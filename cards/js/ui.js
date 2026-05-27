export const ui = {
    switchTab(tabId) {
        document.querySelectorAll('.tab-btn, .tab-pane').forEach(el => el.classList.remove('active'));
        const btn = document.querySelector(`[data-tab="${tabId}"]`);
        if(btn) btn.classList.add('active');
        const pane = document.getElementById(tabId);
        if(pane) pane.classList.add('active');
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
        r.style.setProperty('--view-bg', settings.viewBg);
        r.style.setProperty('--view-title', settings.viewTitleColor);
    },

    renderSummary(state) {
        document.getElementById('stat-total-cards').textContent = state.cards.length;
        document.getElementById('stat-total-cats').textContent = state.categories.length;
        const bars = document.getElementById('category-bars');
        bars.innerHTML = '';
        if(state.categories.length === 0) return bars.innerHTML = '<p style="font-size:0.75rem; color:#94a3b8">Crie categorias primeiro.</p>';
        
        const counts = state.categories.map(cat => ({
            name: cat.name, color: cat.bg, count: state.cards.filter(c => c.categoriaId === cat.id).length
        })).sort((a,b) => b.count - a.count);

        const max = Math.max(...counts.map(c => c.count), 1);
        counts.forEach(c => {
            const perc = (c.count / max) * 100;
            const row = document.createElement('div');
            row.className = 'bar-row';
            row.innerHTML = `<div class="bar-info"><span>${c.name}</span><span>${c.count}</span></div>
                <div class="bar-track"><div class="bar-fill" style="width:${perc}%; background:${c.color}"></div></div>`;
            bars.appendChild(row);
        });
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
        
        let filtered = [...cards];
        if(filters.sort === 'az') filtered.sort((a,b) => a.item.localeCompare(b.item));
        else if(filters.sort === 'za') filtered.sort((a,b) => b.item.localeCompare(a.item));

        filtered = filtered.filter(c => {
            const matchSearch = c.item.toLowerCase().includes(filters.search) || (c.descricao && c.descricao.toLowerCase().includes(filters.search));
            const matchCat = filters.category === "all" || c.categoriaId === filters.category;
            return matchSearch && matchCat;
        });

        filtered.forEach(card => {
            const cat = categories.find(c => c.id === card.categoriaId) || { bg: '#cbd5e1', text: '#64748b', cardBg: '#fff', name: 'Sem Cat.' };
            const el = document.createElement('div');
            el.className = 'card js-tilt';
            el.innerHTML = `
                <div class="quick-edit-btn" title="Editar">🖊️</div>
                <div class="card-inner">
                    <div class="card-front" style="background: ${cat.cardBg}">
                        <div class="shine"></div>
                        <div class="cat-badge-container"><span class="cat-badge" style="background: ${cat.bg}22; color: ${cat.bg}">${cat.name}</span></div>
                        <div class="card-ribbon" style="background:${cat.bg}; color:${cat.text}">${card.item}</div>
                        <div class="img-container ${card.layout === 'photo' ? 'mode-photo' : 'mode-icon'}"><img src="${card.imagem}"></div>
                        <div class="flip-hint">↺</div>
                    </div>
                    <div class="card-back" style="background: ${cat.cardBg}">
                        <div class="back-header"><img src="${card.imagem}"><strong>${card.item}</strong></div>
                        <div class="back-content"><p>${card.descricao || ''}</p></div>
                    </div>
                </div>
            `;
            el.querySelector('.quick-edit-btn').onclick = (e) => { e.stopPropagation(); onQuickEdit(card.id); };
            el.onclick = () => el.classList.toggle('is-flipped');
            container.appendChild(el);
        });
    },

    initTilt() {
        document.querySelectorAll('.js-tilt').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const rotateX = ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -10;
                const rotateY = ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 10;
                card.style.setProperty('--rx', `${rotateX}deg`);
                card.style.setProperty('--ry', `${rotateY}deg`);
            });
            card.addEventListener('mouseleave', () => { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); });
        });
    },

    renderManagementLists(state, actions) {
        const cardsList = document.getElementById('manage-cards-list');
        const catsList = document.getElementById('manage-cats-list');
        cardsList.innerHTML = ''; catsList.innerHTML = '';

        state.cards.filter(c => c.item.toLowerCase().includes(state.sidebarCardSearch)).forEach(c => {
            const cat = state.categories.find(cat => cat.id === c.categoriaId) || { bg: '#e2e8f0' };
            const item = document.createElement('div');
            item.className = 'manage-item';
            item.draggable = true;
            item.dataset.id = c.id;
            item.innerHTML = `<div class="item-main"><div class="cat-dot" style="background:${cat.bg}"></div><span class="item-name">${c.item}</span></div>
                <div class="item-actions"><button class="btn-sm edit">🖊️</button><button class="btn-sm delete">🗑️</button></div>`;
            
            item.addEventListener('dragstart', () => item.classList.add('dragging'));
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                actions.onReorderCards([...cardsList.querySelectorAll('.manage-item')].map(el => el.dataset.id));
            });
            item.querySelector('.edit').onclick = () => actions.onEditCard(c.id);
            item.querySelector('.delete').onclick = () => actions.onDeleteCard(c.id);
            cardsList.appendChild(item);
        });

        cardsList.addEventListener('dragover', e => {
            e.preventDefault();
            const dragging = document.querySelector('.dragging');
            const afterElement = [...cardsList.querySelectorAll('.manage-item:not(.dragging)')].reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = e.clientY - box.top - box.height / 2;
                if (offset < 0 && offset > closest.offset) return { offset, element: child };
                else return closest;
            }, { offset: Number.NEGATIVE_INFINITY }).element;
            if (!afterElement) cardsList.appendChild(dragging);
            else cardsList.insertBefore(dragging, afterElement);
        });

        state.categories.forEach(cat => {
            const item = document.createElement('div');
            item.className = 'manage-item';
            item.innerHTML = `<div class="item-main"><div class="cat-dot" style="background:${cat.bg}"></div><span class="item-name">${cat.name}</span></div>
                <div class="item-actions"><button class="btn-sm edit">🖊️</button><button class="btn-sm delete">🗑️</button></div>`;
            item.querySelector('.edit').onclick = () => actions.onEditCat(cat.id);
            item.querySelector('.delete').onclick = () => actions.onDeleteCat(cat.id);
            catsList.appendChild(item);
        });
    },

    fillCardForm(card) {
        document.getElementById('card-form-title').textContent = "✏️ Editando Card";
        document.getElementById('edit-card-id').value = card.id;
        document.getElementById('card-item').value = card.item;
        document.getElementById('card-desc').value = card.descricao || '';
        document.getElementById('card-cat').value = card.categoriaId;
        document.getElementById('card-layout').value = card.layout || "icon";
        document.getElementById('btn-save-card').textContent = "Atualizar Card";
        document.getElementById('btn-cancel-card').classList.remove('hidden');
        document.getElementById('tab-cards').scrollTop = 0;
        document.getElementById('card-item').focus();
    },

    resetCardForm() {
        document.getElementById('form-card').reset();
        document.getElementById('card-form-title').textContent = "Novo Card";
        document.getElementById('edit-card-id').value = "";
        document.getElementById('btn-save-card').textContent = "Salvar Card";
        document.getElementById('btn-cancel-card').classList.add('hidden');
    },

    fillCatForm(cat) {
        this.switchTab('tab-categories');
        document.getElementById('cat-form-title').textContent = "✏️ Editar Categoria";
        document.getElementById('edit-cat-id').value = cat.id;
        document.getElementById('cat-name').value = cat.name;
        document.getElementById('cat-bg').value = cat.bg;
        document.getElementById('cat-text').value = cat.text;
        document.getElementById('cat-card-bg').value = cat.cardBg || "#ffffff";
        document.getElementById('btn-save-cat').textContent = "Atualizar";
        document.getElementById('btn-cancel-cat').classList.remove('hidden');
        document.getElementById('cat-name').focus();
    },

    resetCatForm() {
        document.getElementById('form-category').reset();
        document.getElementById('cat-form-title').textContent = "Nova Categoria";
        document.getElementById('edit-cat-id').value = "";
        document.getElementById('btn-save-cat').textContent = "Salvar Categoria";
        document.getElementById('btn-cancel-cat').classList.add('hidden');
    }
};