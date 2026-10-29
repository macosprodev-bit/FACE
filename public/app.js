const icons = {home:'⌂', verify:'◉', history:'↺', help:'?', build:'⌘'};
const navItems = [
  {id:'home',label:'Início'},
  {id:'verify',label:'Verificação'},
  {id:'history',label:'Histórico'},
  {id:'help',label:'Ajuda'},
  {id:'build',label:'Construir'}
];
const titles = {home:'Início',verify:'Verificação',history:'Histórico',permission:'Permissões',prepare:'Preparação',live:'Verificação oficial',alternate:'Alternativa autorizada',success:'Tudo certo',failure:'Não foi concluída',help:'Ajuda com a câmera',build:'Para construir de verdade'};
const DEMO_HISTORY = [
  {id:'demo-1',service:'Portal Aurora',domain:'conta.aurora.example',time:'29 out 2026 · 09:41',method:'Verificação oficial por câmera'},
  {id:'demo-2',service:'Conta Horizonte',domain:'login.horizonte.example',time:'28 out 2026 · 18:23',method:'Chave de acesso (passkey)'},
  {id:'demo-3',service:'Serviço Alameda',domain:'secure.alameda.example',time:'26 out 2026 · 12:06',method:'Alternativa autorizada pelo serviço'}
];
const state = {
  page:'home', permission:'unknown', issue:'none', checks:{frame:false,light:false,privacy:false},
  altAuthorized:false, fileName:'', fileUrl:'', validating:false, uploadSequence:0,
  authHistory:DEMO_HISTORY.map(entry=>({...entry})), historyQuery:'', clearHistoryConfirm:false, toastTimer:null
};
const screen = document.getElementById('screenRoot');
const pageTitle = document.getElementById('pageTitle');
const eyebrow = document.getElementById('eyebrow');
const toast = document.getElementById('toast');

