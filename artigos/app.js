document.addEventListener('DOMContentLoaded', () => {
    const listaContainer = document.getElementById('lista-artigos');
    const visualizador = document.getElementById('artigo-completo');
    const campoBusca = document.getElementById('busca-artigo');
    
    let bancoArtigos = [];

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

    // 2. Renderiza a lista lateral mapeando a nova estrutura de dados
    function renderizarIndice(artigosParaExibir) {
        listaContainer.innerHTML = '';
        
        if (artigosParaExibir.length === 0) {
            listaContainer.innerHTML = '<p class="placeholder-text" style="font-size: 0.85rem; margin-top: 10px;">Nenhum artigo encontrado.</p>';
            return;
        }

        artigosParaExibir.forEach(artigo => {
            const card = document.createElement('div');
            card.className = 'artigo-thumb-card';
            
            // Montagem dinâmica estruturada injetando Título, Autor, Descrição e Data de forma condicional
            card.innerHTML = `
                <img src="${artigo.imagem}" alt="${artigo.titulo}">
                <div class="info">
                    <h3>${artigo.titulo}</h3>
                    <div class="autor">Por: ${artigo.autor || 'Autor Desconhecido'}</div>
                    <p class="descricao">${artigo.descricao || 'Nenhuma descrição fornecida para este artigo.'}</p>
                    <div class="meta-footer">
                        <span class="data">${artigo.data}</span>
                    </div>
                </div>
            `;
            
            card.addEventListener('click', () => mostrarPreviewGlass(artigo));
            listaContainer.appendChild(card);
        });
    }

    // 3. Sistema de Busca abrangente (Procura tanto no título quanto no autor)
    campoBusca.addEventListener('input', (e) => {
        const termoBusca = e.target.value.toLowerCase().trim();
        
        const artigosFiltrados = bancoArtigos.filter(artigo => {
            const tituloMatch = artigo.titulo.toLowerCase().includes(termoBusca);
            const autorMatch = (artigo.autor || '').toLowerCase().includes(termoBusca);
            return tituloMatch || autorMatch;
        });
        
        renderizarIndice(artigosFiltrados);
    });

    // 4. Estado 1: Modo Slideshow Glassmorphism Maximizada
    function mostrarPreviewGlass(artigo) {
        visualizador.innerHTML = `
            <div class="preview-glass-wrapper">
                <div class="glass-bg-blur" style="background-image: url('${artigo.imagem}');"></div>
                
                <div class="preview-card-central">
                    <h1 class="preview-titulo-glass">${artigo.titulo}</h1>
                    <img src="${artigo.imagem}" class="preview-headline-glass" alt="${artigo.titulo}">
                    <button id="btn-iniciar-leitura" class="btn-ler-artigo-glass">Abrir Documento PDF</button>
                </div>
            </div>
        `;

        document.getElementById('btn-iniciar-leitura').addEventListener('click', () => {
            carregarPdfCompleto(artigo);
        });
    }

    // 5. Estado 2: Modo Leitura Total
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