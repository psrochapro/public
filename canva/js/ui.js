export const ui = {
    renderCategories(categories) {
        const list = document.getElementById('category-list');
        const select = document.getElementById('card-cat');
        
        list.innerHTML = '';
        select.innerHTML = '<option value="">Selecione a Categoria</option>';

        categories.forEach(cat => {
            // Lista na Sidebar
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.textContent = cat.name;
            tag.style.backgroundColor = cat.bg;
            tag.style.color = cat.text;
            list.appendChild(tag);

            // Opção no Select
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = cat.name;
            select.appendChild(opt);
        });
    },

    renderCards(cards, categories, onDelete) {
        const container = document.getElementById('card-container');
        container.innerHTML = '';

        cards.forEach(card => {
            const cat = categories.find(c => c.id === card.categoriaId) || { bg: '#ccc', text: '#000', name: 'Geral' };
            
            const cardEl = document.createElement('div');
            cardEl.className = 'card';
            cardEl.innerHTML = `
                <button class="card-delete" title="Excluir">✕</button>
                <div class="card-inner">
                    <div class="card-front">
                        <div style="height:8px; background:${cat.bg}"></div>
                        <span style="padding:15px; font-size:10px; color:#999">${cat.name.toUpperCase()}</span>
                        <div class="card-ribbon" style="background:${cat.bg}; color:${cat.text}">${card.item}</div>
                        <img src="${card.imagem}">
                    </div>
                    <div class="card-back">
                        <div class="back-header">
                            <img src="${card.imagem}">
                            <strong>${card.item}</strong>
                        </div>
                        <p>${card.descricao}</p>
                    </div>
                </div>
            `;

            cardEl.querySelector('.card-delete').onclick = (e) => {
                e.stopPropagation();
                onDelete(card.id);
            };

            cardEl.onclick = () => cardEl.classList.toggle('is-flipped');
            container.appendChild(cardEl);
        });
    }
};