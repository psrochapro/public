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

    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => ui.switchTab(btn.dataset.tab));
    });

    // Viewport Filters
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

    // Sidebar Manage Search
    document.getElementById('manage-cards-search').addEventListener('input', (e) => {
        state.sidebarCardSearch = e.target.value.toLowerCase();
        renderManagement();
    });

    // Global Adjustments
    const inputs = ['global-width', 'global-height', 'global-radius', 'global-img-size', 'f-size-item', 'f-size-desc', 'f-size-cat'];
    const keys = ['cardWidth', 'cardHeight', 'borderRadius', 'imgSize', 'fontSizeItem', 'fontSizeDesc', 'fontSizeCat'];
    
    inputs.forEach((id, idx) => {
        document.getElementById(id).addEventListener('input', (e) => {
            state.settings[keys[idx]] = parseInt(e.target.value) || 0;
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
    
    // Actions com Limpeza de Input
    document.getElementById('btn-export').addEventListener('click', () => zipService.exportCollection(state));
    
    document.getElementById('import-file').addEventListener('change', (e) => {
        zipService.importCollection(e, () => {
            resetViewFilters();
            updateAll();
            e.target.value = ""; // CORREÇÃO: Limpa o input para permitir re-importar o mesmo arquivo
        });
    });

    document.getElementById('btn-export-text').addEventListener('click', () => zipService.exportTextOnly(state));
    
    document.getElementById('import-text').addEventListener('change', (e) => {
        zipService.importTextOnly(e, () => {
            resetViewFilters();
            updateAll();
            e.target.value = ""; // CORREÇÃO: Limpa o input para permitir re-importar o mesmo arquivo
        });
    });

    document.getElementById('btn-clear').addEventListener('click', clearAll);
    document.getElementById('btn-cancel-card').onclick = () => ui.resetCardForm();
    document.getElementById('btn-cancel-cat').onclick = () => ui.resetCatForm();

    updateAll();
}

function resetViewFilters() {
    state.filters.search = "";
    state.filters.category = "all";
    state.sidebarCardSearch = "";
    const searchInput = document.getElementById('search-input');
    const filterSelect = document.getElementById('filter-category');
    const sidebarSearch = document.getElementById('manage-cards-search');
    if (searchInput) searchInput.value = "";
    if (filterSelect) filterSelect.value = "all";
    if (sidebarSearch) sidebarSearch.value = "";
}

function handleQuickEdit(cardId) {
    const card = state.cards.find(c => c.id === cardId);
    if(card) {
        ui.switchTab('tab-cards');
        ui.fillCardForm(card);
    }
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
        imageData = await optimizeImage(file, layout);
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

export const optimizeImage = (file, layout) => {
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
    const s = state.settings;
    document.getElementById('collection-name').value = s.collectionName;
    document.getElementById('global-width').value = s.cardWidth;
    document.getElementById('global-height').value = s.cardHeight;
    document.getElementById('global-radius').value = s.borderRadius;
    document.getElementById('global-img-size').value = s.imgSize;
    document.getElementById('f-size-item').value = s.fontSizeItem;
    document.getElementById('f-size-desc').value = s.fontSizeDesc;
    document.getElementById('f-size-cat').value = s.fontSizeCat;
    ui.applyGlobalStyles(s);
    ui.updateCollectionTitle(s.collectionName);
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

function clearAll() { 
    if(confirm("Apagar projeto?")) { 
        state.cards = []; 
        state.categories = []; 
        resetViewFilters();
        state.settings = {
            collectionName: "Nome da Coleção",
            cardWidth: 280,
            cardHeight: 400,
            borderRadius: 20,
            imgSize: 150,
            fontSizeItem: 18,
            fontSizeDesc: 14,
            fontSizeCat: 10
        };
        updateAll(); 
    } 
}

init();