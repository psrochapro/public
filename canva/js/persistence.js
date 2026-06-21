const persistence = {
    // Retorna o conteúdo atual do canvas formatado como string limpa
    getContentString() {
        let content = "";
        
        // 1. Metadados de Cabeçalho
        const headerTags = ['nome', 'macroprocesso', 'area', 'dono', 'objetivo'];
        headerTags.forEach(tag => {
            const el = document.getElementById(`val-${tag}`);
            if (el && el.innerText !== "---") {
                content += `#${tag} ${el.innerText}\n`;
            }
        });
        content += "\n";

        // 2. Novo: Dicionário de Etapas (#etapas)
        const stepHeaders = document.querySelectorAll('.step-header-row');
        if (stepHeaders.length > 0) {
            content += "#etapas\n";
            stepHeaders.forEach(header => {
                const num = header.getAttribute('data-target-step');
                const nameEl = header.querySelector('.step-name-text');
                if (nameEl) {
                    // Remove o caractere ":" inicial se existir para exportação limpa
                    const name = nameEl.innerText.replace(/^:\s*/, '').trim();
                    content += `${num}: ${name}\n`;
                }
            });
            content += "\n";
        }

        // 3. Cards de Levantamento (Pills)
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

        // 4. Atividades do Fluxo (Seleção específica para evitar headers de sanfona)
        const flowRows = document.querySelectorAll('.activity-row-card');
        flowRows.forEach((row) => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 7) {
                // Captura a Regra/Lógica limpando o prefixo
                const regraEl = cells[4].querySelector('.regra-box');
                let regraTxt = "";
                if (regraEl) {
                    regraTxt = regraEl.innerText.replace(/^Lógica:\s*/i, '').trim();
                }

                // Captura o ID da Atividade limpando tags HTML
                const activityId = row.querySelector('.activity-tag').innerText;
                const etapaNum = row.getAttribute('data-etapa') || "1";

                content += `#atividade ${activityId}\n`;
                content += `Etapa: ${etapaNum}\n`;
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

        // 5. Observações Gerais
        const obsItems = document.querySelectorAll('.obs-row td');
        if (obsItems.length > 0) {
            content += `#observacoes\n`;
            obsItems.forEach(td => {
                content += `${td.innerText}\n`;
            });
        }

        return content.trim();
    },

    // Salva rascunho no navegador
    saveToLocal(content) {
        if (!content) return;
        localStorage.setItem('canvas_draft_txt', content);
    },

    // Recupera rascunho do navegador
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