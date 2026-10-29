#!/usr/bin/env python3
"""Test the dashboard UI locally; never install an extension, request camera or run OAuth."""
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
import hashlib
import json
import tempfile

ROOT = Path(__file__).resolve().parents[1]
BASE = 'http://127.0.0.1:3000'


def main():
    errors = []
    unexpected = []
    with tempfile.TemporaryDirectory(prefix='verifica-panel-test-') as temporary:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
            context = browser.new_context(viewport={'width': 1440, 'height': 1000}, accept_downloads=True)
            page = context.new_page()
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.on('request', lambda request: unexpected.append(request.url) if request.method not in {'GET', 'HEAD'} or not request.url.startswith(BASE + '/') else None)
            page.goto(BASE + '/painel.html', wait_until='networkidle')
            page.locator('#runSelect').wait_for()
            assert page.title().lower().find('verifica') >= 0
            assert page.locator('#runSelect').input_value() == 'corrected'
            page.locator('[data-panel-nav="reports"]').click()
            page.locator('#resultFilter').select_option('incomplete')
            assert page.locator('details').count() == 3
            page.locator('details').first.locator('summary').click()
            assert page.locator('details').first.get_attribute('open') is not None
            assert 'color-contrast' in page.locator('details').first.inner_text()
            page.locator('#stateSearch').fill('nenhum-estado-coincide')
            assert page.locator('details').count() == 0
            assert 'nenhum' in page.locator('main').inner_text().lower()
            page.locator('#stateSearch').fill('')
            page.locator('#resultFilter').select_option('all')
            assert page.locator('details').count() == 12
            page.locator('#runSelect').select_option('initial')
            data = page.evaluate('window.VERIFICA_DASHBOARD_DATA')
            assert next(r for r in data['runs'] if r['id'] == 'initial')['summary']['incomplete_occurrences_by_state'] == 9
            page.locator('#runSelect').select_option('corrected')
            with page.expect_download() as export_info:
                page.locator('[data-action="export-run"]').click()
            exported = Path(temporary) / 'exported-report.json'
            export_info.value.save_as(exported)
            assert json.loads(exported.read_text())['summary']['incomplete_occurrences_by_state'] == 3
            page.locator('[data-panel-nav="extension"]').click()
            page.locator('#demoEnabled').set_checked(False)
            assert 'simulad' in page.locator('main').inner_text().lower()
            page.locator('input[name="installNote"][value="reported-installed"]').check()
            assert 'não' in page.locator('main').inner_text().lower()
            package = page.locator('a[href$="verifica-extensao-teste-0.1.1.zip"]').first
            with page.expect_download() as download_info:
                package.click()
            download = download_info.value
            target = Path(temporary) / download.suggested_filename
            download.save_as(target)
            expected = (ROOT / 'public/downloads/verifica-extensao-teste-0.1.1.zip.sha256').read_text().split()[0]
            assert hashlib.sha256(target.read_bytes()).hexdigest() == expected
            page.locator('[data-panel-nav="review"]').click()
            review_boxes = page.locator('[data-review-item]')
            assert review_boxes.count() >= 6
            review_boxes.first.check()
            page.locator('#resetReview').click()
            page.locator('#resetDialog').wait_for(state='visible')
            page.keyboard.press('Escape')
            assert review_boxes.first.is_checked()
            page.locator('#resetReview').click()
            page.locator('#resetDialog [data-reset="yes"]').click()
            expect(review_boxes.first).not_to_be_checked()
            review_boxes.first.check()
            page.locator('#resetReview').click()
            page.keyboard.press('Escape')
            expect(review_boxes.first).to_be_checked()
            assert page.evaluate("window.VERIFICA_DASHBOARD_DATA.runs.find(r=>r.id==='corrected').summary.incomplete_occurrences_by_state") == 3
            page.locator('[data-panel-nav="overview"]').focus()
            page.keyboard.press('Enter')
            page.locator('#runSelect').wait_for()
            page.reload(wait_until='networkidle')
            page.locator('[data-panel-nav="extension"]').click()
            assert page.locator('#demoEnabled').is_checked()
            assert page.locator('input[name="installNote"][value="not-installed"]').is_checked()
            for width in (390, 320):
                page.set_viewport_size({'width': width, 'height': 844})
                for name in ('overview', 'extension', 'reports', 'review'):
                    page.locator(f'[data-panel-nav="{name}"]').click()
                    assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'), (width, name)
            for link in data['guides']:
                response = context.request.get(BASE + link['url'])
                assert response.status == 200, link['url']
            assert page.evaluate('localStorage.length') == 0
            assert page.evaluate('sessionStorage.length') == 0
            assert not errors, errors
            assert not unexpected, unexpected
            browser.close()
    print(json.dumps({'status': 'passed', 'checks': ['registered reports', 'filters and empty state', 'technical details', 'local demo controls', 'ZIP digest', 'review reset/cancel', 'immutable evidence', 'reload reset', 'keyboard', 'mobile overflow', 'guide downloads', 'no persistence', 'no outbound/POST requests'], 'camera': 'not requested', 'extension_installation': 'not performed'}, ensure_ascii=False))


if __name__ == '__main__':
    main()
