const persistence = {
    exportCanvas() {
        let content = "";
        
        // Header
        content += `#nome ${document.getElementById('val-nome').innerText}\n`;
        content += `#objetivo ${document.getElementById('val-objetivo').innerText}\n`;
        content += `#macroprocesso ${document.getElementById('val-macroprocesso').innerText}\n`;
        content += `#area ${document.getElementById('val-area').innerText}\n`;
        content += `#dono ${document.getElementById('val-dono').innerText}\n\n`;

        // Inventory
        const cards = document.querySelectorAll('.inventory-card');
        cards.forEach(card => {
            const title = card.querySelector('.card-title').innerText;
            const tag = renderer.config.find(c => c.label === title)?.id;
            const pills = Array.from(card.querySelectorAll('.modern-pill')).map(p => p.innerText);
            if (tag && pills.length > 0) {
                content += `#${tag}\n${pills.join(', ')}\n\n`;
            }
        });

        // Flow
        const items = document.querySelectorAll('.timeline-item');
        items.forEach((item, idx) => {
            const etapa = item.querySelector('.step-number').innerText;
            const desc = item.querySelector('.act-detail').innerText;
            const actor = item.querySelector('.act-actor').innerText.replace('Executor: ', '');
            const sides = item.querySelectorAll('.side-data p');
            
            content += `#atividade ${idx + 1}\n`;
            content += `Etapa: ${etapa}\n`;
            content += `Fornecedor: ${sides[1].innerText}\n`;
            content += `Insumos: ${sides[0].innerText}\n`;
            content += `Ator: ${actor}\n`;
            content += `Atividades: ${desc}\n`;
            content += `Saídas: ${sides[2].innerText}\n`;
            content += `Cliente: ${sides[3].innerText}\n\n`;
        });

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "design-processo.cnv";
        a.click();
    }
};