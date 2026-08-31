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

function parseBPMNSequentially(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    
    // 1. Mapear Atores (Lanes) -> Atividades
    const laneMap = {}; // elementId -> laneName
    const lanes = xmlDoc.getElementsByTagNameNS('*', 'lane');
    for (let lane of lanes) {
        const actorName = lane.getAttribute('name') || 'N/A';
        const nodeRefs = lane.getElementsByTagNameNS('*', 'flowNodeRef');
        for (let ref of nodeRefs) {
            laneMap[ref.textContent.trim()] = actorName;
        }
    }

    // 2. Mapear detalhes de todas as Tasks
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

    // 3. Mapear Fluxos (sequenceFlow)
    const flowMap = {}; // sourceRef -> [targetRefs]
    const flows = xmlDoc.getElementsByTagNameNS('*', 'sequenceFlow');
    for (let flow of flows) {
        const src = flow.getAttribute('sourceRef');
        const tgt = flow.getAttribute('targetRef');
        if (!flowMap[src]) flowMap[src] = [];
        flowMap[src].push(tgt);
    }

    // 4. Encontrar Start Event(s)
    const startEvents = xmlDoc.getElementsByTagNameNS('*', 'startEvent');
    const tableData = [];
    const visited = new Set();
    const queue = [];

    // Adicionar todos os pontos de partida na fila
    for (let start of startEvents) {
        queue.push(start.getAttribute('id'));
    }

    // 5. Travessia do Fluxo (BFS Adaptado para ordem temporal)
    while (queue.length > 0) {
        const currentId = queue.shift();
        if (visited.has(currentId)) continue;
        visited.add(currentId);

        // Se o nó atual for uma Task, adiciona na tabela
        if (tasksDetails[currentId]) {
            tableData.push({
                ator: laneMap[currentId] || 'Não identificado',
                atividade: tasksDetails[currentId].name,
                observacao: tasksDetails[currentId].obs
            });
        }

        // Adiciona os próximos nós na fila baseado no SequenceFlow
        const targets = flowMap[currentId];
        if (targets) {
            targets.forEach(tId => {
                if (!visited.has(tId)) queue.push(tId);
            });
        }
    }

    // 6. Backup: Adicionar tasks que não foram alcançadas pelo fluxo (tasks órfãs)
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
    
    if (data.length === 0) {
        container.innerHTML = '<div class="empty-msg">Nenhuma atividade encontrada no arquivo.</div>';
        return;
    }

    let html = `
        <table>
            <thead>
                <tr>
                    <th class="col-order">#</th>
                    <th class="col-actor">Ator</th>
                    <th class="col-activity">Atividade</th>
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

    html += `
            </tbody>
        </table>
    `;

    container.innerHTML = html;
}