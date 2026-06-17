const persistence = {
    exportCanvas() {
        let content = "";
        const headerTags = ['nome', 'macroprocesso', 'area', 'dono', 'objetivo'];
        
        headerTags.forEach(tag => {
            const val = document.getElementById(`val-${tag}`).innerText;
            content += `#${tag} ${val}\n\n`;
        });

        renderer.config.forEach(conf => {
            const row = Array.from(document.querySelectorAll('.fluid-table tr')).find(r => r.innerText.includes(conf.label));
            if (row) {
                const pills = Array.from(row.querySelectorAll('.pill')).map(p => p.innerText);
                if (pills.length > 0) content += `#${conf.id}\n${pills.join(', ')}\n\n`;
            }
        });

        const flowRows = document.querySelectorAll('#flow-body tr');
        flowRows.forEach((row, idx) => {
            const cols = row.querySelectorAll('td');
            content += `#atividade ${idx + 1}\n`;
            content += `Etapa: ${cols[0].innerText}\n`;
            content += `Fornecedor: ${cols[1].innerText}\n`;
            content += `Insumos: ${cols[2].innerText}\n`;
            content += `Ator: ${cols[3].innerText}\n`;
            content += `Atividades: ${cols[4].innerText}\n`;
            content += `Saídas: ${cols[5].innerText}\n`;
            content += `Cliente: ${cols[6].innerText}\n\n`;
        });

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `processo-exportado.cnv`;
        a.click();
    }
};