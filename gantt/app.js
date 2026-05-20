// Dados Iniciais de Segurança
const DEFAULT_DATA = [
    { id: 1, name: "1. Ambientação SEPLAN e Curso Preparatório", start: "2026-03-02", end: "2026-03-20", cat: "Integração", color: "#a8dadc" },
    { id: 2, name: "11. Relacionamento e Interação com EPROC/SEPLAN", start: "2026-03-02", end: "2027-02-28", cat: "Gestão", color: "#457b9d" }
];

let tasks = [];

// 1. CARREGAMENTO INICIAL
window.onload = () => {
    loadData();
    initTitle();
    renderAll();
};

function loadData() {
    try {
        const saved = localStorage.getItem('gantt_tasks');
        if (saved) {
            tasks = JSON.parse(saved);
        } 
        if (!tasks || tasks.length === 0) {
            tasks = JSON.parse(JSON.stringify(DEFAULT_DATA));
        }
    } catch (e) {
        console.error("Erro ao carregar LocalStorage:", e);
        tasks = JSON.parse(JSON.stringify(DEFAULT_DATA));
    }
}

function initTitle() {
    const title = localStorage.getItem('gantt_title') || "Plano de Ação - SEPLAN 2026";
    const el = document.getElementById('main-title');
    if(el) {
        el.innerText = title;
        el.onblur = () => localStorage.setItem('gantt_title', el.innerText);
    }
}

// 2. RENDERIZAÇÃO
function renderAll() {
    // Ordena por data
    tasks.sort((a, b) => new Date(a.start) - new Date(b.start));
    
    renderTable();
    renderGantt();
    
    // Salva estado
    localStorage.setItem('gantt_tasks', JSON.stringify(tasks));
}

function renderTable() {
    const tbody = document.getElementById('table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    tasks.forEach((task, index) => {
        const d1 = new Date(task.start + "T00:00:00");
        const d2 = new Date(task.end + "T00:00:00");
        const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)) || 0;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="text" value="${task.name}" oninput="updateTask(${index}, 'name', this.value)"></td>
            <td><input type="text" value="${task.cat}" oninput="updateTask(${index}, 'cat', this.value)"></td>
            <td><input type="date" value="${task.start}" onchange="updateTask(${index}, 'start', this.value)"></td>
            <td><input type="date" value="${task.end}" onchange="updateTask(${index}, 'end', this.value)"></td>
            <td style="font-size:11px; font-weight:bold">${diff}d</td>
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

    if (tasks.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:20px;">Nenhuma atividade para exibir.</p>';
        return;
    }

    // Calcular escala
    const allDates = tasks.flatMap(t => [new Date(t.start + "T00:00:00"), new Date(t.end + "T00:00:00")]);
    let minDate = new Date(Math.min(...allDates));
    let maxDate = new Date(Math.max(...allDates));

    minDate.setDate(1); 
    maxDate.setMonth(maxDate.getMonth() + 2); // Margem de folga

    const totalDays = (maxDate - minDate) / (1000 * 60 * 60 * 24);

    // Header Meses
    const header = document.createElement('div');
    header.className = 'gantt-header-months';
    let temp = new Date(minDate);
    while (temp < maxDate) {
        const mCol = document.createElement('div');
        mCol.className = 'month-col';
        mCol.innerText = `${temp.getMonth() + 1}/${temp.getFullYear()}`;
        header.appendChild(mCol);
        temp.setMonth(temp.setMonth() + 1);
    }
    container.appendChild(header);

    // Hoje
    const today = new Date();
    if (today >= minDate && today <= maxDate) {
        const left = ((today - minDate) / (1000 * 60 * 60 * 24) / totalDays) * 100;
        const line = document.createElement('div');
        line.className = 'today-line';
        line.style.left = `calc(250px + ${left}%)`;
        container.appendChild(line);
    }

    // Linhas
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
                    <span>${width > 10 ? task.cat : ''}</span>
                </div>
            </div>
        `;
        container.appendChild(row);
    });
}

// 3. AÇÕES (Expostas globalmente)
window.updateTask = (index, field, value) => {
    tasks[index][field] = value;
    renderAll();
};

window.addTask = () => {
    const today = new Date().toISOString().split('T')[0];
    tasks.push({
        id: Date.now(),
        name: "Nova Atividade",
        start: today,
        end: today,
        cat: "Geral",
        color: "#4a90e2"
    });
    renderAll();
};

window.removeTask = (index) => {
    if(confirm("Excluir esta atividade?")) {
        tasks.splice(index, 1);
        renderAll();
    }
};

window.resetData = () => {
    if(confirm("Isso apagará tudo e voltará ao padrão. Confirmar?")) {
        localStorage.clear();
        tasks = JSON.parse(JSON.stringify(DEFAULT_DATA));
        renderAll();
        location.reload();
    }
};

window.exportToJSON = () => {
    const data = { title: document.getElementById('main-title').innerText, tasks: tasks };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "cronograma.json";
    a.click();
};

window.importFromJSON = (event) => {
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
                alert("Importado com sucesso!");
            }
        } catch (err) {
            alert("Erro ao ler JSON: arquivo inválido.");
        }
    };
    reader.readAsText(file);
};

window.exportToPNG = () => {
    const area = document.getElementById('gantt-capture-area');
    html2canvas(area, { backgroundColor: "#ffffff", scale: 2 }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'cronograma.png';
        link.href = canvas.toDataURL();
        link.click();
    });
};