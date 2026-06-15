const table = document.getElementById('periodic-table');
const modal = document.getElementById('modal-overlay');

async function init() {
    try {
        const response = await fetch('pte.json');
        const data = await response.json();
        
        data.elements.forEach(el => {
            const card = document.createElement('div');
            
            // 1. Normalizar Categoria para o CSS
            // Isso resolve o problema do Elemento 119 que vem com um texto longo
            let catClass = 'unknown';
            const cat = el.category.toLowerCase();
            
            if (cat.includes('noble gas')) catClass = 'noble-gas';
            else if (cat.includes('alkali metal')) catClass = 'alkali-metal';
            else if (cat.includes('alkaline earth')) catClass = 'alkaline-earth-metal';
            else if (cat.includes('transition metal')) catClass = 'transition-metal';
            else if (cat.includes('post-transition')) catClass = 'post-transition-metal';
            else if (cat.includes('metalloid')) catClass = 'metalloid';
            else if (cat.includes('diatomic nonmetal')) catClass = 'diatomic-nonmetal';
            else if (cat.includes('polyatomic nonmetal')) catClass = 'polyatomic-nonmetal';
            else if (cat.includes('lanthanide')) catClass = 'lanthanide';
            else if (cat.includes('actinide')) catClass = 'actinide';

            card.classList.add('element', catClass);
            card.style.gridColumn = el.xpos;
            card.style.gridRow = el.ypos;

            card.innerHTML = `
                <span class="number">${el.number}</span>
                <span class="symbol">${el.symbol}</span>
                <span class="name-small">${el.name.substring(0, 8)}</span>
            `;

            // EVENTO: Destaque de Família (Hover)
            card.addEventListener('mouseenter', () => {
                table.classList.add('faded');
                document.querySelectorAll(`.${catClass}`).forEach(item => item.classList.add('highlight'));
            });

            card.addEventListener('mouseleave', () => {
                table.classList.remove('faded');
                document.querySelectorAll('.element').forEach(item => item.classList.remove('highlight'));
            });

            // EVENTO: Detalhes (Click)
            card.addEventListener('click', () => openModal(el, catClass));

            table.appendChild(card);
        });
    } catch (err) {
        console.error("Erro ao carregar dados:", err);
    }
}

function openModal(el, catClass) {
    document.getElementById('modal-el-box').className = `element-box ${catClass}`;
    document.getElementById('modal-number').innerText = el.number;
    document.getElementById('modal-symbol').innerText = el.symbol;
    document.getElementById('modal-name').innerText = el.name;
    document.getElementById('modal-category').innerText = el.category;
    document.getElementById('modal-summary').innerText = el.summary;
    document.getElementById('modal-mass').innerText = el.atomic_mass;
    document.getElementById('modal-melt').innerText = el.melt || 'N/A';
    document.getElementById('modal-boil').innerText = el.boil || 'N/A';
    document.getElementById('modal-link').href = el.source;
    
    // Imagem (algumas podem falhar, então usamos um fallback)
    const img = document.getElementById('modal-img');
    img.src = el.image.url;
    img.onerror = () => img.src = 'https://via.placeholder.com/400x200?text=Sem+Imagem';

    modal.style.display = 'flex';
}

// Fechar Modal
document.getElementById('close-modal').onclick = () => modal.style.display = 'none';
window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; }

init();