function navMarkup(className){
  return navItems.map(item=>`<button class="nav-item ${state.page===item.id?'active':''}" data-page="${item.id}" ${state.page===item.id?'aria-current="page"':''}><span class="nav-icon" aria-hidden="true">${icons[item.id]}</span><span>${item.label}</span>${className==='side-nav'?'<span class="nav-arrow" aria-hidden="true">›</span>':''}</button>`).join('');
}
function setPage(page){
  if(!titles[page]) return;
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
        <div><div class="aside-icon" aria-hidden="true">⌁</div><h3>Você mantém o controle</h3><p>Este protótipo não acessa sua câmera, não envia imagens e não guarda dados.</p></div>
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
        <div class="callout info"><span class="callout-icon" aria-hidden="true">i</span><div><strong>Este fluxo é demonstrativo.</strong> Os botões simulam estados; nenhuma câmera é ligada e nenhum dado sai do navegador.</div></div>
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
        ${restricted?`<div class="callout danger"><span class="callout-icon">!</span><div><strong>${permissionLabel}.</strong> ${permissionMessage}</div></div>`:`<div class="permission-card"><span class="big-icon" aria-hidden="true">◎</span><div><h3>Por que a câmera pode ser necessária?</h3><p>Alguns serviços oficiais usam vídeo ao vivo para verificar presença. O Verifica não captura nem transmite imagens nesta demonstração.</p></div></div>`}
        <div class="section-label">SIMULAR ESTADO DA PERMISSÃO</div>
        <div class="radio-stack">
          <label class="option-row"><input type="radio" name="perm" value="granted" ${state.permission==='granted'?'checked':''}><span><strong>Concedida pelo navegador</strong><small>O fluxo oficial pode solicitar acesso no momento adequado.</small></span></label>
          <label class="option-row"><input type="radio" name="perm" value="denied" ${denied?'checked':''}><span><strong>Negada</strong><small>A pessoa recusou o pedido desta vez.</small></span></label>
          <label class="option-row"><input type="radio" name="perm" value="blocked" ${blocked?'checked':''}><span><strong>Bloqueada pelo navegador</strong><small>A permissão precisa ser alterada nas configurações do site.</small></span></label>
        </div>
        <div class="callout warning"><span class="callout-icon">⚠</span><div><strong>Protótipo, sem acesso real.</strong> “Simular estado” não abre câmera nem altera permissões do dispositivo.</div></div>
        <div class="button-row">${button(restricted?'Ver diagnóstico da câmera':'Continuar para preparação <span aria-hidden="true">→</span>',restricted?'help':'prepare',restricted?'btn btn-secondary':'btn btn-primary',state.permission==='unknown')}<button class="btn btn-outline" data-page="help">Ajuda</button></div>
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
      <aside><section class="panel"><span class="state-chip chip-green">✓ Preparação</span><h2 style="margin-top:14px">O que esta tela não faz</h2><p class="panel-lead">Não ativa sensores, não grava vídeo, não lê seu rosto e não envia imagem. É só uma demonstração clicável da experiência.</p><div class="divider"></div><button class="text-button" data-page="build">Ver requisitos técnicos →</button></section></aside>
    </div>`;},
  live(){return `
    <div class="content-layout">
      <section class="panel">
        <div class="panel-heading"><div><h2>Você está no controle</h2><p>A verificação real deve acontecer no site ou app oficial do provedor.</p></div><span class="state-chip chip-blue">Demonstração</span></div>
        <div class="sim-preview"><div class="preview-content"><div class="face-outline" aria-hidden="true"></div><strong>Área visual ilustrativa</strong><small>Nenhuma câmera está ativa neste protótipo</small></div></div>
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
  success(){return `<section class="result-card"><div class="result-icon">✓</div><h2>Demonstração concluída</h2><p>Este protótipo mostrou o caminho seguro. Nenhuma verificação real aconteceu e nenhum dado foi transmitido.</p><div class="result-next"><strong>Em um serviço real</strong>Confirme o resultado no canal oficial. Se a verificação não aparecer como concluída, não repita o envio — contate o suporte do serviço.</div><div class="button-row" style="justify-content:center">${button('Voltar ao início','home','btn btn-primary')}${button('Rever requisitos','build','btn btn-outline')}</div></section>`;},
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
    </section><aside><section class="panel"><span class="state-chip chip-gold">Dica de segurança</span><h2 style="margin-top:14px">Não compartilhe sua imagem por canais aleatórios</h2><p class="panel-lead">Use somente um fluxo informado pelo serviço que solicitou a verificação. Desconfie de pedidos por chat, e-mail ou sites fora do domínio oficial.</p></section></aside></div>`;
  },
  build(){
    const items=[
      ['⌘','Extensão de navegador','Manifest V3, popup acessível, permissões mínimas e suporte às versões atuais de Chrome, Edge e Firefox.','BASE'],
      ['◎','Integração com serviço oficial','API, SDK ou fluxo documentado pelo provedor; validar domínio e origem dos sinais de autorização.','ESSENCIAL'],
      ['▣','Permissões e câmera','Solicitar câmera apenas no contexto oficial, após ação clara da pessoa; tratar concedida, negada e bloqueada.','ESSENCIAL'],
      ['⇧','Alternativas autorizadas','Exibir upload somente quando o provedor permitir explicitamente; validar tipo, tamanho, consentimento e destino.','ESSENCIAL'],
      ['↺','Histórico de autenticações','Registrar somente eventos de sucesso confirmados pelo serviço, com retenção e exclusão claras. Nunca guardar senhas, tokens, imagens ou dados biométricos.','ESSENCIAL'],
      ['◇','Privacidade e segurança','Minimização de dados, transmissão criptografada, retenção definida, proteção contra exposição e política de privacidade.','ESSENCIAL'],
      ['♿','Acessibilidade e idioma','Teclado, leitor de tela, foco visível, contraste, linguagem simples e suporte a pt-BR.','QUALIDADE'],
      ['✓','Testes e publicação','Testes em navegadores e dispositivos, revisão de segurança, termos da loja, suporte e monitoramento de falhas.','LANÇAMENTO']
    ];
    return `<p class="docs-intro">Para transformar a demonstração em extensão, o ponto crítico é a integração oficial: o produto não pode interceptar ou falsificar a câmera, nem deduzir autorização por conta própria.</p><div class="docs-list">${items.map(i=>`<article class="docs-row"><span class="docs-icon" aria-hidden="true">${i[0]}</span><div><strong>${i[1]}</strong><p>${i[2]}</p></div><span class="docs-tag ${i[3]==='ESSENCIAL'?'must':''}">${i[3]}</span></article>`).join('')}</div>
      <div class="docs-bottom"><div><strong>O que precisa estar definido antes do desenvolvimento?</strong><p>Nome do serviço de verificação, documentação de integração, política de dados e alternativas oficialmente suportadas.</p></div>${button('Voltar ao início','home','btn btn-primary btn-small')}</div>
      <p class="tiny-note">Estimativa de escopo: requer engenharia de extensão, integração/API do provedor, revisão de privacidade e testes de compatibilidade. Nenhuma integração real está conectada neste protótipo.</p>`;
  }
};
function escapeHTML(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function bindScreenControls(){
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
    else if(action==='home') setPage('home');
    else if(action==='build') setPage('build');
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
}
document.addEventListener('click',event=>{
  const target=event.target.closest('[data-page]');
  if(target && !screen.contains(target) && !target.closest('#screenRoot')) setPage(target.dataset.page);
});
render();
