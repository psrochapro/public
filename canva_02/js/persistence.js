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
                const regraEl = cells[4].querySelector('.regra-box');
                let regraTxt = "";
                if (regraEl) {
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
            obsItems.forEach(td => {
                // Removida a inserção automática do hífen para dar controle total ao usuário
                content += `${td.innerText}\n`;
            });
        }

        return content.trim();
    },

    // Nova função: Salva rascunho no navegador
    saveToLocal(content) {
        if (!content) return;
        localStorage.setItem('canvas_draft_txt', content);
    },

    // Nova função: Recupera rascunho do navegador
    loadFromLocal() {
        return localStorage.getItem('canvas_draft_txt');
    },

    exportCanvas() {
        const content = this.getContentString();
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        let nomeProc = document.getElementById('val-nome').innerText
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, '-')
            .toLowerCase();
            
        a.download = `${nomeProc || 'processo'}.txt`;
        a.click();
        
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }
};