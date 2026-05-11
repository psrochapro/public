const csvInput = document.getElementById('csvInput');
const tableHeader = document.getElementById('tableHeader');
const tableBody = document.getElementById('tableBody');
const columnList = document.getElementById('columnList');
const statsBar = document.getElementById('statsBar');
const sidebar = document.getElementById('sidebar');
const loadMoreBtn = document.getElementById('loadMoreBtn');

let allDataRows = [];
let displayedRowCount = 0;
const CHUNK_SIZE = 50;

csvInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    document.getElementById('fileName').textContent = file.name;

    const reader = new FileReader();
    reader.onload = function(event) {
        processData(event.target.result);
    };
    reader.readAsText(file);
});

loadMoreBtn.addEventListener('click', () => {
    renderMoreRows();
});

function processData(csvText) {
    tableHeader.innerHTML = '';
    tableBody.innerHTML = '';
    columnList.innerHTML = '';
    displayedRowCount = 0;

    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) return;

    const parseLine = (line) => line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    
    const headers = parseLine(lines[0]);
    allDataRows = lines.slice(1).map(line => parseLine(line));

    const columnTypes = headers.map((_, index) => {
        return detectType(allDataRows.slice(0, 15).map(row => row[index]));
    });

    document.getElementById('rowCount').textContent = allDataRows.length;
    document.getElementById('colCount').textContent = headers.length;
    statsBar.style.display = 'grid';
    sidebar.style.display = 'block';

    headers.forEach((h, i) => {
        const li = document.createElement('li');
        const cleanHeader = (h || '').replace(/"/g, '').trim();
        li.innerHTML = `
            <span>${cleanHeader}</span>
            <span class="badge badge-${columnTypes[i].toLowerCase()}">${columnTypes[i]}</span>
        `;
        columnList.appendChild(li);
    });

    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = (headerText || '').replace(/"/g, '').trim();
        tableHeader.appendChild(th);
    });

    renderMoreRows();
}

function renderMoreRows() {
    const nextBatch = allDataRows.slice(displayedRowCount, displayedRowCount + CHUNK_SIZE);
    
    nextBatch.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = (cell || '').replace(/"/g, '').trim();
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });

    displayedRowCount += nextBatch.length;
    loadMoreBtn.style.display = displayedRowCount < allDataRows.length ? 'inline-block' : 'none';
}

function detectType(samples) {
    const values = samples.filter(s => s && s.trim() !== "");
    if (values.length === 0) return "String";

    const testValue = values[0].replace(/"/g, '').trim();
    if (testValue !== "" && !isNaN(testValue)) return "Number";
    
    const date = Date.parse(testValue);
    if (!isNaN(date) && testValue.length > 5 && isNaN(testValue)) return "Date";

    return "String";
}