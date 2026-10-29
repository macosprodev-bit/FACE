const icons = {home:'⌂', verify:'◉', history:'↺', help:'?', build:'⌘'};
const navItems = [
  {id:'home',label:'Início'},
  {id:'verify',label:'Verificação'},
  {id:'history',label:'Histórico'},
  {id:'help',label:'Ajuda'},
  {id:'build',label:'Construir'}
];
const titles = {home:'Início',verify:'Verificação',history:'Histórico',permission:'Permissões',prepare:'Preparação',live:'Verificação oficial',fallback:'Opções sem câmera',alternate:'Alternativa autorizada',success:'Tudo certo',failure:'Não foi concluída',help:'Ajuda com a câmera',build:'Para construir de verdade'};
const DEMO_HISTORY = [
  {id:'demo-1',service:'Portal Aurora',domain:'conta.aurora.example',time:'29 out 2026 · 09:41',method:'Verificação oficial por câmera'},
  {id:'demo-2',service:'Conta Horizonte',domain:'login.horizonte.example',time:'28 out 2026 · 18:23',method:'Chave de acesso (passkey)'},
  {id:'demo-3',service:'Serviço Alameda',domain:'secure.alameda.example',time:'26 out 2026 · 12:06',method:'Alternativa autorizada pelo serviço'}
];
const DEMO_SIGNATURE_DEFAULTS = Object.freeze({component:'Componente fictício',version:'0.0.0-demo',availableAt:'Ambiente de teste',processStatus:'Processo de assinatura simulado',reason:'Finalização automática após a última assinatura habilitada.',documentNumber:'3f8becaf-0f01-42a5-a263-746a0015fd38'});
const state = {
  page:'home', permission:'unknown', issue:'none', checks:{frame:false,light:false,privacy:false},
  altAuthorized:false, fileName:'', fileUrl:'', validating:false, uploadSequence:0,
  mediaFileName:'', mediaFileUrl:'', mediaPendingUrl:'', mediaType:'', mediaInfo:null, mediaAnnotations:null, mediaError:'', mediaValidating:false, mediaSequence:0,
  signatureAnnotations:{...DEMO_SIGNATURE_DEFAULTS}, testEndpoint:'', testPayloadVisible:false, testPayloadJson:'',
  cameraStream:null, cameraBusy:false, cameraReady:false, cameraCapturing:false, cameraError:'', cameraPhotoUrl:'', cameraPhotoInfo:null, cameraAnnotations:{label:'',note:''}, cameraRequestSequence:0, cameraCaptureSequence:0,
  authHistory:DEMO_HISTORY.map(entry=>({...entry})), historyQuery:'', clearHistoryConfirm:false, toastTimer:null
};
function stopWebcamStream(){
  if(state.cameraStream) state.cameraStream.getTracks().forEach(track=>track.stop());
  state.cameraStream=null;state.cameraReady=false;
}
function clearWebcamPhoto(){
  if(state.cameraPhotoUrl) URL.revokeObjectURL(state.cameraPhotoUrl);
  state.cameraPhotoUrl='';state.cameraPhotoInfo=null;
}
function resetWebcamState(){
  state.cameraRequestSequence+=1;state.cameraCaptureSequence+=1;
  stopWebcamStream();clearWebcamPhoto();
  state.cameraBusy=false;state.cameraCapturing=false;state.cameraError='';
  state.cameraAnnotations={label:'',note:''};
}
function cameraFailureMessage(error){
  if(error?.name==='NotAllowedError'||error?.name==='SecurityError') return 'O navegador ou o sistema bloqueou a webcam. Permita o acesso para este site HTTPS; se a prévia estiver incorporada, abra-a em uma aba do navegador.';
  if(error?.name==='NotFoundError'||error?.name==='DevicesNotFoundError') return 'Nenhuma webcam foi encontrada. Confira se a câmera integrada está habilitada no Windows e tente novamente.';
  if(error?.name==='NotReadableError'||error?.name==='AbortError') return 'A webcam está ocupada ou desativada. Feche outros aplicativos que a usam e confira as configurações do Windows.';
  return 'Não foi possível iniciar a webcam neste navegador. Confira a permissão do site e as configurações da câmera.';
}
async function startWebcam(){
  if(state.cameraBusy||state.cameraStream) return;
  if(!window.isSecureContext){state.cameraError='A webcam exige uma página segura HTTPS.';render();return;}
  const devices=navigator.mediaDevices;
  if(!devices||typeof devices.getUserMedia!=='function'){state.cameraError='Este navegador ou a prévia incorporada não disponibiliza a webcam. Tente abrir a prévia em uma aba HTTPS.';render();return;}
  const requestId=++state.cameraRequestSequence;
  state.cameraBusy=true;state.cameraReady=false;state.cameraError='';render();
  try{
    const stream=await devices.getUserMedia({video:{facingMode:{ideal:'user'}},audio:false});
    if(requestId!==state.cameraRequestSequence||state.page!=='live'){stream.getTracks().forEach(track=>track.stop());return;}
    state.cameraStream=stream;state.cameraBusy=false;render();
  }catch(error){
    if(requestId!==state.cameraRequestSequence||state.page!=='live') return;
    state.cameraBusy=false;state.cameraError=cameraFailureMessage(error);render();
  }
}
function captureWebcamPhoto(){
  const video=document.getElementById('webcamVideo');
  if(!state.cameraStream||!video||video.videoWidth<1||video.videoHeight<1){state.cameraError='A prévia da webcam ainda está iniciando. Aguarde um instante e tente novamente.';render();return;}
  if(state.cameraCapturing) return;
  state.cameraCapturing=true;
  const captureId=++state.cameraCaptureSequence;
  const width=video.videoWidth,height=video.videoHeight;
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const context=canvas.getContext('2d');
  if(!context){state.cameraCapturing=false;state.cameraError='Não foi possível preparar a foto local neste navegador.';render();return;}
  context.drawImage(video,0,0,width,height);
  const captureButton=screen.querySelector('[data-action="camera-capture"]');
  if(captureButton){captureButton.disabled=true;captureButton.textContent='Capturando…';}
  try{
    canvas.toBlob(blob=>{
      if(captureId!==state.cameraCaptureSequence||state.page!=='live') return;
      state.cameraCapturing=false;
      if(!blob){state.cameraError='A foto não pôde ser criada. Tente novamente.';render();return;}
      clearWebcamPhoto();state.cameraPhotoUrl=URL.createObjectURL(blob);state.cameraPhotoInfo={width,height,size:formatBytes(blob.size),mimeType:'image/png',capturedAt:new Date().toISOString()};
      stopWebcamStream();state.cameraError='';render();notify('Foto capturada localmente. A webcam foi desligada; a foto não foi enviada.');
    },'image/png');
  }catch{
    state.cameraCapturing=false;state.cameraError='A foto não pôde ser criada. Tente novamente.';render();
  }
}
const screen = document.getElementById('screenRoot');
const pageTitle = document.getElementById('pageTitle');
const eyebrow = document.getElementById('eyebrow');
const toast = document.getElementById('toast');

