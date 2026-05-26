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
        cardWidth: 300, cardHeight: 420, imgSize: 160,
        fontSizeItem: 18, fontSizeDesc: 16, fontSizeCat: 11,
        borderRadius: 24
    }
};

async function init() {
    const saved = storage.load();
    state.cards = saved.cards || [];
    state.categories = saved.categories || [];
    state.settings = { ...state.settings, ...saved.settings };

    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => ui.switchTab(btn.dataset.tab));
    });

    // Viewport Listeners
    document.getElementById('search-input').addEventListener('input', (e) => {
        state.filters.search = e.target.value.toLowerCase();
        ui.renderCards(state.cards, state.categories, state.filters, handleQuickEdit);
        ui.initTilt();
    });

    document.getElementById('filter-category').addEventListener('change', (e) => {
        state.filters.category = e.target.value;
        ui.renderCards(state.cards, state.categories, state.filters, handleQuickEdit);
        ui.initTilt();
    });

    // Sidebar Listeners
    document.getElementById('manage-cards-search').addEventListener('input', (e) => {
        state.sidebarCardSearch = e.target.value.toLowerCase();
        renderManagement();
    });

    // Global Settings (Sliders)
    const settingsMap = {
        'global-width': 'cardWidth',
        'global-height': 'cardHeight',
        'global-radius': 'borderRadius',
        'global-img-size': 'imgSize',
        'f-size-item': 'fontSizeItem',
        'f-size-desc': 'fontSizeDesc',
        'f-size-cat': 'fontSizeCat'
    };

    Object.keys(settingsMap).forEach(id => {
        document.getElementById(id).addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            state.settings[settingsMap[id]] = val;
            ui.applyGlobalStyles(state.settings);
            storage.save(state);
        });
    });

    document.getElementById('collection-name').addEventListener('input', (e) => {
        state.settings.collectionName = e.target.value;
        ui.updateCollectionTitle(e.target.value);
        storage.save(state);
    });

    // Forms
    document.getElementById('form-category').addEventListener('submit', handleCategorySubmit);
    document.getElementById('form-card').addEventListener('submit', handleCardSubmit);
    
    // Actions
    document.getElementById('btn-export').addEventListener('click', () => zipService.exportCollection(state));
    document.getElementById('import-file').addEventListener('change', (e) => zipService.importCollection(e, updateAll));
    document.getElementById('btn-export-text').addEventListener('click', () => zipService.exportTextOnly(state));
    document.getElementById('import-text').addEventListener('change', (e) => zipService.importTextOnly(e, updateAll));
    document.getElementById('btn-clear').addEventListener('click', clearAll);

    document.getElementById('btn-cancel-card').onclick = () => ui.resetCardForm();
    document.getElementById('btn-cancel-cat').onclick = () => ui.resetCatForm();

    updateAll();
}

function handleQuickEdit(cardId) {
    const card = state.cards.find(c => c.id === cardId);
    ui.switchTab('tab-cards');
    ui.fillCardForm(card);
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
    if (file) imageData = await optimizeImage(file, layout);

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
        if (!file) return alert("Selecione uma imagem.");
        state.cards.push({ id: Date.now().toString(), imagem: imageData, ...data });
    }
    ui.resetCardForm();
    updateAll();
}

const optimizeImage = (file, layout) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width; let height = img.height;
                const maxDim = layout === 'photo' ? 1000 : 600;
                if (width > height) { if (width > maxDim) { height *= maxDim / width; width = maxDim; } }
                else { if (height > maxDim) { width *= maxDim / height; height = maxDim; } }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/webp', 0.8);
                resolve(dataUrl.startsWith('data:image/webp') ? dataUrl : canvas.toDataURL(layout === 'photo' ? 'image/jpeg' : 'image/png', 0.8));
            };
        };
        reader.onerror = error => reject(error);
    });
};

export function updateAll() {
    storage.save(state);
    
    // Sincroniza sliders e labels
    document.getElementById('collection-name').value = state.settings.collectionName;
    
    const sync = (id, key, labelId) => {
        document.getElementById(id).value = state.settings[key];
        document.getElementById(labelId).textContent = state.settings[key];
    };
    
    sync('global-width', 'cardWidth', 'val-width');
    sync('global-height', 'cardHeight', 'val-height');
    sync('global-radius', 'borderRadius', 'val-radius');
    sync('global-img-size', 'imgSize', 'val-img-size');
    sync('f-size-item', 'fontSizeItem', 'val-f-item');
    sync('f-size-desc', 'fontSizeDesc', 'val-f-desc');
    sync('f-size-cat', 'fontSizeCat', 'val-f-cat');

    ui.applyGlobalStyles(state.settings);
    ui.updateCollectionTitle(state.settings.collectionName);
    ui.renderCategories(state.categories);
    ui.renderCards(state.cards, state.categories, state.filters, handleQuickEdit);
    ui.initTilt();
    renderManagement();
}

function renderManagement() {
    ui.renderManagementLists(state, {
        onEditCard: (id) => ui.fillCardForm(state.cards.find(c => c.id === id)),
        onDeleteCard: (id) => { if(confirm('Excluir card?')) { state.cards = state.cards.filter(c => c.id !== id); updateAll(); } },
        onEditCat: (id) => ui.fillCatForm(state.categories.find(c => c.id === id)),
        onDeleteCat: (id) => { 
            if(state.cards.some(c => c.categoriaId === id)) return alert("Categoria em uso.");
            if(confirm('Excluir categoria?')) { state.categories = state.categories.filter(c => c.id !== id); updateAll(); } 
        }
    });
}

function clearAll() { if(confirm("Apagar projeto?")) { state.cards = []; state.categories = []; updateAll(); } }
init();