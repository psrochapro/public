const persistence = {
    // Retorna o conteúdo atual do canvas formatado como string limpa
    getContentString() {
        let content = "";
        const headerTags = ['nome', 'macroprocesso', 'area', 'dono', 'objetivo'];
        
        headerTags.forEach(tag => {
            const el = document.getElementById(`val-${tag}`);
            if (el && el.innerText !== "---") {
                content += `#${tag} ${el.innerText}\n`;
            }
        });
        content += "\n";

        const surveyCards = document.querySelectorAll('.survey-card');
        renderer.config.forEach((conf, idx) => {
            const card = surveyCards[idx];
            if (card) {
                const pills = Array.from(card.querySelectorAll('.pill')).map(p => p.innerText);
                if (pills.length > 0 && pills[0] !== "---") {
                    content += `#${conf.id} ${pills.join(', ')}\n\n`;
                }
            }
        });

        const flowRows = document.querySelectorAll('#flow-items-container tr');
        flowRows.forEach((row, idx) => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 7) {
                // Limpeza crítica: Remove o prefixo "Lógica:" injetado pelo Renderer
                const regraEl = cells[4].querySelector('.regra-box');
                let regraTxt = "";
                if (regraEl) {
                    // Pega o texto e remove o prefixo "Lógica:" (case insensitive)
                    regraTxt = regraEl.innerText.replace(/^Lógica:\s*/i, '').trim();
                }

                content += `#atividade ${idx + 1}\n`;
                content += `Etapa: ${cells[0].innerText}\n`;
                content += `Fornecedor: ${cells[1].innerText}\n`;
                content += `Insumos: ${cells[2].innerText}\n`;
                content += `Ator: ${cells[3].innerText}\n`;
                content += `Atividades: ${cells[4].querySelector('.act-main-text').innerText}\n`;
                if (regraTxt && regraTxt !== "" && regraTxt !== "N/A") {
                    content += `Regra: ${regraTxt}\n`;
                }
                content += `Saídas: ${cells[5].innerText}\n`;
                content += `Cliente: ${cells[6].innerText}\n\n`;
            }
        });

        const obsItems = document.querySelectorAll('.obs-row td');
        if (obsItems.length > 0) {
            content += `#observacoes\n`;
            obsItems.forEach(td => content += `- ${td.innerText}\n`);
        }

        return content.trim();
    },

    exportCanvas() {
        const content = this.getContentString();
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Obtém o nome do processo para o arquivo, higienizando caracteres especiais
        let nomeProc = document.getElementById('val-nome').innerText
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove acentos
            .replace(/\s+/g, '-')
            .toLowerCase();
            
        a.download = `${nomeProc || 'processo'}.txt`;
        a.click();
        
        // Libera a memória do objeto URL
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }
};