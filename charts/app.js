Chart.register(ChartDataLabels);

const cores = {
    primaria: '#00ffff',
    primariaTrans: 'rgba(0, 255, 255, 0.2)',
    secundaria: '#0080ff',
    texto: '#e0f7fa',
    grid: 'rgba(255, 255, 255, 0.05)',
    paletaDoughnut: [
        'rgba(0, 255, 255, 0.7)',
        'rgba(0, 160, 255, 0.7)',
        'rgba(0, 80, 255, 0.7)',
        'rgba(0, 200, 200, 0.7)'
    ]
};

const baseOptions = {
    responsive: true,
    maintainAspectRatio: false, // Permite que o gráfico preencha o card
    plugins: {
        legend: {
            display: true,
            position: 'top',
            labels: { 
                color: cores.texto, 
                font: { size: 10 },
                boxWidth: 12,
                padding: 10
            }
        },
        datalabels: {
            color: cores.texto,
            font: { weight: 'bold', size: 9 },
            anchor: 'end',
            align: 'top',
            offset: 2,
            formatter: (v) => v
        }
    },
    scales: {
        x: { ticks: { color: cores.texto, font: { size: 9 } }, grid: { display: false } },
        y: { 
            beginAtZero: true,
            ticks: { color: cores.texto, font: { size: 9 } },
            grid: { color: cores.grid }
        }
    }
};

async function init() {
    try {
        const response = await fetch('dados.json');
        const d = await response.json();

        // 1. COLUNAS
        new Chart(document.getElementById('chartVendas'), {
            type: 'bar',
            data: {
                labels: d.vendas_mensais.labels,
                datasets: [{
                    label: d.vendas_mensais.titulo,
                    data: d.vendas_mensais.valores,
                    backgroundColor: cores.primariaTrans,
                    borderColor: cores.primaria,
                    borderWidth: 1.5
                }]
            },
            options: baseOptions
        });

        // 2. ROSCA
        new Chart(document.getElementById('chartRosca'), {
            type: 'doughnut',
            data: {
                labels: d.quadrantes.labels,
                datasets: [{
                    data: d.quadrantes.valores,
                    backgroundColor: cores.paletaDoughnut,
                    borderColor: '#000d1a',
                    borderWidth: 2
                }]
            },
            options: {
                ...baseOptions,
                plugins: {
                    ...baseOptions.plugins,
                    datalabels: { color: '#fff', font: { size: 11, weight: 'bold' } }
                },
                scales: { x: { display: false }, y: { display: false } }
            }
        });

        // 3. LINHA
        new Chart(document.getElementById('chartLinha'), {
            type: 'line',
            data: {
                labels: d.evolucao_performance.labels,
                datasets: [{
                    label: d.evolucao_performance.titulo,
                    data: d.evolucao_performance.valores,
                    borderColor: cores.primaria,
                    backgroundColor: 'rgba(0, 255, 255, 0.05)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 2
                }]
            },
            options: baseOptions
        });

        // 4. BARRAS HORIZONTAIS
        new Chart(document.getElementById('chartBarras'), {
            type: 'bar',
            data: {
                labels: d.top_produtos.labels,
                datasets: [{
                    label: d.top_produtos.titulo,
                    data: d.top_produtos.valores,
                    backgroundColor: 'rgba(0, 120, 255, 0.4)',
                    borderColor: cores.secundaria,
                    borderWidth: 1.5
                }]
            },
            options: {
                ...baseOptions,
                indexAxis: 'y',
                plugins: {
                    ...baseOptions.plugins,
                    datalabels: { align: 'right', anchor: 'end' }
                }
            }
        });

    } catch (err) {
        console.error("Erro:", err);
    }
}

window.onload = init;