import { storage } from './storage.js';
import { ui } from './ui.js';
import { zipService } from './zip-service.js';

// Estado da Aplicação
export const state = {
    cards: [],
    categories: []
};

async function init() {
    // 1. Carregar dados salvos localmente
    const saved = storage.load();
    state.cards = saved.cards || [];
    state.categories = saved.categories || [];

    // 2. Vincular eventos de formulário
    document.getElementById('form-category').addEventListener('submit', handleAddCategory);
    document.getElementById('form-card').addEventListener('submit', handleAddCard);
    document.getElementById('btn-export').addEventListener('click', () => zipService.exportCollection(state));
    document.getElementById('import-file').addEventListener('change', (e) => zipService.importCollection(e, updateAll));
    document.getElementById('btn-clear').addEventListener('click', clearAll);

    updateAll();
}

function handleAddCategory(e) {
    e.preventDefault();
    const newCat = {
        id: Date.now().toString(),
        name: document.getElementById('cat-name').value,
        bg: document.getElementById('cat-bg').value,
        text: document.getElementById('cat-text').value
    };
    state.categories.push(newCat);
    e.target.reset();
    updateAll();
}

async function handleAddCard(e) {
    e.preventDefault();
    const file = document.getElementById('card-img').files[0];
    const base64 = await toBase64(file);

    const newCard = {
        id: Date.now().toString(),
        item: document.getElementById('card-item').value,
        descricao: document.getElementById('card-desc').value,
        categoriaId: document.getElementById('card-cat').value,
        imagem: base64
    };

    state.cards.push(newCard);
    e.target.reset();
    updateAll();
}

function updateAll() {
    storage.save(state);
    ui.renderCategories(state.categories);
    ui.renderCards(state.cards, state.categories, (id) => {
        state.cards = state.cards.filter(c => c.id !== id);
        updateAll();
    });
}

function clearAll() {
    if(confirm("Tem certeza que deseja apagar tudo?")) {
        state.cards = [];
        state.categories = [];
        updateAll();
    }
}

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

init();