const persistence = {
    exportCanvas() {
        // Pega os dados atuais renderizados para gerar o arquivo
        let content = "";
        const headerTags = ['nome', 'macroprocesso', 'area', 'dono', 'objetivo'];
        
        headerTags.forEach(tag => {
            const val = document.getElementById(`val-${tag}`).innerText;
            content += `#${tag}\n${val}\n\n`;
        });

        renderer.config.forEach(conf => {
            const container = document.querySelector(`tr:nth-child(${renderer.config.indexOf(conf) + 1}) .pill-container`);
            const pills = Array.from(container.querySelectorAll('.pill')).map(p => p.innerText);
            if (pills.length > 0) {
                content += `#${conf.id}\n${pills.join(', ')}\n\n`;
            }
        });

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `processo-${new Date().getTime()}.cnv`;
        a.click();
    }
};