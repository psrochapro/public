function setupSidebarInputs() {
    const safeListener = (id, event, callback) => {
        const el = document.getElementById(id);
        if (el) {
            el[event] = callback;
        } else {
            console.warn(`Aviso: Elemento ID '${id}' não encontrado no HTML.`);
        }
    };

    const handleLayoutChange = (e) => {
        const val = e.target.value;
        state.config.layout = val;
        document.body.className = val;
        const sel1 = document.getElementById('layout-selector');
        const sel2 = document.getElementById('layout-selector-bottom');
        if(sel1) sel1.value = val;
        if(sel2) sel2.value = val;
        syncTypographyUI();
        applyTypographyToCSS();
        render();
        updateColors();
    };

    safeListener('layout-selector', 'onchange', handleLayoutChange);
    safeListener('layout-selector-bottom', 'onchange', handleLayoutChange);
    handleImageUpload('edit-logo', (res) => { state.config.logo_url = res; render(); });
    handleImageUpload('edit-main-img', async (res) => { 
        state.noticiaPrincipal.imagem_url = await cropImage(res, 4/3); 
        render(); 
    });

    for (let i = 0; i < 3; i++) {
        handleImageUpload(`edit-thumb-${i}`, async (res) => { 
            state.miniNoticias[i].thumb_url = await cropImage(res, 1/1); 
            render(); 
        });
        safeListener(`edit-title-${i}`, 'oninput', (e) => { state.miniNoticias[i].titulo = e.target.value; render(); });
        safeListener(`edit-resumo-${i}`, 'oninput', (e) => { state.miniNoticias[i].resumo = e.target.value; render(); });
    }

    safeListener('edit-img-zoom', 'oninput', (e) => {
        state.noticiaPrincipal.zoom = e.target.value;
        document.documentElement.style.setProperty('--img-zoom', e.target.value);
    });
    safeListener('edit-img-y', 'oninput', (e) => {
        state.noticiaPrincipal.yPos = e.target.value;
        document.documentElement.style.setProperty('--img-y', e.target.value + '%');
    });

    safeListener('edit-badge-text', 'oninput', (e) => { state.config.badge_text = e.target.value; render(); });
    safeListener('edit-main-cat', 'oninput', (e) => { state.noticiaPrincipal.categoria = e.target.value; render(); });
    safeListener('edit-main-date', 'oninput', (e) => { state.noticiaPrincipal.data = e.target.value; render(); });
    safeListener('edit-main-title', 'oninput', (e) => { state.noticiaPrincipal.titulo = e.target.value; render(); });
    safeListener('edit-main-sub', 'oninput', (e) => { state.noticiaPrincipal.subtitulo = e.target.value; render(); });
    safeListener('edit-main-body', 'oninput', (e) => { state.noticiaPrincipal.corpo_texto = e.target.value; render(); });
    safeListener('edit-site-url', 'oninput', (e) => { 
        state.config.site_url = e.target.value; 
        const urlDisplay = document.getElementById('site-url-text');
        if(urlDisplay) urlDisplay.innerText = e.target.value;
    });

    const updateSpacing = (key) => (e) => {
        const layout = state.config.layout || "ratio-16-9";
        state.layoutSettings[layout][key] = parseFloat(e.target.value);
        applyTypographyToCSS();
    };

    safeListener('edit-padding-y', 'oninput', updateSpacing('padding_y'));
    safeListener('edit-padding-x', 'oninput', updateSpacing('padding_x'));
    safeListener('edit-gap-card', 'oninput', updateSpacing('gap_card'));
    safeListener('edit-mini-gap', 'oninput', updateSpacing('mini_gap'));
    safeListener('edit-mini-padding', 'oninput', updateSpacing('mini_padding'));

    safeListener('bg-card-color', 'oninput', () => { state.config.bg_color = document.getElementById('bg-card-color').value; updateColors(); });
    safeListener('header-color', 'oninput', () => { state.config.header_color = document.getElementById('header-color').value; updateColors(); });
    safeListener('accent-color', 'oninput', () => { state.config.accent_color = document.getElementById('accent-color').value; updateColors(); });
    safeListener('global-typography-toggle', 'onchange', (e) => { state.config.global_typography = e.target.checked; });
    safeListener('text-element-selector', 'onchange', syncTypographyUI);
    safeListener('edit-font-size', 'oninput', handleTypographyInput);
    safeListener('edit-font-color', 'oninput', handleTypographyInput);
}

