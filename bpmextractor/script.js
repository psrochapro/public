document.getElementById('bpmnFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    document.getElementById('fileName').textContent = file.name;

    const reader = new FileReader();
    reader.onload = function(e) {
        const xmlContent = e.target.result;
        parseBPMN(xmlContent);
    };
    reader.readAsText(file);
});

function parseBPMN(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const container = document.getElementById('tableContainer');
    
    // Tipos de elementos que podem conter atividades
    const taskTypes = [
        'task', 'userTask', 'serviceTask', 'sendTask', 
        'receiveTask', 'manualTask', 'businessRuleTask', 'scriptTask'
    ];

    // Mapear todas as tarefas por ID para busca rápida
    const tasksMap = {};
    taskTypes.forEach(type => {
        const elements = xmlDoc.getElementsByTagNameNS('*', type);
        for (let el of elements) {
            const id = el.getAttribute('id');
            const name = el.getAttribute('name') || 'Sem nome';
            
            // Buscar documentação
            let docText = '';
            const docElements = el.getElementsByTagNameNS('*', 'documentation');
            if (docElements.length > 0) {
                docText = docElements[0].textContent.trim();
            }

            tasksMap[id] = {
                name: name,
                obs: docText
            };
        }
    });

    // Buscar as Lanes (Atores)
    const lanes = xmlDoc.getElementsByTagNameNS('*', 'lane');
    const tableData = [];

    if (lanes.length > 0) {
        for (let lane of lanes) {
            const actorName = lane.getAttribute('name') || 'Ator não definido';
            const nodeRefs = lane.getElementsByTagNameNS('*', 'flowNodeRef');
            
            for (let ref of nodeRefs) {
                const taskId = ref.textContent.trim();
                if (tasksMap[taskId]) {
                    tableData.push({
                        ator: actorName,
                        atividade: tasksMap[taskId].name,
                        observacao: tasksMap[taskId].obs
                    });
                }
            }
        }
    }

    renderTable(tableData);
}

function renderTable(data) {
    const container = document.getElementById('tableContainer');
    
    if (data.length === 0) {
        container.innerHTML = '<div class="empty-msg">Nenhuma atividade encontrada no arquivo selecionado.</div>';
        return;
    }

    let html = `
        <table>
            <thead>
                <tr>
                    <th style="width: 20%;">Ator</th>
                    <th style="width: 40%;">Atividade</th>
                    <th style="width: 40%;">Observações</th>
                </tr>
            </thead>
            <tbody>
    `;

    data.forEach(item => {
        html += `
            <tr>
                <td><strong>${item.ator}</strong></td>
                <td>${item.atividade}</td>
                <td class="obs-text">${item.observacao || '-'}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    container.innerHTML = html;
}