import { storage } from './storage.js';
import { ui } from './ui.js';
import { zipService } from './zip-service.js';

export const state = {
    cards: [],
    categories: []
};

async function init() {
    const saved = storage.load();
    state.cards = saved.cards || [];
    state.categories = saved.categories || [];

    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => ui.switchTab(btn.dataset.tab));
    });

    // Form Events
    document.getElementById('form-category').addEventListener('submit', handleCategorySubmit);
    document.getElementById('form-card').addEventListener('submit', handleCardSubmit);
    
    // Global Actions
    document.getElementById('btn-export').addEventListener('click', () => zipService.exportCollection(state));
    document.getElementById('import-file').addEventListener('change', (e) => zipService.importCollection(e, updateAll));
    document.getElementById('btn-clear').addEventListener('click', clearAll);

    // Cancel buttons
    document.getElementById('btn-cancel-card').onclick = () => ui.resetCardForm();
    document.getElementById('btn-cancel-cat').onclick = () => ui.resetCatForm();

    updateAll();
}

function handleCategorySubmit(e) {
    e.preventDefault();
    const id = document.getElementById('edit-cat-id').value;
    const data = {
        name: document.getElementById('cat-name').value,
        bg: document.getElementById('cat-bg').value,
        text: document.getElementById('cat-text').value
    };

    if (id) {
        const idx = state.categories.findIndex(c => c.id === id);
        state.categories[idx] = { ...state.categories[idx], ...data };
    } else {
        state.categories.push({ id: Date.now().toString(), ...data });
    }
    
    ui.resetCatForm();
    updateAll();
}

async function handleCardSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('edit-card-id').value;
    const file = document.getElementById('card-img').files[0];
    
    let imageData = null;
    if (file) {
        imageData = await toBase64(file);
    }

    const data = {
        item: document.getElementById('card-item').value,
        descricao: document.getElementById('card-desc').value,
        categoriaId: document.getElementById('card-cat').value
    };

    if (id) {
        const idx = state.cards.findIndex(c => c.id === id);
        if (imageData) data.imagem = imageData;
        state.cards[idx] = { ...state.cards[idx], ...data };
    } else {
        if (!file) return alert("Por favor, selecione uma imagem para o novo card.");
        state.cards.push({ id: Date.now().toString(), imagem: imageData, ...data });
    }

    ui.resetCardForm();
    updateAll();
}

export function updateAll() {
    storage.save(state);
    ui.renderCategories(state.categories);
    ui.renderCards(state.cards, state.categories);
    ui.renderManagementLists(state, {
        onEditCard: (id) => ui.fillCardForm(state.cards.find(c => c.id === id)),
        onDeleteCard: (id) => { if(confirm('Excluir este card permanentemente?')) { state.cards = state.cards.filter(c => c.id !== id); updateAll(); } },
        onEditCat: (id) => ui.fillCatForm(state.categories.find(c => c.id === id)),
        onDeleteCat: (id) => { 
            if(state.cards.some(c => c.categoriaId === id)) return alert("Não é possível excluir: existem cards vinculados a esta categoria.");
            if(confirm('Excluir esta categoria?')) { state.categories = state.categories.filter(c => c.id !== id); updateAll(); } 
        }
    });
}

function clearAll() {
    if(confirm("Deseja apagar TODO o projeto atual? Essa ação não pode ser desfeita.")) {
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