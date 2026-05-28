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
        r.style.setProperty('--main-bg', settings.viewportBg || '#f3f6f9');
        r.style.setProperty('--view-title-color', settings.titleColor || '#1e293b');
    },

    updateCollectionTitle(name) {
        const titleEl = document.getElementById('view-title');
        if(titleEl) titleEl.textContent = name || "Visualização";
    },

    renderCategories(categories) {
        const selects = [document.getElementById('card-cat'), document.getElementById('filter-category')];
        selects.forEach((select, i) => {
            if(!select) return;
            const currentVal = select.value;
            select.innerHTML = i === 0 ? '<option value="">Categoria...</option>' : '<option value="all">Todas Categorias</option>';
            [...categories].sort((a,b) => a.name.localeCompare(b.name)).forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat.id; opt.textContent = cat.name; select.appendChild(opt);
            });
            select.value = currentVal;
        });
    },

    renderCards(cards, categories, filters, onQuickEdit) {
        const container = document.getElementById('card-container');
        if(!container) return;
        container.innerHTML = '';

        let processedCards = [...cards];
        
        if (filters.sort === "asc") {
            processedCards.sort((a, b) => a.item.localeCompare(b.item));
        } else if (filters.sort === "desc") {
            processedCards.sort((a, b) => b.item.localeCompare(a.item));
        }

        const filtered = processedCards.filter(c => {
            const matchSearch = c.item.toLowerCase().includes(filters.search) || (c.descricao && c.descricao.toLowerCase().includes(filters.search));
            const matchCat = filters.category === "all" || c.categoriaId === filters.category;
            return matchSearch && matchCat;
        });

        filtered.forEach(card => {
            const cat = categories.find(c => c.id === card.categoriaId) || { bg: '#cbd5e1', text: '#64748b', cardBg: '#fff', name: 'Sem Cat.', bgType: 'color' };
            const layoutClass = card.layout === 'photo' ? 'mode-photo' : 'mode-icon';
            
            // Lógica de fundo da Categoria
            let cardBgStyle = `background: ${cat.cardBg};`;
            if (cat.bgType === 'gradient') {
                cardBgStyle = `background: linear-gradient(135deg, ${cat.cardBg} 0%, ${cat.cardBg2 || cat.cardBg} 100%);`;
            } else if (cat.bgType === 'image' && cat.catBgImage) {
                cardBgStyle = `background: url(${cat.catBgImage}) center/cover no-repeat;`;
            }

            const el = document.createElement('div');
            el.className = 'card js-tilt';
            el.innerHTML = `
                <div class="quick-edit-btn" title="Editar">🖊️</div>
                <div class="card-inner">
                    <div class="card-front" style="${cardBgStyle}">
                        <div class="shine"></div>
                        <div class="cat-badge-container">
                            <span class="cat-badge" style="background: ${cat.bg}22; color: ${cat.bg}">${cat.name}</span>
                        </div>
                        <div class="card-ribbon" style="background:${cat.bg}; color:${cat.text}">${card.item}</div>
                        <div class="img-container ${layoutClass}"><img src="${card.imagem}"></div>
                        <div class="flip-hint">↺</div>
                    </div>
                    <div class="card-back" style="${cardBgStyle}">
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
        const cards = document.querySelectorAll('.js-tilt');
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left; const y = e.clientY - rect.top;
                const xc = rect.width / 2; const yc = rect.height / 2;
                const dx = x - xc; const dy = y - yc;
                const rotateX = (dy / yc) * -10; const rotateY = (dx / xc) * 10;
                card.style.setProperty('--rx', `${rotateX}deg`);
                card.style.setProperty('--ry', `${rotateY}deg`);
            });
            card.addEventListener('mouseleave', () => {
                card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg');
            });
        });
    },

    renderManagementLists(state, actions) {
        const cardsList = document.getElementById('manage-cards-list');
        if(!cardsList) return;
        cardsList.innerHTML = '';
        
        const filteredCards = state.cards.filter(c => c.item.toLowerCase().includes(state.sidebarCardSearch));
        
        filteredCards.forEach((c, idx) => {
            const cat = state.categories.find(cat => cat.id === c.categoriaId) || { bg: '#e2e8f0' };
            const item = document.createElement('div');
            item.className = 'manage-item';
            
            item.innerHTML = `
                <div class="item-main">
                    <div class="cat-dot" style="background:${cat.bg}"></div>
                    <span class="item-name">${c.item}</span>
                </div>
                <div class="item-actions">
                    <button class="btn-sm move-up" title="Subir">↑</button>
                    <button class="btn-sm move-down" title="Descer">↓</button>
                    <button class="btn-sm edit" title="Editar">🖊️</button>
                    <button class="btn-sm delete" title="Excluir">🗑️</button>
                </div>`;
            
            item.querySelector('.move-up').onclick = () => actions.onMoveCard(c.id, 'up');
            item.querySelector('.move-down').onclick = () => actions.onMoveCard(c.id, 'down');
            item.querySelector('.edit').onclick = () => actions.onEditCard(c.id);
            item.querySelector('.delete').onclick = () => actions.onDeleteCard(c.id);
            
            if (idx === 0) item.querySelector('.move-up').style.opacity = '0.2';
            if (idx === filteredCards.length - 1) item.querySelector('.move-down').style.opacity = '0.2';

            cardsList.appendChild(item);
        });

        const catsList = document.getElementById('manage-cats-list');
        if(!catsList) return;
        catsList.innerHTML = '';
        state.categories.forEach(cat => {
            const item = document.createElement('div');
            item.className = 'manage-item';
            item.innerHTML = `<div class="item-main"><div class="cat-dot" style="background:${cat.bg}"></div><span class="item-name">${cat.name}</span></div>
                <div class="item-actions"><button class="btn-sm edit" title="Editar">🖊️</button><button class="btn-sm delete" title="Excluir">🗑️</button></div>`;
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
        
        const pane = document.getElementById('tab-cards');
        const firstInput = document.getElementById('card-item');
        const form = document.getElementById('form-card');

        if(pane) pane.scrollTop = 0; 
        if(firstInput) firstInput.focus(); 
        
        if(form) {
            form.classList.add('pulse');
            setTimeout(() => form.classList.remove('pulse'), 1000);
        }
    },

    resetCardForm() {
        const form = document.getElementById('form-card');
        if(form) form.reset();
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
        document.getElementById('cat-bg-type').value = cat.bgType || "color";
        document.getElementById('cat-card-bg2').value = cat.cardBg2 || "#ffffff";
        document.getElementById('btn-save-cat').textContent = "Atualizar";
        document.getElementById('btn-cancel-cat').classList.remove('hidden');

        const pane = document.getElementById('tab-categories');
        const firstInput = document.getElementById('cat-name');
        const form = document.getElementById('form-category');

        if(pane) pane.scrollTop = 0; 
        if(firstInput) firstInput.focus(); 

        if(form) {
            form.classList.add('pulse');
            setTimeout(() => form.classList.remove('pulse'), 1000);
        }
    },

    resetCatForm() {
        const form = document.getElementById('form-category');
        if(form) form.reset();
        document.getElementById('cat-form-title').textContent = "Nova Categoria";
        document.getElementById('edit-cat-id').value = "";
        document.getElementById('btn-save-cat').textContent = "Salvar Categoria";
        document.getElementById('btn-cancel-cat').classList.add('hidden');
    },

    renderSummary(cards, categories) {
        const container = document.getElementById('summary-container');
        if (!container) return;

        const totalCards = cards.length;
        const totalCats = categories.length;

        const stats = categories.map(cat => {
            const count = cards.filter(c => c.categoriaId === cat.id).length;
            return { ...cat, count };
        }).sort((a, b) => b.count - a.count);

        const maxCount = stats.length > 0 ? Math.max(...stats.map(s => s.count)) : 0;

        container.innerHTML = `
            <div class="summary-stats-grid">
                <div class="summary-stat-card blue">
                    <div class="stat-label">TOTAL DE CARDS</div>
                    <div class="stat-value">${totalCards}</div>
                </div>
                <div class="summary-stat-card green">
                    <div class="stat-label">CATEGORIAS</div>
                    <div class="stat-value">${totalCats}</div>
                </div>
            </div>
            <div class="summary-chart-section">
                <h4>Cards por Categoria</h4>
                <div class="summary-list">
                    ${stats.map(s => `
                        <div class="summary-row">
                            <div class="summary-row-info">
                                <span>${s.name}</span>
                                <strong>${s.count}</strong>
                            </div>
                            <div class="summary-progress-bg">
                                <div class="summary-progress-bar" style="width: ${maxCount > 0 ? (s.count / maxCount * 100) : 0}%; background: ${s.bg}"></div>
                            </div>
                        </div>
                    `).join('')}
                    ${totalCards === 0 ? '<div class="empty-msg">Nenhum card criado ainda.</div>' : ''}
                </div>
            </div>
        `;
    }
};