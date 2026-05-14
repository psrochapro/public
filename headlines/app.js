const stage = document.getElementById('snapshot-stage');
const layoutSelector = document.getElementById('layout-selector');
const accentInput = document.getElementById('accent-color');

async function init() {
    const response = await fetch('dados.json');
    const data = await response.json();
    render(data);
}

function render(data) {
    // Principal
    document.getElementById('logo-img').src = data.config.logo_url;
    document.getElementById('main-img').src = data.noticiaPrincipal.imagem_url;
    document.getElementById('title').innerText = data.noticiaPrincipal.titulo;
    document.getElementById('subtitle').innerText = data.noticiaPrincipal.subtitulo;
    document.getElementById('category').innerText = data.noticiaPrincipal.categoria;
    document.getElementById('image-date').innerText = data.noticiaPrincipal.data;

    // Mini Notícias
    const miniContainer = document.getElementById('mini-news');
    miniContainer.innerHTML = '';
    data.miniNoticias.slice(0, 2).forEach(item => { // Apenas 2 para não estourar o layout
        miniContainer.innerHTML += `
            <div class="mini-item">
                <img src="${item.thumb_url}">
                <h4>${item.titulo}</h4>
            </div>
        `;
    });
}

// Troca de Layout
layoutSelector.addEventListener('change', (e) => {
    document.body.className = e.target.value;
});

// Cor de Destaque
accentInput.addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--accent', e.target.value);
});

// Exportação (Exemplo simplificado, depois podemos usar html2canvas ou a lógica do Pro)
document.getElementById('btn-export').onclick = () => {
    alert("Pronto para integrar a lógica de exportação em alta resolução!");
};

init();