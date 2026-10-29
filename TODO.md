# TODO — Verifica

## 1. Orientação inicial e limites de segurança
- [x] A tela inicial da extensão deve explicar claramente o propósito, os limites de segurança e como acessar o fluxo de verificação.
- [x] O fluxo deve respeitar verificações de presença e identidade: não pode substituir a câmera, simular presença, nem contornar a verificação.

## 2. Preparação, permissões e diagnóstico da câmera
- [x] O fluxo guiado cobre enquadramento, iluminação, privacidade e orientações antes de iniciar.
- [x] As permissões de câmera são explicadas contextualmente e os estados concedida, negada e bloqueada são distintos na demonstração.
- [x] O diagnóstico visual cobre dispositivo indisponível, câmera em uso, baixa iluminação e ausência de permissão.

## 3. Verificação oficial e alternativas autorizadas
- [x] A tela de acompanhamento orienta a verificação facial legítima sem substituir vídeo da câmera nem simular ou contornar presença e identidade.
- [x] Métodos alternativos só aparecem quando o sinal de autorização está ativado na demonstração; a interface informa que, em produção, a autorização deve vir do serviço oficial.
- [x] O fluxo alternativo demonstra seleção e prévia local de imagem, com avisos de origem, consentimento e segurança; não envia arquivo.
- [x] Estados de conclusão, falha e tentativa novamente apresentam próximos passos seguros e suporte do serviço oficial.

## 4. Histórico de autenticações bem-sucedidas
- [x] Adicionar uma tela para gerenciar o histórico de autenticações bem-sucedidas.
- [x] Permitir busca por serviço, domínio ou método, confirmação antes de limpar os exemplos e restauração dos registros demonstrativos.
- [x] Usar apenas eventos e domínios fictícios, sem autenticações reais ou armazenamento de senhas, tokens, imagens ou dados biométricos; os dados existem apenas na sessão do protótipo.
- [x] Mostrar estado vazio após a limpeza e manter explícito que autenticações reais são gerenciadas no serviço de origem.

## 5. Navegação, responsividade e requisitos de implementação
- [x] Navegação clicável entre as telas principais, responsiva ao formato compacto de extensão e a dispositivos menores.
- [x] Abrir o protótipo em tela cheia e testar navegação, busca, confirmação de limpeza, estado vazio e restauração dos exemplos.
- [x] A documentação lista requisitos técnicos, permissões, integrações, privacidade, segurança, acessibilidade, testes, publicação e minimização dos dados de histórico para construir a extensão real.

## 6. Pré-visualização local de mídia
- [x] Adicionar à tela de verificação um botão para importar imagem e vídeo somente para pré-visualização local.
- [x] Não enviar a mídia, ativar a câmera, autenticar ou usar o arquivo para substituir a verificação de presença/identidade.
- [x] Validar tipo, tamanho e decodificação; permitir remover a seleção e liberar URLs temporárias ao limpar ou fechar o protótipo.
- [x] Ao importar mídia válida, mostrar tipo, tamanho, dimensões, decodificação e status “válida para visualização”; esclarecer que isso não valida identidade, rosto ou prova de vida.
- [x] Após importar uma imagem, exibir campos editáveis para nome anotado, IP, CPF, latitude, longitude e URL de mapa; tratá-los como anotações locais não verificadas, mantê-los somente em memória, não modificar nem enviar o arquivo e removê-los ao limpar a imagem ou recarregar a página.

## 7. Alternativa quando a câmera não funcionar
- [x] Oferecer um caminho separado que oriente a tentar outro dispositivo/navegador ou um método sem câmera somente se o serviço oficial o disponibilizar.
- [x] Se não houver método oficial alternativo, orientar a pessoa a contatar o suporte do serviço; não tratar mídia importada como prova de presença ou substituto de câmera.

## 8. Prévia local de payload fictício, sem envio real
- [x] Manter a URL do endpoint como campo editável de anotação, sem conectá-la nem enviar requisições.
- [x] Permitir gerar somente no navegador uma prévia JSON com anotações editáveis e uma imagem PNG sintética sem rosto; nunca incluir a imagem importada ou a foto da webcam.
- [x] Manter fixos os sinalizadores “teste”, “simulado”, “não verificado” e “imagem sintética”; não criar nem validar assinatura criptográfica, não usar cookies/credenciais e não realizar POST, CORS ou qualquer chamada de rede.
- [x] Restringir o servidor estático a GET/HEAD; responder HTTP 405 a outros métodos sem processar seus corpos.

## 9. Captura local da webcam
- [x] Solicitar acesso à webcam somente após clique explícito, sem pedir microfone, e mostrar estados de permissão, câmera indisponível e erro.
- [x] Permitir capturar uma foto local para pré-visualização, sem autenticar, analisar rosto/presença ou enviar a foto ao serviço/endpoint de teste.
- [x] Parar as faixas da câmera após captura, ao sair da tela ou fechar/recarregar a página; ao remover a foto, liberar o URL temporário.
- [x] Separar metadados técnicos reais da captura (somente leitura) de rótulo/observação editáveis e não verificados; não alterar EXIF, data/hora, localização ou bytes do arquivo, nem enviar essas anotações.

## 10. Limite de webcam virtual
- [x] O protótipo não cria um dispositivo de webcam virtual nem substitui/intercepta o vídeo visto por outros aplicativos; oferece apenas acesso opcional à câmera real após clique explícito e captura local.

## 11. Painel de controle da extensão e relatórios de teste
- [x] Acrescentar uma página web com painel interativo para acompanhar a extensão de teste e visualizar os relatórios, com link a partir do protótipo existente.
- [x] Exibir pacote/versionamento, instruções e downloads reais do ZIP/hash; identificar qualquer controle de ativação ou estado de instalação como simulação/anotação local, sem instalar, detectar ou alterar a extensão no Chrome.
- [x] Mostrar resultados registrados das auditorias Playwright/axe, com data/versões, contagens reais, escolha de execução, busca/filtros e detalhes de cada estado; não alegar execução ao vivo ou certificação WCAG.
- [x] Separar violações, inconclusivos e não testados; distinguir contagens repetidas por estado de alvos únicos. A revisão manual local não apaga resultados nem registra autenticação real.
- [x] Oferecer checklist local de revisão humana e guias; manter dados somente em memória e permitir redefinir a autoavaliação com confirmação.
- [x] Manter navegação responsiva, teclado, foco visível, pt-BR e estados vazios; preservar webcam/mídia do protótipo original sem acioná-las pelo painel.
- [x] Não enviar dados pessoais, chamar endpoint, iniciar OAuth, usar webcam virtual, instalar a extensão ou executar testes no dispositivo do usuário.
- [ ] Salvar o painel no repositório GitHub autorizado.

Evidência: smoke test integrado aprovado, incluindo exportação JSON e digest do ZIP. Na checagem automática do painel, zero violações nos oito estados desktop/mobile; um alvo de contraste inconclusivo permanece para revisão humana, separado dos relatórios da extensão. Fotos importadas continuam sendo apenas prévias locais e não substituem captura oficial exigida.
