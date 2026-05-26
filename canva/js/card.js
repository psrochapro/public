export function createCard(data, index) {
    const card = document.createElement('div');
    
    // Define a cor baseada no resto da divisão por 4
    const colorIndex = index % 4;
    card.className = `card card-color-${colorIndex}`;

    card.innerHTML = `
        <div class="card-inner">
            <!-- LADO DA FRENTE -->
            <div class="card-front">
                <div class="card-top-bar"></div>
                <span class="category">${data.Categoria || 'PROCESSO'}</span>
                <div class="ribbon">${data.Item}</div>
                <img src="${data.Imagem}" alt="${data.Item}">
            </div>
            
            <!-- LADO DE TRÁS -->
            <div class="card-back">
                <div class="back-header">
                    <img src="${data.Imagem}" alt="ícone reduzido">
                    <h4>${data.Item}</h4>
                </div>
                <div class="back-content">
                    <p>${data.Descricao}</p>
                </div>
            </div>
        </div>
    `;

    // Evento de clique para o flip
    card.addEventListener('click', function() {
        this.classList.toggle('is-flipped');
    });

    return card;
}