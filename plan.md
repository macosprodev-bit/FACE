# Verifica — painel de controle

Acrescentar `/painel.html` ao site existente, preservando a demonstração em `/`. Reutilizar a identidade Sinal Seguro: azul profundo, âmbar, superfícies claras, marca de escudo e tipografia de sistema legível. O painel terá navegação lateral no desktop e compacta no celular, cartões de métricas, comparação simples de execuções e detalhes expansíveis dos estados auditados.

A interface será estática, com JavaScript sem dependências e estados somente na memória da aba. Gerenciar significa acompanhar o pacote, baixar ZIP/hash, ler instruções e preencher uma simulação/checklist local. Sem canal autorizado com o navegador, não detectar, instalar, ativar/desativar a extensão real nem executar Playwright no computador do usuário. Controles demonstrativos devem permanecer marcados como simulados.

Exibir resultados registrados das auditorias inicial, corrigida e de CI estrito, preservando data, versão e origem. As métricas serão derivadas dos relatórios executados, com distinção entre violações, resultados inconclusivos e estados não testados. Filtros, busca e detalhes devem funcionar sem modificar a evidência. A revisão humana local não transforma automaticamente um resultado axe inconclusivo em aprovação.

## Estrutura

- `public/painel.html`: entrada acessível do painel, vinculada ao site original.
- `public/dashboard/panel.css` e `panel.js`: visual responsivo, navegação, filtros e estado local.
- `public/dashboard/data.js`: dados publicados por allowlist a partir dos relatórios existentes, sem HTML bruto, valores de formulário, credenciais ou caminhos locais.
- `public/downloads/`: pacote de teste, hash e guias sem dados pessoais, acessíveis por download manual.
- `tests/dashboard-smoke.py`: teste finito do painel, sem câmera, OAuth ou instalação real.

A publicação continua com `build.command=true` e `build.outputDirectory=public`. Não adicionar banco, backend, integração de autenticação, automação futura ou permissões de extensão. Salvar somente as alterações deste painel no repositório GitHub já confirmado.
