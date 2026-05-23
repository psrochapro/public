function setupSidebarInputs() {
    const handleLayoutChange = (e) => {
        const val = e.target.value;
        state.config.layout = val;
        document.body.className = val;
        document.getElementById('layout-selector').value = val;
        document.getElementById('layout-selector-bottom').value = val;
        syncTypographyUI();
        applyTypographyToCSS();
        render();
        updateColors();
    };

    document.getElementById('layout-selector').onchange = handleLayoutChange;
    document.getElementById('layout-selector-bottom').onchange = handleLayoutChange;

    document.getElementById('bg-card-color').oninput = () => { state.config.bg_color = document.getElementById('bg-card-color').value; updateColors(); };
    document.getElementById('header-color').oninput = () => { state.config.header_color = document.getElementById('header-color').value; updateColors(); };
    document.getElementById('accent-color').oninput = () => { state.config.accent_color = document.getElementById('accent-color').value; updateColors(); };
    
    document.getElementById('edit-badge-text').oninput = (e) => { state.config.badge_text = e.target.value; render(); };
    
    document.getElementById('global-typography-toggle').onchange = (e) => {
        state.config.global_typography = e.target.checked;
    };
    document.getElementById('text-element-selector').onchange = syncTypographyUI;
    document.getElementById('edit-font-size').oninput = handleTypographyInput;
    document.getElementById('edit-font-color').oninput = handleTypographyInput;

    document.getElementById('edit-img-zoom').oninput = (e) => {
        state.noticiaPrincipal.zoom = e.target.value;
        document.documentElement.style.setProperty('--img-zoom', e.target.value);
    };
    document.getElementById('edit-img-y').oninput = (e) => {
        state.noticiaPrincipal.yPos = e.target.value;
        document.documentElement.style.setProperty('--img-y', e.target.value + '%');
    };
    document.getElementById('edit-site-url').oninput = (e) => {
        state.config.site_url = e.target.value;
        document.getElementById('site-url-text').innerText = e.target.value;
    };

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
        document.getElementById(`edit-title-${i}`).oninput = (e) => { state.miniNoticias[i].titulo = e.target.value; render(); };
        document.getElementById(`edit-resumo-${i}`).oninput = (e) => { state.miniNoticias[i].resumo = e.target.value; render(); };
    }

    document.getElementById('edit-main-cat').oninput = (e) => { state.noticiaPrincipal.categoria = e.target.value; render(); };
    document.getElementById('edit-main-date').oninput = (e) => { state.noticiaPrincipal.data = e.target.value; render(); };
    document.getElementById('edit-main-title').oninput = (e) => { state.noticiaPrincipal.titulo = e.target.value; render(); };
    document.getElementById('edit-main-sub').oninput = (e) => { state.noticiaPrincipal.subtitulo = e.target.value; render(); };
    document.getElementById('edit-main-body').oninput = (e) => { state.noticiaPrincipal.corpo_texto = e.target.value; render(); };
}

function syncTypographyUI() {
    const layout = state.config.layout || "ratio-16-9";
    const elementKey = document.getElementById('text-element-selector').value.replace('-', '_');
    const settings = state.layoutSettings[layout][elementKey];
    
    document.getElementById('edit-font-size').value = settings.size;
    document.getElementById('edit-font-color').value = settings.color;
}

function handleTypographyInput() {
    const isGlobal = document.getElementById('global-typography-toggle').checked;
    const elementKey = document.getElementById('text-element-selector').value.replace('-', '_');
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
    document.getElementById('layout-selector').value = layout;
    document.getElementById('layout-selector-bottom').value = layout;
    document.getElementById('global-typography-toggle').checked = !!state.config.global_typography;
    document.getElementById('edit-badge-text').value = state.config.badge_text || "";
    document.getElementById('bg-card-color').value = state.config.bg_color || "#ffffff";
    document.getElementById('header-color').value = state.config.header_color || "#f5f5f5";
    document.getElementById('accent-color').value = state.config.accent_color || "#b3adad";
    document.getElementById('edit-site-url').value = state.config.site_url || "";
    document.getElementById('edit-img-zoom').value = state.noticiaPrincipal.zoom || 1;
    document.getElementById('edit-img-y').value = state.noticiaPrincipal.yPos || 0;
    document.documentElement.style.setProperty('--img-zoom', state.noticiaPrincipal.zoom || 1);
    document.documentElement.style.setProperty('--img-y', (state.noticiaPrincipal.yPos || 0) + '%');
    document.getElementById('edit-main-cat').value = state.noticiaPrincipal.categoria;
    document.getElementById('edit-main-date').value = state.noticiaPrincipal.data;
    document.getElementById('edit-main-title').value = state.noticiaPrincipal.titulo;
    document.getElementById('edit-main-sub').value = state.noticiaPrincipal.subtitulo;
    document.getElementById('edit-main-body').value = state.noticiaPrincipal.corpo_texto;
    for (let i = 0; i < 3; i++) {
        document.getElementById(`edit-title-${i}`).value = state.miniNoticias[i].titulo;
        document.getElementById(`edit-resumo-${i}`).value = state.miniNoticias[i].resumo;
    }
    document.body.className = layout;
    syncTypographyUI();
}