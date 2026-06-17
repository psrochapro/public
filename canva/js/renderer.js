const renderer = {
    config: [
        { id: 'atores', label: 'Atores Envolvidos', icon: '👥' },
        { id: 'entradas', label: 'Principais Entradas', icon: '📥' },
        { id: 'saidas', label: 'Principais Saídas', icon: '📤' },
        { id: 'interessados', label: 'Interessados', icon: '👤' },
        { id: 'normas', label: 'Leis e Normas Aplicadas', icon: '⚖️' },
        { id: 'lgpd', label: 'Gestão LGPD', icon: '🛡️' },
        { id: 'recursos', label: 'Recursos Tecnológicos', icon: '💻' },
        { id: 'documentos', label: 'Gestão Documental', icon: '📄' },
        { id: 'sgpe', label: 'Parâmetros SGPE', icon: '⌨️' },
        { id: 'indicadores', label: 'Indicadores', icon: '📊' },
        { id: 'gatilho', label: 'Gatilho de Início', icon: '☝️' }
    ],

    render(data) {
        // Render Header
        document.getElementById('val-nome').innerText = (data.nome || ['Design de Processo']).join(' ');
        document.getElementById('val-objetivo').innerText = (data.objetivo || ['---']).join(' ');
        document.getElementById('val-macroprocesso').innerText = (data.macroprocesso || ['---']).join(' ');
        document.getElementById('val-area').innerText = (data.area || ['---']).join(' ');
        document.getElementById('val-dono').innerText = (data.dono || ['---']).join(' ');

        // Render Inventory Cards
        const invContainer = document.getElementById('inventory-container');
        invContainer.innerHTML = '';
        this.config.forEach(conf => {
            let rawData = data[conf.id] || data[conf.id.replace('saidas', 'saídas')] || [];
            let items = [];
            rawData.forEach(line => items.push(...line.split(',').map(p => p.trim()).filter(p => p !== "")));
            
            const card = document.createElement('div');
            card.className = 'inventory-card glass';
            card.innerHTML = `
                <div class="card-header">
                    <span class="card-icon">${conf.icon}</span>
                    <span class="card-title">${conf.label}</span>
                </div>
                <div class="card-pills">
                    ${items.map(t => `<span class="modern-pill">${t}</span>`).join('') || '<span style="color:#555">Nenhum dado</span>'}
                </div>
            `;
            invContainer.appendChild(card);
        });

        // Render Timeline Flow
        const flowContainer = document.getElementById('flow-container');
        flowContainer.innerHTML = '';
        if (data.fluxo) {
            data.fluxo.forEach(item => {
                const step = document.createElement('div');
                step.className = 'timeline-item';
                step.innerHTML = `
                    <div class="step-number">${item.etapa || '?'}</div>
                    <div class="timeline-content glass">
                        <div class="act-main">
                            <div class="act-title">Atividade</div>
                            <div class="act-detail">${item.atividades || '---'}</div>
                            <div class="act-actor">Executor: ${item.ator || 'N/A'}</div>
                        </div>
                        <div class="side-data">
                            <h4>Insumos</h4>
                            <p>${item.insumos || '---'}</p>
                            <h4 style="margin-top:15px">Fornecedor</h4>
                            <p>${item.fornecedor || '---'}</p>
                        </div>
                        <div class="side-data">
                            <h4>Saídas</h4>
                            <p>${item.saídas || item.saidas || '---'}</p>
                            <h4 style="margin-top:15px">Cliente</h4>
                            <p>${item.cliente || '---'}</p>
                        </div>
                    </div>
                `;
                flowContainer.appendChild(step);
            });
        }
    }
};