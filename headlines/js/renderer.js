const DEFAULT_TYPOGRAPHY = {
    "ratio-16-9": {
        badge: { size: 10, color: "#ffffff" }, url: { size: 9, color: "#111111" },
        cat: { size: 11, color: "#b3adad" }, date: { size: 9, color: "#ffffff" },
        title: { size: 28, color: "#111111" }, sub: { size: 14, color: "#111111" },
        body: { size: 13, color: "#555555" }, mini_t: { size: 16, color: "#111111" }, mini_d: { size: 13, color: "#555555" },
        // Layout Metrics (Legacy 16:9 Values)
        padding_y: 2.5, padding_x: 3, gap_card: 25, mini_gap: 12, mini_padding: 15
    },
    "ratio-4-3": {
        badge: { size: 11, color: "#ffffff" }, url: { size: 10, color: "#111111" },
        cat: { size: 12, color: "#b3adad" }, date: { size: 10, color: "#ffffff" },
        title: { size: 30, color: "#111111" }, sub: { size: 16, color: "#111111" },
        body: { size: 14, color: "#555555" }, mini_t: { size: 17, color: "#111111" }, mini_d: { size: 13, color: "#555555" },
        // Layout Metrics (Standard Legacy Values)
        padding_y: 5, padding_x: 6, gap_card: 30, mini_gap: 15, mini_padding: 18
    },
    "ratio-1-1": {
        badge: { size: 12, color: "#ffffff" }, url: { size: 11, color: "#111111" },
        cat: { size: 14, color: "#b3adad" }, date: { size: 12, color: "#ffffff" },
        title: { size: 36, color: "#111111" }, sub: { size: 18, color: "#111111" },
        body: { size: 15, color: "#555555" }, mini_t: { size: 18, color: "#111111" }, mini_d: { size: 14, color: "#555555" },
        padding_y: 3, padding_x: 5, gap_card: 25, mini_gap: 20, mini_padding: 25
    },
    "ratio-4-5": {
        badge: { size: 12, color: "#ffffff" }, url: { size: 11, color: "#111111" },
        cat: { size: 14, color: "#b3adad" }, date: { size: 12, color: "#ffffff" },
        title: { size: 36, color: "#111111" }, sub: { size: 18, color: "#111111" },
        body: { size: 15, color: "#555555" }, mini_t: { size: 18, color: "#111111" }, mini_d: { size: 14, color: "#555555" },
        padding_y: 2, padding_x: 5, gap_card: 20, mini_gap: 15, mini_padding: 15
    },
    "ratio-9-16": {
        badge: { size: 14, color: "#ffffff" }, url: { size: 12, color: "#111111" },
        cat: { size: 16, color: "#b3adad" }, date: { size: 14, color: "#ffffff" },
        title: { size: 42, color: "#111111" }, sub: { size: 20, color: "#111111" },
        body: { size: 17, color: "#555555" }, mini_t: { size: 20, color: "#111111" }, mini_d: { size: 16, color: "#555555" },
        padding_y: 4, padding_x: 6, gap_card: 10, mini_gap: 8, mini_padding: 12
    }
};

function render() {
    if (!state) return;
    const principal = state.noticiaPrincipal;
    const layout = state.config.layout || 'ratio-16-9';
    const cardBody = document.querySelector('.card-body');
    const imageHTML = `<div class="main-image-container"><div class="img-anchor-wrapper"><img src="${principal.imagem_url}"><div class="timestamp">${principal.data}</div></div></div>`;
    const textBaseHTML = `<span class="category-tag">${principal.categoria}</span><h1>${principal.titulo}</h1><p class="subtitle">${principal.subtitulo}</p>`;
    
    if (layout === 'ratio-4-5') {
        cardBody.innerHTML = `<div class="layout-4-5-wrapper"><div class="top-text-section">${textBaseHTML}</div><div class="section-divider"></div><div class="middle-split-section">${imageHTML}<div class="split-body-column"><p class="body-text">${principal.corpo_texto}</p></div></div><div class="section-divider"></div><div class="mini-news-vertical-list" id="mini-news-container"></div></div>`;
    } 
    else if (layout === 'ratio-1-1' || layout === 'ratio-4-3') {
        cardBody.innerHTML = `<div class="top-section">${imageHTML}<div class="news-text">${textBaseHTML}<p class="body-text">${principal.corpo_texto}</p></div></div><div class="mid-separator"></div><div class="mini-news-grid" id="mini-news-container"></div>`;
    } else {
        cardBody.innerHTML = `${imageHTML}<div class="info-container"><div class="news-text">${textBaseHTML}<p class="body-text">${principal.corpo_texto}</p></div><div class="mini-news-grid" id="mini-news-container"></div></div>`;
    }

    document.getElementById('logo-img').src = state.config.logo_url;
    document.getElementById('site-url-text').innerText = state.config.site_url;
    const badgeEl = document.querySelector('.live-badge');
    if(badgeEl) badgeEl.innerText = state.config.badge_text;
    
    const miniContainer = document.getElementById('mini-news-container');
    miniContainer.innerHTML = '';
    state.miniNoticias.slice(0, 3).forEach(item => {
        miniContainer.innerHTML += `<div class="mini-item"><img src="${item.thumb_url}"><div><h4>${item.titulo}</h4><p>${item.resumo}</p></div></div>`;
    });
}

function updateColors() {
    const bgColor = state.config.bg_color || "#ffffff";
    const hColor = state.config.header_color || "#f5f5f5";
    const accentColor = state.config.accent_color || "#b3adad";
    
    const getContrastYIQ = (hex) => {
        hex = hex.replace("#", "");
        const r = parseInt(hex.substr(0,2),16);
        const g = parseInt(hex.substr(2,2),16);
        const b = parseInt(hex.substr(4,2),16);
        const yiq = ((r*299)+(g*587)+(b*114))/1000;
        return (yiq >= 128) ? '#111111' : '#ffffff';
    };

    const mainText = getContrastYIQ(bgColor);
    const root = document.documentElement;
    root.style.setProperty('--bg-card', bgColor);
    root.style.setProperty('--bg-header', hColor);
    root.style.setProperty('--accent', accentColor);
    root.style.setProperty('--accent-soft', accentColor + "40");
    root.style.setProperty('--text-color', mainText);
    root.style.setProperty('--text-muted', mainText === '#111111' ? '#444444' : '#bbbbbb');
    root.style.setProperty('--contrast-accent', getContrastYIQ(accentColor));
}

function applyTypographyToCSS() {
    const layout = state.config.layout || "ratio-16-9";
    const settings = state.layoutSettings[layout];
    const root = document.documentElement;

    // Apply Typography
    Object.keys(settings).forEach(key => {
        if (typeof settings[key] === 'object' && settings[key].size) {
            const cssKey = key.replace('_', '-'); 
            root.style.setProperty(`--fs-${cssKey}`, `${settings[key].size / 16}rem`);
            root.style.setProperty(`--clr-${cssKey}`, settings[key].color);
        }
    });

    // Apply Layout Spacing (Isolamento Total)
    root.style.setProperty('--layout-padding-y', `${settings.padding_y}%`);
    root.style.setProperty('--layout-padding-x', `${settings.padding_x}%`);
    root.style.setProperty('--layout-gap', `${settings.gap_card}px`);
    root.style.setProperty('--mini-grid-gap', `${settings.mini_gap}px`);
    root.style.setProperty('--mini-grid-padding', `${settings.mini_padding}px`);
}