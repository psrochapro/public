document.getElementById('bpmnFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    document.getElementById('fileName').textContent = file.name;

    const reader = new FileReader();
    reader.onload = function(e) {
        const xmlContent = e.target.result;
        parseBPMNSequentially(xmlContent);
    };
    reader.readAsText(file);
});

document.getElementById('btnCopy').addEventListener('click', function() {
    copyTableToClipboard();
});

function parseBPMNSequentially(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    
    const laneMap = {};
    const lanes = xmlDoc.getElementsByTagNameNS('*', 'lane');
    for (let lane of lanes) {
        const actorName = lane.getAttribute('name') || 'N/A';
        const nodeRefs = lane.getElementsByTagNameNS('*', 'flowNodeRef');
        for (let ref of nodeRefs) {
            laneMap[ref.textContent.trim()] = actorName;
        }
    }

    const taskTypes = ['task', 'userTask', 'serviceTask', 'sendTask', 'receiveTask', 'manualTask', 'businessRuleTask', 'scriptTask'];
    const tasksDetails = {};
    taskTypes.forEach(type => {
        const elements = xmlDoc.getElementsByTagNameNS('*', type);
        for (let el of elements) {
            const id = el.getAttribute('id');
            const name = el.getAttribute('name') || 'Sem nome';
            let obs = '';
            const doc = el.getElementsByTagNameNS('*', 'documentation');
            if (doc.length > 0) obs = doc[0].textContent.trim();
            tasksDetails[id] = { name, obs, type };
        }
    });

    const flowMap = {};
    const flows = xmlDoc.getElementsByTagNameNS('*', 'sequenceFlow');
    for (let flow of flows) {
        const src = flow.getAttribute('sourceRef');
        const tgt = flow.getAttribute('targetRef');
        if (!flowMap[src]) flowMap[src] = [];
        flowMap[src].push(tgt);
    }

    const startEvents = xmlDoc.getElementsByTagNameNS('*', 'startEvent');
    const tableData = [];
    const visited = new Set();
    const queue = [];

    for (let start of startEvents) {
        queue.push(start.getAttribute('id'));
    }

    while (queue.length > 0) {
        const currentId = queue.shift();
        if (visited.has(currentId)) continue;
        visited.add(currentId);

        if (tasksDetails[currentId]) {
            tableData.push({
                ator: laneMap[currentId] || 'Não identificado',
                atividade: tasksDetails[currentId].name,
                observacao: tasksDetails[currentId].obs
            });
        }

        const targets = flowMap[currentId];
        if (targets) {
            targets.forEach(tId => {
                if (!visited.has(tId)) queue.push(tId);
            });
        }
    }

    Object.keys(tasksDetails).forEach(id => {
        if (!visited.has(id)) {
            tableData.push({
                ator: laneMap[id] || 'Não identificado',
                atividade: tasksDetails[id].name,
                observacao: tasksDetails[id].obs
            });
            visited.add(id);
        }
    });

    renderTable(tableData);
}

function renderTable(data) {
    const container = document.getElementById('tableContainer');
    const actions = document.getElementById('actionsContainer');
    
    if (data.length === 0) {
        container.innerHTML = '<div class="empty-msg">Nenhuma atividade encontrada.</div>';
        actions.style.display = 'none';
        return;
    }

    actions.style.display = 'flex';

    let html = `
        <table id="resultTable">
            <thead>
                <tr>
                    <th class="col-order">N.º</th>
                    <th class="col-actor">Ator</th>
                    <th class="col-activity">Atividades no Diagrama</th>
                    <th class="col-obs">Observações</th>
                </tr>
            </thead>
            <tbody>
    `;

    data.forEach((item, index) => {
        html += `
            <tr>
                <td class="col-order">${index + 1}</td>
                <td class="col-actor"><strong>${item.ator}</strong></td>
                <td class="col-activity">${item.atividade}</td>
                <td class="col-obs obs-text">${item.observacao || '-'}</td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

async function copyTableToClipboard() {
    const table = document.getElementById('resultTable');
    if (!table) return;

    // Clonagem e Preparação da Tabela para o Google Docs
    const tableClone = table.cloneNode(true);
    
    // Configurações Gerais da Tabela
    tableClone.setAttribute('border', '1');
    tableClone.style.borderCollapse = 'collapse';
    tableClone.style.width = '100%';
    tableClone.style.fontFamily = 'Arial, sans-serif';
    tableClone.style.fontSize = '9pt';
    tableClone.style.lineHeight = '1.0';

    // Estilização das Células
    const allCells = tableClone.querySelectorAll('th, td');
    allCells.forEach(cell => {
        cell.style.border = '1px solid #333333';
        cell.style.padding = '4pt 6pt';
        cell.style.verticalAlign = 'middle';
        cell.style.color = '#000000';
    });

    // Cabeçalhos
    const headers = tableClone.querySelectorAll('th');
    headers.forEach(th => {
        th.style.backgroundColor = '#e0e0e0';
        th.style.fontWeight = 'bold';
        th.style.textAlign = 'center';
    });

    // Coluna N.º (Centralizada)
    tableClone.querySelectorAll('.col-order').forEach(c => {
        c.style.textAlign = 'center';
        c.style.width = '30pt';
    });

    // Coluna Ator (Centralizada e Fundo Cinza)
    tableClone.querySelectorAll('.col-actor').forEach(c => {
        c.style.textAlign = 'center';
        c.style.backgroundColor = '#f4f4f4';
        c.style.width = '100pt';
    });

    // Colunas de Texto (Alinhadas à esquerda)
    tableClone.querySelectorAll('.col-activity, .col-obs').forEach(c => {
        c.style.textAlign = 'left';
    });

    const htmlContent = tableClone.outerHTML;
    const blobHtml = new Blob([htmlContent], { type: 'text/html' });
    const blobText = new Blob([table.innerText], { type: 'text/plain' });

    try {
        await navigator.clipboard.write([
            new ClipboardItem({
                'text/html': blobHtml,
                'text/plain': blobText
            })
        ]);

        const btn = document.getElementById('btnCopy');
        btn.textContent = 'Tabela Pronta para o Docs!';
        btn.classList.add('success');
        
        setTimeout(() => {
            btn.textContent = 'Copiar para Template Google Docs';
            btn.classList.remove('success');
        }, 2000);

    } catch (err) {
        alert('Erro ao copiar automaticamente.');
    }
}