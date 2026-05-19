let fullData = null;
let currentKey = null; // Chave da seção atual
let editingIndex = null;
let isRootArray = false; // Se o JSON original é um array simples

const menu = document.getElementById('sections-menu');
const content = document.getElementById('content-area');
const title = document.getElementById('current-section-title');
const controls = document.getElementById('list-controls');

// 1. Carregamento e Inteligência de Estrutura
document.getElementById('upload-json').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const result = JSON.parse(event.target.result);
            fullData = result;
            isRootArray = Array.isArray(result);
            
            if (isRootArray) {
                currentKey = "root_list";
                menu.innerHTML = '<div class="menu-item active"><i class="fas fa-list"></i> Lista Principal</div>';
            } else {
                generateMenu();
                currentKey = Object.keys(fullData)[0];
            }
            selectSection(currentKey);
        } catch (err) { alert("JSON Inválido"); }
    };
    reader.readAsText(file);
});

function generateMenu() {
    menu.innerHTML = "";
    Object.keys(fullData).forEach(key => {
        const item = document.createElement('div');
        item.className = `menu-item ${key === currentKey ? 'active' : ''}`;
        item.innerHTML = `<i class="fas fa-folder"></i> ${key.replace(/_/g, ' ')}`;
        item.onclick = () => selectSection(key);
        menu.appendChild(item);
    });
}

function selectSection(key) {
    currentKey = key;
    editingIndex = null;
    if (!isRootArray) generateMenu();
    title.innerText = isRootArray ? "Lista Principal" : key.replace(/_/g, ' ');
    render();
}

// 2. Renderização Adaptativa
function render() {
    const data = isRootArray ? fullData : fullData[currentKey];
    const isArray = Array.isArray(data);
    controls.style.display = isArray ? 'block' : 'none';

    if (isArray) {
        renderHorizontalTable(data);
    } else {
        renderVerticalTable(data);
    }
}

// Tabela para LISTAS (Artigos, Habilidades...)
function renderHorizontalTable(data) {
    if (data.length === 0) {
        content.innerHTML = "<p>Nenhum registro.</p>";
        return;
    }
    const keys = Object.keys(data[0]);
    let html = `<div class="table-container"><table><thead><tr><th style="width:70px">Ordem</th>`;
    keys.forEach(k => html += `<th>${k}</th>`);
    html += `<th style="width:100px">Ações</th></tr></thead><tbody>`;

    data.forEach((item, idx) => {
        const isEditing = editingIndex === idx;
        html += `<tr ${isEditing ? 'class="editing-row"' : ''}>
            <td>
                <div class="action-btns">
                    <button class="btn-small" onclick="move(${idx}, -1)"><i class="fas fa-arrow-up"></i></button>
                    <button class="btn-small" onclick="move(${idx}, 1)"><i class="fas fa-arrow-down"></i></button>
                </div>
            </td>`;

        keys.forEach(k => {
            let val = item[k];
            if (typeof val === 'object') val = JSON.stringify(val);
            html += `<td>${isEditing ? `<textarea class="inline-edit" data-key="${k}">${val}</textarea>` : val}</td>`;
        });

        html += `<td><div class="action-btns">
            ${isEditing ? 
                `<button class="btn-small btn-save-row" onclick="saveRow(${idx})"><i class="fas fa-check"></i></button>` : 
                `<button class="btn-small" onclick="setEdit(${idx})"><i class="fas fa-edit"></i></button>`}
            <button class="btn-small" onclick="remove(${idx})"><i class="fas fa-trash"></i></button>
        </div></td></tr>`;
    });
    content.innerHTML = html + "</tbody></table></div>";
}

// Tabela para OBJETOS ÚNICOS (Perfil)
function renderVerticalTable(data) {
    const keys = Object.keys(data);
    let html = `<div class="table-container"><table class="vertical-table">`;
    keys.forEach(k => {
        let val = data[k];
        if (typeof val === 'object') val = JSON.stringify(val, null, 2);
        html += `<tr><th>${k}</th><td>
            <textarea class="inline-edit" onchange="updateSingle('${k}', this.value)">${val}</textarea>
        </td></tr>`;
    });
    content.innerHTML = html + "</table></div>";
}

// 3. Ações
function setEdit(idx) { editingIndex = idx; render(); }

function saveRow(idx) {
    const row = isRootArray ? fullData[idx] : fullData[currentKey][idx];
    document.querySelectorAll('.editing-row .inline-edit').forEach(el => {
        let val = el.value;
        if (val.startsWith('{') || val.startsWith('[')) { try { val = JSON.parse(val); } catch(e){} }
        row[el.dataset.key] = val;
    });
    editingIndex = null;
    render();
}

function updateSingle(key, val) {
    if (val.startsWith('{') || val.startsWith('[')) { try { val = JSON.parse(val); } catch(e){} }
    fullData[currentKey][key] = val;
}

function move(idx, dir) {
    const list = isRootArray ? fullData : fullData[currentKey];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= list.length) return;
    [list[idx], list[newIdx]] = [list[newIdx], list[idx]];
    render();
}

function remove(idx) {
    if (!confirm("Excluir?")) return;
    const list = isRootArray ? fullData : fullData[currentKey];
    list.splice(idx, 1);
    render();
}

document.getElementById('add-record').onclick = () => {
    const list = isRootArray ? fullData : fullData[currentKey];
    if (!Array.isArray(list)) return alert("Esta seção não permite múltiplos registros.");
    const newItem = {};
    Object.keys(list[0] || {}).forEach(k => newItem[k] = "");
    const pos = document.getElementById('insert-pos').value;
    if (pos === 'top') list.unshift(newItem); else list.push(newItem);
    editingIndex = (pos === 'top') ? 0 : list.length - 1;
    render();
};

document.getElementById('export-json').onclick = () => {
    const blob = new Blob([JSON.stringify(fullData, null, 2)], {type : 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = "data_ultra.json"; a.click();
};