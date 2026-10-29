window.VERIFICA_DASHBOARD_DATA = {
  "extension": {
    "version": "0.1.1",
    "manifestVersion": 3,
    "sha256": "969bc21805146fe0aebf5606471d94c80577787440731c4f28c4202dba150041",
    "packageUrl": "/downloads/verifica-extensao-teste-0.1.1.zip",
    "shaUrl": "/downloads/verifica-extensao-teste-0.1.1.zip.sha256"
  },
  "runs": [
    {
      "id": "initial",
      "label": "Primeira auditoria",
      "timestamp": "2026-10-29T21:52:03.017218+00:00",
      "browser": "156.0.8078.47",
      "axeVersion": "4.14.0",
      "extensionVersion": "0.1.0",
      "summary": {
        "states_tested": 12,
        "states_not_tested": 0,
        "violation_occurrences_by_state": 0,
        "incomplete_occurrences_by_state": 9,
        "keyboard_failures": 0,
        "focus_heuristics_pending": 0,
        "certifies_wcag": false
      },
      "states": [
        {
          "name": "preparar/concedida-simulada",
          "status": "tested",
          "violations": [],
          "incomplete": [
            {
              "id": "color-contrast",
              "impact": "serious",
              "description": "Elements must meet minimum color contrast ratio thresholds",
              "helpUrl": "https://dequeuniversity.com/rules/axe/4.14/color-contrast?application=axeAPI",
              "targets": [
                [
                  ".section-mark"
                ],
                [
                  "li:nth-child(1) > .check-icon[aria-hidden=\"true\"]"
                ],
                [
                  "li:nth-child(2) > .check-icon[aria-hidden=\"true\"]"
                ],
                [
                  "li:nth-child(3) > .check-icon[aria-hidden=\"true\"]"
                ],
                [
                  "li:nth-child(4) > .check-icon[aria-hidden=\"true\"]"
                ]
              ]
            }
          ]
        },
        {
          "name": "preparar/negada-simulada",
          "status": "tested",
          "violations": [],
          "incomplete": [
            {
              "id": "color-contrast",
              "impact": "serious",
              "description": "Elements must meet minimum color contrast ratio thresholds",
              "helpUrl": "https://dequeuniversity.com/rules/axe/4.14/color-contrast?application=axeAPI",
              "targets": [
                [
                  ".section-mark"
                ],
                [
                  "li:nth-child(1) > .check-icon[aria-hidden=\"true\"]"
                ],
                [
                  "li:nth-child(2) > .check-icon[aria-hidden=\"true\"]"
                ],
                [
                  "li:nth-child(3) > .check-icon[aria-hidden=\"true\"]"
                ],
                [
                  "li:nth-child(4) > .check-icon[aria-hidden=\"true\"]"
                ]
              ]
            }
          ]
        },
        {
          "name": "preparar/bloqueada-simulada",
          "status": "tested",
          "violations": [],
          "incomplete": [
            {
              "id": "color-contrast",
              "impact": "serious",
              "description": "Elements must meet minimum color contrast ratio thresholds",
              "helpUrl": "https://dequeuniversity.com/rules/axe/4.14/color-contrast?application=axeAPI",
              "targets": [
                [
                  ".section-mark"
                ],
                [
                  "li:nth-child(1) > .check-icon[aria-hidden=\"true\"]"
                ],
                [
                  "li:nth-child(2) > .check-icon[aria-hidden=\"true\"]"
                ],
                [
                  "li:nth-child(3) > .check-icon[aria-hidden=\"true\"]"
                ],
                [
                  "li:nth-child(4) > .check-icon[aria-hidden=\"true\"]"
                ]
              ]
            }
          ]
        },
        {
          "name": "ajuda/inicial",
          "status": "tested",
          "violations": [],
          "incomplete": []
        },
        {
          "name": "ajuda/url-invalida",
          "status": "tested",
          "violations": [],
          "incomplete": []
        },
        {
          "name": "ajuda/url-formato-valido-sem-navegar",
          "status": "tested",
          "violations": [],
          "incomplete": []
        },
        {
          "name": "historico/exemplos",
          "status": "tested",
          "violations": [],
          "incomplete": [
            {
              "id": "aria-prohibited-attr",
              "impact": "serious",
              "description": "Elements must only use permitted ARIA attributes",
              "helpUrl": "https://dequeuniversity.com/rules/axe/4.14/aria-prohibited-attr?application=axeAPI",
              "targets": [
                [
                  ".badge-row"
                ],
                [
                  "article:nth-child(1) > .demo-badges[aria-label=\"Registro de demonstra\u00e7\u00e3o\"]"
                ],
                [
                  "article:nth-child(2) > .demo-badges[aria-label=\"Registro de demonstra\u00e7\u00e3o\"]"
                ],
                [
                  "article:nth-child(3) > .demo-badges[aria-label=\"Registro de demonstra\u00e7\u00e3o\"]"
                ]
              ]
            }
          ]
        },
        {
          "name": "historico/busca-sem-resultado",
          "status": "tested",
          "violations": [],
          "incomplete": [
            {
              "id": "aria-prohibited-attr",
              "impact": "serious",
              "description": "Elements must only use permitted ARIA attributes",
              "helpUrl": "https://dequeuniversity.com/rules/axe/4.14/aria-prohibited-attr?application=axeAPI",
              "targets": [
                [
                  ".badge-row"
                ]
              ]
            }
          ]
        },
        {
          "name": "historico/confirmacao",
          "status": "tested",
          "violations": [],
          "incomplete": [
            {
              "id": "aria-prohibited-attr",
              "impact": "serious",
              "description": "Elements must only use permitted ARIA attributes",
              "helpUrl": "https://dequeuniversity.com/rules/axe/4.14/aria-prohibited-attr?application=axeAPI",
              "targets": [
                [
                  ".badge-row"
                ],
                [
                  "article:nth-child(1) > .demo-badges[aria-label=\"Registro de demonstra\u00e7\u00e3o\"]"
                ],
                [
                  "article:nth-child(2) > .demo-badges[aria-label=\"Registro de demonstra\u00e7\u00e3o\"]"
                ],
                [
                  "article:nth-child(3) > .demo-badges[aria-label=\"Registro de demonstra\u00e7\u00e3o\"]"
                ]
              ]
            }
          ]
        },
        {
          "name": "historico/exemplos-apagados",
          "status": "tested",
          "violations": [],
          "incomplete": [
            {
              "id": "aria-prohibited-attr",
              "impact": "serious",
              "description": "Elements must only use permitted ARIA attributes",
              "helpUrl": "https://dequeuniversity.com/rules/axe/4.14/aria-prohibited-attr?application=axeAPI",
              "targets": [
                [
                  ".badge-row"
                ]
              ]
            }
          ]
        },
        {
          "name": "historico/exemplos-restaurados",
          "status": "tested",
          "violations": [],
          "incomplete": [
            {
              "id": "aria-prohibited-attr",
              "impact": "serious",
              "description": "Elements must only use permitted ARIA attributes",
              "helpUrl": "https://dequeuniversity.com/rules/axe/4.14/aria-prohibited-attr?application=axeAPI",
              "targets": [
                [
                  ".badge-row"
                ],
                [
                  "article:nth-child(1) > .demo-badges[aria-label=\"Registro de demonstra\u00e7\u00e3o\"]"
                ],
                [
                  "article:nth-child(2) > .demo-badges[aria-label=\"Registro de demonstra\u00e7\u00e3o\"]"
                ],
                [
                  "article:nth-child(3) > .demo-badges[aria-label=\"Registro de demonstra\u00e7\u00e3o\"]"
                ]
              ]
            }
          ]
        },
        {
          "name": "privacidade/inicial",
          "status": "tested",
          "violations": [],
          "incomplete": [
            {
              "id": "scrollable-region-focusable",
              "impact": "serious",
              "description": "Scrollable region must have keyboard access",
              "helpUrl": "https://dequeuniversity.com/rules/axe/4.14/scrollable-region-focusable?application=axeAPI",
              "targets": [
                [
                  "#appMain"
                ]
              ]
            }
          ]
        }
      ],
      "ruleIds": [
        "aria-prohibited-attr",
        "color-contrast",
        "scrollable-region-focusable"
      ],
      "exitCode": 0,
      "uniqueIncompleteTargets": 10,
      "pageErrorCount": 0,
      "reportUrl": "/downloads/audit-initial.md",
      "jsonUrl": "/downloads/audit-initial.json",
      "source": "Relat\u00f3rio executado em perfil Chromium tempor\u00e1rio; n\u00e3o \u00e9 execu\u00e7\u00e3o ao vivo."
    },
    {
      "id": "corrected",
      "label": "Ap\u00f3s os ajustes",
      "timestamp": "2026-10-29T21:54:23.737346+00:00",
      "browser": "156.0.8078.47",
      "axeVersion": "4.14.0",
      "extensionVersion": "0.1.1",
      "summary": {
        "states_tested": 12,
        "states_not_tested": 0,
        "violation_occurrences_by_state": 0,
        "incomplete_occurrences_by_state": 3,
        "keyboard_failures": 0,
        "focus_heuristics_pending": 0,
        "certifies_wcag": false
      },
      "states": [
        {
          "name": "preparar/concedida-simulada",
          "status": "tested",
          "violations": [],
          "incomplete": [
            {
              "id": "color-contrast",
              "impact": "serious",
              "description": "Elements must meet minimum color contrast ratio thresholds",
              "helpUrl": "https://dequeuniversity.com/rules/axe/4.14/color-contrast?application=axeAPI",
              "targets": [
                [
                  ".section-mark"
                ],
                [
                  "li:nth-child(1) > .check-icon[aria-hidden=\"true\"]"
                ],
                [
                  "li:nth-child(2) > .check-icon[aria-hidden=\"true\"]"
                ],
                [
                  "li:nth-child(3) > .check-icon[aria-hidden=\"true\"]"
                ],
                [
                  "li:nth-child(4) > .check-icon[aria-hidden=\"true\"]"
                ]
              ]
            }
          ]
        },
        {
          "name": "preparar/negada-simulada",
          "status": "tested",
          "violations": [],
          "incomplete": [
            {
              "id": "color-contrast",
              "impact": "serious",
              "description": "Elements must meet minimum color contrast ratio thresholds",
              "helpUrl": "https://dequeuniversity.com/rules/axe/4.14/color-contrast?application=axeAPI",
              "targets": [
                [
                  ".section-mark"
                ],
                [
                  "li:nth-child(1) > .check-icon[aria-hidden=\"true\"]"
                ],
                [
                  "li:nth-child(2) > .check-icon[aria-hidden=\"true\"]"
                ],
                [
                  "li:nth-child(3) > .check-icon[aria-hidden=\"true\"]"
                ],
                [
                  "li:nth-child(4) > .check-icon[aria-hidden=\"true\"]"
                ]
              ]
            }
          ]
        },
        {
          "name": "preparar/bloqueada-simulada",
          "status": "tested",
          "violations": [],
          "incomplete": [
            {
              "id": "color-contrast",
              "impact": "serious",
              "description": "Elements must meet minimum color contrast ratio thresholds",
              "helpUrl": "https://dequeuniversity.com/rules/axe/4.14/color-contrast?application=axeAPI",
              "targets": [
                [
                  ".section-mark"
                ],
                [
                  "li:nth-child(1) > .check-icon[aria-hidden=\"true\"]"
                ],
                [
                  "li:nth-child(2) > .check-icon[aria-hidden=\"true\"]"
                ],
                [
                  "li:nth-child(3) > .check-icon[aria-hidden=\"true\"]"
                ],
                [
                  "li:nth-child(4) > .check-icon[aria-hidden=\"true\"]"
                ]
              ]
            }
          ]
        },
        {
          "name": "ajuda/inicial",
          "status": "tested",
          "violations": [],
          "incomplete": []
        },
        {
          "name": "ajuda/url-invalida",
          "status": "tested",
          "violations": [],
          "incomplete": []
        },
        {
          "name": "ajuda/url-formato-valido-sem-navegar",
          "status": "tested",
          "violations": [],
          "incomplete": []
        },
        {
          "name": "historico/exemplos",
          "status": "tested",
          "violations": [],
          "incomplete": []
        },
        {
          "name": "historico/busca-sem-resultado",
          "status": "tested",
          "violations": [],
          "incomplete": []
        },
        {
          "name": "historico/confirmacao",
          "status": "tested",
          "violations": [],
          "incomplete": []
        },
        {
          "name": "historico/exemplos-apagados",
          "status": "tested",
          "violations": [],
          "incomplete": []
        },
        {
          "name": "historico/exemplos-restaurados",
          "status": "tested",
          "violations": [],
          "incomplete": []
        },
        {
          "name": "privacidade/inicial",
          "status": "tested",
          "violations": [],
          "incomplete": []
        }
      ],
      "ruleIds": [
        "color-contrast"
      ],
      "exitCode": 0,
      "uniqueIncompleteTargets": 5,
      "pageErrorCount": 0,
      "reportUrl": "/downloads/audit-corrected.md",
      "jsonUrl": "/downloads/audit-corrected.json",
      "source": "Relat\u00f3rio executado em perfil Chromium tempor\u00e1rio; n\u00e3o \u00e9 execu\u00e7\u00e3o ao vivo."
    },
    {
      "id": "strict",
      "label": "CI com revis\u00e3o obrigat\u00f3ria",
      "timestamp": "2026-10-29T21:56:18.153699+00:00",
      "browser": "156.0.8078.47",
      "axeVersion": "4.14.0",
      "extensionVersion": "0.1.1",
      "summary": {
        "states_tested": 12,
        "states_not_tested": 0,
        "violation_occurrences_by_state": 0,
        "incomplete_occurrences_by_state": 3,
        "keyboard_failures": 0,
        "focus_heuristics_pending": 0,
        "certifies_wcag": false
      },
      "states": [
        {
          "name": "preparar/concedida-simulada",
          "status": "tested",
          "violations": [],
          "incomplete": [
            {
              "id": "color-contrast",
              "impact": "serious",
              "description": "Elements must meet minimum color contrast ratio thresholds",
              "helpUrl": "https://dequeuniversity.com/rules/axe/4.14/color-contrast?application=axeAPI",
              "targets": [
                [
                  ".section-mark"
                ],
                [
                  "li:nth-child(1) > .check-icon[aria-hidden=\"true\"]"
                ],
                [
                  "li:nth-child(2) > .check-icon[aria-hidden=\"true\"]"
                ],
                [
                  "li:nth-child(3) > .check-icon[aria-hidden=\"true\"]"
                ],
                [
                  "li:nth-child(4) > .check-icon[aria-hidden=\"true\"]"
                ]
              ]
            }
          ]
        },
        {
          "name": "preparar/negada-simulada",
          "status": "tested",
          "violations": [],
          "incomplete": [
            {
              "id": "color-contrast",
              "impact": "serious",
              "description": "Elements must meet minimum color contrast ratio thresholds",
              "helpUrl": "https://dequeuniversity.com/rules/axe/4.14/color-contrast?application=axeAPI",
              "targets": [
                [
                  ".section-mark"
                ],
                [
                  "li:nth-child(1) > .check-icon[aria-hidden=\"true\"]"
                ],
                [
                  "li:nth-child(2) > .check-icon[aria-hidden=\"true\"]"
                ],
                [
                  "li:nth-child(3) > .check-icon[aria-hidden=\"true\"]"
                ],
                [
                  "li:nth-child(4) > .check-icon[aria-hidden=\"true\"]"
                ]
              ]
            }
          ]
        },
        {
          "name": "preparar/bloqueada-simulada",
          "status": "tested",
          "violations": [],
          "incomplete": [
            {
              "id": "color-contrast",
              "impact": "serious",
              "description": "Elements must meet minimum color contrast ratio thresholds",
              "helpUrl": "https://dequeuniversity.com/rules/axe/4.14/color-contrast?application=axeAPI",
              "targets": [
                [
                  ".section-mark"
                ],
                [
                  "li:nth-child(1) > .check-icon[aria-hidden=\"true\"]"
                ],
                [
                  "li:nth-child(2) > .check-icon[aria-hidden=\"true\"]"
                ],
                [
                  "li:nth-child(3) > .check-icon[aria-hidden=\"true\"]"
                ],
                [
                  "li:nth-child(4) > .check-icon[aria-hidden=\"true\"]"
                ]
              ]
            }
          ]
        },
        {
          "name": "ajuda/inicial",
          "status": "tested",
          "violations": [],
          "incomplete": []
        },
        {
          "name": "ajuda/url-invalida",
          "status": "tested",
          "violations": [],
          "incomplete": []
        },
        {
          "name": "ajuda/url-formato-valido-sem-navegar",
          "status": "tested",
          "violations": [],
          "incomplete": []
        },
        {
          "name": "historico/exemplos",
          "status": "tested",
          "violations": [],
          "incomplete": []
        },
        {
          "name": "historico/busca-sem-resultado",
          "status": "tested",
          "violations": [],
          "incomplete": []
        },
        {
          "name": "historico/confirmacao",
          "status": "tested",
          "violations": [],
          "incomplete": []
        },
        {
          "name": "historico/exemplos-apagados",
          "status": "tested",
          "violations": [],
          "incomplete": []
        },
        {
          "name": "historico/exemplos-restaurados",
          "status": "tested",
          "violations": [],
          "incomplete": []
        },
        {
          "name": "privacidade/inicial",
          "status": "tested",
          "violations": [],
          "incomplete": []
        }
      ],
      "ruleIds": [
        "color-contrast"
      ],
      "exitCode": 3,
      "uniqueIncompleteTargets": 5,
      "pageErrorCount": 0,
      "reportUrl": "/downloads/audit-strict.md",
      "jsonUrl": "/downloads/audit-strict.json",
      "source": "Relat\u00f3rio executado em perfil Chromium tempor\u00e1rio; n\u00e3o \u00e9 execu\u00e7\u00e3o ao vivo."
    }
  ],
  "guides": [
    {
      "title": "Instalar e testar no Chrome",
      "description": "Extrair ZIP, abrir o popup e diagnosticar c\u00e2mera ocupada sem alterar prote\u00e7\u00f5es.",
      "url": "/downloads/guia-chrome.md"
    },
    {
      "title": "Resultados Playwright e axe-core",
      "description": "Os 12 estados auditados, alvos inconclusivos, regress\u00f5es e limites.",
      "url": "/downloads/resultados-playwright-axe.md"
    },
    {
      "title": "Backend OAuth/OIDC seguro",
      "description": "Configura\u00e7\u00e3o exemplificativa; provedor, contrato e implementa\u00e7\u00e3o ainda pendentes.",
      "url": "/downloads/guia-backend-oidc.md"
    },
    {
      "title": "Executar auditoria Python",
      "description": "Ferramentas locais, c\u00f3digos de CI e supervis\u00e3o humana.",
      "url": "/downloads/guia-auditoria.md"
    }
  ]
};
