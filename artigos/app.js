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
            
            // Evento de clique para abrir o artigo correspondente
            card.addEventListener('click', () => carregarArtigo(artigo));
            listaContainer.appendChild(card);
        });
    }

    // 3. Busca o HTML do artigo e renderiza junto com a headline grande
    function carregarArtigo(artigo) {
        visualizador.innerHTML = '<p class="placeholder-text">A carregar artigo...</p>';

        fetch(artigo.html)
            .then(response => {
                if (!response.ok) throw new Error('Não foi possível carregar o conteúdo do artigo.');
                return response.text();
            })
            .then(htmlConteudo => {
                // Monta a estrutura: Imagem Headline em cima, conteúdo estruturado embaixo
                visualizador.innerHTML = `
                    <img src="${artigo.imagem}" class="headline-principal" alt="${artigo.titulo}">
                    <div class="conteudo-html-artigo">
                        ${htmlConteudo}
                    </div>
                `;
                
                // Força o scroll do visualizador para o topo ao mudar de artigo
                document.querySelector('.content-viewer').scrollTop = 0;
            })
            .catch(error => {
                console.error(error);
                visualizador.innerHTML = `<p class="placeholder-text" style="color: #dc3545;">Erro ao abrir o artigo selecionado.</p>`;
            });
    }
});