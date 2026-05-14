/**
 * Lógica: News Snapshot Creator Pro
 * Gerencia injeção de estrutura para 3 mini notícias e preenchimento de espaço
 */

const accentInput = document.getElementById('accent-color');
const bgInput = document.getElementById('bg-card-color');
const layoutSelector = document.getElementById('layout-selector');
const btnToggleUI = document.getElementById('btn-toggle-ui');

let globalData = null;

async function init() {
    try {
        const response = await fetch('dados.json');
        globalData = await response.json();
        render();
        updateColors();
    } catch (e) {
        console.error("Erro ao carregar dados:", e);
    }
}

function render() {
    if (!globalData) return;
    const principal = globalData.noticiaPrincipal;
    const layout = layoutSelector.value;

    const cardBody = document.querySelector('.card-body');
    
    // Injeção de estrutura dependente do Layout para otimizar espaço
    if (layout === 'ratio-1-1') {
        cardBody.innerHTML = `
            <div class="top-section">
                <div class="main-image-container">
                    <img src="${principal.imagem_url}" id="main-img">
                    <div class="timestamp">${principal.data}</div>
                </div>
                <div class="news-text">
                    <span class="category-tag">${principal.category || principal.categoria}</span>
                    <h1 id="title">${principal.titulo}</h1>
                    <p id="subtitle">${principal.subtitulo}</p>
                </div>
            </div>
            <div class="mini-news-grid" id="mini-news-container"></div>
        `;
    } else {
        cardBody.innerHTML = `
            <div class="main-image-container">
                <img src="${principal.imagem_url}" id="main-img">
                <div class="timestamp">${principal.data}</div>
            </div>
            <div class="info-container">
                <div class="news-text">
                    <span class="category-tag">${principal.category || principal.categoria}</span>
                    <h1 id="title">${principal.titulo}</h1>
                    <p id="subtitle">${principal.subtitulo}</p>
                </div>
                <div class="mini-news-grid" id="mini-news-container"></div>
            </div>
        `;
    }

    document.getElementById('logo-img').src = globalData.config.logo_url;
    
    // Injeção de 3 MINI NOTÍCIAS
    const miniContainer = document.getElementById('mini-news-container');
    miniContainer.innerHTML = '';
    globalData.miniNoticias.slice(0, 3).forEach(item => {
        miniContainer.innerHTML += `
            <div class="mini-item">
                <img src="${item.thumb_url}" alt="thumb">
                <h4>${item.titulo}</h4>
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
    let usePound = false;
    if (hex[0] == "#") { hex = hex.slice(1); usePound = true; }
    let num = parseInt(hex, 16);
    let r = (num >> 16) + amt;
    if (r > 255) r = 255; else if (r < 0) r = 0;
    let b = ((num >> 8) & 0x00FF) + amt;
    if (b > 255) b = 255; else if (b < 0) b = 0;
    let g = (num & 0x0000FF) + amt;
    if (g > 255) g = 255; else if (g < 0) g = 0;
    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
}

function updateColors() {
    const bgColor = bgInput.value;
    const accentColor = accentInput.value;
    
    const mainText = getContrastYIQ(bgColor);
    const mutedText = mainText === '#111111' ? '#444444' : '#bbbbbb';
    const accentContrast = getContrastYIQ(accentColor);
    
    const diff = mainText === '#111111' ? -12 : 18;
    const headerBg = adjustColor(bgColor, diff); 
    const accentSoft = accentColor + "15"; 

    const root = document.documentElement;
    root.style.setProperty('--bg-card', bgColor);
    root.style.setProperty('--bg-header', headerBg);
    root.style.setProperty('--accent', accentColor);
    root.style.setProperty('--accent-soft', accentSoft);
    root.style.setProperty('--text-color', mainText);
    root.style.setProperty('--text-muted', mutedText);
    root.style.setProperty('--contrast-accent', accentContrast);
}

accentInput.addEventListener('input', updateColors);
bgInput.addEventListener('input', updateColors);
layoutSelector.addEventListener('change', () => {
    document.body.className = layoutSelector.value;
    render();
    updateColors();
});

btnToggleUI.addEventListener('click', () => {
    document.body.classList.toggle('ui-hidden');
    btnToggleUI.innerText = document.body.classList.contains('ui-hidden') 
        ? "Mostrar Interface" : "Ocultar Interface";
});

init();