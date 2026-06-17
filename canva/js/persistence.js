const persistence = {
    exportCanvas() {
        const sections = document.querySelectorAll('.block-content');
        let content = "";

        // Nota: Em uma versão real, pegaríamos do estado 'data'. 
        // Para simplificar, reconstruímos o texto a partir do que está na tela.
        const tags = [
            'atores', 'entradas', 'saidas', 'interessados', 'lgpd', 
            'recursos', 'atividades', 'indicadores', 'documentos', 'normas'
        ];

        tags.forEach(tag => {
            const el = document.getElementById(`section-${tag}`);
            if (el) {
                content += `#${tag}\n${el.innerText}\n\n`;
            }
        });

        // SGPE Manual reconstruction
        const sgpeItems = document.querySelectorAll('.sgpe-item');
        if(sgpeItems.length > 0) {
            content += "#sgpe\n";
            sgpeItems.forEach(item => {
                content += item.innerText.replace('\n', ' ') + "\n";
            });
        }

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "diagrama-processo.cnv";
        a.click();
    }
};