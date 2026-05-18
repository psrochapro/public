// Estado global da aplicação
let todosArtigos = [];
let artigosFiltrados = [];
let indiceArtigoAtual = 0;

// Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    carregarArtigos();
    
    // Configurar o evento de busca em tempo real
    document.getElementById('input-busca').addEventListener('input', (e) => {
        filtrarArtigos(e.target.value);
    });
});

// Busca os dados do arquivo JSON
async function carregarArtigos() {
    try {
        const resposta = await fetch('artigos.json');
        todosArtigos = await resposta.json();
        artigosFiltrados = [...todosArtigos];
        
        renderizarListaLateral();
        if (artigosFiltrados.length > 0) {
            selecionarArtigo(0);
        }
    } catch (erro) {
        console.error('Erro ao carregar dados dos artigos:', erro);
    }
}

// Renderiza os cards de miniatura na barra lateral
function renderizarListaLateral() {
    const listaContainer = document.getElementById('lista-artigos');
    listaContainer.innerHTML = '';

    if (artigosFiltrados.length === 0) {
        listaContainer.innerHTML = '<p class="descricao" style="text-align:center; padding:20px;">Nenhum artigo encontrado.</p>';
        return;
    }

    artigosFiltrados.forEach((artigo, index) => {
        const card = document.createElement('div');
        card.className = 'artigo-thumb-card';
        
        // Encontra o índice real do artigo no array global baseado no id
        const indiceReal = todosArtigos.findIndex(a => a.id === artigo.id);
        
        card.onclick = () => {
            // Fecha o PDF caso esteja aberto e exibe a preview
            document.getElementById('artigo-completo').style.display = 'none';
            document.getElementById('preview-container').style.display = 'flex';
            selecionarArtigo(indiceReal);
        };

        card.innerHTML = `
            <img src="${artigo.headline}" alt="Miniatura">
            <div class="info">
                <h3>${artigo.titulo}</h3>
                <span class="autor">Por: ${artigo.autor}</span>
                <p class="descricao">${artigo.descricao}</p>
                <div class="meta-footer">
                    <span class="data">${artigo.data}</span>
                </div>
            </div>
        `;
        listaContainer.appendChild(card);
    });
}

// Altera o artigo ativo exibido no Card Central (Preview)
function selecionarArtigo(index) {
    if (index < 0 || index >= todosArtigos.length) return;
    
    indiceArtigoAtual = index;
    const artigo = todosArtigos[index];

    // Atualiza textos e imagens do Glassmorphism
    document.getElementById('preview-titulo').innerText = artigo.titulo;
    document.getElementById('preview-headline').src = artigo.headline;
    document.getElementById('glass-bg').style.backgroundImage = `url('${artigo.headline}')`;

    // Atualiza a ação do botão para abrir o respectivo PDF
    const btnLer = document.getElementById('btn-ler-artigo');
    btnLer.onclick = () => exibirLeitorPDF(artigo.pdf);
}

// Função do Carrossel: Navega de forma circular pelas publicações existentes
function navegarArtigo(direcao) {
    // Se estiver usando uma busca filtrada, navega apenas entre os resultados do filtro
    const listaTrabalho = artigosFiltrados.length > 0 ? artigosFiltrados : todosArtigos;
    if (listaTrabalho.length <= 1) return;

    // Encontra a posição atual dentro da lista que está visível
    let indexNoFiltro = listaTrabalho.findIndex(a => a.id === todosArtigos[indiceArtigoAtual].id);
    
    if (indexNoFiltro === -1) indexNoFiltro = 0;

    let novoIndexNoFiltro = indexNoFiltro + direcao;

    // Garante a rotação circular perfeita (volta pro início ou vai pro fim)
    if (novoIndexNoFiltro < 0) {
        novoIndexNoFiltro = listaTrabalho.length - 1;
    } else if (novoIndexNoFiltro >= listaTrabalho.length) {
        novoIndexNoFiltro = 0;
    }

    // Identifica o índice absoluto mapeado no array completo
    const novoIndiceReal = todosArtigos.findIndex(a => a.id === listaTrabalho[novoIndexNoFiltro].id);
    
    // Altera o card central para a nova publicação
    selecionarArtigo(novoIndiceReal);
}

// Injeta o visualizador do PDF na tela cheia à direita
function exibirLeitorPDF(caminhoPDF) {
    document.getElementById('preview-container').style.display = 'none';
    const leitorContainer = document.getElementById('artigo-completo');
    leitorContainer.innerHTML = `<iframe src="${caminhoPDF}" class="leitor-pdf-cheio"></iframe>`;
    leitorContainer.style.display = 'block';
}

// Filtra os artigos na barra lateral conforme digitação
function filtrarArtigos(termo) {
    const termoMinulo = termo.toLowerCase().trim();
    
    artigosFiltrados = todosArtigos.filter(artigo => 
        artigo.titulo.toLowerCase().includes(termoMinulo) || 
        artigo.descricao.toLowerCase().includes(termoMinulo) ||
        artigo.autor.toLowerCase().includes(termoMinulo)
    );

    renderizarListaLateral();

    // Se o filtro retornar itens e o artigo atual não estiver mais na lista, atualiza a preview para o primeiro do filtro
    if (artigosFiltrados.length > 0) {
        const existeAinda = artigosFiltrados.some(a => a.id === todosArtigos[indiceArtigoAtual].id);
        if (!existeAinda) {
            const primeiroFiltroIndex = todosArtigos.findIndex(a => a.id === artigosFiltrados[0].id);
            selecionarArtigo(primeiroFiltroIndex);
        }
    }
}