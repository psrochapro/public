import { storage } from './storage.js';
import { ui } from './ui.js';
import { zipService } from './zip-service.js';

export const state = {
    cards: [],
    categories: [],
    filters: { search: "", category: "all" },
    sidebarCardSearch: "",
    settings: {
        collectionName: "Canvas de Processos",
        cardWidth: 300, cardHeight: 420, imgSize: 160,
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

    // Viewport Filtros
    document.getElementById('search-input').addEventListener('input', (e) => {
        state.filters.search = e.target.value.toLowerCase();
        ui.renderCards(state.cards, state.categories, state.filters, handleQuickEdit);
    });

    document.getElementById('filter-category').addEventListener('change', (e) => {
        state.filters.category = e.target.value;
        ui.renderCards(state.cards, state.categories, state.filters, handleQuickEdit);
    });

    // Sidebar Filtro
    document.getElementById('manage-cards-search').addEventListener('input', (e) => {
        state.sidebarCardSearch = e.target.value.toLowerCase();
        renderManagement();
    });

    // Forms
    document.getElementById('form-category').addEventListener('submit', handleCategorySubmit);
    document.getElementById('form-card').addEventListener('submit', handleCardSubmit);
    
    // Settings
    document.getElementById('collection-name').addEventListener('input', (e) => {
        state.settings.collectionName = e.target.value;
        ui.updateCollectionTitle(e.target.value);
        storage.save(state);
    });

    ['global-width', 'global-height', 'global-img-size', 'f-size-item', 'f-size-desc', 'f-size-cat'].forEach(id => {
        document.getElementById(id).addEventListener('input', handleSettingsChange);
    });

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

function handleSettingsChange() {
    state.settings.cardWidth = document.getElementById('global-width').value;
    state.settings.cardHeight = document.getElementById('global-height').value;
    state.settings.imgSize = document.getElementById('global-img-size').value;
    state.settings.fontSizeItem = document.getElementById('f-size-item').value;
    state.settings.fontSizeDesc = document.getElementById('f-size-desc').value;
    state.settings.fontSizeCat = document.getElementById('f-size-cat').value;
    ui.applyGlobalStyles(state.settings);
    storage.save(state);
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
        // Agora usamos a função de otimização em vez de apenas ler o arquivo
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
        if (!file) return alert("Selecione uma imagem.");
        state.cards.push({ id: Date.now().toString(), imagem: imageData, ...data });
    }
    ui.resetCardForm();
    updateAll();
}

/**
 * MOTOR DE OTIMIZAÇÃO DE IMAGEM
 * Reduz dimensões e comprime o peso do arquivo antes de salvar no banco
 */
const optimizeImage = (file, layout) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Define limites baseados no modo de exibição
                const maxDim = layout === 'photo' ? 1000 : 600;

                // Cálculo de Proporção (Ratio)
                if (width > height) {
                    if (width > maxDim) {
                        height *= maxDim / width;
                        width = maxDim;
                    }
                } else {
                    if (height > maxDim) {
                        width *= maxDim / height;
                        height = maxDim;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Exportação Inteligente
                // Modo Foto -> JPEG (Mais leve para fotos)
                // Modo Ícone -> PNG (Preserva transparência)
                const outputType = layout === 'photo' ? 'image/jpeg' : 'image/png';
                const quality = 0.8; // 80% de qualidade é o ponto ideal entre nitidez e peso
                
                resolve(canvas.toDataURL(outputType, quality));
            };
        };
        reader.onerror = error => reject(error);
    });
};

export function updateAll() {
    storage.save(state);
    document.getElementById('collection-name').value = state.settings.collectionName;
    document.getElementById('global-width').value = state.settings.cardWidth;
    document.getElementById('global-height').value = state.settings.cardHeight;
    document.getElementById('global-img-size').value = state.settings.imgSize;
    document.getElementById('f-size-item').value = state.settings.fontSizeItem;
    document.getElementById('f-size-desc').value = state.settings.fontSizeDesc;
    document.getElementById('f-size-cat').value = state.settings.fontSizeCat;

    ui.applyGlobalStyles(state.settings);
    ui.updateCollectionTitle(state.settings.collectionName);
    ui.renderCategories(state.categories);
    ui.renderCards(state.cards, state.categories, state.filters, handleQuickEdit);
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