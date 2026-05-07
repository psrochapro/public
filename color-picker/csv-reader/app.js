const csvInput = document.getElementById('csvInput');
const tableHeader = document.getElementById('tableHeader');
const tableBody = document.getElementById('tableBody');

csvInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(event) {
        const text = event.target.result;
        processData(text);
    };

    reader.readAsText(file);
});

function processData(csvText) {
    // Limpa a tabela anterior
    tableHeader.innerHTML = '';
    tableBody.innerHTML = '';

    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return;

    // Processa o cabeçalho (primeira linha)
    const headers = lines[0].split(',');
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText.trim();
        tableHeader.appendChild(th);
    });

    // Processa os dados (demais linhas)
    for (let i = 1; i < lines.length; i++) {
        const tr = document.createElement('tr');
        const cells = lines[i].split(',');
        
        cells.forEach(cellText => {
            const td = document.createElement('td');
            td.textContent = cellText.trim();
            tr.appendChild(td);
        });
        
        tableBody.appendChild(tr);
    }
}