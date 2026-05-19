let jsonData = [];
let editingIndex = null; // Armazena qual linha está em modo de edição

const uploadInput = document.getElementById('upload-json');
const exportBtn = document.getElementById('export-json');
const addBtn = document.getElementById('add-record');
const jsonViewer = document.getElementById('json-viewer');
const insertPos = document.getElementById('insert-pos');

// 1. Carregar JSON
uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const result = JSON.parse(event.target.result);
            jsonData = Array.isArray(result) ? result : [result];
            renderTable();
        } catch (err) { alert("Erro no JSON"); }
    };
    reader.readAsText(file);
});

// 2. Renderizar Tabela
function renderTable() {
    if (jsonData.length === 0) {
        jsonViewer.innerHTML = '<p class="empty-msg">Nenhum registro. Faça upload ou adicione um novo.</p>';
        return;
    }

    const keys = Object.keys(jsonData[0]);
    let html = `<table><thead><tr>
        <th style="width: 80px">Ordem</th>`;
    keys.forEach(key => html += `<th>${key}</th>`);
    html += `<th style="text-align:center">Ações</th></tr></thead><tbody>`;

    jsonData.forEach((item, index) => {
        const isEditing = editingIndex === index;
        html += `<tr class="${isEditing ? 'editing-row' : ''}">`;
        
        // Coluna de Ordenação Manual
        html += `
            <td>
                <div class="action-cell">
                    <button class="btn-icon btn-move" onclick="moveRow(${index}, -1)" ${index === 0 ? 'disabled' : ''}><i class="fas fa-arrow-up"></i></button>
                    <button class="btn-icon btn-move" onclick="moveRow(${index}, 1)" ${index === jsonData.length - 1 ? 'disabled' : ''}><i class="fas fa-arrow-down"></i></button>
                </div>
            </td>`;

        // Colunas de Dados
        keys.forEach(key => {
            if (isEditing) {
                html += `<td><input type="text" class="inline-edit" data-key="${key}" value="${item[key] || ''}"></td>`;
            } else {
                html += `<td>${item[key] || ''}</td>`;
            }
        });

        // Coluna de Ações (Salvar/Editar/Excluir)
        html += `<td class="action-cell">`;
        if (isEditing) {
            html += `
                <button class="btn-icon btn-save-inline" onclick="saveInline(${index})" title="Salvar"><i class="fas fa-check"></i></button>
                <button class="btn-icon" onclick="cancelEdit()" title="Cancelar"><i class="fas fa-times"></i></button>`;
        } else {
            html += `
                <button class="btn-icon" onclick="setEditMode(${index})" title="Editar"><i class="fas fa-edit"></i></button>
                <button class="btn-icon" style="color: var(--danger)" onclick="deleteRecord(${index})" title="Excluir"><i class="fas fa-trash-alt"></i></button>`;
        }
        html += `</td></tr>`;
    });

    html += `</tbody></table>`;
    jsonViewer.innerHTML = html;
}

// 3. Funções de Edição In-line
function setEditMode(index) {
    editingIndex = index;
    renderTable();
}

function cancelEdit() {
    editingIndex = null;
    renderTable();
}

function saveInline(index) {
    const rowInputs = document.querySelectorAll(`.editing-row .inline-edit`);
    rowInputs.forEach(input => {
        const key = input.getAttribute('data-key');
        jsonData[index][key] = input.value;
    });
    editingIndex = null;
    renderTable();
}

// 4. Adicionar Registro (Topo ou Fim)
addBtn.onclick = () => {
    if (jsonData.length === 0) {
        // Se estiver vazio, cria estrutura baseada no que você precisa
        jsonData.push({ id: "novo", titulo: "", autor: "", data: "", descricao: "" });
    } else {
        const newObj = {};
        Object.keys(jsonData[0]).forEach(key => newObj[key] = "");
        
        if (insertPos.value === 'top') {
            jsonData.unshift(newObj);
            editingIndex = 0;
        } else {
            jsonData.push(newObj);
            editingIndex = jsonData.length - 1;
        }
    }
    renderTable();
};

// 5. Ordenação Manual (Mover para cima/baixo)
function moveRow(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= jsonData.length) return;
    
    // Swap de elementos no array
    [jsonData[index], jsonData[newIndex]] = [jsonData[newIndex], jsonData[index]];
    
    // Se estiver editando alguém, cancela ou ajusta o index (cancelar é mais seguro)
    editingIndex = null;
    renderTable();
}

// 6. Excluir
function deleteRecord(index) {
    if (confirm("Excluir este registro?")) {
        jsonData.splice(index, 1);
        renderTable();
    }
}

// 7. Exportar
exportBtn.onclick = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonData, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", "artigos_atualizados.json");
    dl.click();
};