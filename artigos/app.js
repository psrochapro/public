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
            console.error('Erro ao carregar o índice de artigos:', error);
            visualizador.innerHTML = `<p class="placeholder-text">Erro ao carregar a lista de artigos.</p>`;
        });

    // 2. Renderiza a lista lateral com os thumbnails (cards)
    function renderizarIndice(artigos) {
        listaContainer.innerHTML = '';
        
        if (artigos.length === 0) {
            listaContainer.innerHTML = '<p>Nenhum artigo encontrado.</p>';
            return;
        }

        artigos.forEach(artigo => {
            const card = document.createElement('div');
            card.className = 'artigo-thumb-card';
            card.innerHTML = `
                <img src="${artigo.imagem}" alt="${artigo.titulo}" onerror="this.src='https://placehold.co/300x150?text=Sem+Imagem'">
                <div class="info">
                    <h3>${artigo.titulo}</h3>
                    <span>${artigo.data}</span>
                </div>
            `;
            
            card.addEventListener('click', () => carregarArtigo(artigo));
            listaContainer.appendChild(card);
        });
    }

    // 3. Renderiza a headline e incorpora o leitor de PDF nativo
    function carregarArtigo(artigo) {
        visualizador.innerHTML = '<p class="placeholder-text">A carregar artigo...</p>';

        // Monta a estrutura com a Headline no topo e o PDF integrado abaixo
        // Usamos #toolbar=0&navpanes=0 para ocultar barras desnecessárias do leitor de PDF e manter o visual limpo
        visualizador.innerHTML = `
            <img src="${artigo.imagem}" class="headline-principal" alt="${artigo.titulo}">
            <div class="leitor-pdf-container" style="width: 100%; height: calc(100vh - 250px); margin-top: 20px;">
                <iframe 
                    src="${artigo.pdf}#toolbar=0&navpanes=0" 
                    width="100%" 
                    height="100%" 
                    style="border: none; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
                    title="${artigo.titulo}">
                </iframe>
            </div>
        `;
        
        // Garante o scroll para o topo ao mudar de artigo
        document.querySelector('.content-viewer').scrollTop = 0;
    }
});