function syncTypographyUI() {
    const layout = state.config.layout || "ratio-16-9";
    const selector = document.getElementById('text-element-selector');
    if(!selector) return;
    const elementKey = selector.value.replace('-', '_');
    const settings = state.layoutSettings[layout][elementKey];
    const sizeInput = document.getElementById('edit-font-size');
    const colorInput = document.getElementById('edit-font-color');
    if(sizeInput) sizeInput.value = settings.size;
    if(colorInput) colorInput.value = settings.color;
}

function handleTypographyInput() {
    const toggle = document.getElementById('global-typography-toggle');
    const isGlobal = toggle ? toggle.checked : false;
    const selector = document.getElementById('text-element-selector');
    if(!selector) return;
    const elementKey = selector.value.replace('-', '_');
    const newSize = document.getElementById('edit-font-size').value;
    const newColor = document.getElementById('edit-font-color').value;
    if (isGlobal) {
        ["ratio-16-9", "ratio-4-3", "ratio-1-1", "ratio-4-5", "ratio-9-16"].forEach(l => {
            state.layoutSettings[l][elementKey].size = newSize;
            state.layoutSettings[l][elementKey].color = newColor;
        });
    } else {
        const layout = state.config.layout || "ratio-16-9";
        state.layoutSettings[layout][elementKey].size = newSize;
        state.layoutSettings[layout][elementKey].color = newColor;
    }
    applyTypographyToCSS();
}

function syncSidebarWithState() {
    const layout = state.config.layout || "ratio-16-9";
    const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };
    setVal('layout-selector', layout);
    setVal('layout-selector-bottom', layout);
    const toggle = document.getElementById('global-typography-toggle');
    if(toggle) toggle.checked = !!state.config.global_typography;
    const s = state.layoutSettings[layout];
    setVal('edit-padding-y', s.padding_y);
    setVal('edit-padding-x', s.padding_x);
    setVal('edit-gap-card', s.gap_card);
    setVal('edit-mini-gap', s.mini_gap);
    setVal('edit-mini-padding', s.mini_padding);
    setVal('edit-badge-text', state.config.badge_text || "");
    setVal('bg-card-color', state.config.bg_color || "#ffffff");
    setVal('header-color', state.config.header_color || "#f5f5f5");
    setVal('accent-color', state.config.accent_color || "#b3adad");
    setVal('edit-site-url', state.config.site_url || "");
    setVal('edit-img-zoom', state.noticiaPrincipal.zoom || 1);
    setVal('edit-img-y', state.noticiaPrincipal.yPos || 0);
    document.documentElement.style.setProperty('--img-zoom', state.noticiaPrincipal.zoom || 1);
    document.documentElement.style.setProperty('--img-y', (state.noticiaPrincipal.yPos || 0) + '%');
    setVal('edit-main-cat', state.noticiaPrincipal.categoria);
    setVal('edit-main-date', state.noticiaPrincipal.data);
    setVal('edit-main-title', state.noticiaPrincipal.titulo);
    setVal('edit-main-sub', state.noticiaPrincipal.subtitulo);
    setVal('edit-main-body', state.noticiaPrincipal.corpo_texto);
    for (let i = 0; i < 3; i++) {
        setVal(`edit-title-${i}`, state.miniNoticias[i].titulo);
        setVal(`edit-resumo-${i}`, state.miniNoticias[i].resumo);
    }
    document.body.className = layout;
    syncTypographyUI();
}