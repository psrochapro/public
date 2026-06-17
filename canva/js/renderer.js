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
        // Header Slim Premium
        document.getElementById('val-nome').innerText = (data.nome || ['Design de Processo']).join(' ');
        document.getElementById('val-objetivo').innerText = (data.objetivo || ['---']).join(' ');
        document.getElementById('val-macroprocesso').innerText = (data.macroprocesso || ['---']).join(' ');
        document.getElementById('val-area').innerText = (data.area || ['---']).join(' ');
        document.getElementById('val-dono').innerText = (data.dono || ['---']).join(' ');

        // Inventory Grid
        const invContainer = document.getElementById('inventory-container');
        invContainer.innerHTML = '';
        this.config.forEach(conf => {
            let rawData = data[conf.id] || data[conf.id.replace('saidas', 'saídas')] || [];
            let items = [];
            rawData.forEach(line => items.push(...line.split(',').map(p => p.trim()).filter(p => p !== "")));
            
            const card = document.createElement('div');
            card.className = 'inventory-card glass';
            card.style.padding = '15px';
            card.innerHTML = `
                <div class="card-header" style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                    <span style="font-size:1.2rem;">${conf.icon}</span>
                    <span style="font-size:0.75rem; font-weight:800; color:#10b981; text-transform:uppercase;">${conf.label}</span>
                </div>
                <div class="card-pills">
                    ${items.map(t => `<span class="modern-pill">${t}</span>`).join('') || '---'}
                </div>
            `;
            invContainer.appendChild(card);
        });

        // Tabela de Fluxo Crystal
        const flowContainer = document.getElementById('flow-container');
        flowContainer.innerHTML = '';
        if (data.fluxo) {
            data.fluxo.forEach(item => {
                const row = document.createElement('div');
                row.className = 'flow-row';
                row.innerHTML = `
                    <div class="cell-etapa">${item.etapa || '-'}</div>
                    <div class="cell-data">${item.fornecedor || '-'}</div>
                    <div class="cell-data">${item.insumos || '-'}</div>
                    <div class="cell-col"><span class="cell-actor">${item.ator || '-'}</span></div>
                    <div class="cell-desc">${item.atividades || '-'}</div>
                    <div class="cell-data">${item.saídas || item.saidas || '-'}</div>
                    <div class="cell-data">${item.cliente || '-'}</div>
                `;
                flowContainer.appendChild(row);
            });
        }
    }
};