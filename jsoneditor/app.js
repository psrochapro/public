// Renderização melhorada para dados complexos
function renderTable() {
    if (jsonData.length === 0) {
        jsonViewer.innerHTML = '<p class="empty-msg">Nenhum registro encontrado.</p>';
        return;
    }

    const keys = Object.keys(jsonData[0]);
    let html = `<table><thead><tr><th style="width: 80px">Ordem</th>`;
    keys.forEach(key => html += `<th>${key}</th>`);
    html += `<th style="text-align:center">Ações</th></tr></thead><tbody>`;

    jsonData.forEach((item, index) => {
        const isEditing = editingIndex === index;
        html += `<tr class="${isEditing ? 'editing-row' : ''}">
            <td>
                <div class="action-cell">
                    <button class="btn-icon btn-move" onclick="moveRow(${index}, -1)" ${index === 0 ? 'disabled' : ''}><i class="fas fa-arrow-up"></i></button>
                    <button class="btn-icon btn-move" onclick="moveRow(${index}, 1)" ${index === jsonData.length - 1 ? 'disabled' : ''}><i class="fas fa-arrow-down"></i></button>
                </div>
            </td>`;

        keys.forEach(key => {
            let value = item[key];
            
            // Se o valor for um objeto ou array, transforma em string para não exibir [object Object]
            const displayValue = (typeof value === 'object' && value !== null) 
                ? JSON.stringify(value) 
                : value;

            if (isEditing) {
                html += `<td><input type="text" class="inline-edit" data-key="${key}" value='${displayValue || ""}'></td>`;
            } else {
                html += `<td>${displayValue || ''}</td>`;
            }
        });

        html += `<td class="action-cell">
            ${isEditing ? 
                `<button class="btn-icon btn-save-inline" onclick="saveInline(${index})"><i class="fas fa-check"></i></button>
                 <button class="btn-icon" onclick="cancelEdit()"><i class="fas fa-times"></i></button>` : 
                `<button class="btn-icon" onclick="setEditMode(${index})"><i class="fas fa-edit"></i></button>
                 <button class="btn-icon" style="color: var(--danger)" onclick="deleteRecord(${index})"><i class="fas fa-trash-alt"></i></button>`
            }
        </td></tr>`;
    });

    html += `</tbody></table>`;
    jsonViewer.innerHTML = html;
}

// Salvamento com inteligência de tipo
function saveInline(index) {
    const rowInputs = document.querySelectorAll(`.editing-row .inline-edit`);
    rowInputs.forEach(input => {
        const key = input.getAttribute('data-key');
        let val = input.value;

        // Tenta converter para número se for numérico
        if (val !== "" && !isNaN(val)) {
            val = Number(val);
        } 
        // Tenta converter booleanos
        else if (val.toLowerCase() === "true") val = true;
        else if (val.toLowerCase() === "false") val = false;
        // Tenta converter objetos/arrays se o usuário digitou um JSON válido
        else if (val.startsWith('{') || val.startsWith('[')) {
            try { val = JSON.parse(val); } catch(e) { /* mantém como string se falhar */ }
        }

        jsonData[index][key] = val;
    });
    editingIndex = null;
    renderTable();
}