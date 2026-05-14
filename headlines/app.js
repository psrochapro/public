/**
 * Lógica do Gerador News Snapshot
 * Foco: Sincronização de conteúdo e Customização YIQ
 */

const stage = document.getElementById('snapshot-stage');
const accentInput = document.getElementById('accent-color');
const layoutSelector = document.getElementById('layout-selector');
const btnToggleUI = document.getElementById('btn-toggle-ui');

async function init() {
    try {
        const response = await fetch('dados.json');
        const data = await response.json();
        render(data);
    } catch (e) {
        console.error("Erro ao carregar dados:", e);
    }
}

function render(data) {
    // Logo e Imagem Principal
    document.getElementById('logo-img').src = data.config.logo_url;
    document.getElementById('main-img').src = data.noticiaPrincipal.imagem_url;
    
    // Textos Principais (com limites de caracteres por segurança)
    document.getElementById('category').innerText = data.noticiaPrincipal.categoria;
    document.getElementById('title').innerText = truncateText(data.noticiaPrincipal.titulo, 80);
    document.getElementById('subtitle').innerText = truncateText(data.noticiaPrincipal.subtitulo, 220);
    document.getElementById('image-date').innerText = data.noticiaPrincipal.data;

    // Mini Notícias (Garante as 4)
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

// Auxiliar: Corta texto para não quebrar layout
function truncateText(text, limit) {
    return text.length > limit ? text.substring(0, limit) + "..." : text;
}

// Lógica de Contraste YIQ (Igual ao CitacaoPro)
function getContrastYIQ(hexcolor){
    hexcolor = hexcolor.replace("#", "");
    const r = parseInt(hexcolor.substr(0,2),16);
    const g = parseInt(hexcolor.substr(2,2),16);
    const b = parseInt(hexcolor.substr(4,2),16);
    const yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
}

// Eventos de Customização
accentInput.addEventListener('input', (e) => {
    const color = e.target.value;
    const contrast = getContrastYIQ(color);
    
    document.documentElement.style.setProperty('--accent', color);
    document.documentElement.style.setProperty('--contrast-text', contrast);
    
    // Gera um fundo suave baseado na cor de destaque (Alpha 10%)
    const softColor = color + "1a"; 
    document.documentElement.style.setProperty('--accent-soft', softColor);
});

layoutSelector.addEventListener('change', (e) => {
    document.body.className = e.target.value;
});

btnToggleUI.addEventListener('click', () => {
    document.body.classList.toggle('ui-hidden');
    btnToggleUI.innerText = document.body.classList.contains('ui-hidden') 
        ? "Mostrar Interface" : "Ocultar Interface";
});

// Exportação (Em breve integrado com alta definição)
document.getElementById('btn-export').onclick = () => {
    alert("Layout Validado! Próximo passo: Exportação em alta resolução.");
};

init();