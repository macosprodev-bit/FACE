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

## 8. Envio de payload fictício para endpoint de teste
- [x] Permitir editar o endpoint HTTPS e todos os campos enviados; só enviar após ação explícita e confirmação de que o endpoint está sob controle da pessoa e que os dados são fictícios.
- [x] Enviar somente um JSON com anotações editáveis de IP, CPF, latitude, longitude, URL de mapa, componente/versão/origem/status/motivo/número de documento simulados e uma imagem sintética sem rosto; nunca enviar a imagem importada.
- [x] Manter fixos os sinalizadores de segurança (“teste”, “simulado”, “não verificado” e “imagem sintética”); não criar nem validar assinatura criptográfica, não incluir cookies/credenciais e exibir resultado ou erro de conexão/CORS sem revelar resposta bruta do endpoint.
