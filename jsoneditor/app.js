let jsonData = [];
let editIndex = null;

const uploadInput = document.getElementById('upload-json');
const exportBtn = document.getElementById('export-json');
const addBtn = document.getElementById('add-record');
const jsonViewer = document.getElementById('json-viewer');
const modal = document.getElementById('modal');
const editForm = document.getElementById('edit-form');
const formFields = document.getElementById('form-fields');

// --- 1. Carregamento do JSON ---
uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const result = JSON.parse(event.target.result);
            // Garante que trabalharemos com um Array para a interface de tabela
            jsonData = Array.isArray(result) ? result : [result];
            renderTable();
        } catch (err) {
            alert("Erro ao ler o arquivo JSON. Verifique a sintaxe.");
        }
    };
    reader.readAsText(file);
});

// --- 2. Renderização Universal ---
function renderTable() {
    if (jsonData.length === 0) {
        jsonViewer.innerHTML = '<p class="empty-msg">Nenhum registro encontrado.</p>';
        return;
    }

    // Pega as chaves do primeiro objeto para criar o cabeçalho
    const keys = Object.keys(jsonData[0]);
    
    let html = `<table><thead><tr>`;
    keys.forEach(key => html += `<th>${key}</th>`);
    html += `<th style="text-align:center">Ações</th></tr></thead><tbody>`;

    jsonData.forEach((item, index) => {
        html += `<tr>`;
        keys.forEach(key => {
            let val = item[key] !== undefined ? item[key] : "";
            html += `<td>${val}</td>`;
        });
        html += `
            <td style="display:flex; gap:5px; justify-content:center">
                <button class="btn btn-edit" onclick="openEditModal(${index})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-danger" onclick="deleteRecord(${index})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    });

    html += `</tbody></table>`;
    jsonViewer.innerHTML = html;
}

// --- 3. CRUD: Adicionar e Editar ---
function openEditModal(index = null) {
    editIndex = index;
    const title = document.getElementById('modal-title');
    title.innerText = index !== null ? "Editar Registro" : "Novo Registro";
    
    formFields.innerHTML = "";
    
    // Se não houver dados, definimos chaves padrão ou perguntamos ao usuário
    // Aqui, usamos as chaves do primeiro registro para manter a universalidade
    const template = jsonData.length > 0 ? jsonData[0] : { id: "", titulo: "", descricao: "" };
    const keys = Object.keys(template);

    keys.forEach(key => {
        const value = index !== null ? jsonData[index][key] : "";
        formFields.innerHTML += `
            <div class="form-group">
                <label>${key.toUpperCase()}</label>
                <input type="text" name="${key}" value="${value || ''}" data-key="${key}">
            </div>
        `;
    });

    modal.style.display = 'flex';
}

function closeModal() {
    modal.style.display = 'none';
    editForm.reset();
}

editForm.onsubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(editForm);
    const newItem = {};
    
    // Captura os campos dinâmicos
    const inputs = formFields.querySelectorAll('input');
    inputs.forEach(input => {
        newItem[input.getAttribute('data-key')] = input.value;
    });

    if (editIndex !== null) {
        jsonData[editIndex] = newItem;
    } else {
        jsonData.push(newItem);
    }

    renderTable();
    closeModal();
};

addBtn.onclick = () => openEditModal();

// --- 4. CRUD: Excluir ---
function deleteRecord(index) {
    if (confirm("Deseja realmente excluir este registro?")) {
        jsonData.splice(index, 1);
        renderTable();
    }
}

// --- 5. Exportar JSON ---
exportBtn.onclick = () => {
    if (jsonData.length === 0) return alert("Não há dados para exportar.");
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "data_exported.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
};

// Fechar modal ao clicar fora
window.onclick = (event) => {
    if (event.target == modal) closeModal();
};