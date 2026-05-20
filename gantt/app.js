// Dados Iniciais Conforme Especificação
const DEFAULT_DATA = [
    { id: 1, name: "1. Ambientação SEPLAN e Curso Preparatório", start: "2026-03-02", end: "2026-03-20", cat: "Integração", color: "#a8dadc" },
    { id: 2, name: "11. Relacionamento e Interação com EPROC/SEPLAN", start: "2026-03-02", end: "2027-02-28", cat: "Gestão", color: "#457b9d" },
    { id: 3, name: "7. Priorização do Mapeamento de Processos", start: "2026-04-10", end: "2026-09-30", cat: "Mapeamento", color: "#f1faee" },
    { id: 4, name: "8. Priorização da Melhoria de Processos (Legado)", start: "2026-04-10", end: "2026-10-10", cat: "Melhoria", color: "#e9c46a" },
    { id: 5, name: "10. Melhorias por meio de Ferramentas Tecnológicas", start: "2026-04-10", end: "2027-02-28", cat: "Tecnologia", color: "#8ecae6" },
    { id: 6, name: "2. Análise Organizacional (Diagnóstico)", start: "2026-04-28", end: "2026-05-10", cat: "Diagnóstico", color: "#ffb703" },
    { id: 7, name: "3. Desenvolvimento ou Melhoria do Planejamento Estratégico", start: "2026-05-10", end: "2026-06-10", cat: "Planejamento", color: "#2a9d8f" },
    { id: 8, name: "6. Núcleos de Gestão de Processos (NUPROC)", start: "2026-05-10", end: "2026-08-10", cat: "Gestão", color: "#457b9d" },
    { id: 9, name: "5. Cultura e Metodologia para Gestão por Processos", start: "2026-05-10", end: "2026-10-10", cat: "Cultura", color: "#e76f51" },
    { id: 10, name: "4. Identificação dos Processos Organizacionais", start: "2026-06-10", end: "2026-08-10", cat: "Mapeamento", color: "#f1faee" },
    { id: 11, name: "9. Monitoramento e Controle dos Processos", start: "2026-06-10", end: "2027-02-28", cat: "Gestão", color: "#457b9d" }
];

let tasks = JSON.parse(localStorage.getItem('gantt_tasks')) || DEFAULT_DATA;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    initTitle();
    renderAll();
});

function initTitle() {
    const title = localStorage.getItem('gantt_title');
    if (title) document.getElementById('main-title').innerText = title;
    
    document.getElementById('main-title').addEventListener('blur', (e) => {
        localStorage.setItem('gantt_title', e.target.innerText);
    });
}

function renderAll() {
    // Ordenar por data de início
    tasks.sort((a, b) => new Date(a.start) - new Date(b.start));
    
    renderTable();
    renderGantt();
    localStorage.setItem('gantt_tasks', JSON.stringify(tasks));
}

// Renderiza a Tabela de Edição
function renderTable() {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';

    tasks.forEach((task, index) => {
        const start = new Date(task.start);
        const end = new Date(task.end);
        const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="text" value="${task.name}" onchange="updateTask(${index}, 'name', this.value)"></td>
            <td><input type="text" value="${task.cat}" onchange="updateTask(${index}, 'cat', this.value)"></td>
            <td><input type="date" value="${task.start}" onchange="updateTask(${index}, 'start', this.value)"></td>
            <td><input type="date" value="${task.end}" onchange="updateTask(${index}, 'end', this.value)"></td>
            <td style="font-size: 12px; color: #666">${duration}d</td>
            <td><input type="color" value="${task.color || '#4a90e2'}" onchange="updateTask(${index}, 'color', this.value)"></td>
            <td><button class="btn btn-danger" onclick="removeTask(${index})" style="padding: 2px 8px;">×</button></td>
        `;
        tbody.appendChild(tr);
    });
}

// Renderiza o Gráfico de Gantt
function renderGantt() {
    const container = document.getElementById('gantt-container');
    container.innerHTML = '';

    if (tasks.length === 0) return;

    // Calcular limites do gráfico
    const dates = tasks.flatMap(t => [new Date(t.start), new Date(t.end)]);
    const minDate = new Date(Math.min(...dates));
    minDate.setDate(1); // Começar no dia 1 do mês inicial
    const maxDate = new Date(Math.max(...dates));
    maxDate.setMonth(maxDate.getMonth() + 1); // Estender um mês

    const totalDays = (maxDate - minDate) / (1000 * 60 * 60 * 24);

    // Criar cabeçalho de meses
    const header = document.createElement('div');
    header.className = 'gantt-header-months';
    let current = new Date(minDate);
    while (current < maxDate) {
        const monthBox = document.createElement('div');
        monthBox.className = 'month-col';
        monthBox.innerText = `${current.getMonth() + 1}/${current.getFullYear()}`;
        header.appendChild(monthBox);
        current.setMonth(current.getMonth() + 1);
    }
    container.appendChild(header);

    // Criar Linha de "Hoje"
    const today = new Date();
    if (today >= minDate && today <= maxDate) {
        const leftPercent = ((today - minDate) / (1000 * 60 * 60 * 24) / totalDays) * 100;
        const line = document.createElement('div');
        line.className = 'today-line';
        line.style.left = `calc(250px + ${leftPercent}%)`;
        container.appendChild(line);
    }

    // Criar linhas das tarefas
    tasks.forEach(task => {
        const taskStart = new Date(task.start);
        const taskEnd = new Date(task.end);
        
        const left = ((taskStart - minDate) / (1000 * 60 * 60 * 24) / totalDays) * 100;
        const width = ((taskEnd - taskStart) / (1000 * 60 * 60 * 24) / totalDays) * 100;

        const row = document.createElement('div');
        row.className = 'gantt-row';
        row.innerHTML = `
            <div class="task-label" title="${task.name}">${task.name}</div>
            <div class="timeline-area">
                <div class="bar" style="left: ${left}%; width: ${width}%; background-color: ${task.color || '#4a90e2'}">
                    ${width > 5 ? task.cat : ''}
                </div>
            </div>
        `;
        container.appendChild(row);
    });
}

// Funções de CRUD
function updateTask(index, field, value) {
    tasks[index][field] = value;
    renderAll();
}

function addTask() {
    const lastTask = tasks[tasks.length - 1];
    tasks.push({
        id: Date.now(),
        name: "Nova Atividade",
        start: lastTask ? lastTask.start : "2026-03-01",
        end: lastTask ? lastTask.end : "2026-03-31",
        cat: "Geral",
        color: "#4a90e2"
    });
    renderAll();
}

function removeTask(index) {
    if (confirm("Deseja excluir esta atividade?")) {
        tasks.splice(index, 1);
        renderAll();
    }
}

function resetData() {
    if (confirm("Isso apagará todas as alterações. Deseja continuar?")) {
        tasks = [...DEFAULT_DATA];
        renderAll();
    }
}

// Exportação e Importação
function exportToPNG() {
    const area = document.getElementById('gantt-capture-area');
    html2canvas(area).then(canvas => {
        const link = document.createElement('a');
        link.download = 'cronograma-gantt.png';
        link.href = canvas.toDataURL();
        link.click();
    });
}

function exportToJSON() {
    const dataStr = JSON.stringify({ title: document.getElementById('main-title').innerText, tasks: tasks });
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "cronograma.json";
    link.click();
}

function importFromJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            if (imported.tasks) {
                tasks = imported.tasks;
                if (imported.title) document.getElementById('main-title').innerText = imported.title;
                renderAll();
            }
        } catch (err) {
            alert("Erro ao ler o arquivo JSON.");
        }
    };
    reader.readAsText(file);
}