const renderer = {
    config: [
        { id: 'atores', label: 'Atores', icon: '👥' },
        { id: 'entradas', label: 'Entradas', icon: '📥' },
        { id: 'saidas', label: 'Saídas', icon: '📤' },
        { id: 'interessados', label: 'Interessados', icon: '👤' },
        { id: 'normas', label: 'Normas', icon: '⚖️' },
        { id: 'lgpd', label: 'LGPD', icon: '🛡️' },
        { id: 'recursos', label: 'Sistemas', icon: '💻' },
        { id: 'documentos', label: 'Documentos', icon: '📄' },
        { id: 'sgpe', label: 'SGPE', icon: '⌨️' },
        { id: 'indicadores', label: 'Indicadores', icon: '📊' },
        { id: 'gatilho', label: 'Gatilho', icon: '☝️' }
    ],

    render(data) {
        document.getElementById('val-nome').innerText = (data.nome || ['Design de Processo']).join(' ');
        document.getElementById('val-objetivo').innerText = (data.objetivo || ['---']).join(' ');
        document.getElementById('val-macroprocesso').innerText = (data.macroprocesso || ['---']).join(' ');
        document.getElementById('val-area').innerText = (data.area || ['---']).join(' ');
        document.getElementById('val-dono').innerText = (data.dono || ['---']).join(' ');

        // Render Inventory Compact
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
                    ${items.map(t => `<span class="modern-pill">${t}</span>`).join('') || '<span style="color:#444; font-size:10px">N/A</span>'}
                </div>
            `;
            invContainer.appendChild(card);
        });

        // Render Glass Table Flow
        const flowContainer = document.getElementById('flow-container');
        flowContainer.innerHTML = '';
        if (data.fluxo) {
            data.fluxo.forEach(item => {
                const row = document.createElement('div');
                row.className = 'flow-row glass';
                row.innerHTML = `
                    <div class="etapa-badge">${item.etapa || '-'}</div>
                    <div class="sub-info">
                        <b>Fornecedor</b> ${item.fornecedor || '-'}
                        <b style="margin-top:5px">Insumos</b> ${item.insumos || '-'}
                    </div>
                    <div class="actor-box">${item.ator || 'N/A'}</div>
                    <div class="activity-text">${item.atividades || '---'}</div>
                    <div class="sub-info">
                        <b>Saídas</b> ${item.saídas || item.saidas || '-'}
                        <b style="margin-top:5px">Cliente</b> ${item.cliente || '-'}
                    </div>
                `;
                flowContainer.appendChild(row);
            });
        }
    }
};