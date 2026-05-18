document.addEventListener('DOMContentLoaded', () => {
    const listaContainer = document.getElementById('lista-artigos');
    const visualizador = document.getElementById('artigo-completo');

    // 1. Carrega o índice de artigos do JSON
    fetch('artigos.json')
        .then(response => response.json())
        .then(artigos => {
            renderizarIndice(artigos);
        })
        .catch(error => {
            console.error('Erro ao carregar o índice:', error);
            visualizador.innerHTML = `<p class="placeholder-text">Erro ao carregar a lista de artigos.</p>`;
        });

    // 2. Renderiza a lista lateral
    function renderizarIndice(artigos) {
        listaContainer.innerHTML = '';
        artigos.forEach(artigo => {
            const card = document.createElement('div');
            card.className = 'artigo-thumb-card';
            card.innerHTML = `
                <img src="${artigo.imagem}" alt="${artigo.titulo}">
                <div class="info">
                    <h3>${artigo.titulo}</h3>
                </div>
            `;
            card.addEventListener('click', () => mostrarPreview(artigo));
            listaContainer.appendChild(card);
        });
    }

    // 3. Estado 1: Mostra apenas a Capa/Preview (Headline + Botão)
    function mostrarPreview(artigo) {
        visualizador.innerHTML = `
            <div class="preview-container">
                <h1 class="preview-titulo">${artigo.titulo}</h1>
                <img src="${artigo.imagem}" class="preview-headline" alt="${artigo.titulo}">
                <button id="btn-iniciar-leitura" class="btn-ler-artigo">Ler Artigo Completo</button>
            </div>
        `;

        // Ouvinte para mudar para o modo de leitura cheia
        document.getElementById('btn-iniciar-leitura').addEventListener('click', () => {
            carregarPdfCompleto(artigo);
        });
    }

    // 4. Estado 2: Modo Leitura Total (PDF assume 100% do espaço)
    function carregarPdfCompleto(artigo) {
        visualizador.innerHTML = `
            <iframe 
                src="${artigo.pdf}#toolbar=0&navpanes=0" 
                class="leitor-pdf-cheio"
                title="${artigo.titulo}">
            </iframe>
        `;
    }
});