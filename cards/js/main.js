import { storage } from './storage.js';
import { ui } from './ui.js';
import { zipService } from './zip-service.js';

export const state = {
    cards: [],
    categories: [],
    filters: { search: "", category: "all", sort: "manual" },
    sidebarCardSearch: "",
    settings: {} // Inicializa vazio para receber do storage/import
};

async function init() {
    // 1. Carrega dados salvos ou padrões
    const saved = storage.load();
    state.cards = saved.cards || [];
    state.categories = saved.categories || [];
    state.settings = saved.settings; // Garante que carrega as dimensões salvas

    // 2. Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => ui.switchTab(btn.dataset.tab));
    });

    // 3. Toolbar/Filtros
    document.getElementById('search-input').addEventListener('input', (e) => {
        state.filters.search = e.target.value.toLowerCase();
        ui.renderCards(state.cards, state.categories, state.filters, handleQuickEdit);
    });
    document.getElementById('filter-category').addEventListener('change', (e) => {
        state.filters.category = e.target.value;
        ui.renderCards(state.cards, state.categories, state.filters, handleQuickEdit);
    });
    document.getElementById('sort-select').addEventListener('change', (e) => {
        state.filters.sort = e.target.value;
        ui.renderCards(state.cards, state.categories, state.filters, handleQuickEdit);
    });

    // 4. Sidebar Search
    document.getElementById('manage-cards-search').addEventListener('input', (e) => {
        state.sidebarCardSearch = e.target.value.toLowerCase();
        renderManagement();
    });

    // 5. Ajustes Globais (Inputs)
    const setupInput = (id, key, isColor = false) => {
        const el = document.getElementById(id);
        el.addEventListener('input', (e) => {
            state.settings[key] = isColor ? e.target.value : (parseInt(e.target.value) || 0);
            ui.applyGlobalStyles(state.settings);
            storage.save(state);
        });
    };

    setupInput('global-width', 'cardWidth');
    setupInput('global-height', 'cardHeight');
    setupInput('global-radius', 'borderRadius');
    setupInput('global-img-size', 'imgSize');
    setupInput('f-size-item', 'fontSizeItem');
    setupInput('f-size-desc', 'fontSizeDesc');
    setupInput('f-size-cat', 'fontSizeCat');
    setupInput('cfg-view-bg', 'viewBg', true);
    setupInput('cfg-view-title', 'viewTitleColor', true);

    document.getElementById('collection-name').addEventListener('input', (e) => {
        state.settings.collectionName = e.target.value;
        ui.updateCollectionTitle(e.target.value);
        storage.save(state);
    });

    // 6. Formulários
    document.getElementById('form-category').addEventListener('submit', handleCategorySubmit);
    document.getElementById('form-card').addEventListener('submit', handleCardSubmit);
    
    // 7. Botões Principais - CORREÇÃO DA CARGA
    document.getElementById('btn-export').addEventListener('click', () => zipService.exportCollection(state));
    
    document.getElementById('import-file').addEventListener('change', async (e) => {
        const data = await zipService.importCollection(e);
        if (data) {
            state.cards = data.cards;
            state.categories = data.categories;
            state.settings = data.settings;
            updateAll();
        }
        e.target.value = "";
    });

    document.getElementById('btn-export-text').addEventListener('click', () => zipService.exportTextOnly(state));
    
    document.getElementById('import-text').addEventListener('change', async (e) => {
        const data = await zipService.importTextOnly(e);
        if (data) {
            state.cards = data.cards.map(importedCard => {
                const existing = state.cards.find(c => c.id === importedCard.id);
                return { ...importedCard, imagem: existing ? existing.imagem : "" };
            });
            state.categories = data.categories || state.categories;
            state.settings = data.settings || state.settings;
            updateAll();
        }
        e.target.value = "";
    });

    document.getElementById('btn-clear').addEventListener('click', clearAll);
    document.getElementById('btn-cancel-card').onclick = () => ui.resetCardForm();
    document.getElementById('btn-cancel-cat').onclick = () => ui.resetCatForm();

    // Início Forçado
    updateAll();
}

export function updateAll() {
    storage.save(state);
    const s = state.settings;

    // Sincroniza inputs da Sidebar com o Estado (Essencial para as dimensões)
    document.getElementById('collection-name').value = s.collectionName || "";
    document.getElementById('global-width').value = s.cardWidth;
    document.getElementById('global-height').value = s.cardHeight;
    document.getElementById('global-radius').value = s.borderRadius;
    document.getElementById('global-img-size').value = s.imgSize;
    document.getElementById('f-size-item').value = s.fontSizeItem;
    document.getElementById('f-size-desc').value = s.fontSizeDesc;
    document.getElementById('f-size-cat').value = s.fontSizeCat;
    document.getElementById('cfg-view-bg').value = s.viewBg;
    document.getElementById('cfg-view-title').value = s.viewTitleColor;

    // Aplica estilos visuais e renderiza tudo
    ui.applyGlobalStyles(s);
    ui.updateCollectionTitle(s.collectionName);
    ui.renderCategories(state.categories);
    ui.renderSummary(state);
    ui.renderCards(state.cards, state.categories, state.filters, handleQuickEdit);
    ui.initTilt();
    renderManagement();
}

function handleQuickEdit(cardId) {
    const card = state.cards.find(c => c.id === cardId);
    if(card) { ui.switchTab('tab-cards'); ui.fillCardForm(card); }
}

function handleCategorySubmit(e) {
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
}

async function handleCardSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('edit-card-id').value;
    const file = document.getElementById('card-img').files[0];
    const layout = document.getElementById('card-layout').value;
    let imageData = null;
    if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        imageData = await new Promise(resolve => {
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let w = img.width, h = img.height, max = layout === 'photo' ? 1000 : 600;
                    if (w > h) { if (w > max) { h *= max / w; w = max; } } else { if (h > max) { w *= max / h; h = max; } }
                    canvas.width = w; canvas.height = h;
                    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                    resolve(canvas.toDataURL('image/webp', 0.8));
                };
            };
        });
    }
    const data = {
        item: document.getElementById('card-item').value,
        descricao: document.getElementById('card-desc').value,
        categoriaId: document.getElementById('card-cat').value,
        layout: layout
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
}

function renderManagement() {
    ui.renderManagementLists(state, {
        onEditCard: (id) => ui.fillCardForm(state.cards.find(c => c.id === id)),
        onDeleteCard: (id) => { if(confirm('Excluir card?')) { state.cards = state.cards.filter(c => c.id !== id); updateAll(); } },
        onReorderCards: (newIds) => {
            state.cards = newIds.map(id => state.cards.find(c => c.id === id));
            storage.save(state);
            ui.renderCards(state.cards, state.categories, state.filters, handleQuickEdit);
        },
        onEditCat: (id) => ui.fillCatForm(state.categories.find(c => c.id === id)),
        onDeleteCat: (id) => { 
            if(state.cards.some(c => c.categoriaId === id)) return alert("Categoria em uso.");
            if(confirm('Excluir categoria?')) { state.categories = state.categories.filter(c => c.id !== id); updateAll(); } 
        }
    });
}

function clearAll() { 
    if(confirm("Apagar projeto?")) { 
        state.cards = []; state.categories = []; 
        state.settings = { collectionName: "Nome da Coleção", cardWidth: 280, cardHeight: 400, borderRadius: 20, imgSize: 150, fontSizeItem: 18, fontSizeDesc: 16, fontSizeCat: 11, viewBg: "#f3f6f9", viewTitleColor: "#1e293b" };
        updateAll(); 
    } 
}

init();