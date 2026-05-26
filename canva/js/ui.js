export const ui = {
    switchTab(tabId) {
        document.querySelectorAll('.tab-btn, .tab-pane').forEach(el => el.classList.remove('active'));
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(tabId).classList.add('active');
    },

    applyGlobalStyles(settings) {
        const root = document.documentElement;
        root.style.setProperty('--card-w', `${settings.cardWidth}px`);
        root.style.setProperty('--card-h', `${settings.cardHeight}px`);
        root.style.setProperty('--card-img-size', `${settings.imgSize}px`);
        root.style.setProperty('--f-size-item', `${settings.fontSizeItem}px`);
        root.style.setProperty('--f-size-desc', `${settings.fontSizeDesc}px`);
        root.style.setProperty('--f-size-cat', `${settings.fontSizeCat}px`);
    },

    updateCollectionTitle(name) {
        document.getElementById('view-title').textContent = name || "Visualização";
    },

    renderCategories(categories) {
        const selects = [document.getElementById('card-cat'), document.getElementById('filter-category')];
        
        selects.forEach((select, i) => {
            const currentVal = select.value;
            select.innerHTML = i === 0 ? '<option value="">Categoria...</option>' : '<option value="all">Todas as Categorias</option>';
            
            categories.sort((a, b) => a.name.localeCompare(b.name)).forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat.id;
                opt.textContent = cat.name;
                select.appendChild(opt);
            });
            select.value = currentVal;
        });
    },

    renderCards(cards, categories, filters) {
        const container = document.getElementById('card-container');
        container.innerHTML = '';

        const filtered = cards.filter(c => {
            const matchSearch = c.item.toLowerCase().includes(filters.search) || 
                               c.descricao.toLowerCase().includes(filters.search);
            const matchCat = filters.category === "all" || c.categoriaId === filters.category;
            return matchSearch && matchCat;
        });

        filtered.forEach(card => {
            const cat = categories.find(c => c.id === card.categoriaId) || { 
                bg: '#e2e8f0', text: '#64748b', cardBg: '#ffffff', name: 'Sem Categoria' 
            };
            
            const layoutClass = card.layout === 'photo' ? 'mode-photo' : 'mode-icon';
            
            const el = document.createElement('div');
            el.className = 'card';
            el.innerHTML = `
                <div class="card-inner">
                    <div class="card-front" style="background: ${cat.cardBg}">
                        <div style="height:10px; background:${cat.bg}"></div>
                        <span class="cat-label">${cat.name}</span>
                        <div class="card-ribbon" style="background:${cat.bg}; color:${cat.text}">${card.item}</div>
                        <div class="img-container ${layoutClass}">
                            <img src="${card.imagem}">
                        </div>
                    </div>
                    <div class="card-back" style="background: ${cat.cardBg}">
                        <div class="back-header">
                            <img src="${card.imagem}">
                            <strong>${card.item}</strong>
                        </div>
                        <div class="back-content"><p>${card.descricao}</p></div>
                    </div>
                </div>
            `;
            el.onclick = () => el.classList.toggle('is-flipped');
            container.appendChild(el);
        });

        if (filtered.length === 0) container.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#94a3b8; padding:50px;">Nenhum card encontrado.</p>';
    },

    renderManagementLists(state, actions) {
        // Gerenciar Cards
        const cardsList = document.getElementById('manage-cards-list');
        cardsList.innerHTML = '';
        state.cards.forEach(c => {
            const cat = state.categories.find(cat => cat.id === c.categoriaId) || { bg: '#e2e8f0' };
            const item = document.createElement('div');
            item.className = 'manage-item';
            item.innerHTML = `
                <div class="item-main">
                    <div class="cat-dot" style="background: ${cat.bg}"></div>
                    <span class="item-name">${c.item}</span>
                </div>
                <div class="item-actions">
                    <button class="btn-sm edit" title="Editar">🖊️</button>
                    <button class="btn-sm delete" title="Excluir">🗑️</button>
                </div>`;
            item.querySelector('.edit').onclick = () => actions.onEditCard(c.id);
            item.querySelector('.delete').onclick = () => actions.onDeleteCard(c.id);
            cardsList.appendChild(item);
        });

        // Gerenciar Categorias
        const catsList = document.getElementById('manage-cats-list');
        catsList.innerHTML = '';
        state.categories.forEach(cat => {
            const item = document.createElement('div');
            item.className = 'manage-item';
            item.innerHTML = `
                <div class="item-main">
                    <div class="cat-dot" style="background: ${cat.bg}"></div>
                    <span class="item-name">${cat.name}</span>
                </div>
                <div class="item-actions">
                    <button class="btn-sm edit" title="Editar">🖊️</button>
                    <button class="btn-sm delete" title="Excluir">🗑️</button>
                </div>`;
            item.querySelector('.edit').onclick = () => actions.onEditCat(cat.id);
            item.querySelector('.delete').onclick = () => actions.onDeleteCat(cat.id);
            catsList.appendChild(item);
        });
    },

    fillCardForm(card) {
        document.getElementById('card-form-title').textContent = "✏️ Editando Card";
        document.getElementById('edit-card-id').value = card.id;
        document.getElementById('card-item').value = card.item;
        document.getElementById('card-desc').value = card.descricao;
        document.getElementById('card-cat').value = card.categoriaId;
        document.getElementById('card-layout').value = card.layout || "icon";
        document.getElementById('btn-save-card').textContent = "Atualizar Card";
        document.getElementById('btn-cancel-card').classList.remove('hidden');
        document.getElementById('tab-cards').scrollTo({ top: 0, behavior: 'smooth' });
    },

    resetCardForm() {
        document.getElementById('form-card').reset();
        document.getElementById('card-form-title').textContent = "Novo Card";
        document.getElementById('edit-card-id').value = "";
        document.getElementById('btn-save-card').textContent = "Salvar Card";
        document.getElementById('btn-cancel-card').classList.add('hidden');
    },

    fillCatForm(cat) {
        document.getElementById('cat-form-title').textContent = "✏️ Editando Categoria";
        document.getElementById('edit-cat-id').value = cat.id;
        document.getElementById('cat-name').value = cat.name;
        document.getElementById('cat-bg').value = cat.bg;
        document.getElementById('cat-text').value = cat.text;
        document.getElementById('cat-card-bg').value = cat.cardBg || "#ffffff";
        document.getElementById('btn-save-cat').textContent = "Atualizar";
        document.getElementById('btn-cancel-cat').classList.remove('hidden');
        document.getElementById('tab-categories').scrollTo({ top: 0, behavior: 'smooth' });
    },

    resetCatForm() {
        document.getElementById('form-category').reset();
        document.getElementById('cat-form-title').textContent = "Nova Categoria";
        document.getElementById('edit-cat-id').value = "";
        document.getElementById('btn-save-cat').textContent = "Salvar Categoria";
        document.getElementById('btn-cancel-cat').classList.add('hidden');
    }
};