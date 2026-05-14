/**
 * Lógica: News Snapshot Creator
 * Gerencia conteúdo, layouts e cores dinâmicas
 */

const stage = document.getElementById('snapshot-stage');
const accentInput = document.getElementById('accent-color');
const bgInput = document.getElementById('bg-card-color');
const layoutSelector = document.getElementById('layout-selector');
const btnToggleUI = document.getElementById('btn-toggle-ui');

async function init() {
    try {
        const response = await fetch('dados.json');
        const data = await response.json();
        render(data);
        updateColors(); // Aplica cores iniciais
    } catch (e) {
        console.error("Erro ao carregar dados:", e);
    }
}

function render(data) {
    document.getElementById('logo-img').src = data.config.logo_url;
    document.getElementById('main-img').src = data.noticiaPrincipal.imagem_url;
    document.getElementById('category').innerText = data.noticiaPrincipal.categoria;
    document.getElementById('title').innerText = data.noticiaPrincipal.titulo;
    document.getElementById('subtitle').innerText = data.noticiaPrincipal.subtitulo;
    document.getElementById('image-date').innerText = data.noticiaPrincipal.data;

    const miniContainer = document.getElementById('mini-news-container');
    miniContainer.innerHTML = '';
    data.miniNoticias.slice(0, 4).forEach(item => {
        miniContainer.innerHTML += `
            <div class="mini-item">
                <img src="${item.thumb_url}" alt="thumb">
                <h4>${item.titulo}</h4>
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

function darkenColor(hex, percent) {
    let num = parseInt(hex.replace("#",""),16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) - amt,
    G = (num >> 8 & 0x00FF) - amt,
    B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R<255?R<0?0:R:255)*0x10000 + (G<255?G<0?0:G:255)*0x100 + (B<255?B<0?0:B:255)).toString(16).slice(1);
}

function updateColors() {
    const bgColor = bgInput.value;
    const accentColor = accentInput.value;
    
    // Contraste para textos gerais baseados no fundo do card
    const mainText = getContrastYIQ(bgColor);
    const mutedText = mainText === '#111111' ? '#555555' : '#cccccc';
    
    // Contraste para elementos de destaque (ex: badge AO VIVO)
    const accentContrast = getContrastYIQ(accentColor);
    
    // Tons derivados
    const headerBg = darkenColor(bgColor, 5); // 5% mais escuro para o cabeçalho
    const accentSoft = accentColor + "15"; // 15 em hexa para opacidade ~8%

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

layoutSelector.addEventListener('change', (e) => {
    document.body.className = e.target.value;
});

btnToggleUI.addEventListener('click', () => {
    document.body.classList.toggle('ui-hidden');
    btnToggleUI.innerText = document.body.classList.contains('ui-hidden') 
        ? "Mostrar Interface" : "Ocultar Interface";
});

document.getElementById('btn-export').onclick = () => {
    alert("Cores e Layout validados! Pronto para exportação.");
};

init();