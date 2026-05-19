let fullData = {}; // Armazena o JSON completo
let currentSection = null; // A chave atual (ex: 'habilidades_detalhadas')
let editingIndex = null;

const sectionsMenu = document.getElementById('sections-menu');
const tableContainer = document.getElementById('table-container');
const sectionTitle = document.getElementById('current-section-title');

// 1. Carregar JSON e Gerar Menu
document.getElementById('upload-json').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const result = JSON.parse(event.target.result);
            fullData = result;
            generateMenu();
            // Seleciona a primeira seção automaticamente
            const firstKey = Object.keys(fullData)[0];
            selectSection(firstKey);
        } catch (err) { alert("Erro ao ler JSON"); }
    };
    reader.readAsText(file);
});

function generateMenu() {
    sectionsMenu.innerHTML = "";
    Object.keys(fullData).forEach(key => {
        const div = document.createElement('div');
        div.className = `menu-item ${key === currentSection ? 'active' : ''}`;
        div.innerHTML = `<i class="fas fa-folder"></i> ${key.replace(/_/g, ' ')}`;
        div.onclick = () => selectSection(key);
        sectionsMenu.appendChild(div);
    });
}

function selectSection(key) {
    currentSection = key;
    editingIndex = null;
    sectionTitle.innerText = key.replace(/_/g, ' ');
    generateMenu();
    renderActiveTable();
}

// 2. Renderizar a Tabela da Seção Ativa
function renderActiveTable() {
    let data = fullData[currentSection];
    
    // Se a seção for um objeto único (ex: perfil), transformamos em array de 1 item para a tabela
    const isSingleObject = !Array.isArray(data);
    const tableData = isSingleObject ? [data] : data;

    if (tableData.length === 0 || !tableData[0]) {
        tableContainer.innerHTML = "<p class='empty-msg'>Seção vazia.</p>";
        return;
    }

    const keys = Object.keys(tableData[0]);
    let html = `<table><thead><tr><th style="width:50px">#</th>`;
    keys.forEach(k => html += `<th>${k}</th>`);
    html += `<th>Ações</th></tr></thead><tbody>`;

    tableData.forEach((item, index) => {
        const isEditing = editingIndex === index;
        html += `<tr class="${isEditing ? 'editing-row' : ''}">
            <td>${index + 1}</td>`;
        
        keys.forEach(k => {
            let val = item[k];
            // Trata objetos aninhados para exibição
            if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
            
            if (isEditing) {
                html += `<td><textarea class="inline-edit" data-key="${k}">${val || ''}</textarea></td>`;
            } else {
                html += `<td>${val || ''}</td>`;
            }
        });

        html += `<td>
            <div style="display:flex; gap:5px">
                ${isEditing ? 
                    `<button class="btn-icon btn-save" onclick="saveRow(${index})"><i class="fas fa-check"></i></button>` : 
                    `<button class="btn-icon" onclick="editRow(${index})"><i class="fas fa-edit"></i></button>`
                }
                <button class="btn-icon" onclick="deleteRow(${index})"><i class="fas fa-trash"></i></button>
            </div>
        </td></tr>`;
    });

    html += `</tbody></table>`;
    tableContainer.innerHTML = html;
}

// 3. Funções de Edição
function editRow(index) { editingIndex = index; renderActiveTable(); }

function saveRow(index) {
    const inputs = document.querySelectorAll('.editing-row .inline-edit');
    let target = Array.isArray(fullData[currentSection]) ? fullData[currentSection][index] : fullData[currentSection];

    inputs.forEach(input => {
        const key = input.getAttribute('data-key');
        let val = input.value;
        // Tentativa de converter strings em objetos/arrays se necessário
        if (val.startsWith('{') || val.startsWith('[')) {
            try { val = JSON.parse(val); } catch(e) {}
        }
        target[key] = val;
    });

    editingIndex = null;
    renderActiveTable();
}

function deleteRow(index) {
    if (!confirm("Excluir?")) return;
    if (Array.isArray(fullData[currentSection])) {
        fullData[currentSection].splice(index, 1);
    } else {
        delete fullData[currentSection];
    }
    renderActiveTable();
}

// 4. Adicionar Novo
document.getElementById('add-record').onclick = () => {
    if (!currentSection) return;
    const template = Array.isArray(fullData[currentSection]) ? fullData[currentSection][0] : fullData[currentSection];
    const newItem = {};
    Object.keys(template).forEach(k => newItem[k] = "");

    if (Array.isArray(fullData[currentSection])) {
        const pos = document.getElementById('insert-pos').value;
        if (pos === 'top') fullData[currentSection].unshift(newItem);
        else fullData[currentSection].push(newItem);
    }
    renderActiveTable();
};

// 5. Exportar tudo
document.getElementById('export-json').onclick = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullData, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", "dados_completos.json");
    dl.click();
};