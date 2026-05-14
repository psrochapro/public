/**
 * APP: News Snapshot Creator Pro
 * Lógica de Edição Live + Injeção de Linha Divisória
 */

let state = null;

async function init() {
    try {
        const response = await fetch('dados.json');
        state = await response.json();
        
        setupSidebarInputs();
        setupPersistence();
        syncSidebarWithState();
        render();
        updateColors();
    } catch (e) {
        console.error("Erro ao iniciar aplicação:", e);
    }
}

function setupPersistence() {
    document.getElementById('btn-export-json').onclick = () => {
        state.config.current_layout = document.getElementById('layout-selector').value;
        state.config.current_bg = document.getElementById('bg-card-color').value;
        state.config.current_accent = document.getElementById('accent-color').value;
        const dataStr = JSON.stringify(state, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const link = document.createElement('a');
        link.setAttribute('href', dataUri);
        link.setAttribute('download', 'snapshot-projeto.json');
        link.click();
    };

    const fileInput = document.getElementById('import-json-file');
    document.getElementById('btn-trigger-import').onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            state = JSON.parse(event.target.result);
            if(state.config.current_layout) document.getElementById('layout-selector').value = state.config.current_layout;
            if(state.config.current_bg) document.getElementById('bg-card-color').value = state.config.current_bg;
            if(state.config.current_accent) document.getElementById('accent-color').value = state.config.current_accent;
            document.body.className = document.getElementById('layout-selector').value;
            syncSidebarWithState();
            render();
            updateColors();
        };
        reader.readAsText(file);
    };

    document.getElementById('btn-export-png').onclick = () => {
        const stage = document.getElementById('snapshot-stage');
        const btn = document.getElementById('btn-export-png');
        btn.innerText = "Gerando Imagem...";
        btn.disabled = true;

        html2canvas(stage, {
            scale: 2, 
            useCORS: true,
            allowTaint: true,
            backgroundColor: null
        }).then(canvas => {
            const image = canvas.toDataURL("image/png", 1.0);
            const link = document.createElement('a');
            link.setAttribute('href', image);
            link.setAttribute('download', `news-snapshot-${new Date().getTime()}.png`);
            link.click();
            btn.innerText = "Baixar PNG Alta Resolução";
            btn.disabled = false;
        });
    };
}

function setupSidebarInputs() {
    document.getElementById('layout-selector').onchange = (e) => {
        document.body.className = e.target.value;
        render();
        updateColors();
    };
    document.getElementById('bg-card-color').oninput = updateColors;
    document.getElementById('accent-color').oninput = updateColors;
    document.getElementById('edit-site-url').oninput = (e) => {
        state.config.site_url = e.target.value;
        document.getElementById('site-url-text').innerText = e.target.value;
    };
    handleImageUpload('edit-logo', (res) => { state.config.logo_url = res; render(); });
    handleImageUpload('edit-main-img', (res) => { state.noticiaPrincipal.imagem_url = res; render(); });
    document.getElementById('edit-main-cat').oninput = (e) => { state.noticiaPrincipal.categoria = e.target.value; render(); };
    document.getElementById('edit-main-date').oninput = (e) => { state.noticiaPrincipal.data = e.target.value; render(); };
    document.getElementById('edit-main-title').oninput = (e) => { state.noticiaPrincipal.titulo = e.target.value; render(); };
    document.getElementById('edit-main-sub').oninput = (e) => { state.noticiaPrincipal.subtitulo = e.target.value; render(); };
    document.getElementById('edit-main-body').oninput = (e) => { state.noticiaPrincipal.corpo_texto = e.target.value; render(); };
    for (let i = 0; i < 3; i++) {
        handleImageUpload(`edit-thumb-${i}`, (res) => { state.miniNoticias[i].thumb_url = res; render(); });
        document.getElementById(`edit-title-${i}`).oninput = (e) => { state.miniNoticias[i].titulo = e.target.value; render(); };
        document.getElementById(`edit-resumo-${i}`).oninput = (e) => { state.miniNoticias[i].resumo = e.target.value; render(); };
    }
}

