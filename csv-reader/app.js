const csvInput = document.getElementById('csvInput');
const tableHeader = document.getElementById('tableHeader');
const tableBody = document.getElementById('tableBody');
const columnList = document.getElementById('columnList');
const statsBar = document.getElementById('statsBar');
const sidebar = document.getElementById('sidebar');

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

function processData(csvText) {
    // 1. Split lines (handling different line endings)
    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) return;

    // 2. Parse Headers and Rows 
    // (A better way to split by comma while respecting quotes)
    const parseLine = (line) => line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    
    const headers = parseLine(lines[0]);
    const dataRows = lines.slice(1).map(line => parseLine(line));

    // 3. Detect Data Types (Sample first 5 rows)
    const columnTypes = headers.map((_, index) => {
        return detectType(dataRows.slice(0, 5).map(row => row[index]));
    });

    // 4. Update Stats & UI Visibility
    document.getElementById('rowCount').textContent = dataRows.length;
    document.getElementById('colCount').textContent = headers.length;
    statsBar.style.display = 'grid';
    sidebar.style.display = 'block';

    // 5. Render Sidebar (Column List)
    columnList.innerHTML = '';
    headers.forEach((h, i) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${h.replace(/"/g, '').trim()}</span>
            <span class="badge badge-${columnTypes[i].toLowerCase()}">${columnTypes[i]}</span>
        `;
        columnList.appendChild(li);
    });

    // 6. Render Table Header
    tableHeader.innerHTML = '';
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText.replace(/"/g, '').trim();
        tableHeader.appendChild(th);
    });

    // 7. Render Table Body (Limit to 50 for performance)
    tableBody.innerHTML = '';
    dataRows.slice(0, 50).forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell.replace(/"/g, '').trim();
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });
}

/**
 * Basic Type Detection Logic
 */
function detectType(samples) {
    const values = samples.filter(s => s && s.trim() !== "");
    if (values.length === 0) return "String";

    const testValue = values[0].replace(/"/g, '').trim();

    // Check Number
    if (!isNaN(testValue) && !isNaN(parseFloat(testValue))) return "Number";
    
    // Check Date
    const date = Date.parse(testValue);
    if (!isNaN(date) && testValue.length > 5) return "Date";

    // Default
    return "String";
}