function navMarkup(className){
  return navItems.map(item=>`<button class="nav-item ${state.page===item.id?'active':''}" data-page="${item.id}" ${state.page===item.id?'aria-current="page"':''}><span class="nav-icon" aria-hidden="true">${icons[item.id]}</span><span>${item.label}</span>${className==='side-nav'?'<span class="nav-arrow" aria-hidden="true">›</span>':''}</button>`).join('');
}
function setPage(page){
  if(!titles[page]) return;
  if(state.page==='live'&&page!=='live'){
    if(state.mediaValidating){
      state.mediaSequence+=1;state.mediaValidating=false;
      if(state.mediaPendingUrl){URL.revokeObjectURL(state.mediaPendingUrl);state.mediaPendingUrl='';}
    }
    resetWebcamState();
  }
  state.page=page;
  render();
  window.scrollTo({top:0,behavior:'smooth'});
}
function notify(message){
  toast.textContent=message;
  toast.classList.add('show');
  clearTimeout(state.toastTimer);
  state.toastTimer=setTimeout(()=>toast.classList.remove('show'),2600);
}
function button(text, action, cls='btn btn-primary', disabled=false){
  return `<button class="${cls}" data-action="${action}" ${disabled?'disabled':''}>${text}</button>`;
}
function render(){
  document.querySelector('#sideNav').innerHTML=navMarkup('side-nav');
  document.querySelector('#bottomNav').innerHTML=navMarkup('bottom-nav');
  pageTitle.textContent=titles[state.page]||'Verifica';
  eyebrow.textContent=state.page==='build'?'NOTAS DE IMPLEMENTAÇÃO':state.page==='history'?'REGISTROS DE DEMONSTRAÇÃO':'ASSISTENTE DE VERIFICAÇÃO';
  screen.innerHTML=views[state.page]();
  bindScreenControls();
}
const views={
  home(){return `
    <div class="hero-grid">
      <section class="hero-card">
        <div class="hero-kicker"><span></span> UM PASSO A PASSO SEGURO</div>
        <h2>Sua verificação,<br>sem surpresas.</h2>
        <p>Prepare a câmera e entenda cada etapa antes de começar no serviço oficial.</p>
        <div class="button-row">${button('Preparar câmera <span aria-hidden="true">→</span>','permission','btn btn-primary')}<button class="btn btn-ghost" data-page="verify">Como funciona</button></div>
      </section>
      <aside class="hero-aside">
        <div><div class="aside-icon" aria-hidden="true">⌁</div><h3>Você mantém o controle</h3><p>A webcam só é solicitada após seu clique; a foto capturada fica nesta tela. Mídias e prévias de dados permanecem locais; nenhuma chamada de rede é feita.</p></div>
        <button class="mini-link" data-page="build">Veja como seria construído <span aria-hidden="true">→</span></button>
      </aside>
    </div>
    <div class="safety-banner"><span class="banner-icon" aria-hidden="true">◆</span><div><strong>A verificação continua no serviço oficial.</strong><p>Não substituímos câmera, não simulamos presença e não contornamos verificações de identidade.</p></div></div>
    <div class="section-label">ESCOLHA SEU PRÓXIMO PASSO</div>
    <div class="quick-grid">
      <button class="quick-card" data-page="verify"><span class="quick-icon" aria-hidden="true">◉</span><span><strong>Entender o fluxo</strong><small>Veja as etapas antes de iniciar.</small></span></button>
      <button class="quick-card" data-page="help"><span class="quick-icon" aria-hidden="true">⌕</span><span><strong>Resolver um problema</strong><small>Permissão, luz ou dispositivo.</small></span></button>
      <button class="quick-card" data-page="build"><span class="quick-icon" aria-hidden="true">⌘</span><span><strong>Planejar a extensão real</strong><small>Requisitos de produto e segurança.</small></span></button>
    </div>`;},
  verify(){return `
    <div class="content-layout">
      <section class="panel">
        <div class="panel-heading"><div><h2>Uma jornada transparente</h2><p>O serviço oficial conduz a verificação. O Verifica só ajuda você a chegar preparado.</p></div><span class="state-chip chip-blue">3 etapas</span></div>
        <div class="step-list">
          <div class="step-row"><span class="step-num">1</span><div><strong>Prepare o ambiente</strong><p>Encontre luz uniforme, posicione a câmera na altura dos olhos e feche outros apps que possam usá-la.</p></div></div>
          <div class="step-row"><span class="step-num">2</span><div><strong>Revise a permissão</strong><p>O navegador pede acesso à câmera somente no contexto do site oficial e após sua ação.</p></div></div>
          <div class="step-row"><span class="step-num">3</span><div><strong>Conclua no serviço de origem</strong><p>Presença e identidade são verificadas pelo provedor — nunca por uma imagem estática neste protótipo.</p></div></div>
        </div>
        <div class="callout info"><span class="callout-icon">i</span><div><strong>Este fluxo é demonstrativo.</strong> A webcam só é solicitada após clique explícito no painel local; a foto não autentica nem é enviada. A URL do endpoint é apenas editável: a prévia de JSON e PNG sintético é local e nenhuma chamada de rede é feita.</div></div>
        ${button('Começar preparação <span aria-hidden="true">→</span>','permission')}
      </section>
      <aside>
        <section class="panel"><div class="panel-heading"><div><h2>Antes de começar</h2><p>Pequenas verificações que ajudam.</p></div></div>
          <div class="checklist">
            <div class="step-row"><span class="step-num">✓</span><div><strong>Confira o endereço</strong><p>Use somente o domínio esperado do serviço oficial.</p></div></div>
            <div class="step-row"><span class="step-num">✓</span><div><strong>Leia a solicitação</strong><p>Conceda permissões apenas quando entender por que são necessárias.</p></div></div>
            <div class="step-row"><span class="step-num">✓</span><div><strong>Procure ajuda oficial</strong><p>Se algo parecer estranho, interrompa e fale com o suporte do serviço.</p></div></div>
          </div>
          <button class="text-button" data-page="help">Precisa de ajuda com a câmera? →</button>
        </section>
      </aside>
    </div>`;},
  permission(){
    const denied=state.permission==='denied';
    const blocked=state.permission==='blocked';
    const restricted=denied||blocked;
    const permissionLabel=denied?'Negada':blocked?'Bloqueada':state.permission==='granted'?'Concedida':'Ainda não solicitada';
    const permissionMessage=denied?'A solicitação foi recusada. Revise o pedido e escolha conscientemente se quer tentar novamente.':blocked?'O navegador bloqueou a permissão. Altere a configuração do site no navegador antes de continuar.':'';
    return `<div class="content-layout">
      <section class="panel">
        <div class="panel-heading"><div><h2>Permissão de câmera</h2><p>Em uma extensão real, o pedido deve ser contextual e partir de um serviço autorizado.</p></div><span class="state-chip ${restricted?'chip-red':state.permission==='granted'?'chip-green':'chip-gold'}">${permissionLabel}</span></div>
        ${restricted?`<div class="callout danger"><span class="callout-icon">!</span><div><strong>${permissionLabel}.</strong> ${permissionMessage}</div></div>`:`<div class="permission-card"><span class="big-icon" aria-hidden="true">◎</span><div><h3>Por que a câmera pode ser necessária?</h3><p>Alguns serviços oficiais usam vídeo ao vivo para verificar presença. Neste protótipo, a webcam só pode ser usada no painel de captura local após seu clique; a foto não é enviada nem usada para autenticar.</p></div></div>`}
        <div class="section-label">SIMULAR ESTADO DA PERMISSÃO</div>
        <div class="radio-stack">
          <label class="option-row"><input type="radio" name="perm" value="granted" ${state.permission==='granted'?'checked':''}><span><strong>Concedida pelo navegador</strong><small>O fluxo oficial pode solicitar acesso no momento adequado.</small></span></label>
          <label class="option-row"><input type="radio" name="perm" value="denied" ${denied?'checked':''}><span><strong>Negada</strong><small>A pessoa recusou o pedido desta vez.</small></span></label>
          <label class="option-row"><input type="radio" name="perm" value="blocked" ${blocked?'checked':''}><span><strong>Bloqueada pelo navegador</strong><small>A permissão precisa ser alterada nas configurações do site.</small></span></label>
        </div>
        <div class="callout warning"><span class="callout-icon">⚠</span><div><strong>Estados demonstrativos.</strong> “Simular estado” não abre a câmera nem altera permissões; o acesso real da webcam só é solicitado depois, pelo botão local explícito.</div></div>
        <div class="button-row">${button(restricted?'Ver diagnóstico da câmera':'Continuar para preparação <span aria-hidden="true">→</span>',restricted?'help':'prepare',restricted?'btn btn-secondary':'btn btn-primary',state.permission==='unknown')}<button class="btn btn-outline" data-page="help">Ajuda</button></div>
        <button class="text-button fallback-link" data-page="fallback">A câmera não funciona? Ver opções seguras →</button>
      </section>
      <aside><section class="panel"><h2>Permissão com contexto</h2><p class="panel-lead">A extensão real deve pedir acesso só quando necessário, explicar o motivo e respeitar a decisão da pessoa.</p><div class="divider"></div><div class="step-row"><span class="step-num">1</span><div><strong>Confira o site</strong><p>O domínio deve ser o serviço que iniciou a verificação.</p></div></div><div class="step-row"><span class="step-num">2</span><div><strong>Escolha conscientemente</strong><p>Negar não deve acionar qualquer método oculto ou alternativo.</p></div></div></section></aside>
    </div>`;
  },
  prepare(){return `
    <div class="content-layout">
      <section class="panel">
        <div class="panel-heading"><div><h2>Prepare-se para começar</h2><p>Marque os itens quando estiver tudo pronto. Nada será capturado aqui.</p></div><div class="step-indicator" aria-label="Etapa 2 de 3"><span class="on"></span><span class="on"></span><span></span></div></div>
        <div class="checklist">
          <label class="check-row"><input type="checkbox" data-check="frame" ${state.checks.frame?'checked':''}><span><strong>Enquadramento</strong><small>Posicione o dispositivo de forma estável, na altura dos olhos.</small></span></label>
          <label class="check-row"><input type="checkbox" data-check="light" ${state.checks.light?'checked':''}><span><strong>Iluminação</strong><small>Prefira luz uniforme à sua frente; evite contraluz forte.</small></span></label>
          <label class="check-row"><input type="checkbox" data-check="privacy" ${state.checks.privacy?'checked':''}><span><strong>Privacidade</strong><small>Confirme que está no site correto e confortável para continuar.</small></span></label>
        </div>
        <div class="callout info"><span class="callout-icon">i</span><div><strong>Você decide quando continuar.</strong> O serviço oficial apresentará suas instruções e controles de câmera.</div></div>
        <div class="button-row">${button('Iniciar demonstração oficial <span aria-hidden="true">→</span>','live','btn btn-primary',!Object.values(state.checks).every(Boolean))}<button class="btn btn-outline" data-page="help">Preciso de ajuda</button></div>
      </section>
      <aside><section class="panel"><span class="state-chip chip-green">✓ Preparação</span><h2 style="margin-top:14px">O que esta tela não faz</h2><p class="panel-lead">Nesta etapa, não ativa sensores, não grava vídeo, não lê seu rosto nem envia a imagem escolhida. A URL de teste não é chamada; um JSON e um PNG sintético podem ser pré-visualizados localmente.</p><div class="divider"></div><button class="text-button" data-page="build">Ver requisitos técnicos →</button></section></aside>
    </div>`;},
  live(){return `
    <div class="content-layout">
      <section class="panel">
        <div class="panel-heading"><div><h2>Você está no controle</h2><p>A verificação real deve acontecer no site ou app oficial do provedor.</p></div><span class="state-chip chip-blue">Demonstração</span></div>
        <div class="sim-preview"><div class="preview-content"><div class="face-outline" aria-hidden="true"></div><strong>Área visual ilustrativa</strong><small>A webcam só é solicitada após seu clique no painel local abaixo.</small></div></div>
        <section class="webcam-capture-card" aria-labelledby="webcamCaptureTitle">
          <div class="media-local-heading"><div><h3 id="webcamCaptureTitle">Capturar foto da webcam</h3><p>Acesso opcional, iniciado por você; não cria uma webcam virtual.</p></div><span class="state-chip chip-gold">Somente local</span></div>
          ${state.cameraStream?`<video id="webcamVideo" class="webcam-preview" autoplay muted playsinline aria-label="Prévia ao vivo da webcam"></video>`:state.cameraPhotoUrl?`<img class="webcam-preview" src="${state.cameraPhotoUrl}" alt="Foto capturada localmente da webcam">`:'<div class="webcam-placeholder"><span aria-hidden="true">◎</span><strong>Nenhuma câmera ativa</strong><small>Clique em “Ativar webcam” para solicitar permissão.</small></div>'}
          ${state.cameraPhotoInfo?`<dl class="webcam-tech-details"><div><dt>Formato</dt><dd>${escapeHTML(state.cameraPhotoInfo.mimeType)}</dd></div><div><dt>Resolução</dt><dd>${state.cameraPhotoInfo.width} × ${state.cameraPhotoInfo.height} px</dd></div><div><dt>Tamanho</dt><dd>${escapeHTML(state.cameraPhotoInfo.size)}</dd></div><div><dt>Horário do navegador</dt><dd>${escapeHTML(new Date(state.cameraPhotoInfo.capturedAt).toLocaleString('pt-BR'))} · não verificado</dd></div></dl>`:''}
          <section class="webcam-annotation-panel" aria-labelledby="webcamAnnotationsTitle"><div class="media-annotations-heading"><div><h4 id="webcamAnnotationsTitle">Anotações locais</h4><p>Editáveis, não verificadas</p></div><span class="state-chip chip-gold">Não fazem parte do arquivo</span></div><div class="webcam-annotation-fields"><label>Rótulo local<input data-camera-annotation="label" type="text" maxlength="100" value="${escapeHTML(state.cameraAnnotations.label)}" placeholder="Ex.: captura de teste" autocomplete="off"></label><label>Observação<input data-camera-annotation="note" type="text" maxlength="240" value="${escapeHTML(state.cameraAnnotations.note)}" placeholder="Nota opcional" autocomplete="off"></label></div><p class="media-annotations-note">As anotações ficam apenas nesta sessão. Não alteram pixels, EXIF, horário, localização ou origem da webcam e não são enviadas ao endpoint.</p></section>
          <p class="webcam-status ${state.cameraError?'media-error':''}" id="webcamStatus" role="status" aria-live="polite">${state.cameraBusy?'Aguardando a permissão do navegador…':state.cameraError?escapeHTML(state.cameraError):state.cameraStream?'Webcam ativa somente para a prévia; nada é salvo até você capturar.':state.cameraPhotoUrl?'Foto disponível apenas nesta tela; a webcam está desligada.':'A permissão só será solicitada após seu clique. Nenhuma captura é automática.'}</p>
          <div class="button-row">${state.cameraStream?button(state.cameraCapturing?'Capturando…':'Capturar foto','camera-capture','btn btn-primary',!state.cameraReady||state.cameraCapturing):button(state.cameraBusy?'Solicitando permissão…':'Ativar webcam','camera-start','btn btn-primary',state.cameraBusy)}${state.cameraStream?button('Parar câmera','camera-stop','btn btn-outline',state.cameraCapturing):''}${state.cameraPhotoUrl?button('Remover foto','camera-clear','btn btn-outline btn-small'):''}</div>
          <p class="tiny-note">Sem microfone. A foto capturada fica em memória nesta tela, não verifica identidade ou prova de vida e não é incluída na prévia JSON local, que usa apenas o PNG sintético. Outros aplicativos continuam usando as câmeras instaladas no sistema.</p>
        </section>
        <section class="media-local-tools" aria-labelledby="mediaPreviewTitle"><div class="media-local-heading"><div><h3 id="mediaPreviewTitle">Pré-visualização local</h3><p>Selecione uma imagem ou vídeo para visualizar neste navegador.</p></div><span class="state-chip chip-blue">Arquivo local</span></div>
          <div class="button-row"><div class="media-picker-group"><label class="media-picker-button" for="mediaInput">Importar imagem ou vídeo</label><input id="mediaInput" class="media-file-input" type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" aria-label="Selecionar arquivo para pré-visualização local"></div>${state.mediaFileUrl||state.mediaValidating?button('Remover mídia','media-clear','btn btn-outline btn-small'):''}</div>
          <p class="media-status ${state.mediaError?'media-error':''}" id="mediaStatus" role="status" aria-live="polite">${state.mediaValidating?'Validando o arquivo localmente…':state.mediaError?escapeHTML(state.mediaError):state.mediaFileName?`Pronto para visualizar: ${escapeHTML(state.mediaFileName)}`:'JPG, PNG, WebP, MP4 ou WebM · até 25 MB.'}</p>
          ${state.mediaFileUrl&&state.mediaType==='video'?`<video class="media-preview" src="${state.mediaFileUrl}" controls playsinline preload="metadata" aria-label="Pré-visualização local do vídeo"></video>`:state.mediaFileUrl?`<img class="media-preview" src="${state.mediaFileUrl}" alt="Pré-visualização local da imagem">`:''}
          ${state.mediaInfo?`<div class="media-validation-card"><div class="media-validation-heading"><span class="validation-mark" aria-hidden="true">✓</span><div><strong>Válida para visualização local</strong><small>Arquivo decodificado neste navegador.</small></div></div><dl class="media-meta-grid"><div><dt>Formato</dt><dd>${escapeHTML(state.mediaInfo.type)}</dd></div><div><dt>Tamanho</dt><dd>${escapeHTML(state.mediaInfo.size)}</dd></div><div><dt>Dimensões</dt><dd>${state.mediaInfo.width} × ${state.mediaInfo.height} px</dd></div>${state.mediaType==='video'?`<div><dt>Duração</dt><dd>${state.mediaInfo.duration===null?'Não disponível':`${state.mediaInfo.duration.toFixed(1)} s`}</dd></div>`:''}<div><dt>Decodificação</dt><dd>OK</dd></div></dl><p class="media-validation-note">Validação técnica local; não verifica rosto, identidade, presença, prova de vida ou aceitação do serviço.</p></div>`:''}
          ${mediaAnnotationsPanel()}
          <div class="callout warning media-warning"><span class="callout-icon">!</span><div>A imagem/vídeo importado permanece neste navegador e nunca é incluído na prévia JSON. O botão abaixo apenas monta localmente dados fictícios e um PNG sintético; nenhum endpoint é chamado.</div></div>
        </section>
        <p class="security-footnote">Em um produto real, o Verifica não substitui o fluxo do provedor nem interfere no vídeo usado para verificação de presença.</p>
        <div class="button-row" style="margin-top:15px">${button('Simular conclusão bem-sucedida','success','btn btn-primary')}${button('Simular falha','failure','btn btn-outline')}</div>
      </section>
      <aside><section class="panel"><h2>Método alternativo?</h2><p class="panel-lead">Uma opção por imagem só aparece se o próprio serviço oficial declarar que ela é permitida.</p>
        <div class="auth-signal"><div class="auth-signal-top"><div><strong>Sinal de autorização do serviço</strong><p>A chave abaixo é apenas uma simulação visual — não representa um sinal real ou confiável.</p></div></div>
          <label class="switch-label" style="margin-top:12px"><input type="checkbox" id="authorizationSignal" ${state.altAuthorized?'checked':''}> Simular autorização explícita</label>
        </div>
        <div id="alternativeEntry" class="${state.altAuthorized?'':'hidden'}" style="margin-top:12px"><div class="callout success"><span class="callout-icon">✓</span><div><strong>Alternativa demonstrativa liberada.</strong> Em produção, a decisão viria do provedor oficial por integração confiável.</div></div>${button('Ver método autorizado <span aria-hidden="true">→</span>','alternate','btn btn-secondary')}</div>
        ${!state.altAuthorized?'<p class="tiny-note">Sem autorização explícita, nenhuma opção de upload deve ser mostrada.</p>':''}
      </section></aside>
    </div>`;},
  fallback(){return `
    <div class="content-layout"><section class="panel"><div class="panel-heading"><div><h2>A câmera não funciona?</h2><p>Você pode seguir opções seguras sem tentar contornar a verificação.</p></div><span class="state-chip chip-gold">Alternativa segura</span></div>
      <div class="step-list"><div class="step-row"><span class="step-num">1</span><div><strong>Tente outro dispositivo confiável</strong><p>Abra o site ou app oficial em um aparelho com câmera funcional e confira o domínio antes de continuar.</p></div></div>
        <div class="step-row"><span class="step-num">2</span><div><strong>Veja se o serviço oferece outro método</strong><p>Use passkey, aplicativo oficial ou outro método sem câmera somente se ele aparecer nas opções do próprio serviço.</p></div></div>
        <div class="step-row"><span class="step-num">3</span><div><strong>Fale com o suporte oficial</strong><p>Se não houver método alternativo, procure o suporte pelo site ou app oficial. Não envie imagens ou vídeos por canais desconhecidos.</p></div></div></div>
      <div class="callout warning"><span class="callout-icon">!</span><div><strong>Importar mídia não resolve a verificação.</strong> O botão de imagem/vídeo deste protótipo serve só para pré-visualização local; não substitui câmera nem prova de vida.</div></div>
      <div class="button-row">${button('Rever permissões','permission','btn btn-outline')}${button('Abrir diagnóstico','help','btn btn-secondary')}</div>
    </section><aside><section class="panel"><span class="state-chip chip-blue">Sem câmera</span><h2 style="margin-top:14px">A decisão é do provedor</h2><p class="panel-lead">O Verifica não inventa um método de autenticação. Só o serviço que pediu a verificação pode autorizar uma alternativa.</p></section></aside></div>`;},
  alternate(){
    if(!state.altAuthorized) return `<section class="panel result-card"><div class="result-icon fail">!</div><h2>Alternativa indisponível</h2><p>O serviço não informou que aceita outro método. Continue pelo fluxo oficial ou fale com o suporte.</p>${button('Voltar à verificação','live')}</section>`;
    return `<div class="content-layout"><section class="panel"><div class="panel-heading"><div><h2>Método alternativo autorizado</h2><p>Esta opção só existe na demonstração porque você ativou o sinal simulado do serviço.</p></div><span class="state-chip chip-green">Autorização simulada</span></div>
      <div class="callout warning"><span class="callout-icon">⚠</span><div><strong>Demonstração local — não é um login real.</strong> A imagem escolhida fica no navegador e não é enviada a ninguém.</div></div>
      <label class="upload-zone" for="imageInput"><span class="upload-icon" aria-hidden="true">↑</span><strong>Escolher imagem de demonstração</strong><small>JPG, PNG ou WebP · até 10 MB no produto real</small><input id="imageInput" type="file" accept="image/png,image/jpeg,image/webp">${state.fileUrl?`<img class="upload-preview" src="${state.fileUrl}" alt="Prévia local da imagem selecionada">`:''}</label>
      <p class="tiny-note" id="fileStatus">${state.validating?'Validando se o arquivo pode ser aberto como imagem neste navegador…':state.fileName?`Imagem selecionada localmente: ${escapeHTML(state.fileName)}`:'Nenhuma imagem foi selecionada.'}</p>
      <div class="callout info"><span class="callout-icon">i</span><div>Uma extensão real só poderia encaminhar um arquivo se o provedor documentasse e autorizasse esse método, com consentimento informado.</div></div>
      <div class="button-row">${button('Concluir demonstração','success','btn btn-primary',!state.fileName||state.validating)}<button class="btn btn-outline" data-page="live">Voltar</button></div>
    </section><aside><section class="panel"><h2>Antes de enviar em produção</h2><p class="panel-lead">A autorização precisa vir do serviço de origem; uma preferência local não basta. Exija domínio verificado, integração documentada, consentimento e finalidade clara.</p><div class="divider"></div><button class="text-button" data-page="build">Revisar requisitos de segurança →</button></section></aside></div>`;
  },
  success(){return `<section class="result-card"><div class="result-icon">✓</div><h2>Demonstração concluída</h2><p>Nenhuma verificação real aconteceu. A foto da webcam permanece local e nenhuma requisição é enviada pelo protótipo.</p><div class="result-next"><strong>Em um serviço real</strong>Confirme qualquer resultado no canal oficial. Se a verificação não aparecer como concluída, não repita o envio — contate o suporte do serviço.</div><div class="button-row" style="justify-content:center">${button('Voltar ao início','home','btn btn-primary')}${button('Rever requisitos','build','btn btn-outline')}</div></section>`;},
  failure(){return `<section class="result-card"><div class="result-icon fail">!</div><h2>Não foi concluída</h2><p>Falhas podem acontecer por permissão, iluminação ou instabilidade do serviço. O Verifica não altera nem contorna o resultado do provedor.</p><div class="result-next"><strong>Próximos passos seguros</strong>1. Consulte a mensagem do serviço oficial.<br>2. Revise a permissão e as condições da câmera.<br>3. Se persistir, peça ajuda ao suporte oficial.</div><div class="button-row" style="justify-content:center">${button('Tentar novamente','permission','btn btn-primary')}${button('Abrir diagnóstico','help','btn btn-outline')}</div></section>`;},
  history(){
    const records=state.authHistory;
    return `<section class="panel history-panel">
      <div class="history-intro"><div><span class="state-chip chip-green">${records.length} ${records.length===1?'registro':'registros'} de exemplo</span><h2>Autenticações bem-sucedidas</h2><p>Um resumo demonstrativo de acessos confirmados no serviço de origem.</p></div><span class="history-mark" aria-hidden="true">✓</span></div>
      <div class="callout info history-privacy"><span class="callout-icon">i</span><div><strong>Somente dados fictícios.</strong> Esta tela não registra autenticações reais nem armazena senhas, tokens, imagens ou dados biométricos. Os exemplos existem apenas nesta sessão.</div></div>
      <div class="history-tools"><label class="history-search"><span aria-hidden="true">⌕</span><span class="sr-only">Buscar no histórico</span><input id="historySearch" type="search" placeholder="Buscar serviço, domínio ou método" value="${escapeHTML(state.historyQuery)}"></label>
        ${records.length?button('Limpar exemplos','history-clear','btn btn-outline btn-small'):button('Restaurar exemplos','history-restore','btn btn-secondary btn-small')}
      </div>
      ${state.clearHistoryConfirm?`<div class="history-confirm"><div><strong>Limpar os registros fictícios?</strong><p>Isso afeta apenas os exemplos desta demonstração.</p></div><div class="button-row">${button('Limpar agora','history-clear-confirm','btn btn-primary btn-small')}${button('Cancelar','history-clear-cancel','btn btn-outline btn-small')}</div></div>`:''}
      <div class="history-list" id="historyList">${records.map(entry=>`<article class="history-row" data-search="${escapeHTML(`${entry.service} ${entry.domain} ${entry.method}`.toLocaleLowerCase('pt-BR'))}">
        <span class="history-success" aria-hidden="true">✓</span><div class="history-details"><div class="history-service"><strong>${escapeHTML(entry.service)}</strong><span class="state-chip chip-green">Sucesso</span></div><span class="history-domain">${escapeHTML(entry.domain)}</span><div class="history-meta"><span>${escapeHTML(entry.time)}</span><span class="history-separator">·</span><span>${escapeHTML(entry.method)}</span></div></div>
      </article>`).join('')}</div>
      <div class="history-empty ${records.length?'hidden':''}" id="historyEmpty"><strong>Histórico de exemplo vazio</strong><p>Nenhuma autenticação real foi registrada.</p></div>
      <div class="history-empty hidden" id="historyNoResults"><strong>Nenhum resultado</strong><p>Tente buscar por outro serviço, domínio ou método.</p></div>
      <p class="tiny-note">As autenticações reais devem ser consultadas e gerenciadas no serviço que as realizou.</p>
    </section>`;
  },
  help(){
    const issues=[
      {id:'permission',icon:'▣',title:'Sem permissão',desc:'O navegador bloqueou o acesso.'},
      {id:'device',icon:'⌕',title:'Câmera indisponível',desc:'O dispositivo não foi encontrado.'},
      {id:'busy',icon:'◷',title:'Câmera em uso',desc:'Outro app pode estar usando.'},
      {id:'light',icon:'☼',title:'Pouca iluminação',desc:'A imagem pode estar escura.'}
    ];
    const selected=issues.find(i=>i.id===state.issue)||issues[0];
    const guidance={permission:['Confira o ícone de câmera perto do endereço do site.','Abra as configurações de privacidade do navegador e permita câmera apenas para o domínio oficial.','Recarregue a página e tente pelo próprio serviço.'],device:['Confira se o dispositivo tem câmera e se está conectado.','Feche e reabra o navegador; em desktop, veja as configurações do sistema.','Se não houver câmera disponível, pergunte ao serviço oficial por uma alternativa autorizada.'],busy:['Feche outros apps ou abas que estejam usando a câmera.','Aguarde alguns segundos e volte ao serviço oficial.','Não instale extensões desconhecidas que prometam pular a verificação.'],light:['Vá para um local com iluminação uniforme.','Evite janela ou luz intensa atrás de você.','Siga as instruções de qualidade apresentadas pelo provedor.']};
    return `<div class="content-layout"><section class="panel"><div class="panel-heading"><div><h2>O que está acontecendo?</h2><p>Escolha uma situação para ver passos seguros de solução.</p></div><span class="state-chip chip-blue">Diagnóstico simulado</span></div>
      <div class="diagnostic-list">${issues.map(i=>`<button class="diagnostic-option ${state.issue===i.id?'selected':''}" data-issue="${i.id}"><span class="diag-icon" aria-hidden="true">${i.icon}</span><strong>${i.title}</strong></button>`).join('')}</div>
      <div class="diagnostic-result"><h3>${selected.title}</h3><p>Experimente os seguintes passos no seu navegador ou no site oficial:</p><ol>${guidance[selected.id].map(s=>`<li>${s}</li>`).join('')}</ol></div>
      <div class="callout info"><span class="callout-icon">i</span><div>Este protótipo não consegue detectar o estado real do seu dispositivo. Os diagnósticos são exemplos interativos.</div></div>
      ${button('Voltar ao fluxo','permission','btn btn-secondary')}
      ${button('Câmera não funciona? Ver opções seguras','fallback','btn btn-outline')}
    </section><aside><section class="panel"><span class="state-chip chip-gold">Dica de segurança</span><h2 style="margin-top:14px">Não compartilhe sua imagem por canais aleatórios</h2><p class="panel-lead">Use somente um fluxo informado pelo serviço que solicitou a verificação. Desconfie de pedidos por chat, e-mail ou sites fora do domínio oficial.</p></section></aside></div>`;
  },
  build(){
    const items=[
      ['⌘','Extensão de navegador','Manifest V3, popup acessível, permissões mínimas e suporte às versões atuais de Chrome, Edge e Firefox.','BASE'],
      ['◎','Integração com serviço oficial','API, SDK ou fluxo documentado pelo provedor; validar domínio e origem dos sinais de autorização.','ESSENCIAL'],
      ['▣','Permissões e câmera','Solicitar a câmera real apenas no contexto oficial, após ação clara da pessoa; tratar concedida, negada e bloqueada. Não criar dispositivo de webcam virtual nem substituir o vídeo recebido por outros aplicativos.','ESSENCIAL'],
      ['⇧','Alternativas autorizadas','Exibir upload somente quando o provedor permitir explicitamente; validar tipo, tamanho, consentimento e destino.','ESSENCIAL'],
      ['◎','Opções se a câmera falhar','Orientar outro dispositivo e métodos sem câmera apenas quando o serviço oficial os oferecer; caso contrário, direcionar ao suporte oficial.','ESSENCIAL'],
      ['↺','Histórico de autenticações','Registrar somente eventos de sucesso confirmados pelo serviço, com retenção e exclusão claras. Nunca guardar senhas, tokens, imagens ou dados biométricos.','ESSENCIAL'],
      ['◇','Privacidade e segurança','Minimização de dados, transmissão criptografada, retenção definida, proteção contra exposição e política de privacidade.','ESSENCIAL'],
      ['♿','Acessibilidade e idioma','Teclado, leitor de tela, foco visível, contraste, linguagem simples e suporte a pt-BR.','QUALIDADE'],
      ['✓','Testes e publicação','Testes em navegadores e dispositivos, revisão de segurança, termos da loja, suporte e monitoramento de falhas.','LANÇAMENTO']
    ];
    return `<p class="docs-intro">Para transformar a demonstração em extensão, o ponto crítico é a integração oficial: o produto não pode interceptar ou falsificar a câmera, criar webcam virtual, nem deduzir autorização por conta própria.</p><div class="docs-list">${items.map(i=>`<article class="docs-row"><span class="docs-icon" aria-hidden="true">${i[0]}</span><div><strong>${i[1]}</strong><p>${i[2]}</p></div><span class="docs-tag ${i[3]==='ESSENCIAL'?'must':''}">${i[3]}</span></article>`).join('')}</div>
      <div class="docs-bottom"><div><strong>O que precisa estar definido antes do desenvolvimento?</strong><p>Nome do serviço de verificação, documentação de integração, política de dados e alternativas oficialmente suportadas.</p></div>${button('Voltar ao início','home','btn btn-primary btn-small')}</div>
      <p class="tiny-note">Estimativa de escopo: requer engenharia de extensão, integração/API do provedor, revisão de privacidade e testes de compatibilidade. Nenhuma integração real está conectada neste protótipo.</p>`;
  }
};
function escapeHTML(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function formatBytes(bytes){
  if(bytes<1024)return `${bytes} B`;
  const units=['KB','MB'];let value=bytes/1024;let unit=0;
  while(value>=1024&&unit<units.length-1){value/=1024;unit+=1;}
  return `${value.toFixed(value>=10?0:1)} ${units[unit]}`;
}
function mediaAnnotationsPanel(){
  if(!state.mediaAnnotations)return '';
  const annotation=state.mediaAnnotations;
  const signature=state.signatureAnnotations;
  return `<section class="media-annotations-card" aria-labelledby="mediaAnnotationsTitle">
    <div class="media-annotations-heading"><div><h3 id="mediaAnnotationsTitle">Anotações de teste</h3><p>Todos os campos abaixo são editáveis e não verificados.</p></div><span class="state-chip chip-gold">Fictícias</span></div>
    <div class="annotation-grid">
      <label>Nome anotado<input data-annotation="fileName" type="text" maxlength="120" value="${escapeHTML(annotation.fileName)}" autocomplete="off"></label>
      <label>IP informado<input data-annotation="ip" type="text" maxlength="45" inputmode="decimal" placeholder="Exemplo fictício" value="${escapeHTML(annotation.ip)}" autocomplete="off"></label>
      <label>CPF informado<input data-annotation="cpf" type="text" maxlength="14" inputmode="numeric" placeholder="Valor fictício" value="${escapeHTML(annotation.cpf)}" autocomplete="off"></label>
      <label>Latitude<input data-annotation="latitude" type="text" maxlength="24" inputmode="decimal" placeholder="Coordenada fictícia" value="${escapeHTML(annotation.latitude)}" autocomplete="off"></label>
      <label>Longitude<input data-annotation="longitude" type="text" maxlength="24" inputmode="decimal" placeholder="Coordenada fictícia" value="${escapeHTML(annotation.longitude)}" autocomplete="off"></label>
      <label>URL para mapa (fictícia)<input data-annotation="mapUrl" type="url" maxlength="500" placeholder="https://maps.example/?q=0,0" value="${escapeHTML(annotation.mapUrl)}" autocomplete="off"></label>
    </div>
    <p class="media-annotations-note">Esses valores não são lidos do dispositivo, não alteram a imagem e não comprovam IP, CPF, localização, identidade ou presença.</p>
  </section>
  <section class="media-annotations-card signature-test-card" aria-labelledby="signatureTestTitle">
    <div class="media-annotations-heading"><div><h3 id="signatureTestTitle">Registro de assinatura de teste</h3><p>Campos fictícios; nenhuma assinatura real é criada ou validada.</p></div><span class="state-chip chip-gold">SIMULADO</span></div>
    <div class="annotation-grid">
      <label>Componente de assinatura<input data-signature="component" type="text" maxlength="120" value="${escapeHTML(signature.component)}" autocomplete="off"></label>
      <label>Versão<input data-signature="version" type="text" maxlength="80" value="${escapeHTML(signature.version)}" autocomplete="off"></label>
      <label>Disponibilizado em<input data-signature="availableAt" type="text" maxlength="120" value="${escapeHTML(signature.availableAt)}" autocomplete="off"></label>
      <label>Status declarado (simulado)<input data-signature="processStatus" type="text" maxlength="160" value="${escapeHTML(signature.processStatus)}" autocomplete="off"></label>
      <label>Motivo informado<input data-signature="reason" type="text" maxlength="240" value="${escapeHTML(signature.reason)}" autocomplete="off"></label>
      <label>Número do documento (teste)<input data-signature="documentNumber" type="text" maxlength="100" value="${escapeHTML(signature.documentNumber)}" autocomplete="off"></label>
    </div>
    <p class="media-annotations-note">O marcador “SIMULADO” é fixo. Este registro não é uma assinatura eletrônica, certificado ou comprovante válido.</p>
  </section>
  <section class="test-send-card" aria-labelledby="testSendTitle">
    <div class="media-annotations-heading"><div><h3 id="testSendTitle">Prévia local do pacote de teste</h3><p>Campo editável apenas como anotação; não há conexão com endpoint.</p></div><span class="state-chip chip-blue">JSON + PNG sintético</span></div>
    <div class="synthetic-image-demo"><img id="syntheticTestPreview" alt="PNG sintético de teste, sem rosto ou pessoa real"><p>Imagem sintética gerada no navegador para esta prévia; nunca é transmitida.</p></div>
    <label class="test-endpoint-label">Endpoint (campo editável, sem conexão)<input id="testEndpoint" type="url" maxlength="500" placeholder="https://seu-endpoint.example/api/teste" value="${escapeHTML(state.testEndpoint)}" autocomplete="off"></label>
    <div class="button-row">${button('Gerar prévia JSON local','test-preview','btn btn-primary')}</div>
    <p class="test-send-status" id="testSendStatus" role="status" aria-live="polite">${state.testPayloadVisible?'Prévia criada apenas nesta tela; nenhuma requisição foi enviada.':'Nenhuma requisição de rede será feita. A URL acima não é usada pelo protótipo.'}</p>
    ${state.testPayloadVisible?`<div class="test-payload-preview"><strong>JSON fictício — somente local</strong><pre>${escapeHTML(state.testPayloadJson)}</pre></div>`:''}
  </section>`;
}
function createSyntheticTestImageDataUrl(){
  const canvas=document.createElement('canvas');canvas.width=320;canvas.height=200;
  const context=canvas.getContext('2d');if(!context)throw new Error('Canvas indisponível para gerar a imagem sintética.');
  context.fillStyle='#edf4f8';context.fillRect(0,0,320,200);
  context.fillStyle='#123d5a';context.fillRect(18,18,284,164);
  context.fillStyle='#f1bd45';context.beginPath();context.arc(73,82,30,0,Math.PI*2);context.fill();
  context.fillStyle='#d8eaf1';context.fillRect(124,48,142,18);context.fillRect(124,80,112,12);context.fillRect(124,105,132,12);
  context.fillStyle='#ffffff';context.font='bold 13px sans-serif';context.fillText('TESTE SINTÉTICO',66,151);
  context.font='10px sans-serif';context.fillText('SEM PESSOA REAL',100,168);
  return canvas.toDataURL('image/png');
}
function createTestPayloadPreview(){
  if(!state.mediaAnnotations)return;
  let syntheticImage;
  try{syntheticImage=createSyntheticTestImageDataUrl();}
  catch{notify('Não foi possível gerar a imagem sintética neste navegador.');return;}
  const payload={
    test_only:true,
    imported_image_included:false,
    annotations:{unverified:true,verification_status:'not_verified',...state.mediaAnnotations},
    signature:{...state.signatureAnnotations,simulated:true,cryptographic_signature_created:false},
    synthetic_image:{file_name:'verifica-imagem-sintetica.png',mime_type:'image/png',synthetic:true,contains_person:false,data_url:syntheticImage}
  };
  state.testPayloadJson=JSON.stringify(payload,null,2);
  state.testPayloadVisible=true;
  render();
  notify('Prévia JSON gerada localmente; nenhuma requisição foi enviada.');
}
function bindScreenControls(){
  const clearMediaSelection=()=>{
    state.mediaSequence+=1;
    [state.mediaFileUrl,state.mediaPendingUrl].filter(Boolean).forEach(url=>URL.revokeObjectURL(url));
    state.mediaFileName='';state.mediaFileUrl='';state.mediaPendingUrl='';state.mediaType='';state.mediaInfo=null;state.mediaAnnotations=null;state.mediaError='';state.mediaValidating=false;
    state.signatureAnnotations={...DEMO_SIGNATURE_DEFAULTS};state.testEndpoint='';state.testPayloadVisible=false;state.testPayloadJson='';
  };
  screen.querySelectorAll('[data-page]').forEach(el=>el.addEventListener('click',()=>setPage(el.dataset.page)));
  screen.querySelectorAll('[data-action]').forEach(el=>el.addEventListener('click',()=>{
    if(el.disabled) return;
    const action=el.dataset.action;
    if(action==='permission'){state.permission='unknown';setPage('permission');}
    else if(action==='prepare'){
      if(state.permission!=='granted'){notify('Simule a permissão concedida para continuar.');return;}
      setPage('prepare');
    } else if(action==='live') setPage('live');
    else if(action==='alternate') setPage('alternate');
    else if(action==='success'||action==='failure') setPage(action);
    else if(action==='help') setPage('help');
    else if(action==='fallback') setPage('fallback');
    else if(action==='home') setPage('home');
    else if(action==='build') setPage('build');
    else if(action==='camera-start') void startWebcam();
    else if(action==='camera-capture') captureWebcamPhoto();
    else if(action==='camera-stop'){state.cameraCaptureSequence+=1;state.cameraCapturing=false;stopWebcamStream();state.cameraError='';render();notify('Webcam desligada.');}
    else if(action==='camera-clear'){state.cameraCaptureSequence+=1;clearWebcamPhoto();state.cameraAnnotations={label:'',note:''};render();notify('Foto local e anotações removidas.');}
    else if(action==='media-open') document.getElementById('mediaInput')?.click();
    else if(action==='test-preview') createTestPayloadPreview();
    else if(action==='media-clear'){clearMediaSelection();render();notify('Pré-visualização local removida.');}
    else if(action==='history-clear'){state.clearHistoryConfirm=true;render();}
    else if(action==='history-clear-cancel'){state.clearHistoryConfirm=false;render();}
    else if(action==='history-clear-confirm'){state.authHistory=[];state.historyQuery='';state.clearHistoryConfirm=false;render();notify('Os registros de exemplo foram removidos.');}
    else if(action==='history-restore'){state.authHistory=DEMO_HISTORY.map(entry=>({...entry}));state.historyQuery='';state.clearHistoryConfirm=false;render();notify('Registros fictícios restaurados.');}
  }));
  screen.querySelectorAll('input[name="perm"]').forEach(input=>input.addEventListener('change',()=>{
    state.permission=input.value;
    if(input.value==='denied') notify('Permissão negada — o fluxo continua bloqueado.');
    else if(input.value==='blocked') notify('Permissão bloqueada — confira as configurações do navegador.');
    else notify('Permissão concedida apenas para a demonstração.');
    render();
  }));
  screen.querySelectorAll('[data-check]').forEach(input=>input.addEventListener('change',()=>{
    state.checks[input.dataset.check]=input.checked;render();
  }));
  screen.querySelectorAll('[data-issue]').forEach(el=>el.addEventListener('click',()=>{state.issue=el.dataset.issue;render();}));
  const historySearch=document.getElementById('historySearch');
  if(historySearch) historySearch.addEventListener('input',()=>{
    state.historyQuery=historySearch.value;
    const query=state.historyQuery.trim().toLocaleLowerCase('pt-BR');
    let visible=0;
    screen.querySelectorAll('.history-row').forEach(row=>{
      const matches=row.dataset.search.includes(query);
      row.classList.toggle('hidden',!matches);
      if(matches) visible+=1;
    });
    const noResults=document.getElementById('historyNoResults');
    if(noResults) noResults.classList.toggle('hidden',visible>0||state.authHistory.length===0);
  });
  const discardSelection=()=>{
    state.uploadSequence+=1;
    if(state.fileUrl) URL.revokeObjectURL(state.fileUrl);
    state.fileName='';
    state.fileUrl='';
    state.validating=false;
  };
  const signal=document.getElementById('authorizationSignal');
  if(signal) signal.addEventListener('change',()=>{
    state.altAuthorized=signal.checked;
    if(!state.altAuthorized) discardSelection();
    render();
    notify(state.altAuthorized?'Sinal autorizado simulado para esta demonstração.':'Alternativa oculta sem autorização.');
  });
  const imageInput=document.getElementById('imageInput');
  if(imageInput) imageInput.addEventListener('change',event=>{
    const file=event.target.files&&event.target.files[0];
    if(!file)return;
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)){discardSelection();render();notify('Arquivo recusado. Escolha uma imagem JPG, PNG ou WebP.');return;}
    if(file.size>10*1024*1024){discardSelection();render();notify('Arquivo recusado. A imagem excede o limite de 10 MB da demonstração.');return;}
    discardSelection();
    const sequence=state.uploadSequence;
    const validationUrl=URL.createObjectURL(file);
    const probe=new Image();
    state.validating=true;
    render();
    const rejectDecodedImage=()=>{
      URL.revokeObjectURL(validationUrl);
      if(sequence!==state.uploadSequence||!state.altAuthorized)return;
      discardSelection();
      render();
      notify('Arquivo recusado. O conteúdo não pôde ser aberto como uma imagem válida.');
    };
    probe.onload=()=>{
      URL.revokeObjectURL(validationUrl);
      if(sequence!==state.uploadSequence||!state.altAuthorized)return;
      if(probe.naturalWidth<1||probe.naturalHeight<1){rejectDecodedImage();return;}
      state.validating=false;
      state.fileName=file.name;
      state.fileUrl=URL.createObjectURL(file);
      render();
      notify('Prévia local criada; a imagem não foi enviada.');
    };
    probe.onerror=rejectDecodedImage;
    probe.src=validationUrl;
    notify('Validando o conteúdo localmente…');
  });
  const invalidateLocalPayloadPreview=()=>{
    state.testPayloadVisible=false;state.testPayloadJson='';
    screen.querySelector('.test-payload-preview')?.remove();
    const status=document.getElementById('testSendStatus');
    if(status)status.textContent='Dados alterados; gere novamente a prévia JSON local. Nenhuma requisição será feita.';
  };
  screen.querySelectorAll('[data-annotation]').forEach(input=>input.addEventListener('input',()=>{
    if(state.mediaAnnotations) state.mediaAnnotations[input.dataset.annotation]=input.value;
    invalidateLocalPayloadPreview();
  }));
  screen.querySelectorAll('[data-signature]').forEach(input=>input.addEventListener('input',()=>{
    state.signatureAnnotations[input.dataset.signature]=input.value;
    invalidateLocalPayloadPreview();
  }));
  const testEndpointInput=document.getElementById('testEndpoint');
  if(testEndpointInput) testEndpointInput.addEventListener('input',()=>{state.testEndpoint=testEndpointInput.value;});
  const webcamVideo=document.getElementById('webcamVideo');
  if(webcamVideo&&state.cameraStream){
    webcamVideo.srcObject=state.cameraStream;webcamVideo.muted=true;
    webcamVideo.addEventListener('loadeddata',()=>{
      if(!state.cameraStream||state.page!=='live') return;
      state.cameraReady=true;
      const captureButton=screen.querySelector('[data-action="camera-capture"]');
      if(captureButton&&!state.cameraCapturing)captureButton.disabled=false;
    },{once:true});
    const playPromise=webcamVideo.play();
    if(playPromise&&typeof playPromise.catch==='function')playPromise.catch(()=>{
      state.cameraError='A permissão foi concedida, mas a prévia não iniciou. Tente novamente ou confira a câmera do sistema.';
      const status=document.getElementById('webcamStatus');if(status)status.textContent=state.cameraError;
      const captureButton=screen.querySelector('[data-action="camera-capture"]');if(captureButton)captureButton.disabled=true;
    });
  }
  const syntheticPreview=document.getElementById('syntheticTestPreview');
  if(syntheticPreview){try{syntheticPreview.src=createSyntheticTestImageDataUrl();}catch{syntheticPreview.alt='Imagem sintética indisponível neste navegador.';}}
  screen.querySelectorAll('[data-camera-annotation]').forEach(input=>input.addEventListener('input',()=>{state.cameraAnnotations[input.dataset.cameraAnnotation]=input.value;}));
  const mediaInput=document.getElementById('mediaInput');
  if(mediaInput) mediaInput.addEventListener('change',event=>{
    const file=event.target.files&&event.target.files[0];
    if(!file)return;
    clearMediaSelection();
    const allowedTypes=['image/jpeg','image/png','image/webp','video/mp4','video/webm'];
    if(!allowedTypes.includes(file.type)){state.mediaError='Arquivo recusado. Escolha JPG, PNG, WebP, MP4 ou WebM.';render();notify(state.mediaError);return;}
    if(file.size>25*1024*1024){state.mediaError='Arquivo recusado. O limite desta pré-visualização local é 25 MB.';render();notify(state.mediaError);return;}
    const sequence=state.mediaSequence;
    const previewUrl=URL.createObjectURL(file);
    const mediaType=file.type.startsWith('video/')?'video':'image';
    state.mediaPendingUrl=previewUrl;
    state.mediaValidating=true;
    render();
    const rejectMedia=message=>{
      URL.revokeObjectURL(previewUrl);
      if(sequence!==state.mediaSequence)return;
      state.mediaSequence+=1;
      state.mediaPendingUrl='';state.mediaValidating=false;state.mediaInfo=null;state.mediaError=message;
      render();notify(message);
    };
    const acceptMedia=(width,height,duration=null)=>{
      if(sequence!==state.mediaSequence||state.page!=='live'){URL.revokeObjectURL(previewUrl);return;}
      if(width<1||height<1){rejectMedia('Arquivo recusado. O conteúdo não pôde ser aberto como mídia válida.');return;}
      state.mediaPendingUrl='';state.mediaFileUrl=previewUrl;state.mediaFileName=file.name;state.mediaType=mediaType;state.mediaInfo={type:file.type,size:formatBytes(file.size),width,height,duration:Number.isFinite(duration)?duration:null};state.mediaAnnotations=mediaType==='image'?{fileName:'2025, 15-24-53.png',ip:'',cpf:'',latitude:'',longitude:'',mapUrl:''}:null;state.signatureAnnotations={...DEMO_SIGNATURE_DEFAULTS};state.testEndpoint='';state.testPayloadVisible=false;state.testPayloadJson='';state.mediaError='';state.mediaValidating=false;
      render();notify('Pré-visualização local pronta; nenhum arquivo foi enviado.');
    };
    if(mediaType==='image'){
      const probe=new Image();
      probe.onload=()=>acceptMedia(probe.naturalWidth,probe.naturalHeight);
      probe.onerror=()=>rejectMedia('Arquivo recusado. A imagem não pôde ser decodificada.');
      probe.src=previewUrl;
    }else{
      const probe=document.createElement('video');
      probe.preload='metadata';
      probe.onloadedmetadata=()=>acceptMedia(probe.videoWidth,probe.videoHeight,probe.duration);
      probe.onerror=()=>rejectMedia('Arquivo recusado. O vídeo não pôde ser decodificado neste navegador.');
      probe.src=previewUrl;
      probe.load();
    }
    notify('Validando a mídia localmente…');
  });
}
document.addEventListener('click',event=>{
  const target=event.target.closest('[data-page]');
  if(target && !screen.contains(target) && !target.closest('#screenRoot')) setPage(target.dataset.page);
});
render();

window.addEventListener('beforeunload',()=>{resetWebcamState();[state.fileUrl,state.mediaFileUrl,state.mediaPendingUrl].filter(Boolean).forEach(url=>URL.revokeObjectURL(url));});
