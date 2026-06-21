/* 
   ARQUIVO: js/persistence.js
   FUNÇÃO: Gestão de Dados (Exportação TXT, Auto-save e Geração de String de Conteúdo).
*/

const persistence = {
    // Retorna o conteúdo atual do canvas formatado como string limpa respeitando a ordem do template
    getContentString() {
        let content = "";
        
        // 1. Metadados de Cabeçalho (Ordem: Nome -> Objetivo -> Macro -> Area -> Dono)
        const headerTags = ['nome', 'objetivo', 'macroprocesso', 'area', 'dono'];
        headerTags.forEach(tag => {
            const el = document.getElementById(`val-${tag}`);
            if (el && el.textContent.trim() !== "---") {
                // Usamos textContent para ignorar transformações de CSS (uppercase)
                content += `#${tag} ${el.textContent.trim()}\n`;
            }
        });
        content += "\n";

        // 2. Cards de Levantamento (Os 11 itens de survey)
        const surveyCards = document.querySelectorAll('.survey-card');
        let surveySection = "";
        renderer.config.forEach((conf, idx) => {
            const card = surveyCards[idx];
            if (card) {
                const pills = Array.from(card.querySelectorAll('.pill')).map(p => p.textContent.trim());
                if (pills.length > 0 && pills[0] !== "---") {
                    surveySection += `#${conf.id} ${pills.join(', ')}\n`;
                }
            }
        });
        if (surveySection) {
            content += surveySection + "\n";
        }

        // 3. Dicionário de Etapas (#etapas)
        const stepHeaders = document.querySelectorAll('.step-header-row');
        if (stepHeaders.length > 0) {
            content += "#etapas\n";
            stepHeaders.forEach(header => {
                const num = header.getAttribute('data-target-step');
                const nameEl = header.querySelector('.step-name-text');
                if (nameEl) {
                    // Remove o caractere ":" inicial se existir para exportação limpa
                    const name = nameEl.textContent.replace(/^:\s*/, '').trim();
                    content += `${num}: ${name}\n`;
                }
            });
            content += "\n";
        }

        // 4. Atividades do Fluxo (#atividade)
        const flowRows = document.querySelectorAll('.activity-row-card');
        flowRows.forEach((row) => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 7) {
                // Captura a Regra/Lógica limpando o prefixo
                const regraEl = cells[4].querySelector('.regra-box');
                let regraTxt = "";
                if (regraEl) {
                    regraTxt = regraEl.textContent.replace(/^Lógica:\s*/i, '').trim();
                }

                // Captura o ID da Atividade e remove preenchimento de zeros (001 -> 1)
                let activityId = row.querySelector('.activity-tag').textContent.trim();
                activityId = activityId.replace(/^0+/, ''); 

                const etapaNum = row.getAttribute('data-etapa') || "1";

                content += `#atividade ${activityId}\n`;
                content += `Etapa: ${etapaNum}\n`;
                content += `Fornecedor: ${cells[1].textContent.trim()}\n`;
                content += `Insumos: ${cells[2].textContent.trim()}\n`;
                content += `Ator: ${cells[3].textContent.trim()}\n`;
                content += `Atividades: ${cells[4].querySelector('.act-main-text').textContent.trim()}\n`;
                if (regraTxt && regraTxt !== "" && regraTxt !== "N/A") {
                    content += `Regra: ${regraTxt}\n`;
                }
                content += `Saídas: ${cells[5].textContent.trim()}\n`;
                content += `Cliente: ${cells[6].textContent.trim()}\n\n`;
            }
        });

        // 5. Observações Gerais
        const obsItems = document.querySelectorAll('.obs-row td');
        if (obsItems.length > 0) {
            content += `#observacoes\n`;
            obsItems.forEach(td => {
                content += `${td.textContent.trim()}\n`;
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
        
        // Para o nome do arquivo, mantemos o tratamento de caracteres especiais
        let nomeProc = document.getElementById('val-nome').textContent
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, '-')
            .toLowerCase();
            
        a.download = `${nomeProc || 'processo'}.txt`;
        a.click();
        
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }
};