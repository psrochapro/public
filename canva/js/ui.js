export const ui = {
    switchTab(tabId) {
        document.querySelectorAll('.tab-btn, .tab-pane').forEach(el => el.classList.remove('active'));
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(tabId).classList.add('active');
    },

    renderCategories(categories) {
        const select = document.getElementById('card-cat');
        const currentVal = select.value;
        select.innerHTML = '<option value="">Selecione uma categoria</option>';
        categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = cat.name;
            select.appendChild(opt);
        });
        select.value = currentVal;
    },

    renderCards(cards, categories) {
        const container = document.getElementById('card-container');
        container.innerHTML = '';
        cards.forEach(card => {
            const cat = categories.find(c => c.id === card.categoriaId) || { bg: '#eee', text: '#333', name: 'Sem Categoria' };
            const el = document.createElement('div');
            el.className = 'card';
            el.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">
                        <div style="height:10px; background:${cat.bg}"></div>
                        <span style="padding:15px 20px 0; font-size:10px; font-weight:700; color:#999; text-transform:uppercase">${cat.name}</span>
                        <div class="card-ribbon" style="background:${cat.bg}; color:${cat.text}">${card.item}</div>
                        <img src="${card.imagem}">
                    </div>
                    <div class="card-back">
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
    },

    renderManagementLists(state, actions) {
        // Lista de Cards na Sidebar
        const cardsList = document.getElementById('manage-cards-list');
        cardsList.innerHTML = '';
        state.cards.forEach(c => {
            const item = document.createElement('div');
            item.className = 'manage-item';
            item.innerHTML = `<span>${c.item}</span><div class="item-actions">
                <button class="btn-sm edit">Editar</button>
                <button class="btn-sm delete">X</button>
            </div>`;
            item.querySelector('.edit').onclick = () => actions.onEditCard(c.id);
            item.querySelector('.delete').onclick = () => actions.onDeleteCard(c.id);
            cardsList.appendChild(item);
        });

        // Lista de Categorias na Sidebar
        const catsList = document.getElementById('manage-cats-list');
        catsList.innerHTML = '';
        state.categories.forEach(cat => {
            const item = document.createElement('div');
            item.className = 'manage-item';
            item.innerHTML = `
                <div style="display:flex; align-items:center; gap:8px">
                    <div style="width:12px; height:12px; border-radius:3px; background:${cat.bg}"></div>
                    <span>${cat.name}</span>
                </div>
                <div class="item-actions">
                    <button class="btn-sm edit">Editar</button>
                    <button class="btn-sm delete">X</button>
                </div>`;
            item.querySelector('.edit').onclick = () => actions.onEditCat(cat.id);
            item.querySelector('.delete').onclick = () => actions.onDeleteCat(cat.id);
            catsList.appendChild(item);
        });
    },

    fillCardForm(card) {
        document.getElementById('card-form-title').textContent = "Editar Card";
        document.getElementById('edit-card-id').value = card.id;
        document.getElementById('card-item').value = card.item;
        document.getElementById('card-desc').value = card.descricao;
        document.getElementById('card-cat').value = card.categoriaId;
        document.getElementById('btn-save-card').textContent = "Atualizar Card";
        document.getElementById('btn-cancel-card').classList.remove('hidden');
        document.getElementById('card-img').required = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    resetCardForm() {
        document.getElementById('form-card').reset();
        document.getElementById('card-form-title').textContent = "Novo Card";
        document.getElementById('edit-card-id').value = "";
        document.getElementById('btn-save-card').textContent = "Criar Card";
        document.getElementById('btn-cancel-card').classList.add('hidden');
        document.getElementById('card-img').required = true;
    },

    fillCatForm(cat) {
        document.getElementById('cat-form-title').textContent = "Editar Categoria";
        document.getElementById('edit-cat-id').value = cat.id;
        document.getElementById('cat-name').value = cat.name;
        document.getElementById('cat-bg').value = cat.bg;
        document.getElementById('cat-text').value = cat.text;
        document.getElementById('btn-save-cat').textContent = "Atualizar";
        document.getElementById('btn-cancel-cat').classList.remove('hidden');
    },

    resetCatForm() {
        document.getElementById('form-category').reset();
        document.getElementById('cat-form-title').textContent = "Nova Categoria";
        document.getElementById('edit-cat-id').value = "";
        document.getElementById('btn-save-cat').textContent = "Salvar Categoria";
        document.getElementById('btn-cancel-cat').classList.add('hidden');
    }
};