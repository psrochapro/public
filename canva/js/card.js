export function createCard(data) {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
        <div class="card-inner">
            <div class="card-front">
                <img src="${data.Imagem}" alt="${data.Item}">
                <h3>${data.Item}</h3>
            </div>
            <div class="card-back">
                <p>${data.Descricao}</p>
            </div>
        </div>
    `;

    // Adiciona o evento de clique
    card.addEventListener('click', function() {
        this.classList.toggle('is-flipped');
    });

    return card;
}