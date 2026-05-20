// Dados Iniciais
const DEFAULT_DATA = [
    { id: 1, name: "1. Ambientação SEPLAN", start: "2026-03-02", end: "2026-03-20", cat: "Integração", color: "#a8dadc" },
    { id: 2, name: "11. Relacionamento EPROC", start: "2026-03-02", end: "2027-02-28", cat: "Gestão", color: "#457b9d" }
];

let tasks = [];

// Tenta carregar do LocalStorage, se falhar ou estiver vazio, usa o padrão
try {
    const saved = localStorage.getItem('gantt_tasks');
    tasks = (saved && JSON.parse(saved).length > 0) ? JSON.parse(saved) : [...DEFAULT_DATA];
} catch (e) {
    tasks = [...DEFAULT_DATA];
}

document.addEventListener('DOMContentLoaded', () => {
    initTitle();
    renderAll();
});

function initTitle() {
    const title = localStorage.getItem('gantt_title') || "Plano de Ação - SEPLAN 2026";
    const titleEl = document.getElementById('main-title');
    if (titleEl) {
        titleEl.innerText = title;
        titleEl.addEventListener('blur', (e) => {
            localStorage.setItem('gantt_title', e.target.innerText);
        });
    }
}

function renderAll() {
    // Ordenação segura
    tasks.sort((a, b) => new Date(a.start) - new Date(b.start));
    
    renderTable();
    renderGantt();
    
    // Salva o estado atual
    localStorage.setItem('gantt_tasks', JSON.stringify(tasks));
}

function renderTable() {
    const tbody = document.getElementById('table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    tasks.forEach((task, index) => {
        const start = new Date(task.start + "T00:00:00");
        const end = new Date(task.end + "T00:00:00");
        const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 0;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="text" value="${task.name}" onchange="updateTask(${index}, 'name', this.value)"></td>
            <td><input type="text" value="${task.cat}" onchange="updateTask(${index}, 'cat', this.value)"></td>
            <td><input type="date" value="${task.start}" onchange="updateTask(${index}, 'start', this.value)"></td>
            <td><input type="date" value="${task.end}" onchange="updateTask(${index}, 'end', this.value)"></td>
            <td style="font-size: 11px;">${diff}d</td>
            <td><input type="color" value="${task.color || '#4a90e2'}" onchange="updateTask(${index}, 'color', this.value)"></td>
            <td><button class="btn btn-danger" onclick="removeTask(${index})" style="padding: 2px 8px;">×</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function renderGantt() {
    const container = document.getElementById('gantt-container');
    if (!container) return;
    container.innerHTML = '';

    // Se não houver tarefas, exibe aviso e sai da função para não quebrar o JS
    if (tasks.length === 0) {
        container.innerHTML = '<p style="padding:20px; color:#999; text-align:center;">Nenhuma atividade cadastrada.</p>';
        return;
    }

    // Cálculo de limites de data (Proteção contra datas inválidas)
    const dates = tasks.flatMap(t => [new Date(t.start + "T00:00:00"), new Date(t.end + "T00:00:00")]);
    let minDate = new Date(Math.min(...dates));
    let maxDate = new Date(Math.max(...dates));

    // Fallback se as datas forem inválidas
    if (isNaN(minDate)) minDate = new Date();
    if (isNaN(maxDate)) maxDate = new Date();

    minDate.setDate(1); 
    maxDate.setMonth(maxDate.getMonth() + 2); // Espaço extra no final

    const totalDays = (maxDate - minDate) / (1000 * 60 * 60 * 24);

    // Gerar Cabeçalho de Meses
    const header = document.createElement('div');
    header.className = 'gantt-header-months';
    let tempDate = new Date(minDate);
    while (tempDate < maxDate) {
        const mCol = document.createElement('div');
        mCol.className = 'month-col';
        mCol.innerText = `${tempDate.getMonth() + 1}/${tempDate.getFullYear()}`;
        header.appendChild(mCol);
        tempDate.setMonth(tempDate.getMonth() + 1);
    }
    container.appendChild(header);

    // Linha do Dia Atual
    const today = new Date();
    if (today >= minDate && today <= maxDate) {
        const leftP = ((today - minDate) / (1000 * 60 * 60 * 24) / totalDays) * 100;
        const line = document.createElement('div');
        line.className = 'today-line';
        line.style.left = `calc(250px + ${leftP}%)`;
        container.appendChild(line);
    }

    // Desenhar Barras
    tasks.forEach(task => {
        const tStart = new Date(task.start + "T00:00:00");
        const tEnd = new Date(task.end + "T00:00:00");
        
        const left = ((tStart - minDate) / (1000 * 60 * 60 * 24) / totalDays) * 100;
        const width = ((tEnd - tStart) / (1000 * 60 * 60 * 24) / totalDays) * 100;

        const row = document.createElement('div');
        row.className = 'gantt-row';
        row.innerHTML = `
            <div class="task-label">${task.name}</div>
            <div class="timeline-area">
                <div class="bar" style="left: ${left}%; width: ${width}%; background-color: ${task.color || '#4a90e2'}">
                    <span style="overflow:hidden; text-overflow:ellipsis;">${width > 8 ? task.cat : ''}</span>
                </div>
            </div>
        `;
        container.appendChild(row);
    });
}

function updateTask(index, field, value) {
    tasks[index][field] = value;
    renderAll();
}

function addTask() {
    const todayStr = new Date().toISOString().split('T')[0];
    tasks.push({
        id: Date.now(),
        name: "Nova Atividade",
        start: todayStr,
        end: todayStr,
        cat: "Geral",
        color: "#4a90e2"
    });
    renderAll();
}

function removeTask(index) {
    if (confirm("Excluir esta atividade?")) {
        tasks.splice(index, 1);
        renderAll();
    }
}

function resetData() {
    if (confirm("Resetar para os dados originais?")) {
        tasks = JSON.parse(JSON.stringify(DEFAULT_DATA));
        renderAll();
    }
}

function exportToJSON() {
    const dataStr = JSON.stringify({ 
        title: document.getElementById('main-title').innerText, 
        tasks: tasks 
    }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "cronograma.json";
    a.click();
}

function importFromJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            if (imported.tasks && Array.isArray(imported.tasks)) {
                tasks = imported.tasks;
                if (imported.title) document.getElementById('main-title').innerText = imported.title;
                renderAll();
                alert("Dados importados com sucesso!");
            }
        } catch (err) {
            alert("Erro ao importar: Arquivo JSON inválido.");
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // Limpa o input para permitir re-importar o mesmo arquivo
}

function exportToPNG() {
    const area = document.getElementById('gantt-capture-area');
    html2canvas(area, { backgroundColor: "#ffffff" }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'gantt-seplan.png';
        link.href = canvas.toDataURL();
        link.click();
    });
}