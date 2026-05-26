import { fetchDados } from './api.js';
import { createCard } from './card.js';

const container = document.getElementById('card-container');

async function init() {
    const dados = await fetchDados();
    
    dados.forEach(item => {
        const cardElement = createCard(item);
        container.appendChild(cardElement);
    });
}

init();