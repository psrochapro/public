let state = null;

async function init() {
    try {
        const response = await fetch('dados.json');
        state = await response.json();
        
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
        reader.onload = (event) => {
            state = JSON.parse(event.target.result);
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

        // SCALE 3 garante que mesmo backgrounds fiquem super nítidos no export
        html2canvas(stage, { 
            scale: 3, 
            useCORS: true, 
            allowTaint: false, 
            backgroundColor: null,
            logging: false,
            imageTimeout: 0
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
    const layout = document.getElementById('layout-selector').value;
    const cardBody = document.querySelector('.card-body');
    
    // SOLUÇÃO: Usamos divs com background para garantir que o html2canvas respeite o crop center
    const imageHTML = `
        <div class="main-image-container">
            <div class="main-image-bg" style="background-image: url('${principal.imagem_url}')"></div>
            <div class="timestamp">${principal.data}</div>
        </div>`;
    
    const mainContentHTML = `
        <div class="news-text">
            <span class="category-tag">${principal.categoria}</span>
            <h1>${principal.titulo}</h1>
            <p class="subtitle">${principal.subtitulo}</p>
            <p class="body-text">${principal.corpo_texto}</p>
        </div>`;
    
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
        miniContainer.innerHTML += `
            <div class="mini-item">
                <div class="mini-thumb-bg" style="background-image: url('${item.thumb_url}')"></div>
                <div>
                    <h4>${item.titulo}</h4>
                    <p>${item.resumo}</p>
                </div>
            </div>`;
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