# Verifica — validação do painel web

Registro: 29/10/2026. Escopo: `/painel.html`, não a extensão instalada nem um serviço de autenticação.

## Fluxos interativos

O smoke test Playwright passou: escolha de execução, filtro de inconclusivos, busca e estado vazio, abertura dos detalhes técnicos, simulação local de atividade, anotação de instalação por rádio, download do ZIP com conferência SHA-256, limpeza/cancelamento da revisão, preservação das evidências, reinicialização ao recarregar, navegação por teclado e larguras de 390 e 320 pixels. Os guias responderam HTTP 200.

O teste não solicitou câmera, não instalou a extensão e não iniciou OAuth. Não foram observadas requisições POST ou para destinos externos no teste local; as autoavaliações não usam localStorage/sessionStorage.

## Acessibilidade automática do painel

axe-core 4.14.0 foi executado em quatro áreas — visão geral, extensão, relatórios e revisão manual — nas larguras de 1440 e 390 pixels, com animações finalizadas. Foram encontradas zero violações automáticas nos oito estados auditados.

Permaneceu um resultado inconclusivo de contraste no endereço `chrome://extensions` das instruções, repetido nas duas larguras. É um único alvo para revisão humana, não uma violação confirmada. O teste automático não certifica conformidade WCAG nem substitui leitor de tela, inspeção de foco e verificação visual.

## Evidências da extensão

Os relatórios apresentados no painel são registros históricos separados: 12 estados por execução, zero violações automáticas e 9/3/3 ocorrências inconclusivas na auditoria inicial/corrigida/CI estrito. Marcar a revisão local não altera essas evidências. O estado real do Chrome continua desconhecido, pois este painel não tem um canal de comunicação autorizado com a extensão.

## Repetir localmente

Com Node.js e Playwright Python/Chromium disponíveis, execute `npm run dev` na raiz do site e `python3 tests/dashboard-smoke.py` em outro terminal. O axe-core é uma ferramenta de teste local, não uma dependência carregada pela página.

Para a checagem separada de acessibilidade:

```bash
python3 tests/dashboard-a11y.py \
  --axe-path /caminho/axe-core/axe.min.js \
  --output /tmp/verifica-painel-a11y.json
```

O script de teste usa `/usr/bin/chromium` no ambiente de validação Ubuntu. Adapte o executável em outro ambiente; `--no-sandbox` no lançamento é uma escolha do sandbox isolado, não uma instrução para desativar a proteção do Chrome de usuários.
