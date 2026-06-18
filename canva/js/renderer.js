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

        // Atualizar Contador de Atividades
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

            const pillsHtml = itemsToRender.map(txt => 
                `<span class="pill" style="${semanticStyle}">${txt}</span>`
            ).join('');
            
            surveyContainer.innerHTML += `
                <div class="survey-card">
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
        if (data.fluxo) {
            data.fluxo.forEach(item => {
                flowItemsContainer.innerHTML += `
                    <tr class="activity-row-card">
                        <td class="step-num">${item.etapa || '-'}</td>
                        <td>${item.fornecedor || ''}</td>
                        <td>${item.insumos || ''}</td>
                        <td>${item.ator || ''}</td>
                        <td class="highlight-col">${item.atividades || ''}</td>
                        <td>${item.saídas || item.saidas || ''}</td>
                        <td>${item.cliente || ''}</td>
                    </tr>`;
            });
        }
    }
};