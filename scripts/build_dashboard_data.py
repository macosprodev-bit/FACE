#!/usr/bin/env python3
"""Prepare a minimized, static dashboard dataset from existing Verifica audit files."""
from pathlib import Path
import argparse
import hashlib
import json
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
SUMMARY_KEYS = (
    'states_tested', 'states_not_tested', 'violation_occurrences_by_state',
    'incomplete_occurrences_by_state', 'keyboard_failures', 'focus_heuristics_pending',
)
SPECS = (
    ('initial', 'Primeira auditoria', 'a11y-v1', '0.1.0', 0),
    ('corrected', 'Após os ajustes', 'a11y-v2', '0.1.1', 0),
    ('strict', 'CI com revisão obrigatória', 'a11y-ci-strict', '0.1.1', 3),
)


def compact_issue(issue):
    url = str(issue.get('help_url', ''))
    parsed = urlparse(url)
    if parsed.scheme != 'https' or parsed.hostname not in {'dequeuniversity.com', 'www.w3.org'}:
        url = ''
    return {
        'id': str(issue.get('id', 'unknown')),
        'impact': issue.get('impact'),
        'description': str(issue.get('help', '')),
        'helpUrl': url,
        'targets': [node.get('target', []) for node in issue.get('nodes', [])],
    }


def compact_run(raw, run_id, label, version, exit_code):
    states = [
        {
            'name': state['name'], 'status': state['status'],
            'violations': [compact_issue(i) for i in state.get('violations', [])],
            'incomplete': [compact_issue(i) for i in state.get('incomplete', [])],
        }
        for state in raw['states']
    ]
    summary = {key: raw['summary'][key] for key in SUMMARY_KEYS}
    summary['certifies_wcag'] = False
    assert sum(len(s['violations']) for s in states) == summary['violation_occurrences_by_state']
    assert sum(len(s['incomplete']) for s in states) == summary['incomplete_occurrences_by_state']
    assert sum(s['status'] == 'tested' for s in states) == summary['states_tested']
    unique_targets = set()
    for state in states:
        for issue in state['incomplete']:
            unique_targets.update(json.dumps(t, sort_keys=True) for t in issue['targets'])
    rule_ids = sorted({i['id'] for s in states for i in s['violations'] + s['incomplete']})
    return {
        'id': run_id, 'label': label, 'timestamp': raw['collected_at'],
        'browser': raw['browser'], 'axeVersion': raw['axe_version'],
        'extensionVersion': version, 'summary': summary, 'states': states,
        'ruleIds': rule_ids, 'exitCode': exit_code,
        'uniqueIncompleteTargets': len(unique_targets),
        'pageErrorCount': raw['page_error_count'],
        'reportUrl': f'/downloads/audit-{run_id}.md',
        'jsonUrl': f'/downloads/audit-{run_id}.json',
        'source': 'Relatório executado em perfil Chromium temporário; não é execução ao vivo.',
    }


def markdown_report(run):
    s = run['summary']
    lines = [
        f"# Verifica — {run['label']}", '',
        f"Registro UTC: {run['timestamp']}. Extensão: {run['extensionVersion']}.",
        f"Chromium: {run['browser']}. axe-core: {run['axeVersion']}.", '',
        f"Estados testados: {s['states_tested']}; não testados: {s['states_not_tested']}.",
        f"Violações por estado: {s['violation_occurrences_by_state']}; inconclusivos: {s['incomplete_occurrences_by_state']}.",
        f"Falhas complementares de teclado: {s['keyboard_failures']}; código de saída registrado: {run['exitCode']}.", '',
        'Contagens por estado podem repetir o mesmo problema. Zero violações não certifica WCAG.', '',
    ]
    for state in run['states']:
        lines.extend([f"## {state['name']}", f"Estado: {state['status']}."])
        for group, title in [('violations', 'Violação automática'), ('incomplete', 'Revisão pendente')]:
            for issue in state[group]:
                lines.append(f"{title}: {issue['id']} — {issue['description']}")
                lines.extend(f"Alvo técnico: `{json.dumps(t, ensure_ascii=False)}`" for t in issue['targets'])
        if not state['violations'] and not state['incomplete']:
            lines.append('Sem violações automáticas ou resultados inconclusivos neste estado.')
        lines.append('')
    lines.extend(['## Limites', '',
                  'Resultado histórico. Nenhum teste foi disparado por este painel. Revisar com leitor de tela, teclado, zoom e contraste manual.',
                  'Não contém HTML bruto, valores de formulário, credenciais, imagens faciais ou caminhos do computador.', ''])
    return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-dir', type=Path, required=True, help='Existing reports directory; no tests are executed.')
    parser.add_argument('--package', type=Path, required=True)
    args = parser.parse_args()
    downloads = ROOT / 'public/downloads'
    dashboard = ROOT / 'public/dashboard'
    downloads.mkdir(parents=True, exist_ok=True)
    dashboard.mkdir(parents=True, exist_ok=True)
    expected = args.package.with_suffix('.zip.sha256').read_text().split()[0]
    assert hashlib.sha256(args.package.read_bytes()).hexdigest() == expected, 'Package digest mismatch'
    runs = []
    for run_id, label, folder, version, exit_code in SPECS:
        raw = json.loads((args.source_dir / folder / 'audit-results.json').read_text())
        run = compact_run(raw, run_id, label, version, exit_code)
        runs.append(run)
        (downloads / f'audit-{run_id}.json').write_text(json.dumps(run, ensure_ascii=False, indent=2) + '\n')
        (downloads / f'audit-{run_id}.md').write_text(markdown_report(run))
    payload = {
        'extension': {
            'version': '0.1.1', 'manifestVersion': 3, 'sha256': expected,
            'packageUrl': '/downloads/verifica-extensao-teste-0.1.1.zip',
            'shaUrl': '/downloads/verifica-extensao-teste-0.1.1.zip.sha256',
        },
        'runs': runs,
        'guides': [
            {'title': 'Instalar e testar no Chrome', 'description': 'Extrair ZIP, abrir o popup e diagnosticar câmera ocupada sem alterar proteções.', 'url': '/downloads/guia-chrome.md'},
            {'title': 'Resultados Playwright e axe-core', 'description': 'Os 12 estados auditados, alvos inconclusivos, regressões e limites.', 'url': '/downloads/resultados-playwright-axe.md'},
            {'title': 'Backend OAuth/OIDC seguro', 'description': 'Configuração exemplificativa; provedor, contrato e implementação ainda pendentes.', 'url': '/downloads/guia-backend-oidc.md'},
            {'title': 'Executar auditoria Python', 'description': 'Ferramentas locais, códigos de CI e supervisão humana.', 'url': '/downloads/guia-auditoria.md'},
        ],
    }
    (dashboard / 'data.js').write_text('window.VERIFICA_DASHBOARD_DATA = ' + json.dumps(payload, ensure_ascii=True, indent=2) + ';\n')
    print(f'Prepared {len(runs)} recorded runs; no camera, browser test or external request executed.')


if __name__ == '__main__':
    main()