function syncSidebarWithState() {
    document.getElementById('edit-site-url').value = state.config.site_url;
    document.getElementById('edit-main-cat').value = state.noticiaPrincipal.categoria;
    document.getElementById('edit-main-date').value = state.noticiaPrincipal.data;
    document.getElementById('edit-main-title').value = state.noticiaPrincipal.titulo;
    document.getElementById('edit-main-sub').value = state.noticiaPrincipal.subtitulo;
    document.getElementById('edit-main-body').value = state.noticiaPrincipal.corpo_texto;
    for (let i = 0; i < 3; i++) {
        document.getElementById(`edit-title-${i}`).value = state.miniNoticias[i].titulo;
        document.getElementById(`edit-resumo-${i}`).value = state.miniNoticias[i].resumo;
    }
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
    const layout = document.getElementById('layout-selector').value;
    const cardBody = document.querySelector('.card-body');
    
    const imageHTML = `
        <div class="main-image-container">
            <div class="img-anchor-wrapper">
                <img src="${principal.imagem_url}" id="main-img">
                <div class="timestamp">${principal.data}</div>
            </div>
        </div>
    `;

    const mainContentHTML = `
        <div class="news-text">
            <span class="category-tag">${principal.categoria}</span>
            <h1>${principal.titulo}</h1>
            <p class="subtitle">${principal.subtitulo}</p>
            <p class="body-text">${principal.corpo_texto}</p>
        </div>
    `;

    // Linha divisória injetada entre seções
    const separatorHTML = `<div class="mid-separator"></div>`;

    if (layout === 'ratio-1-1') {
        cardBody.innerHTML = `
            <div class="top-section">
                ${imageHTML}
                ${mainContentHTML}
            </div>
            ${separatorHTML}
            <div class="mini-news-grid" id="mini-news-container"></div>
        `;
    } else {
        cardBody.innerHTML = `
            ${imageHTML}
            <div class="info-container">
                ${mainContentHTML}
                ${separatorHTML}
                <div class="mini-news-grid" id="mini-news-container"></div>
            </div>
        `;
    }

    document.getElementById('logo-img').src = state.config.logo_url;
    document.getElementById('site-url-text').innerText = state.config.site_url;
    
    const miniContainer = document.getElementById('mini-news-container');
    miniContainer.innerHTML = '';
    state.miniNoticias.slice(0, 3).forEach(item => {
        miniContainer.innerHTML += `
            <div class="mini-item">
                <img src="${item.thumb_url}" alt="thumb">
                <div class="mini-text">
                    <h4>${item.titulo}</h4>
                    <p>${item.resumo}</p>
                </div>
            </div>
        `;
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

function adjustColor(hex, amt) {
    let usePound = false; if (hex[0] == "#") { hex = hex.slice(1); usePound = true; }
    let num = parseInt(hex, 16);
    let r = (num >> 16) + amt; if (r > 255) r = 255; else if (r < 0) r = 0;
    let b = ((num >> 8) & 0x00FF) + amt; if (b > 255) b = 255; else if (b < 0) b = 0;
    let g = (num & 0x0000FF) + amt; if (g > 255) g = 255; else if (g < 0) g = 0;
    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
}

function updateColors() {
    const bgColor = document.getElementById('bg-card-color').value;
    const accentColor = document.getElementById('accent-color').value;
    const mainText = getContrastYIQ(bgColor);
    const mutedText = mainText === '#111111' ? '#444444' : '#bbbbbb';
    const headerBg = adjustColor(bgColor, mainText === '#111111' ? -12 : 18); 
    const root = document.documentElement;
    root.style.setProperty('--bg-card', bgColor);
    root.style.setProperty('--bg-header', headerBg);
    root.style.setProperty('--accent', accentColor);
    root.style.setProperty('--accent-soft', accentColor + "40");
    root.style.setProperty('--text-color', mainText);
    root.style.setProperty('--text-muted', mutedText);
    root.style.setProperty('--contrast-accent', getContrastYIQ(accentColor));
}

init();