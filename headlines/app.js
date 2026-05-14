// Configurações e Seletores
const sidebar = document.getElementById('sidebar');
const btnToggleUI = document.getElementById('btn-toggle-ui');
const inputAccentColor = document.getElementById('input-accent-color');

// Função para carregar os dados do JSON
async function init() {
    try {
        const response = await fetch('dados.json');
        const data = await response.json();
        renderPortal(data);
    } catch (error) {
        console.error("Erro ao carregar dados.json:", error);
        document.getElementById('main-title').innerText = "Erro ao carregar conteúdo.";
    }
}

// Renderiza o conteúdo no DOM
function renderPortal(data) {
    // 1. Configurações Gerais
    document.getElementById('site-logo').src = data.config.logo_url;
    
    // 2. Notícia Principal
    const principal = data.noticiaPrincipal;
    document.getElementById('main-img').src = principal.imagem_url;
    document.getElementById('main-category').innerText = principal.categoria;
    document.getElementById('main-date').innerText = principal.data;
    document.getElementById('main-title').innerText = principal.titulo;
    document.getElementById('main-subtitle').innerText = principal.subtitulo;
    document.getElementById('main-body').innerHTML = principal.corpo_texto.replace(/\n/g, '<br>');

    // 3. Cálculo de Tempo de Leitura
    const time = calculateReadingTime(principal.corpo_texto);
    document.getElementById('read-time').innerText = time;

    // 4. Renderizar Mini Notícias (Sidebar)
    const miniNewsContainer = document.getElementById('mini-news-container');
    miniNewsContainer.innerHTML = ''; // Limpa

    data.miniNoticias.forEach(item => {
        const card = `
            <div class="mini-card">
                <img src="${item.thumb_url}" alt="${item.titulo}">
                <div class="mini-card-info">
                    <span class="cat">${item.categoria}</span>
                    <h4>${item.titulo}</h4>
                    <span class="date">${item.data}</span>
                </div>
            </div>
        `;
        miniNewsContainer.innerHTML += card;
    });
}

// Lógica de Tempo de Leitura (Média de 200 palavras por minuto)
function calculateReadingTime(text) {
    const wordsPerMinute = 200;
    const noOfWords = text.split(/\s+/).length;
    const minutes = Math.ceil(noOfWords / wordsPerMinute);
    return minutes;
}

// EVENTOS DE CUSTOMIZAÇÃO
inputAccentColor.addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--accent-color', e.target.value);
});

// Toggle UI (Ocultar/Mostrar Painel)
btnToggleUI.addEventListener('click', () => {
    document.body.classList.toggle('ui-hidden');
    btnToggleUI.innerText = document.body.classList.contains('ui-hidden') 
        ? "Mostrar Painel" 
        : "Ocultar Painel (Ver Notícia)";
});

// Inicializa o app
init();