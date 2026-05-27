export const ui = {
    switchTab(tabId) {
        document.querySelectorAll('.tab-btn, .tab-pane').forEach(el => el.classList.remove('active'));
        const btn = document.querySelector(`[data-tab="${tabId}"]`);
        if(btn) btn.classList.add('active');
        const pane = document.getElementById(tabId);
        if(pane) pane.classList.add('active');
    },

    renderSummary(cards, categories) {
        document.getElementById('stat-total-cards').textContent = cards.length;
        document.getElementById('stat-total-cats').textContent = categories.length;

        const container = document.getElementById('category-bars-list');
        container.innerHTML = '';

        if (categories.length === 0) {
            container.innerHTML = '<p style="font-size: 0.8rem; color: #94a3b8;">Nenhuma categoria criada.</p>';
            return;
        }

        const stats = categories.map(cat => {
            const count = cards.filter(card => card.categoriaId === cat.id).length;
            return { ...cat, count };
        }).sort((a, b) => b.count - a.count);

        const maxCount = Math.max(...stats.map(s => s.count), 1);

        stats.forEach(s => {
            const percentage = (s.count / maxCount) * 100;
            const row = document.createElement('div');
            row.className = 'chart-row';
            row.innerHTML = `
                <div class="chart-label-group">
                    <span class="chart-cat-name">${s.name}</span>
                    <span class="chart-cat-count">${s.count}</span>
                </div>
                <div class="chart-bar-bg">
                    <div class="chart-bar-fill" style="width: ${percentage}%; background: ${s.bg}"></div>
                </div>
            `;
            container.appendChild(row);
        });
    },

    applyGlobalStyles(settings) {
        const r = document.documentElement;
        r.style.setProperty('--card-w', `${settings.cardWidth}px`);
        r.style.setProperty('--card-h', `${settings.cardHeight}px`);
        r.style.setProperty('--card-radius', `${settings.borderRadius}px`);
        r.style.setProperty('--card-img-size', `${settings.imgSize}px`);
        r.style.setProperty('--f-size-item', `${settings.fontSizeItem}px`);
        r.style.setProperty('--f-size-desc', `${settings.fontSizeDesc}px`);
        r.style.setProperty('--f-size-cat', `${settings.fontSizeCat}px`);
    },

    updateCollectionTitle(name) {
        document.getElementById('view-title').textContent = name || "Visualização";
    },

    renderCategories(categories) {
        const selects = [document.getElementById('card-cat'), document.getElementById('filter-category')];
        selects.forEach((select, i) => {
            if(!select) return;
            const currentVal = select.value;
            select.innerHTML = i === 0 ? '<option value="">Categoria...</option>' : '<option value="all">Todas Categorias</option>';
            categories.sort((a,b) => a.name.localeCompare(b.name)).forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat.id; opt.textContent = cat.name; select.appendChild(opt);
            });
            select.value = currentVal;
        });
    },

    renderCards(cards, categories, filters, onQuickEdit) {
        const container = document.getElementById('card-container');
        container.innerHTML = '';
        const filtered = cards.filter(c => {
            const matchSearch = c.item.toLowerCase().includes(filters.search) || (c.descricao && c.descricao.toLowerCase().includes(filters.search));
            const matchCat = filters.category === "all" || c.categoriaId === filters.category;
            return matchSearch && matchCat;
        });

        filtered.forEach(card => {
            const cat = categories.find(c => c.id === card.categoriaId) || { bg: '#cbd5e1', text: '#64748b', cardBg: '#fff', name: 'Sem Cat.' };
            const layoutClass = card.layout === 'photo' ? 'mode-photo' : 'mode-icon';
            const el = document.createElement('div');
            el.className = 'card';
            el.innerHTML = `
                <div class="card-inner">
                    <div class="card-front" style="background: ${cat.cardBg}">
                        <div class="cat-badge" style="padding: 10px; font-size: var(--f-size-cat); color: ${cat.bg}; font-weight: 800;">${cat.name}</div>
                        <div class="card-ribbon" style="background:${cat.bg}; color:${cat.text}">${card.item}</div>
                        <div class="img-container ${layoutClass}"><img src="${card.imagem}"></div>
                    </div>
                    <div class="card-back">
                        <div style="padding: 20px;"><strong>${card.item}</strong><p>${card.descricao || ''}</p></div>
                    </div>
                </div>
            `;
            el.onclick = () => el.classList.toggle('is-flipped');
            container.appendChild(el);
        });
    },

    renderManagementLists(state, actions) {
        const cardsList = document.getElementById('manage-cards-list');
        cardsList.innerHTML = '';
        state.cards.filter(c => c.item.toLowerCase().includes(state.sidebarCardSearch)).forEach(c => {
            const cat = state.categories.find(cat => cat.id === c.categoriaId) || { bg: '#e2e8f0' };
            const item = document.createElement('div');
            item.className = 'manage-item';
            item.innerHTML = `<div><div class="cat-dot" style="background:${cat.bg}; display:inline-block"></div><span class="item-name">${c.item}</span></div>
                <div><button class="btn-edit">🖊️</button><button class="btn-del">🗑️</button></div>`;
            item.querySelector('.btn-edit').onclick = () => actions.onEditCard(c.id);
            item.querySelector('.btn-del').onclick = () => actions.onDeleteCard(c.id);
            cardsList.appendChild(item);
        });

        const catsList = document.getElementById('manage-cats-list');
        catsList.innerHTML = '';
        state.categories.forEach(cat => {
            const item = document.createElement('div');
            item.className = 'manage-item';
            item.innerHTML = `<div><div class="cat-dot" style="background:${cat.bg}; display:inline-block"></div><span class="item-name">${cat.name}</span></div>
                <div><button class="btn-edit">🖊️</button><button class="btn-del">🗑️</button></div>`;
            item.querySelector('.btn-edit').onclick = () => actions.onEditCat(cat.id);
            item.querySelector('.btn-del').onclick = () => actions.onDeleteCat(cat.id);
            catsList.appendChild(item);
        });
    },

    fillCardForm(card) {
        this.switchTab('tab-cards');
        document.getElementById('edit-card-id').value = card.id;
        document.getElementById('card-item').value = card.item;
        document.getElementById('card-desc').value = card.descricao || '';
        document.getElementById('card-cat').value = card.categoriaId;
        document.getElementById('btn-save-card').textContent = "Atualizar";
        document.getElementById('btn-cancel-card').classList.remove('hidden');
    },

    resetCardForm() {
        document.getElementById('form-card').reset();
        document.getElementById('edit-card-id').value = "";
        document.getElementById('btn-save-card').textContent = "Salvar Card";
        document.getElementById('btn-cancel-card').classList.add('hidden');
    },

    fillCatForm(cat) {
        this.switchTab('tab-categories');
        document.getElementById('edit-cat-id').value = cat.id;
        document.getElementById('cat-name').value = cat.name;
        document.getElementById('cat-bg').value = cat.bg;
        document.getElementById('cat-text').value = cat.text;
        document.getElementById('btn-save-cat').textContent = "Atualizar";
        document.getElementById('btn-cancel-cat').classList.remove('hidden');
    },

    resetCatForm() {
        document.getElementById('form-category').reset();
        document.getElementById('edit-cat-id').value = "";
        document.getElementById('btn-save-cat').textContent = "Salvar Categoria";
        document.getElementById('btn-cancel-cat').classList.add('hidden');
    }
};