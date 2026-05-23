let state = null;

async function init() {
    try {
        const response = await fetch('dados.json');
        state = await response.json();
        
        sanitizeState();

        state.noticiaPrincipal.imagem_url = await cropImage(state.noticiaPrincipal.imagem_url, 4/3);
        for (let i = 0; i < state.miniNoticias.length; i++) {
            state.miniNoticias[i].thumb_url = await cropImage(state.miniNoticias[i].thumb_url, 1/1);
        }

        setupSidebarInputs();
        setupPersistence();
        syncSidebarWithState();
        applyTypographyToCSS();
        render();
        updateColors();
    } catch (e) {
        console.error("Erro ao iniciar:", e);
    }
}

function sanitizeState() {
    if(!state.noticiaPrincipal.zoom) state.noticiaPrincipal.zoom = 1;
    if(!state.noticiaPrincipal.yPos) state.noticiaPrincipal.yPos = 0;
    if(!state.config.badge_text) state.config.badge_text = "ÚLTIMAS NOTÍCIAS IMPORTANTES";
    if(state.config.global_typography === undefined) state.config.global_typography = false;
    
    if(!state.layoutSettings) state.layoutSettings = JSON.parse(JSON.stringify(DEFAULT_TYPOGRAPHY));
    
    ["ratio-16-9", "ratio-4-3", "ratio-1-1", "ratio-4-5", "ratio-9-16"].forEach(l => {
        if(!state.layoutSettings[l]) {
            state.layoutSettings[l] = JSON.parse(JSON.stringify(DEFAULT_TYPOGRAPHY[l]));
        }
        const s = state.layoutSettings[l];
        const d = DEFAULT_TYPOGRAPHY[l];
        if (s.padding_y === undefined) s.padding_y = d.padding_y;
        if (s.padding_x === undefined) s.padding_x = d.padding_x;
        if (s.gap_card === undefined) s.gap_card = d.gap_card;
        if (s.mini_gap === undefined) s.mini_gap = d.mini_gap;
        if (s.mini_padding === undefined) s.mini_padding = d.mini_padding;
    });
}

init();