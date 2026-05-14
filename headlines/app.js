/**
 * Lógica: News Snapshot Creator
 * Gerencia conteúdo, limites de texto e cores
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

// Auxiliar para limitar texto e evitar quebra de layout
function limitText(text, limit) {
    if (text.length <= limit) return text;
    return text.substring(0, limit).trim() + "...";
}

function render() {
    if (!globalData) return;

    const layout = layoutSelector.value;
    const principal = globalData.noticiaPrincipal;

    // Definição de limites por layout para garantir que NADA corte
    let titleLimit = 80;
    let subLimit = 160;

    if (layout === 'ratio-1-1') {
        titleLimit = 60;
        subLimit = 100;
    } else if (layout === 'ratio-9-16') {
        titleLimit = 55;
        subLimit = 85;
    }

    document.getElementById('logo-img').src = globalData.config.logo_url;
    document.getElementById('main-img').src = principal.imagem_url;
    document.getElementById('category').innerText = principal.categoria;
    document.getElementById('image-date').innerText = principal.data;
    
    // Aplica os limites rigorosos
    document.getElementById('title').innerText = limitText(principal.titulo, titleLimit);
    document.getElementById('subtitle').innerText = limitText(principal.subtitulo, subLimit);

    const miniContainer = document.getElementById('mini-news-container');
    miniContainer.innerHTML = '';
    
    // No Stories e Quadrado, 4 thumbs podem ser demais se o texto for grande, 
    // mas vamos manter os 4 com fontes pequenas como solicitado.
    globalData.miniNoticias.slice(0, 4).forEach(item => {
        miniContainer.innerHTML += `
            <div class="mini-item">
                <img src="${item.thumb_url}" alt="thumb">
                <h4>${limitText(item.titulo, 45)}</h4>
            </div>
        `;
    });
}

// Funções de Cor
function getContrastYIQ(hexcolor){
    hexcolor = hexcolor.replace("#", "");
    const r = parseInt(hexcolor.substr(0,2),16);
    const g = parseInt(hexcolor.substr(2,2),16);
    const b = parseInt(hexcolor.substr(4,2),16);
    const yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? '#111111' : '#ffffff';
}

// Escurece ou clareia para o cabeçalho
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
    const mutedText = mainText === '#111111' ? '#555555' : '#aaaaaa';
    const accentContrast = getContrastYIQ(accentColor);
    
    // Cabeçalho levemente diferente do fundo
    const headerBg = adjustColor(bgColor, -10); 
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

// Eventos
accentInput.addEventListener('input', updateColors);
bgInput.addEventListener('input', updateColors);
layoutSelector.addEventListener('change', () => {
    document.body.className = layoutSelector.value;
    render(); // Re-renderiza para aplicar novos limites de texto
});

btnToggleUI.addEventListener('click', () => {
    document.body.classList.toggle('ui-hidden');
    btnToggleUI.innerText = document.body.classList.contains('ui-hidden') 
        ? "Mostrar Interface" : "Ocultar Interface";
});

document.getElementById('btn-export').onclick = () => {
    alert("Pronto para a fase de exportação em PNG!");
};

init();