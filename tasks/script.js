let tasks = JSON.parse(localStorage.getItem("tasksFlow")) || [];
let currentFilter = 'all';

document.addEventListener("DOMContentLoaded", () => {
    renderTasks();
    updateDate();
    
    // Suporte ao Enter
    document.getElementById("taskInput").addEventListener("keypress", (e) => {
        if (e.key === "Enter") addTask();
    });
});

function updateDate() {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    document.getElementById("date-display").innerText = new Date().toLocaleDateString('pt-BR', options);
}

function addTask() {
    const input = document.getElementById("taskInput");
    const category = document.getElementById("categorySelect").value;

    if (input.value.trim() === "") return;

    const newTask = {
        id: Date.now(),
        text: input.value,
        category: category,
        completed: false
    };

    tasks.push(newTask);
    saveAndRender();
    input.value = "";
}

function toggleTask(id) {
    tasks = tasks.map(t => t.id === id ? {...t, completed: !t.completed} : t);
    saveAndRender();
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveAndRender();
}

function filterTasks(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText.toLowerCase().includes(filter) || (filter === 'all' && btn.innerText === 'Todas'));
    });
    renderTasks();
}

function clearCompleted() {
    tasks = tasks.filter(t => !t.completed);
    saveAndRender();
}

function saveAndRender() {
    localStorage.setItem("tasksFlow", JSON.stringify(tasks));
    renderTasks();
}

function renderTasks() {
    const list = document.getElementById("taskList");
    list.innerHTML = "";

    const filtered = tasks.filter(t => currentFilter === 'all' || t.category === currentFilter);

    filtered.forEach(task => {
        const li = document.createElement("li");
        li.className = `${task.completed ? 'completed' : ''} cat-${task.category}`;
        
        li.innerHTML = `
            <i class="${task.completed ? 'fas fa-check-circle' : 'far fa-circle'} btn-check" 
               onclick="toggleTask(${task.id})"></i>
            <span>${task.text}</span>
            <button class="delete-btn" onclick="deleteTask(${task.id})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        list.appendChild(li);
    });

    const pending = tasks.filter(t => !t.completed).length;
    document.getElementById("pendingCount").innerText = `${pending} tarefa(s) pendente(s)`;
}