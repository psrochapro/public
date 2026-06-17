const persistence = {
    exportCanvas() {
        let content = "";
        const headerTags = ['nome', 'macroprocesso', 'area', 'dono', 'objetivo'];
        
        headerTags.forEach(tag => {
            const el = document.getElementById(`val-${tag}`);
            if (el) content += `#${tag} ${el.innerText}\n\n`;
        });

        // Exporta do Levantamento (Survey Cards)
        const surveyCards = document.querySelectorAll('.survey-card');
        renderer.config.forEach((conf, idx) => {
            const card = surveyCards[idx];
            if (card) {
                const pills = Array.from(card.querySelectorAll('.pill')).map(p => p.innerText);
                if (pills.length > 0) content += `#${conf.id}\n${pills.join(', ')}\n\n`;
            }
        });

        // Exporta do Fluxo (Activity Cards)
        const activityCards = document.querySelectorAll('.activity-card');
        activityCards.forEach((card, idx) => {
            const cells = card.querySelectorAll('.activity-cell');
            if (cells.length >= 7) {
                content += `#atividade ${idx + 1}\n`;
                content += `Etapa: ${cells[0].innerText}\n`;
                content += `Fornecedor: ${cells[1].innerText}\n`;
                content += `Insumos: ${cells[2].innerText}\n`;
                content += `Ator: ${cells[3].innerText}\n`;
                content += `Atividades: ${cells[4].innerText}\n`;
                content += `Saídas: ${cells[5].innerText}\n`;
                content += `Cliente: ${cells[6].innerText}\n\n`;
            }
        });

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const nomeProc = document.getElementById('val-nome').innerText.replace(/\s+/g, '-').toLowerCase();
        a.download = `processo-${nomeProc || 'exportado'}.cnv`;
        a.click();
    }
};