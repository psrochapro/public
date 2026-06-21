const renderer = {
    config: [
        { id: 'atores', label: 'Atores Envolvidos', icon: '👥', desc: 'Participantes que desempenham atividades.' },
        { id: 'entradas', label: 'Principais Entradas', icon: '📥', desc: 'Fatos ou materiais que iniciam o processo.' },
        { id: 'saidas', label: 'Principais Saídas', icon: '📤', desc: 'Resultados gerados (documentos, formulários).' },
        { id: 'interessados', label: 'Interessados', icon: '👤', desc: 'Beneficiários que recebem os resultados.' },
        { id: 'normas', label: 'Leis e Normas Aplicadas', icon: '⚖️', desc: 'Leis ou normas que disciplinam a execução.' },
        { id: 'lgpd', label: 'Gestão LGPD', icon: '🛡️', desc: 'Dados pessoais envolvidos no processo.' },
        { id: 'recursos', label: 'Recursos Tecnológicos', icon: '💻', desc: 'Sistemas e ferramentas de apoio.' },
        { id: 'documentos', label: 'Gestão Documental CPAD', icon: '📄', desc: 'Documentos e temporalidade de guarda.' },
        { id: 'sgpe', label: 'Parâmetros SGPE', icon: '⌨️', desc: 'Assunto, Classe e Sigilo definidos.' },
        { id: 'indicadores', label: 'Indicadores de Performance', icon: '📊', desc: 'Métricas de resultado do processo.' },
        { id: 'gatilho', label: 'Gatilho de Início', icon: '☝️', desc: 'Evento exato que dispara o processo.' }
    ],

    render(data) {
        document.getElementById('val-nome').innerText = (data.nome || ['---']).join(' ');
        document.getElementById('val-macroprocesso').innerText = (data.macroprocesso || ['---']).join(' ');
        document.getElementById('val-area').innerText = (data.area || ['---']).join(' ');
        document.getElementById('val-dono').innerText = (data.dono || ['---']).join(' ');
        document.getElementById('val-objetivo').innerText = (data.objetivo || ['---']).join(' ');

        const totalAtividades = data.fluxo ? data.fluxo.length : 0;
        document.getElementById('val-total-atividades').innerText = totalAtividades;

        const surveyContainer = document.getElementById('survey-container');
        surveyContainer.innerHTML = '';
        
        this.config.forEach((item, index) => {
            let rawData = data[item.id] || data[item.id.replace('saidas', 'saídas')] || [];
            let itemsToRender = [];
            rawData.forEach(line => itemsToRender.push(...line.split(',').map(p => p.trim()).filter(p => p !== "")));
            
            const semanticStyle = {
                'lgpd': 'background-color: #e3f2fd; border-color: #bbdefb;',
                'normas': 'background-color: #fff3e0; border-color: #ffe0b2;',
                'entradas': 'background-color: #e8f5e9; border-color: #c8e6c9;',
                'saidas': 'background-color: #fce4ec; border-color: #f8bbd0;',
                'indicadores': 'background-color: #f3e5f5; border-color: #e1bee7;'
            }[item.id] || '';

            const pillsHtml = itemsToRender.map(txt => `<span class="pill" style="${semanticStyle}">${txt}</span>`).join('');
            
            surveyContainer.innerHTML += `
                <div class="survey-card" data-survey-id="${item.id}">
                    <div class="card-info-side">
                        <div class="card-num">${(index + 1).toString().padStart(2, '0')}</div>
                        <div class="card-icon-box">${item.icon}</div>
                        <div class="card-text-content">
                            <div class="card-item-name">${item.label}</div>
                            <div class="card-item-desc">${item.desc}</div>
                        </div>
                    </div>
                    <div class="card-responses-side">
                        <div class="pill-container">${pillsHtml || '<span style="color:#ccc">---</span>'}</div>
                    </div>
                </div>`;
        });

        const flowItemsContainer = document.getElementById('flow-items-container');
        flowItemsContainer.innerHTML = '';
        
        if (data.fluxo && data.fluxo.length > 0) {
            const grupos = {};
            data.fluxo.forEach((item, index) => {
                const eNum = item.etapa || "1";
                if (!grupos[eNum]) grupos[eNum] = [];
                grupos[eNum].push({ ...item, originalIndex: index });
            });

            Object.keys(grupos).sort((a, b) => parseInt(a) - parseInt(b)).forEach(eNum => {
                const etapaNome = data.mapaEtapas[eNum];
                const warning = !etapaNome ? `<span class="step-warning">Etapa ${eNum} não declarada no índice</span>` : '';
                
                const headerRow = document.createElement('tr');
                headerRow.className = 'step-header-row';
                headerRow.setAttribute('data-target-step', eNum);
                
                headerRow.innerHTML = `
                    <td colspan="7">
                        <div class="step-header-content">
                            <span class="step-header-indicator">▼</span>
                            <div class="step-header-label">
                                <span>🏷️ ETAPA ${eNum}${etapaNome ? ':' : ''}</span>
                                ${etapaNome ? `<span class="step-name-text">${etapaNome}</span>` : warning}
                            </div>
                        </div>
                    </td>
                `;
                headerRow.onclick = () => this.toggleStep(eNum);
                flowItemsContainer.appendChild(headerRow);

                grupos[eNum].forEach(item => {
                    const activityId = (item.numero || (item.originalIndex + 1)).toString().padStart(3, '0');
                    const stepValue = parseInt(item.etapa) || 1;
                    const stepColorClass = `step-b${((stepValue - 1) % 5) + 1}`;
                    const regraHtml = item.regra ? `<div class="regra-box"><strong>Lógica:</strong> ${item.regra}</div>` : '';
                    
                    const row = document.createElement('tr');
                    row.className = 'activity-row-card';
                    row.setAttribute('data-etapa', eNum);
                    row.innerHTML = `
                        <td>
                            <div class="step-col-container">
                                <div class="step-bubble ${stepColorClass}">${item.etapa || '-'}</div>
                                <div class="activity-tag">${activityId}</div>
                            </div>
                        </td>
                        <td>${item.fornecedor || ''}</td>
                        <td>${item.insumos || ''}</td>
                        <td class="actor-cell"><span class="actor-badge">${item.ator || ''}</span></td>
                        <td class="highlight-col">
                            <div class="act-main-text">${item.atividades || ''}</div>
                            ${regraHtml}
                        </td>
                        <td>${item.saídas || item.saidas || ''}</td>
                        <td>${item.cliente || ''}</td>
                    `;
                    flowItemsContainer.appendChild(row);
                });
            });
        }

        const obsContainer = document.getElementById('obs-section-container');
        if (data.observacoes && data.observacoes.length > 0) {
            const obsRowsHtml = data.observacoes.map(o => `<tr class="obs-row"><td>${o}</td></tr>`).join('');
            obsContainer.innerHTML = `
                <table class="obs-table-styled">
                    <thead><tr><th>📝 Observações Gerais</th></tr></thead>
                    <tbody>${obsRowsHtml}</tbody>
                </table>`;
        } else {
            obsContainer.innerHTML = '';
        }
    },

    toggleStep(stepNum) {
        const header = document.querySelector(`.step-header-row[data-target-step="${stepNum}"]`);
        const rows = document.querySelectorAll(`.activity-row-card[data-etapa="${stepNum}"]`);
        if (!header) return;
        const isCollapsed = header.classList.toggle('collapsed');
        rows.forEach(row => {
            if (isCollapsed) row.classList.add('row-hidden');
            else row.classList.remove('row-hidden');
        });
    },

    toggleAllSteps(expand) {
        const headers = document.querySelectorAll('.step-header-row');
        headers.forEach(header => {
            const stepNum = header.getAttribute('data-target-step');
            const rows = document.querySelectorAll(`.activity-row-card[data-etapa="${stepNum}"]`);
            if (expand) {
                header.classList.remove('collapsed');
                rows.forEach(row => row.classList.remove('row-hidden'));
            } else {
                header.classList.add('collapsed');
                rows.forEach(row => row.classList.add('row-hidden'));
            }
        });
    }
};