document.addEventListener('DOMContentLoaded', () => {
    const listaContainer = document.getElementById('lista-artigos');
    const visualizador = document.getElementById('artigo-completo');
    const campoBusca = document.getElementById('busca-artigo');
    
    let bancoArtigos = []; // Guarda a lista global para aplicar os filtros

    // 1. Carrega o índice de artigos do JSON
    fetch('artigos.json')
        .then(response => response.json())
        .then(artigos => {
            bancoArtigos = artigos;
            renderizarIndice(bancoArtigos);
        })
        .catch(error => {
            console.error('Erro ao carregar o índice:', error);
            visualizador.innerHTML = `<p class="placeholder-text">Erro ao carregar a lista de artigos.</p>`;
        });

    // 2. Renderiza a lista lateral com base no array fornecido
    function renderizarIndice(artigos ParaExibir) {
        listaContainer.innerHTML = '';
        
        if (artigosParaExibir.length === 0) {
            listaContainer.innerHTML = '<p class="placeholder-text" style="font-size: 0.85rem; margin-top: 10px;">Nenhum artigo encontrado.</p>';
            return;
        }

        artigosParaExibir.forEach(artigo => {
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

    // 3. Sistema de Busca / Filtro em tempo real
    campoBusca.addEventListener('input', (e) => {
        const termoBusca = e.target.value.toLowerCase().trim();
        
        // Filtra comparando o termo digitado com o título do artigo
        const artigosFiltrados = bancoArtigos.filter(artigo => {
            return artigo.titulo.toLowerCase().includes(termoBusca);
        });
        
        renderizarIndice(artigosFiltrados);
    });

    // 4. Estado 1: Mostra apenas a Capa/Preview (Headline + Botão)
    function mostrarPreview(artigo) {
        visualizador.innerHTML = `
            <div class="preview-container">
                <h1 class="preview-titulo">${artigo.titulo}</h1>
                <img src="${artigo.imagem}" class="preview-headline" alt="${artigo.titulo}">
                <button id="btn-iniciar-leitura" class="btn-ler-artigo">Ler Artigo Completo</button>
            </div>
        `;

        document.getElementById('btn-iniciar-leitura').addEventListener('click', () => {
            carregarPdfCompleto(artigo);
        });
    }

    // 5. Estado 2: Modo Leitura Total (PDF assume 100% do espaço com barra de zoom nativa)
    function carregarPdfCompleto(artigo) {
        visualizador.innerHTML = `
            <iframe 
                src="${artigo.pdf}#toolbar=1&navpanes=0" 
                class="leitor-pdf-cheio"
                title="${artigo.titulo}">
            </iframe>
        `;
    }
});