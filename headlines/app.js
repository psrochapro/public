/**
 * Lógica: News Snapshot Creator Pro
 * Gerencia conteúdo e cores com proteção de layout
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

// Renderização Principal
function render() {
    if (!globalData) return;
    const principal = globalData.noticiaPrincipal;

    document.getElementById('logo-img').src = globalData.config.logo_url;
    document.getElementById('main-img').src = principal.imagem_url;
    document.getElementById('category').innerText = principal.categoria;
    document.getElementById('image-date').innerText = principal.data;
    
    // Injeção de textos sem cortes bruscos via JS (CSS cuida do clamp)
    document.getElementById('title').innerText = principal.titulo;
    document.getElementById('subtitle').innerText = principal.subtitulo;

    const miniContainer = document.getElementById('mini-news-container');
    miniContainer.innerHTML = '';
    globalData.miniNoticias.slice(0, 4).forEach(item => {
        miniContainer.innerHTML += `
            <div class="mini-item">
                <img src="${item.thumb_url}" alt="thumb">
                <h4>${item.titulo}</h4>
            </div>
        `;
    });
}

// Sistema de Cores e Contraste
function getContrastYIQ(hexcolor){
    hexcolor = hexcolor.replace("#", "");
    const r = parseInt(hexcolor.substr(0,2),16);
    const g = parseInt(hexcolor.substr(2,2),16);
    const b = parseInt(hexcolor.substr(4,2),16);
    const yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? '#111111' : '#ffffff';
}

// Gera um tom baseado na cor base
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
    
    // Cabeçalho ganha profundidade com tom derivado
    // Se o fundo for claro, escurece 10. Se for escuro, clareia 10.
    const diff = mainText === '#111111' ? -10 : 15;
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

// Eventos de Interface
accentInput.addEventListener('input', updateColors);
bgInput.addEventListener('input', updateColors);
layoutSelector.addEventListener('change', () => {
    document.body.className = layoutSelector.value;
    render();
});

btnToggleUI.addEventListener('click', () => {
    document.body.classList.toggle('ui-hidden');
    btnToggleUI.innerText = document.body.classList.contains('ui-hidden') 
        ? "Mostrar Interface" : "Ocultar Interface";
});

// Botão de Exportação
document.getElementById('btn-export').onclick = () => {
    alert("Layout e Proporções validados! Vamos para a integração final do Canvas.");
};

init();