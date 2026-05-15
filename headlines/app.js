let state = null;

// FORÇA BRUTA: Recorta a imagem nos pixels para a proporção exata
async function cropImage(url, targetRatio) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            let sw, sh, sx, sy;
            if (img.width / img.height > targetRatio) {
                sh = img.height;
                sw = img.height * targetRatio;
                sx = (img.width - sw) / 2;
                sy = 0;
            } else {
                sw = img.width;
                sh = img.width / targetRatio;
                sx = 0;
                sy = (img.height - sh) / 2;
            }

            // Alta resolução para o processamento
            canvas.width = 1600; 
            canvas.height = 1600 / targetRatio;
            
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.95));
        };
        img.onerror = () => resolve(url);
        img.src = url;
    });
}

async function init() {
    try {
        const response = await fetch('dados.json');
        state = await response.json();
        
        // Ajuste inicial de proporções
        state.noticiaPrincipal.imagem_url = await cropImage(state.noticiaPrincipal.imagem_url, 4/3);
        for (let i = 0; i < state.miniNoticias.length; i++) {
            state.miniNoticias[i].thumb_url = await cropImage(state.miniNoticias[i].thumb_url, 1/1);
        }

        if(!state.noticiaPrincipal.zoom) state.noticiaPrincipal.zoom = 1;
        if(!state.noticiaPrincipal.yPos) state.noticiaPrincipal.yPos = 0;
        if(!state.config.badge_text) state.config.badge_text = "ÚLTIMAS NOTÍCIAS IMPORTANTES";

        setupSidebarInputs();
        setupPersistence();
        syncSidebarWithState();
        render();
        updateColors();
    } catch (e) {
        console.error("Erro ao iniciar:", e);
    }
}

function setupPersistence() {
    document.getElementById('btn-export-json').onclick = () => {
        state.config.layout = document.getElementById('layout-selector').value;
        state.config.bg_color = document.getElementById('bg-card-color').value;
        state.config.header_color = document.getElementById('header-color').value;
        state.config.accent_color = document.getElementById('accent-color').value;
        
        const dataStr = JSON.stringify(state, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        let fileName = document.getElementById('export-filename').value.trim() || 'snapshot-projeto';
        if(!fileName.toLowerCase().endsWith('.json')) fileName += '.json';

        const link = document.createElement('a');
        link.setAttribute('href', dataUri);
        link.setAttribute('download', fileName);
        link.click();
    };

    const fileInput = document.getElementById('import-json-file');
    document.getElementById('btn-trigger-import').onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (event) => {
            state = JSON.parse(event.target.result);
            state.noticiaPrincipal.imagem_url = await cropImage(state.noticiaPrincipal.imagem_url, 4/3);
            for (let i = 0; i < state.miniNoticias.length; i++) {
                state.miniNoticias[i].thumb_url = await cropImage(state.miniNoticias[i].thumb_url, 1/1);
            }
            syncSidebarWithState();
            render();
            updateColors();
        };
        reader.readAsText(file);
    };

    document.getElementById('btn-export-png').onclick = () => {
        const stage = document.getElementById('snapshot-stage');
        const btn = document.getElementById('btn-export-png');
        btn.innerText = "Gerando Imagem Ultra HD...";
        btn.disabled = true;
        
        html2canvas(stage, { 
            scale: 3, 
            useCORS: true, 
            allowTaint: true, 
            backgroundColor: null 
        }).then(canvas => {
            const image = canvas.toDataURL("image/png", 1.0);
            const link = document.createElement('a');
            link.setAttribute('href', image);
            link.setAttribute('download', `snapshot-${new Date().getTime()}.png`);
            link.click();
            btn.innerText = "Baixar PNG Alta Resolução";
            btn.disabled = false;
        });
    };
}

function setupSidebarInputs() {
    document.getElementById('layout-selector').onchange = (e) => {
        state.config.layout = e.target.value;
        document.body.className = e.target.value;
        render();
        updateColors();
    };
    document.getElementById('bg-card-color').oninput = updateColors;
    document.getElementById('header-color').oninput = updateColors;
    document.getElementById('accent-color').oninput = updateColors;

    document.getElementById('edit-badge-text').oninput = (e) => {
        state.config.badge_text = e.target.value;
        render();
    };

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

function syncSidebarWithState() {
    document.getElementById('layout-selector').value = state.config.layout || "ratio-16-9";
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
    document.body.className = state.config.layout || "ratio-16-9";
}

function handleImageUpload(id, callback) {
    const el = document.getElementById(id);
    if(el) {
        el.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => callback(ev.target.result);
                reader.readAsDataURL(file);
            }
        };
    }
}

function render() {
    if (!state) return;
    const principal = state.noticiaPrincipal;
    const layout = state.config.layout;
    const cardBody = document.querySelector('.card-body');
    const imageHTML = `<div class="main-image-container"><div class="img-anchor-wrapper"><img src="${principal.imagem_url}"><div class="timestamp">${principal.data}</div></div></div>`;
    const mainContentHTML = `<div class="news-text"><span class="category-tag">${principal.categoria}</span><h1>${principal.titulo}</h1><p class="subtitle">${principal.subtitulo}</p><p class="body-text">${principal.corpo_texto}</p></div>`;
    
    if (layout === 'ratio-1-1') {
        cardBody.innerHTML = `<div class="top-section">${imageHTML}${mainContentHTML}</div><div class="mid-separator"></div><div class="mini-news-grid" id="mini-news-container"></div>`;
    } else {
        cardBody.innerHTML = `${imageHTML}<div class="info-container">${mainContentHTML}<div class="mini-news-grid" id="mini-news-container"></div></div>`;
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

function getContrastYIQ(hexcolor){
    hexcolor = hexcolor.replace("#", "");
    const r = parseInt(hexcolor.substr(0,2),16);
    const g = parseInt(hexcolor.substr(2,2),16);
    const b = parseInt(hexcolor.substr(4,2),16);
    const yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? '#111111' : '#ffffff';
}

function updateColors() {
    const bgColor = document.getElementById('bg-card-color').value;
    const hColor = document.getElementById('header-color').value;
    const accentColor = document.getElementById('accent-color').value;
    const mainText = getContrastYIQ(bgColor);
    root = document.documentElement;
    root.style.setProperty('--bg-card', bgColor);
    root.style.setProperty('--bg-header', hColor);
    root.style.setProperty('--accent', accentColor);
    root.style.setProperty('--accent-soft', accentColor + "40");
    root.style.setProperty('--text-color', mainText);
    root.style.setProperty('--text-muted', mainText === '#111111' ? '#444444' : '#bbbbbb');
    root.style.setProperty('--contrast-accent', getContrastYIQ(accentColor));
}

init();