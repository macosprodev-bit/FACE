# Resultados detalhados — Playwright e axe-core

A extensão **Verifica 0.1.1** foi carregada como extensão real em perfil Chromium temporário no sandbox. A auditoria registrada em `2026-10-29T21:54:23.737346+00:00` usou Chromium **156.0.8078.47** e axe-core **4.14.0**. A origem foi `chrome-extension://ejelddigjhkfdhankoapljebebdmjcag/popup.html`; o ID muda se o caminho de instalação local mudar e não deve ser copiado como configuração universal.

Os resultados são os já executados; este relatório não representa uma nova instalação no Google Chrome do Windows, teste com leitor de tela ou autenticação perante provedor.

## Resultado da auditoria renderizada

Foram testados **12 estados**, com **zero estados não testados**, **zero violações automáticas**, **zero falhas complementares de navegação por teclado** e **zero indicadores de foco classificados como pendentes pela heurística**. Não foram registrados erros JavaScript nem hosts HTTP/HTTPS bloqueados durante essa execução.

Restaram **três ocorrências inconclusivas** da regra `color-contrast`. Elas referem-se aos mesmos **cinco alvos técnicos** presentes nos três estados de Preparação, somando **15 ocorrências de alvo** quando as repetições são contadas. Portanto, não são 15 defeitos distintos nem três violações confirmadas.

`incomplete` significa que a automação não decidiu. Não equivale a aprovação e também não comprova, sozinho, uma violação. O axe documenta a necessidade de revisão manual nesses casos. [1]

## Os 12 estados e seus resultados

1. **Preparar — concedida simulada:** testado, zero violações, uma ocorrência de regra inconclusiva de contraste.
2. **Preparar — negada simulada:** testado, zero violações, uma ocorrência de regra inconclusiva de contraste.
3. **Preparar — bloqueada simulada:** testado, zero violações, uma ocorrência de regra inconclusiva de contraste.
4. **Ajuda — inicial:** testado, zero violações e zero resultados inconclusivos.
5. **Ajuda — URL inválida:** testado, zero violações e zero resultados inconclusivos.
6. **Ajuda — formato HTTPS válido, sem navegar:** testado, zero violações e zero resultados inconclusivos.
7. **Histórico — exemplos:** testado, zero violações e zero resultados inconclusivos.
8. **Histórico — busca sem resultado:** testado, zero violações e zero resultados inconclusivos.
9. **Histórico — confirmação de limpeza:** testado, zero violações e zero resultados inconclusivos.
10. **Histórico — exemplos apagados:** testado, zero violações e zero resultados inconclusivos.
11. **Histórico — exemplos restaurados:** testado, zero violações e zero resultados inconclusivos.
12. **Privacidade — inicial:** testado, zero violações e zero resultados inconclusivos.

## Alvos que exigem revisão de contraste

A regra inconclusiva identifica `.section-mark` e os quatro elementos `.check-icon` com `aria-hidden="true"` dos itens de Preparação. O código usa esses símbolos como decoração junto a instruções em texto, mas a função visual precisa ser confirmada pela equipe; `aria-hidden` isoladamente não comprova exceção ao critério de contraste.

Inspecionar cada símbolo em todos os estados, verificar se transmite informação além do texto adjacente e conferir foreground/background efetivos, possíveis sobreposições e o sentido da decoração. Para conteúdo textual útil, aplicar o critério de texto normal/grande apropriado sem arredondar o resultado para passar no limiar. WCAG 1.4.3 define 4,5:1 para texto normal e 3:1 para texto grande, com exceções específicas de conteúdo incidental e logotipos. [2]

Não desligar a regra de contraste para obter relatório verde. Registrar responsável, navegador, evidência e conclusão humana para cada alvo. Os registros atuais não contêm uma decisão humana de aprovação desses símbolos.

## Verificações complementares de Playwright

A navegação com Enter foi executada para **Ajuda, Histórico, Privacidade e Preparar**, conferindo visibilidade da tela e foco no respectivo título. As quatro verificações não apresentaram falhas. O auditor também focou controles visíveis para detectar outline; essa detecção é heurística e não avalia integralmente ordem, anúncio, área, contraste do indicador ou percepção por uma pessoa.

O smoke test separado percorreu validação de URL, invalidação após alteração, os três estados simulados de câmera, busca de exemplos, cancelamento/confirmação de limpeza, restauração e reset por recarga. Não clicou no endereço externo de teste. Nenhum desses passos comprova permissão real de câmera ou autenticação oficial.

## Regressões auxiliares executadas

Os três testes do arquivo `tests/test_accessibility_auditor.py` terminaram com `OK`:

- **Identificação da extensão:** verificou o formato esperado do ID da instalação de teste.
- **Diagnóstico sem dados indevidos:** confirmou que a compactação dos resultados não copia HTML bruto nem valores de formulário do fixture.
- **Contraste negativo e integridade:** alterou somente o DOM temporário para inserir texto de contraste deliberadamente ruim, confirmou a detecção de `color-contrast` e comparou hashes dos arquivos-fonte antes/depois. Os arquivos da extensão não foram modificados por esse teste.

O fixture negativo é uma regressão do auditor, não um resultado de usabilidade nem uma deficiência inserida no pacote distribuído.

## Correções realizadas e política de CI

A primeira auditoria havia retornado nove ocorrências inconclusivas. Os contêineres nomeados de marcadores receberam `role="group"`, e a região rolável passou a ter `tabindex="0"` com nome acessível. A execução posterior reduziu o conjunto aos três casos decorativos de contraste; as regras não foram suprimidas.

No modo normal, a execução retornou **0** porque não houve violação automática ou erro. A execução com `--strict-incomplete` retornou **3**, conforme esperado, para bloquear aprovação automática enquanto houver revisão pendente. Retorno 0 nunca significa certificação WCAG.

O auditor usa também código **1** para violações/falhas complementares e **2** para execução incompleta ou erro. Não houve violação automática no relatório final; não alegar que o fluxo de produção foi validado com base nesses códigos.

## Ambiente e evidência preservados

Os arquivos originais ficam em `reports/a11y-v2/audit-report.md` e `reports/a11y-v2/audit-results.json`. O modo estrito foi registrado separadamente em `reports/a11y-ci-strict`. O relatório inicial permanece em `reports/a11y-v1`, sem sobrescrita.

O perfil de teste foi temporário, sem login pessoal; o auditor bloqueia HTTP/HTTPS no contexto de teste e não modifica CSP ou permissões do pacote. Recursos locais foram renderizados e o motor axe foi injetado somente pela automação. Isso não avalia segurança completa de código, backend, política jurídica ou consentimento.

Permanecem pendentes teste do popup real no Chrome do Windows, leitor de tela, zoom/escala, compreensão dos marcadores simulados, contraste inconclusivo e fluxos oficiais de autenticação/facial. Nenhum backend, câmera, webhook, documento, credencial ou dado biométrico real participou desta auditoria.

## Referências

[1]: https://github.com/dequelabs/axe-core "axe-core: automação e resultados incompletos"
[2]: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html "W3C: interpretação do contraste mínimo WCAG 1.4.3"
