import { storage } from './storage.js';
import { ui } from './ui.js';
import { zipService } from './zip-service.js';

export const state = {
    cards: [],
    categories: [],
    filters: { search: "", category: "all" },
    sidebarCardSearch: "",
    settings: {
        collectionName: "Nome da Coleção",
        cardWidth: 280, cardHeight: 400, borderRadius: 20, imgSize: 150,
        fontSizeItem: 18, fontSizeDesc: 16, fontSizeCat: 11
    }
};

async function init() {
    const saved = storage.load();
    state.cards = saved.cards || [];
    state.categories = saved.categories || [];
    state.settings = { ...state.settings, ...saved.settings };

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => ui.switchTab(btn.dataset.tab));
    });

    document.getElementById('search-input').addEventListener('input', (e) => {
        state.filters.search = e.target.value.toLowerCase();
        ui.renderCards(state.cards, state.categories, state.filters, (id) => ui.fillCardForm(state.cards.find(c => c.id === id)));
    });

    document.getElementById('filter-category').addEventListener('change', (e) => {
        state.filters.category = e.target.value;
        ui.renderCards(state.cards, state.categories, state.filters, (id) => ui.fillCardForm(state.cards.find(c => c.id === id)));
    });

    document.getElementById('form-category').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-cat-id').value;
        const data = {
            name: document.getElementById('cat-name').value,
            bg: document.getElementById('cat-bg').value,
            text: document.getElementById('cat-text').value,
            cardBg: document.getElementById('cat-card-bg').value
        };
        if (id) {
            const idx = state.categories.findIndex(c => c.id === id);
            state.categories[idx] = { ...state.categories[idx], ...data };
        } else {
            state.categories.push({ id: Date.now().toString(), ...data });
        }
        ui.resetCatForm();
        updateAll();
    });

    document.getElementById('form-card').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-card-id').value;
        const file = document.getElementById('card-img').files[0];
        let imageData = null;
        if (file) {
            const reader = new FileReader();
            imageData = await new Promise(res => {
                reader.onload = e => res(e.target.result);
                reader.readAsDataURL(file);
            });
        }
        const data = {
            item: document.getElementById('card-item').value,
            descricao: document.getElementById('card-desc').value,
            categoriaId: document.getElementById('card-cat').value,
            layout: document.getElementById('card-layout').value
        };
        if (id) {
            const idx = state.cards.findIndex(c => c.id === id);
            if (imageData) data.imagem = imageData;
            state.cards[idx] = { ...state.cards[idx], ...data };
        } else {
            if (!file) return alert("Suba uma imagem.");
            state.cards.push({ id: Date.now().toString(), imagem: imageData, ...data });
        }
        ui.resetCardForm();
        updateAll();
    });

    updateAll();
}

export function updateAll() {
    storage.save(state);
    ui.applyGlobalStyles(state.settings);
    ui.updateCollectionTitle(state.settings.collectionName);
    ui.renderCategories(state.categories);
    ui.renderCards(state.cards, state.categories, state.filters, (id) => ui.fillCardForm(state.cards.find(c => c.id === id)));
    ui.renderSummary(state.cards, state.categories);
    ui.renderManagementLists(state, {
        onEditCard: (id) => ui.fillCardForm(state.cards.find(c => c.id === id)),
        onDeleteCard: (id) => { if(confirm('Excluir?')) { state.cards = state.cards.filter(c => c.id !== id); updateAll(); } },
        onEditCat: (id) => ui.fillCatForm(state.categories.find(c => c.id === id)),
        onDeleteCat: (id) => { if(confirm('Excluir?')) { state.categories = state.categories.filter(c => c.id !== id); updateAll(); } }
    });
}

init();