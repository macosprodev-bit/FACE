#!/usr/bin/env python3
"""Audit the web dashboard only, using a locally supplied axe-core engine."""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--axe-path', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--screenshots', action='store_true', help='Capture only the local dashboard for layout review.')
    args = parser.parse_args()
    results = []
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
        context = browser.new_context(viewport={'width': 1440, 'height': 1000}, reduced_motion='reduce')
        page = context.new_page()
        page.goto('http://127.0.0.1:3000/painel.html', wait_until='networkidle')
        page.add_script_tag(path=str(args.axe_path.resolve()))
        for width in (1440, 390):
            page.set_viewport_size({'width': width, 'height': 844})
            for view in ('overview', 'extension', 'reports', 'review'):
                page.locator(f'[data-panel-nav="{view}"]').click()
                page.evaluate('async () => await Promise.all(document.getAnimations().map(animation => animation.finished.catch(() => {})))')
                raw = page.evaluate("async () => await axe.run(document, {runOnly: {type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']}})")
                record = {
                    'width': width, 'view': view,
                    'violations': [{'id': issue['id'], 'targets': [node['target'] for node in issue['nodes']]} for issue in raw['violations']],
                    'incomplete': [{'id': issue['id'], 'targets': [node['target'] for node in issue['nodes']]} for issue in raw['incomplete']],
                }
                results.append(record)
                print(json.dumps({'width': width, 'view': view, 'violations': [(r['id'], len(r['targets'])) for r in record['violations']], 'incomplete': [(r['id'], len(r['targets'])) for r in record['incomplete']]}, ensure_ascii=False))
            if args.screenshots:
                page.locator('[data-panel-nav="overview"]').click()
                page.screenshot(path=str(args.output.parent / f'panel-{width}.png'), full_page=True)
        browser.close()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps({'scope': 'painel.html — não é extensão', 'certifies_wcag': False, 'checks': results}, ensure_ascii=False, indent=2) + '\n')
    return 1 if any(item['violations'] for item in results) else 0


if __name__ == '__main__':
    raise SystemExit(main())
