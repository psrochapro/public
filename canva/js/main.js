import { fetchDados } from './api.js';
import { createCard } from './card.js';

const container = document.getElementById('card-container');

async function init() {
    const dados = await fetchDados();
    
    if (dados.length === 0) {
        container.innerHTML = '<p>Erro ao carregar os dados. Verifique o console.</p>';
        return;
    }

    // Limpa o container antes de renderizar
    container.innerHTML = '';

    dados.forEach((item, index) => {
        const cardElement = createCard(item, index);
        container.appendChild(cardElement);
    });
}

// Inicia a aplicação
init();