// Carregar tarefas ao abrir
document.addEventListener("DOMContentLoaded", loadTasks);

function addTask() {
    let input = document.getElementById("taskInput");
    if (input.value === "") return;

    let li = document.createElement("li");
    li.innerHTML = `${input.value} <button onclick="this.parentElement.remove(); saveTasks()">X</button>`;
    document.getElementById("taskList").appendChild(li);
    
    input.value = "";
    saveTasks();
}

function saveTasks() {
    let tasks = [];
    document.querySelectorAll("#taskList li").forEach(li => {
        tasks.push(li.innerText.replace("X", "").trim());
    });
    localStorage.setItem("minhasTarefas", JSON.stringify(tasks));
}

function loadTasks() {
    let tasks = JSON.parse(localStorage.getItem("minhasTarefas"));
    if (!tasks) return;
    tasks.forEach(task => {
        let li = document.createElement("li");
        li.innerHTML = `${task} <button onclick="this.parentElement.remove(); saveTasks()">X</button>`;
        document.getElementById("taskList").appendChild(li);
    });
}