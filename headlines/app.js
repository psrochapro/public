/**
 * APP: News Snapshot Generator
 * Lógica: Carregamento dinâmico e controle de interface
 */

const stage = document.getElementById('snapshot-stage');
const layoutSelector = document.getElementById('layout-selector');
const accentInput = document.getElementById('accent-color');
const btnToggleUI = document.getElementById('btn-toggle-ui');

async function init() {
    try {
        const response = await fetch('dados.json');
        if (!response.ok) throw new Error('Falha ao carregar dados.json');
        const data = await response.json();
        render(data);
    } catch (error) {
        console.error(error);
        document.getElementById('title').innerText = "Erro ao carregar dados.json";
    }
}

function render(data) {
    // Dados Globais
    document.getElementById('logo-img').src = data.config.logo_url;
    
    // Notícia Principal
    const principal = data.noticiaPrincipal;
    document.getElementById('main-img').src = principal.imagem_url;
    document.getElementById('title').innerText = principal.titulo;
    document.getElementById('subtitle').innerText = principal.subtitulo;
    document.getElementById('category').innerText = principal.categoria;
    document.getElementById('image-date').innerText = principal.data;

    // Mini Notícias (Apenas 2 para garantir que caiba no card fixo)
    const miniContainer = document.getElementById('mini-news-container');
    miniContainer.innerHTML = '';
    
    data.miniNoticias.slice(0, 2).forEach(item => {
        miniContainer.innerHTML += `
            <div class="mini-item">
                <img src="${item.thumb_url}" alt="thumb">
                <div class="mini-text">
                    <h4>${item.titulo}</h4>
                </div>
            </div>
        `;
    });
}

// Troca de Proporção (Layout)
layoutSelector.addEventListener('change', (e) => {
    document.body.classList.remove('ratio-16-9', 'ratio-1-1', 'ratio-9-16');
    document.body.classList.add(e.target.value);
});

// Alteração da Cor de Destaque
accentInput.addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--accent', e.target.value);
});

// Mostrar/Ocultar Interface Editor
btnToggleUI.addEventListener('click', () => {
    document.body.classList.toggle('ui-hidden');
    btnToggleUI.innerText = document.body.classList.contains('ui-hidden') 
        ? "Mostrar Interface" 
        : "Ocultar Interface";
});

// Exportação (Placeholder para a próxima fase)
document.getElementById('btn-export').onclick = () => {
    alert("Pronto para integrar o motor de renderização do CitacaoPro!");
};

// Iniciar
init();