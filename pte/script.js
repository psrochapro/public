async function init() {
    try {
        const response = await fetch('pte.json');
        const data = await response.json();
        const container = document.getElementById('periodic-table');

        data.elements.forEach(el => {
            const card = document.createElement('div');
            
            // Tratamento da categoria para virar classe CSS (ex: "noble gas" -> "noble-gas")
            const categoryClass = el.category.replace(/\s+/g, '-');
            card.classList.add('element', categoryClass);

            // Posicionamento exato usando xpos e ypos do JSON
            card.style.gridColumn = el.xpos;
            card.style.gridRow = el.ypos;

            // Conteúdo do card
            card.innerHTML = `
                <span class="number">${el.number}</span>
                <span class="symbol">${el.symbol}</span>
                <span class="mass">${el.atomic_mass.toFixed(2)}</span>
            `;

            // Evento de clique para mostrar o resumo (está no seu JSON!)
            card.addEventListener('click', () => {
                alert(`${el.name}: ${el.summary}`);
            });

            container.appendChild(card);
        });
    } catch (err) {
        console.error("Erro ao carregar o JSON:", err);
    }
}

init();