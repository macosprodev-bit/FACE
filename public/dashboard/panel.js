(() => {
  'use strict';

  const FALLBACK_DATA = { extension: {}, runs: [], guides: [] };
  const data = window.VERIFICA_DASHBOARD_DATA && typeof window.VERIFICA_DASHBOARD_DATA === 'object'
    ? window.VERIFICA_DASHBOARD_DATA
    : FALLBACK_DATA;
  const runs = Array.isArray(data.runs) ? data.runs : [];
  const runIds = new Set(runs.map((run) => String(run && run.id ? run.id : '')));
  const initialRun = runs.find((run) => run && run.id === 'corrected') || runs[0] || null;

  const state = {
    view: 'overview',
    runId: initialRun && initialRun.id ? String(initialRun.id) : '',
    reportSearch: '',
    reportFilter: 'all',
    demoEnabled: true,
    installNote: 'not-installed',
    reviewItems: new Set(),
    reviewFocus: null,
    toastTimer: null
  };

  const VIEW_TITLES = {
    overview: 'Visão geral',
    extension: 'Extensão',
    reports: 'Relatórios',
    review: 'Revisão manual'
  };

  const refs = {};

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function append(parent, ...children) {
    children.forEach((child) => {
      if (child !== null && child !== undefined) parent.append(child);
    });
    return parent;
  }

  function clear(parent) {
    parent.replaceChildren();
    return parent;
  }

  function textValue(value, fallback = '—') {
    if (value === null || value === undefined || value === '') return fallback;
    return String(value);
  }

  function numberValue(value) {
    if (typeof value === 'number' && Number.isFinite(value)) return Math.max(0, Math.round(value));
    if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) {
      return Math.max(0, Math.round(Number(value)));
    }
    return null;
  }

  function countFromValue(value) {
    const direct = numberValue(value);
    if (direct !== null) return direct;
    if (Array.isArray(value)) {
      const numbers = value.map(numberValue).filter((item) => item !== null);
      if (numbers.length) return numbers.reduce((sum, item) => sum + item, 0);
      return value.length;
    }
    if (value && typeof value === 'object') {
      const values = Object.values(value);
      const counts = values.map((item) => {
        const directItem = numberValue(item);
        if (directItem !== null) return directItem;
        if (Array.isArray(item)) return item.length;
        return null;
      }).filter((item) => item !== null);
      if (counts.length) return counts.reduce((sum, item) => sum + item, 0);
    }
    return null;
  }

  function issueArray(record, key) {
    return record && Array.isArray(record[key]) ? record[key] : [];
  }

  function isNotTested(record) {
    const status = String(record && record.status ? record.status : '').toLowerCase().replace(/[_\s]+/g, '-');
    return status === 'not-tested' || status === 'notest' || status === 'not-run' || status === 'untested';
  }

  function stateKind(record) {
    const violations = issueArray(record, 'violations');
    const incomplete = issueArray(record, 'incomplete');
    if (isNotTested(record)) return 'not-tested';
    if (violations.length) return 'violations';
    if (incomplete.length) return 'incomplete';
    const status = String(record && record.status ? record.status : '').toLowerCase().replace(/[_\s]+/g, '-');
    if (status === 'violation' || status === 'violations' || status === 'failed' || status === 'fail') return 'violations';
    if (status === 'incomplete' || status === 'inconclusive' || status === 'inconclusivo') return 'incomplete';
    return 'clean';
  }

  function stateKindLabel(kind) {
    return {
      clean: 'Sem ocorrências',
      violations: 'Com violações',
      incomplete: 'Inconclusivo',
      'not-tested': 'Não testado'
    }[kind] || 'Registrado';
  }

  function stateKindClass(kind) {
    return `status-badge status-${kind}`;
  }

  function currentRun() {
    return runs.find((run) => run && String(run.id) === state.runId) || null;
  }

  function runStates(run) {
    return run && Array.isArray(run.states) ? run.states : [];
  }

  function summaryCount(run, key, derivedKey) {
    const summary = run && run.summary && typeof run.summary === 'object' ? run.summary : {};
    const direct = countFromValue(summary[key]);
    if (direct !== null) return direct;
    const records = runStates(run);
    if (!records.length || !derivedKey) return null;
    return records.reduce((total, record) => total + issueArray(record, derivedKey).length, 0);
  }

  function testedStateCount(run) {
    const summary = run && run.summary && typeof run.summary === 'object' ? run.summary : {};
    const direct = numberValue(summary.states_tested);
    if (direct !== null) return direct;
    const records = runStates(run);
    if (!records.length) return null;
    return records.filter((record) => stateKind(record) !== 'not-tested').length;
  }

  function notTestedStateCount(run) {
    const summary = run && run.summary && typeof run.summary === 'object' ? run.summary : {};
    const direct = numberValue(summary.states_not_tested);
    if (direct !== null) return direct;
    const records = runStates(run);
    if (!records.length) return null;
    return records.filter((record) => stateKind(record) === 'not-tested').length;
  }

  function metricText(value) {
    return value === null || value === undefined ? '—' : new Intl.NumberFormat('pt-BR').format(value);
  }

  function formatDate(timestamp) {
    if (!timestamp) return 'sem data registrada';
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return 'data não reconhecida';
    const formatted = new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'UTC'
    }).format(date);
    return `${formatted} UTC`;
  }

  function formatVersion(value) {
    return value === null || value === undefined || value === '' ? 'não registrada' : String(value);
  }

  function safeHref(value) {
    if (typeof value !== 'string' || !value.trim()) return '';
    const raw = value.trim();
    try {
      const url = new URL(raw, window.location.origin);
      const isLocal = raw.startsWith('/') || raw.startsWith('./');
      const isWeb = url.protocol === 'https:' || url.protocol === 'http:';
      return (isLocal || isWeb) && url.protocol !== 'javascript:' ? raw : '';
    } catch (_error) {
      return '';
    }
  }

  function makeLink(label, href, className = 'link-button', download = false) {
    const link = element('a', className, label);
    const validHref = safeHref(href);
    if (validHref) {
      link.href = validHref;
      if (download) link.setAttribute('download', '');
      if (/^https?:\/\//i.test(validHref)) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
    } else {
      link.setAttribute('aria-disabled', 'true');
      link.tabIndex = -1;
    }
    return link;
  }

  function makeButton(label, action, className = 'button button-secondary') {
    const button = element('button', className, label);
    button.type = 'button';
    button.dataset.action = action;
    return button;
  }

  function createBadge(label, className = 'card-badge') {
    return element('span', className, label);
  }

  function runLabel(run) {
    return textValue(run && run.label, run && run.id ? run.id : 'Execução sem nome');
  }

  function runContext(run) {
    const line = element('div', 'run-context');
    const timestamp = element('span');
    append(timestamp, element('strong', null, 'Registro: '), document.createTextNode(formatDate(run && run.timestamp)));
    const browser = element('span');
    append(browser, element('strong', null, 'Chromium: '), document.createTextNode(textValue(run && run.browser, 'não registrado')));
    const axe = element('span');
    append(axe, element('strong', null, 'axe-core: '), document.createTextNode(formatVersion(run && run.axeVersion)));
    const extension = element('span');
    append(extension, element('strong', null, 'Extensão: '), document.createTextNode(formatVersion(run && run.extensionVersion)));
    const source = element('span', 'run-scope', textValue(run && run.source, 'Origem não registrada.'));
    return append(line, timestamp, browser, axe, extension, source);
  }

  function setFooterDate(run) {
    if (!refs.registeredAt) return;
    const label = formatDate(run && run.timestamp);
    refs.registeredAt.textContent = label;
    if (run && run.timestamp && !Number.isNaN(new Date(run.timestamp).getTime())) {
      refs.registeredAt.dateTime = new Date(run.timestamp).toISOString();
    } else {
      refs.registeredAt.removeAttribute('datetime');
    }
  }

  function setRunOptions() {
    clear(refs.runSelect);
    if (!runs.length) {
      const emptyOption = element('option', null, 'Nenhuma execução registrada');
      emptyOption.value = '';
      refs.runSelect.append(emptyOption);
      refs.runSelect.disabled = true;
      return;
    }
    refs.runSelect.disabled = false;
    runs.forEach((run) => {
      const option = element('option', null, runLabel(run));
      option.value = run && run.id ? String(run.id) : '';
      option.selected = option.value === state.runId;
      refs.runSelect.append(option);
    });
  }

  function setActiveNav() {
    refs.navButtons.forEach((button) => {
      const active = button.dataset.panelNav === state.view;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-current', active ? 'page' : 'false');
    });
  }

  function setActiveView() {
    refs.views.forEach((view) => {
      view.hidden = view.dataset.panelView !== state.view;
    });
    refs.panelTitle.textContent = VIEW_TITLES[state.view] || VIEW_TITLES.overview;
  }

  function renderView() {
    setActiveNav();
    setActiveView();
    const run = currentRun();
    setFooterDate(run);
    if (state.view === 'overview') renderOverview(run);
    if (state.view === 'extension') renderExtension(run);
    if (state.view === 'reports') renderReports(run);
    if (state.view === 'review') renderReview();
  }

  function metricCard(label, value, subline) {
    const card = element('article', 'metric-card');
    append(card,
      element('span', 'metric-label', label),
      element('strong', 'metric-value', metricText(value)),
      element('span', 'metric-subline', subline)
    );
    return card;
  }

  function renderOverview(run) {
    const view = refs.overview;
    clear(view);
    const tested = testedStateCount(run);
    const violations = summaryCount(run, 'violation_occurrences_by_state', 'violations');
    const incomplete = summaryCount(run, 'incomplete_occurrences_by_state', 'incomplete');
    const keyboard = countFromValue(run && run.summary ? run.summary.keyboard_failures : null);

    append(view,
      element('p', 'view-lead', 'Acompanhe o registro publicado sem transformar resultados inconclusivos em aprovação. Selecione outra execução no topo para comparar a evidência disponível.'),
      append(element('div', 'metric-grid'),
        metricCard('Estados testados', tested, run ? runLabel(run) : 'Sem execução selecionada'),
        metricCard('Ocorrências de violação', violations, 'Soma registrada no relatório'),
        metricCard('Ocorrências inconclusivas', incomplete, 'Resultados que pedem revisão'),
        metricCard('Falhas de teclado', keyboard, 'Conforme o resumo registrado')
      )
    );

    const layout = element('div', 'overview-layout');
    const mainColumn = element('div');
    const chartCard = element('section', 'dashboard-card');
    const chartHeading = element('div', 'card-heading');
    const chartTitle = element('div');
    append(chartTitle,
      element('h2', null, 'Inconclusivos por execução'),
      element('p', null, 'Contagens por estado podem repetir o mesmo alvo. A escala usa o maior valor registrado, não uma nota de aprovação.')
    );
    append(chartHeading, chartTitle, createBadge(run ? 'Fonte: auditoria' : 'Sem fonte'));
    const chartList = element('div', 'chart-list');
    const chartValues = runs.map((item) => summaryCount(item, 'incomplete_occurrences_by_state', 'incomplete'));
    const availableValues = chartValues.filter((value) => value !== null);
    const maxValue = availableValues.length ? Math.max(...availableValues) : 0;
    if (!runs.length || !availableValues.length) {
      chartList.append(element('div', 'chart-empty', 'Nenhuma métrica de inconclusivos foi registrada para comparação.'));
    } else {
      runs.forEach((item, index) => {
        const value = chartValues[index];
        const row = element('div', 'chart-row');
        const label = element('span', 'chart-row-label', runLabel(item));
        const track = element('div', 'chart-track');
        const bar = element('div', 'chart-bar');
        bar.style.width = maxValue > 0 && value !== null ? `${Math.round((value / maxValue) * 100)}%` : '0%';
        bar.setAttribute('aria-hidden', 'true');
        track.append(bar);
        const valueLabel = element('span', 'chart-value', metricText(value));
        const detailsButton = makeButton('Ver detalhes', 'go-reports', 'button button-quiet');
        detailsButton.dataset.runId = item && item.id ? String(item.id) : '';
        detailsButton.dataset.reportFilter = 'incomplete';
        detailsButton.setAttribute('aria-label', `Ver detalhes de ${runLabel(item)}`);
        append(row, label, track, valueLabel, detailsButton);
        chartList.append(row);
      });
    }
    append(chartCard, chartHeading, runContext(run), chartList);
    mainColumn.append(chartCard);

    const guidesCard = element('section', 'dashboard-card');
    const guidesHeading = element('div', 'card-heading');
    append(guidesHeading,
      append(element('div'), element('h2', null, 'Guias registrados'), element('p', null, 'Arquivos publicados para consulta manual.'))
    );
    append(guidesCard, guidesHeading, makeGuides(data.guides));
    mainColumn.append(guidesCard);

    const sideColumn = element('div');
    const recordCard = element('section', 'dashboard-card');
    const recordHeading = element('div', 'card-heading');
    append(recordHeading, element('h2', null, 'Registro selecionado'), run ? createBadge(runLabel(run)) : createBadge('Nenhum registro'));
    const facts = element('dl', 'facts-list');
    append(facts,
      factRow('Data registrada', formatDate(run && run.timestamp)),
      factRow('Versão da extensão', formatVersion(run && run.extensionVersion)),
      factRow('Chromium no perfil de teste', textValue(run && run.browser, 'não registrado')),
      factRow('axe-core', formatVersion(run && run.axeVersion)),
      factRow('Estados não testados', metricText(notTestedStateCount(run))),
      factRow('Alvos únicos inconclusivos', metricText(run && run.uniqueIncompleteTargets))
    );
    const certification = element('div', 'warning-callout');
    append(certification,
      element('span', null, 'Nota:'),
      element('p', null, 'Este registro não certifica conformidade WCAG. Use a revisão humana para complementar a evidência, sem alterar os resultados publicados.')
    );
    const reportActions = element('div', 'button-row');
    const reportLink = makeLink('Abrir relatório', run && run.reportUrl, 'button button-secondary', true);
    reportLink.dataset.action = 'manual-link';
    const reportsButton = makeButton('Ver estados', 'go-reports', 'button button-primary');
    append(reportActions, reportLink, reportsButton);
    append(recordCard, recordHeading, runContext(run), facts, certification, reportActions);
    sideColumn.append(recordCard);

    append(layout, mainColumn, sideColumn);
    view.append(layout);
  }

  function factRow(label, value) {
    const row = element('div', 'fact-row');
    append(row, element('dt', null, label), element('dd', null, value));
    return row;
  }

  function makeGuides(guides) {
    const list = element('div', 'guide-list');
    if (!Array.isArray(guides) || !guides.length) {
      list.append(element('div', 'empty-state', 'Nenhum guia foi incluído neste registro.'));
      return list;
    }
    guides.forEach((guide) => {
      const row = element('article', 'guide-row');
      const copy = element('div');
      append(copy,
        element('strong', null, textValue(guide && guide.title, 'Guia sem título')),
        element('p', null, textValue(guide && guide.description, 'Descrição não registrada.'))
      );
      const link = makeLink('Baixar guia', guide && guide.url, 'link-button', true);
      append(row, copy, link);
      list.append(row);
    });
    return list;
  }

  function renderExtension(run) {
    const view = refs.extension;
    clear(view);
    const extension = data.extension && typeof data.extension === 'object' ? data.extension : {};
    const version = extension.version;
    const manifestVersion = extension.manifestVersion;
    const packageUrl = extension.packageUrl;
    const shaUrl = extension.shaUrl;
    const hash = extension.sha256;

    const layout = element('div', 'extension-layout');
    const left = element('div');
    const hero = element('section', 'extension-hero');
    append(hero,
      element('h2', null, 'Pacote de teste da extensão'),
      element('p', null, 'Baixe os artefatos publicados e consulte a soma de verificação antes de qualquer instalação manual. Este painel não instala, ativa ou lê o estado do navegador.'),
      append(element('div', 'extension-badges'),
        element('span', 'extension-badge', `Manifest V${textValue(manifestVersion, '—')}`),
        element('span', 'extension-badge', `Versão ${formatVersion(version)}`),
        element('span', 'extension-badge', 'Pacote de teste · sem permissões declaradas')
      )
    );
    const hashBlock = element('div', 'hash-block');
    const hashLabel = element('span', null, 'SHA-256 publicado');
    const hashValue = element('code', 'hash-value', textValue(hash, 'Hash não registrado'));
    const hashActions = element('div', 'button-row');
    const copyButton = makeButton('Copiar hash manualmente', 'copy-hash', 'button button-quiet');
    copyButton.disabled = !hash;
    const copyStatus = element('span', 'metric-subline');
    copyStatus.id = 'hashCopyStatus';
    append(hashActions, copyButton, copyStatus);
    append(hashBlock, hashLabel, hashValue, hashActions);
    const downloads = element('div', 'button-row');
    const zipLink = makeLink('Baixar ZIP', packageUrl, 'button button-primary', true);
    const shaLink = makeLink('Baixar arquivo .sha256', shaUrl, 'button button-secondary', true);
    append(downloads, zipLink, shaLink);
    append(hero, hashBlock, downloads);
    left.append(hero);

    const directions = element('section', 'dashboard-card');
    const directionsHeading = element('div', 'card-heading');
    append(directionsHeading,
      append(element('div'), element('h2', null, 'Instalação manual no Chrome'), element('p', null, 'Somente instruções; nenhum passo é executado por este painel.'))
    );
    const steps = element('ol', 'chrome-steps');
    const stepOne = element('li');
    append(stepOne, document.createTextNode('Baixe ZIP e arquivo .sha256 e confira o digest completo antes de extrair.'));
    const stepTwo = element('li', null, 'Extraia o ZIP em uma pasta estável que contenha manifest.json diretamente.');
    const stepThree = element('li');
    append(stepThree, document.createTextNode('Abra '), element('code', null, 'chrome://extensions'), document.createTextNode(' e ative o modo do desenvolvedor, se a política do dispositivo permitir.'));
    const stepFour = element('li', null, 'Escolha Carregar sem compactação, selecione a pasta extraída e fixe o ícone para abrir o popup.');
    append(steps, stepOne, stepTwo, stepThree, stepFour);
    append(directions, directionsHeading, steps);
    left.append(directions);

    const right = element('div');
    const controls = element('section', 'dashboard-card');
    const controlsHeading = element('div', 'card-heading');
    append(controlsHeading,
      append(element('div'), element('h2', null, 'Controles demonstrativos'), element('p', null, 'Estado somente na memória desta aba.')),
      createBadge('Simulado')
    );
    const demoControl = element('div', 'extension-control');
    const demoCopy = element('div');
    append(demoCopy,
      element('strong', null, 'Atividade da extensão'),
      element('p', null, 'Não representa o estado real do Chrome.'),
      demoStatusNode()
    );
    const switchLabel = element('label', 'demo-switch');
    const demoInput = document.createElement('input');
    demoInput.type = 'checkbox';
    demoInput.id = 'demoEnabled';
    demoInput.checked = state.demoEnabled;
    demoInput.setAttribute('aria-label', 'Simular extensão ativa');
    append(switchLabel, demoInput, document.createTextNode('Simular'));
    append(demoControl, demoCopy, switchLabel);

    const installControl = element('div', 'extension-control');
    const installCopy = element('div');
    append(installCopy,
      element('strong', null, 'Anotação local de instalação'),
      element('p', null, 'Não lê nem confirma uma instalação do navegador.')
    );
    const options = element('div', 'install-options');
    options.id = 'installOptions';
    const optionNotInstalled = installOption('not-installed', 'Ainda não anotei instalação');
    const optionReported = installOption('reported-installed', 'Instalação informada localmente');
    optionNotInstalled.querySelector('input').checked = state.installNote === 'not-installed';
    optionReported.querySelector('input').checked = state.installNote === 'reported-installed';
    append(options, optionNotInstalled, optionReported);
    append(installCopy, options);
    append(installControl, installCopy);
    append(controls, controlsHeading, demoControl, installControl);
    right.append(controls);

    const guidesCard = element('section', 'dashboard-card');
    const guideHeading = element('div', 'card-heading');
    append(guideHeading,
      append(element('div'), element('h2', null, 'Material de apoio'), element('p', null, 'Downloads fornecidos pelo registro publicado.'))
    );
    append(guidesCard, guideHeading, makeGuides(data.guides));
    right.append(guidesCard);

    append(layout, left, right);
    view.append(
      element('p', 'view-lead', 'Pacote MV3, versão registrada e hash legível para uma conferência manual. Os controles desta tela são apenas uma demonstração local.'),
      layout
    );
  }

  function demoStatusNode() {
    const status = element('span', `demo-state${state.demoEnabled ? '' : ' is-paused'}`, state.demoEnabled ? 'Ativa (simulado)' : 'Pausada (simulado)');
    status.id = 'demoState';
    return status;
  }

  function installOption(value, label) {
    const wrapper = element('label', 'install-option');
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'installNote';
    if (value === 'not-installed') input.id = 'installNote';
    input.value = value;
    input.setAttribute('aria-label', label);
    append(wrapper, input, document.createTextNode(label));
    return wrapper;
  }

  function renderReports(run) {
    const view = refs.reports;
    clear(view);
    const heading = element('div', 'card-heading');
    const headingCopy = element('div');
    append(headingCopy,
      element('h2', null, 'Relatório por estado'),
      element('p', null, 'Abra cada registro para consultar violações, resultados inconclusivos e alvos técnicos.'));
    const actions = element('div', 'button-row');
    const reportLink = makeLink('Baixar Markdown', run && run.reportUrl, 'button button-secondary', true);
    const jsonLink = makeLink('Baixar JSON publicado', run && run.jsonUrl, 'button button-secondary', true);
    const exportButton = makeButton('Exportar registro', 'export-run', 'button button-primary');
    append(actions, reportLink, jsonLink, exportButton);
    append(heading, headingCopy, actions);

    const context = runContext(run);
    const toolbar = element('div', 'report-toolbar');
    const searchLabel = element('label', 'field-label');
    append(searchLabel, document.createTextNode('Buscar estado ou regra'));
    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.id = 'stateSearch';
    searchInput.placeholder = 'Ex.: checkout, color-contrast';
    searchInput.value = state.reportSearch;
    searchInput.setAttribute('aria-label', 'Buscar estado ou regra no relatório');
    searchLabel.append(searchInput);
    const filterLabel = element('label', 'field-label');
    append(filterLabel, document.createTextNode('Filtrar resultado'));
    const filter = document.createElement('select');
    filter.id = 'resultFilter';
    filter.setAttribute('aria-label', 'Filtrar estados do relatório');
    [
      ['all', 'Todos'],
      ['violations', 'Com violações'],
      ['incomplete', 'Inconclusivos'],
      ['clean', 'Sem ocorrências'],
      ['not-tested', 'Não testados']
    ].forEach(([value, label]) => {
      const option = element('option', null, label);
      option.value = value;
      option.selected = value === state.reportFilter;
      filter.append(option);
    });
    filterLabel.append(filter);
    const toolbarHint = element('div', 'info-callout');
    append(toolbarHint, element('p', null, 'Os filtros só mudam a visualização local e não alteram a evidência.'));
    append(toolbar, searchLabel, filterLabel, toolbarHint);

    const source = element('div', 'report-source-caption');
    const sourceLeft = element('span');
    append(sourceLeft, element('strong', null, 'Fonte: '), document.createTextNode(run ? runLabel(run) : 'nenhuma execução selecionada'));
    const sourceRight = element('span');
    append(sourceRight, document.createTextNode('Resumo registrado · '), element('strong', null, `exit code ${textValue(run && run.exitCode, '—')}`));
    append(source, sourceLeft, sourceRight);

    const stateList = element('div', 'state-list');
    renderStateList(stateList, run);
    append(view,
      element('p', 'view-lead', 'Consulte a execução selecionada como evidência histórica. Um resultado sem violações não é, por si só, um certificado de conformidade.'),
      element('section', 'dashboard-card')
    );
    const card = view.lastElementChild;
    append(card, heading, context, toolbar, source, stateList);
  }

  function renderStateList(container, run) {
    clear(container);
    const records = runStates(run);
    const query = state.reportSearch.trim().toLowerCase();
    const filtered = records.filter((record) => {
      const kind = stateKind(record);
      if (state.reportFilter !== 'all' && kind !== state.reportFilter) return false;
      if (!query) return true;
      const haystack = [
        record && record.name,
        record && record.status,
        ...issueArray(record, 'violations').flatMap(issueSearchParts),
        ...issueArray(record, 'incomplete').flatMap(issueSearchParts)
      ].join(' ').toLowerCase();
      return haystack.includes(query);
    });
    const summary = element('div', 'report-source-caption');
    append(summary, element('span', null, `${metricText(filtered.length)} estado(s) exibido(s)`), element('span', null, 'Contagens de achados ficam em cada estado.'));
    container.append(summary);
    if (!records.length) {
      container.append(element('div', 'empty-state', 'Nenhum estado foi incluído neste registro.'));
      return;
    }
    if (!filtered.length) {
      container.append(element('div', 'empty-state', 'Nenhum estado corresponde à busca e ao filtro selecionados.'));
      return;
    }
    filtered.forEach((record) => container.append(stateDetails(record)));
  }

  function issueSearchParts(issue) {
    if (!issue || typeof issue !== 'object') return [];
    return [issue.id, issue.description, issue.help, issue.helpUrl, ...targetValues(issue)].filter(Boolean).map(String);
  }

  function targetValues(issue) {
    const targets = issue && Array.isArray(issue.targets) ? issue.targets : [];
    return targets.flatMap((target) => Array.isArray(target) ? target : [target]).filter((target) => target !== null && target !== undefined && target !== '');
  }

  function stateDetails(record) {
    const details = element('details', 'state-card');
    const summary = document.createElement('summary');
    const summaryCopy = element('div');
    const name = element('span', 'state-name', textValue(record && record.name, 'Estado sem nome'));
    const counts = element('span', 'state-summary');
    const violations = issueArray(record, 'violations').length;
    const incomplete = issueArray(record, 'incomplete').length;
    append(counts,
      element('strong', null, `${metricText(violations)} violação(ões)`),
      document.createTextNode(' · '),
      element('strong', null, `${metricText(incomplete)} inconclusivo(s)`)
    );
    append(summaryCopy, name, counts);
    append(summary, summaryCopy, element('span', stateKindClass(stateKind(record)), stateKindLabel(stateKind(record))));
    const detail = element('div', 'state-detail');
    const intro = element('p', 'state-detail-intro', textValue(record && record.status, stateKindLabel(stateKind(record))));
    append(detail, intro);
    appendIssues(detail, 'Violações registradas', issueArray(record, 'violations'));
    appendIssues(detail, 'Resultados inconclusivos', issueArray(record, 'incomplete'));
    if (!violations && !incomplete && stateKind(record) === 'not-tested') {
      detail.append(element('div', 'empty-state', 'Este estado foi marcado como não testado neste registro.'));
    } else if (!violations && !incomplete && stateKind(record) === 'clean') {
      detail.append(element('div', 'no-issues', 'Nenhuma ocorrência foi registrada para este estado. Isso não substitui revisão humana.'));
    }
    append(details, summary, detail);
    return details;
  }

  function appendIssues(parent, heading, issues) {
    if (!issues.length) return;
    const block = element('section');
    const title = element('h3', 'sr-only', heading);
    const list = element('div', 'issue-list');
    issues.forEach((issue) => list.append(issueDetails(issue)));
    append(block, title, list);
    parent.append(block);
  }

  function issueDetails(issue) {
    const item = element('article', 'issue-item');
    const header = element('div', 'issue-header');
    const rule = element('strong', null, textValue(issue && issue.id, 'Regra sem ID'));
    const impactValue = textValue(issue && issue.impact, 'impacto não registrado');
    const impactClass = ['serious', 'critical'].includes(impactValue.toLowerCase()) ? ` impact-${impactValue.toLowerCase()}` : '';
    const impact = element('span', `impact-badge${impactClass}`, impactValue);
    append(header, rule, impact);
    const description = element('p', 'issue-description', textValue(issue && issue.description, 'Descrição não registrada.'));
    append(item, header, description);
    const helpHref = safeHref(issue && issue.helpUrl);
    if (helpHref) {
      const help = makeLink('Abrir explicação da regra', helpHref, 'issue-help');
      help.target = '_blank';
      help.rel = 'noopener noreferrer';
      item.append(help);
    }
    const targets = targetValues(issue);
    if (targets.length) {
      const targetList = element('dl', 'target-list');
      targets.forEach((target, index) => {
        const term = element('dt', null, index === 0 ? 'Alvos técnicos' : `Alvo ${index + 1}`);
        const definition = element('dd', null, textValue(target, 'seletor não registrado'));
        append(targetList, term, definition);
      });
      item.append(targetList);
    }
    return item;
  }

  function renderReview() {
    const view = refs.review;
    clear(view);
    const layout = element('div', 'review-layout');
    const checklistCard = element('section', 'dashboard-card');
    const heading = element('div', 'card-heading');
    append(heading,
      append(element('div'), element('h2', null, 'Autoavaliação desta aba'), element('p', null, 'Marque apenas o que você conferiu manualmente nesta sessão.')),
      createBadge('Local')
    );
    const list = element('div', 'review-list');
    const items = [
      'Navegação principal alcançável por teclado',
      'Foco visível em controles e links',
      'Ordem de foco compreensível',
      'Rótulos e nomes acessíveis conferidos',
      'Estado de erro ou ausência de dados compreendido',
      'Conteúdo crítico revisado em contexto'
    ];
    items.forEach((label, index) => {
      const number = String(index + 1);
      const item = element('label', 'review-item');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = number;
      checkbox.dataset.reviewItem = number;
      checkbox.checked = state.reviewItems.has(number);
      checkbox.setAttribute('aria-label', label);
      append(item, checkbox, append(element('span'), element('strong', null, label), element('span', null, `Item ${number} de 6`)));
      list.append(item);
    });
    const progress = element('div', 'review-progress');
    progress.id = 'reviewProgress';
    const progressBar = element('div', 'progress-track');
    const progressFill = element('div', 'progress-bar');
    progressFill.id = 'reviewProgressBar';
    progressBar.append(progressFill);
    append(progress, document.createTextNode('0 de 6 itens marcados'), element('small', null, 'Autoavaliação desta aba'), progressBar);
    const reset = makeButton('Limpar autoavaliação', 'reset-review', 'button button-secondary reset-review-button');
    reset.id = 'resetReview';
    append(checklistCard, heading, list, progress, reset);

    const noteCard = element('section', 'dashboard-card');
    const noteHeading = element('div', 'card-heading');
    append(noteHeading, element('h2', null, 'Como interpretar'), createBadge('Sem persistência'));
    const note = element('div', 'manual-note');
    append(note,
      element('strong', null, 'Não altera o relatório nem substitui revisão humana'),
      document.createTextNode(' Os marcadores ficam somente na memória desta aba e desaparecem ao recarregar a página.')
    );
    const noteCopy = element('p', 'card-copy', 'Use a lista para registrar uma conferência complementar. Ela não converte um estado inconclusivo em resultado aprovado.');
    append(noteCard, noteHeading, note, noteCopy);
    append(layout, checklistCard, noteCard);
    view.append(
      element('p', 'view-lead', 'Uma lista de conferência local para apoiar a leitura dos resultados registrados. Ela não envia respostas e não altera a evidência.'),
      layout
    );
    updateReviewProgress();
  }

  function updateReviewProgress() {
    const progress = document.getElementById('reviewProgress');
    const fill = document.getElementById('reviewProgressBar');
    if (!progress || !fill) return;
    const count = state.reviewItems.size;
    progress.firstChild.textContent = `${count} de 6 itens marcados`;
    fill.style.width = `${Math.round((count / 6) * 100)}%`;
  }

  function showToast(message) {
    if (!refs.toast) return;
    refs.toast.textContent = message;
    refs.toast.classList.add('is-visible');
    window.clearTimeout(state.toastTimer);
    state.toastTimer = window.setTimeout(() => refs.toast.classList.remove('is-visible'), 3200);
  }

  async function copyHash() {
    const extension = data.extension && typeof data.extension === 'object' ? data.extension : {};
    const hash = typeof extension.sha256 === 'string' ? extension.sha256 : '';
    const status = document.getElementById('hashCopyStatus');
    if (!hash) {
      if (status) status.textContent = 'Hash não registrado.';
      return;
    }
    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
      if (status) status.textContent = 'Cópia indisponível neste contexto; selecione o hash manualmente.';
      return;
    }
    try {
      await navigator.clipboard.writeText(hash);
      if (status) status.textContent = 'Hash copiado por ação manual.';
      showToast('Hash copiado para a área de transferência.');
    } catch (_error) {
      if (status) status.textContent = 'Não foi possível copiar; selecione o hash manualmente.';
    }
  }

  function exportRun() {
    const run = currentRun();
    if (!run) {
      showToast('Nenhum registro está disponível para exportação.');
      return;
    }
    try {
      const blob = new Blob([JSON.stringify(run, null, 2)], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `verifica-auditoria-${textValue(run.id, 'registro')}.json`;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      showToast('Registro JSON exportado localmente.');
    } catch (_error) {
      showToast('Não foi possível exportar este registro.');
    }
  }

  function goToReports(runId, reportFilter) {
    if (runId && runIds.has(String(runId))) state.runId = String(runId);
    if (reportFilter && ['all', 'violations', 'incomplete', 'clean', 'not-tested'].includes(reportFilter)) {
      state.reportFilter = reportFilter;
    }
    state.view = 'reports';
    setRunOptions();
    renderView();
  }

  function preserveReportFocus() {
    const current = document.activeElement;
    const start = current && typeof current.selectionStart === 'number' ? current.selectionStart : null;
    renderReports(currentRun());
    const next = document.getElementById('stateSearch');
    if (next) {
      next.focus();
      if (start !== null) {
        const position = Math.min(start, next.value.length);
        next.setSelectionRange(position, position);
      }
    }
  }

  function openResetDialog() {
    if (!refs.resetDialog || typeof refs.resetDialog.showModal !== 'function') {
      showToast('O diálogo de confirmação não está disponível neste navegador.');
      return;
    }
    state.reviewFocus = document.getElementById('resetReview');
    refs.resetDialog.returnValue = '';
    refs.resetDialog.showModal();
  }

  function handleClick(event) {
    const nav = event.target.closest('[data-panel-nav]');
    if (nav) {
      state.view = nav.dataset.panelNav || 'overview';
      renderView();
      return;
    }
    const actionNode = event.target.closest('[data-action]');
    if (!actionNode) return;
    const action = actionNode.dataset.action;
    if (action === 'go-reports') {
      goToReports(actionNode.dataset.runId || '', actionNode.dataset.reportFilter || '');
    } else if (action === 'copy-hash') {
      copyHash();
    } else if (action === 'export-run') {
      exportRun();
    } else if (action === 'reset-review') {
      openResetDialog();
    }
  }

  function handleInput(event) {
    if (event.target.id === 'stateSearch') {
      state.reportSearch = event.target.value;
      preserveReportFocus();
    }
  }

  function handleChange(event) {
    const target = event.target;
    if (target.id === 'runSelect') {
      state.runId = target.value;
      renderView();
      return;
    }
    if (target.id === 'demoEnabled') {
      state.demoEnabled = Boolean(target.checked);
      const status = document.getElementById('demoState');
      if (status) {
        status.textContent = state.demoEnabled ? 'Ativa (simulado)' : 'Pausada (simulado)';
        status.classList.toggle('is-paused', !state.demoEnabled);
      }
      showToast(state.demoEnabled ? 'Demonstração local ativada.' : 'Demonstração local pausada.');
      return;
    }
    if (target.name === 'installNote') {
      state.installNote = target.value;
      showToast(target.value === 'reported-installed' ? 'Anotação local registrada.' : 'Anotação local removida.');
      return;
    }
    if (target.id === 'resultFilter') {
      state.reportFilter = target.value;
      const list = document.querySelector('.panel-view:not([hidden]) .state-list');
      if (list) renderStateList(list, currentRun());
      return;
    }
    if (target.matches('[data-review-item]')) {
      const item = String(target.value);
      if (target.checked) state.reviewItems.add(item);
      else state.reviewItems.delete(item);
      updateReviewProgress();
    }
  }

  function initDialog() {
    refs.resetDialog.addEventListener('close', () => {
      if (refs.resetDialog.returnValue === 'yes') {
        state.reviewItems.clear();
        if (state.view === 'review') renderReview();
        showToast('Autoavaliação limpa somente nesta aba.');
      }
      const focusTarget = document.getElementById('resetReview') || state.reviewFocus;
      if (focusTarget && typeof focusTarget.focus === 'function') focusTarget.focus();
      state.reviewFocus = null;
    });
  }

  function init() {
    refs.panelTitle = document.getElementById('panelTitle');
    refs.runSelect = document.getElementById('runSelect');
    refs.registeredAt = document.getElementById('registeredAt');
    refs.toast = document.getElementById('panelToast');
    refs.resetDialog = document.getElementById('resetDialog');
    refs.overview = document.getElementById('view-overview');
    refs.extension = document.getElementById('view-extension');
    refs.reports = document.getElementById('view-reports');
    refs.review = document.getElementById('view-review');
    refs.views = Array.from(document.querySelectorAll('[data-panel-view]'));
    refs.navButtons = Array.from(document.querySelectorAll('[data-panel-nav]'));
    setRunOptions();
    renderView();
    document.addEventListener('click', handleClick);
    document.addEventListener('input', handleInput);
    document.addEventListener('change', handleChange);
    initDialog();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
