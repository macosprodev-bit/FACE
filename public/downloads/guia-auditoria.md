# Auditoria automática do popup Verifica

Usar Python Playwright para carregar a extensão em um perfil Chromium temporário e axe-core para testar a interface renderizada. Não substituir esse teste por parsing de HTML ou CSS: contraste depende de cores efetivas, estados e composição visual. Não usar perfil pessoal ou sessão autenticada para esta auditoria.

## Instalar as ferramentas

A extensão continua sem dependências: estas ferramentas são só para a máquina de teste. Criar ambiente Python isolado, instalar Playwright e Chromium; instalar o motor axe localmente em uma versão fixada. Nesta entrega foi usada a versão axe-core 4.14.0, consultada no registro npm, sem colocá-la no código da extensão.

```bash
python -m venv .venv
# Ativar o ambiente: Windows .venv\Scripts\Activate.ps1; Linux source .venv/bin/activate
python -m pip install playwright
python -m playwright install chromium
npm install --prefix ferramentas --save-exact axe-core@4.14.0 --no-audit --no-fund
```

No Windows, usar um Chromium de teste instalado pelo Playwright; não depender de flags de sideload em Google Chrome ou Microsoft Edge de marca. O teste de extensões precisa de contexto persistente Chromium; a documentação do Playwright diferencia esse ambiente da instalação manual normal. [1]

## Executar

```bash
python audit_extension_accessibility.py \
  --extension-dir ./extension \
  --axe-path ./ferramentas/node_modules/axe-core/axe.min.js \
  --output-dir ./auditoria-v1
```

No PowerShell, colocar o comando em uma única linha. No sandbox desta entrega, o teste pode selecionar `--chromium /usr/bin/chromium`; usar `--no-sandbox` apenas se o ambiente de teste realmente precisar desse modo, nunca como configuração da extensão ou de produção. O script não modifica arquivos da extensão, não troca sua CSP nem inicia integração de autenticação.

O auditor injeta o motor local exclusivamente através da automação no processo de teste. Não instala scripts remotos no popup, não muda permissões nem relaxa segurança do pacote. Bloqueia navegações/chamadas HTTP e HTTPS dentro do contexto temporário e não clica no link de serviço informado. Não envia dados, abre câmera ou preenche credenciais.

## Critérios e estados

Executar as regras axe marcadas para WCAG A/AA 2.0, 2.1 e 2.2 e boas práticas aplicáveis. Testar as quatro telas e estados de câmera simulada, URL inválida/validada, busca vazia, confirmação de exclusão, histórico demonstrativo vazio e restaurado. As verificações complementares de teclado e foco são específicas do Verifica; adaptar o roteiro quando o popup mudar, sem declarar telas não visitadas como aprovadas.

WCAG 1.4.3 exige pelo menos 4,5:1 para texto normal e 3:1 para texto grande. O padrão define texto grande em 18 pt, ou 14 pt em negrito, com as conversões CSS apropriadas; não aplicar a redução do limiar simplesmente porque o texto parece grande. O valor calculado não deve ser arredondado para decidir aprovação. Logotipos, decoração e componentes inativos têm exceções próprias; não confundi-las com conteúdo útil de baixo contraste. [2]

O motor axe avalia contraste com a interface renderizada. Resultados `incomplete` significam que a automação não decidiu e exigem revisão; não são passagens nem necessariamente violações. Gradientes, imagens, pseudo-elementos, sobreposição e estados especiais podem exigir checagem humana. A regra de contraste não funciona como uma avaliação confiável em JSDOM; por isso o teste usa navegador real. [3] [4]

## Ler o resultado

O script gera `audit-report.md` para a equipe e `audit-results.json` para CI. O relatório diferencia violações, revisão manual pendente, verificações complementares e estados não testados. As contagens por estado podem repetir o mesmo problema de um componente comum; não interpretá-las como número de defeitos únicos.

Os dados de diagnóstico excluem HTML bruto e valores digitados: registrar somente regra, impacto, alvo técnico e dados de contraste necessários. Mesmo assim, executar apenas sobre fonte aprovada e sem dados pessoais reais; IDs e seletores podem revelar informações se o produto foi mal projetado.

Códigos de saída: `0` quando não há violação automática ou erro de execução; `1` quando há violação confirmada ou falha complementar; `2` para erro de execução/estado não testado; `3` para revisão pendente quando `--strict-incomplete` estiver ativo. Um retorno `0` não certifica conformidade WCAG, acessibilidade total, privacidade ou segurança. Revisões pendentes continuam visíveis no relatório mesmo sem bloqueio estrito.

## Supervisão humana

Conferir leitura com NVDA ou outro leitor de tela do ambiente, ordem e anúncio de foco, sentido dos avisos, alcance de conteúdo rolável, zoom/escala, navegação sem mouse, contraste em estados que o motor não resolveu e compreensão de “simulado” versus autenticação real. Verificar também cancelamento e retorno do fluxo de confirmação. Não aprovar identidade, alternativa de upload ou política de privacidade com base em score de acessibilidade.

## Referências

[1]: https://playwright.dev/python/docs/chrome-extensions "Playwright: teste de extensões em Chromium persistente"
[2]: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html "W3C: entendimento do contraste mínimo WCAG 1.4.3"
[3]: https://github.com/dequelabs/axe-core "axe-core: documentação e limites da automação"
[4]: https://dequeuniversity.com/rules/axe/4.11/color-contrast "Deque: regra de contraste e casos incompletos"
