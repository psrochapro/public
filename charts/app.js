// Registro seguro do plugin
if (typeof ChartDataLabels !== 'undefined') {
    Chart.register(ChartDataLabels);
}

const configCores = {
    texto: 'rgba(255, 255, 255, 0.6)',
    grid: 'rgba(255, 255, 255, 0.05)',
    preenchimento: 'rgba(255, 255, 255, 0.15)',
    borda: 'rgba(255, 255, 255, 0.4)'
};

const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: { color: configCores.texto, font: { size: 10, weight: '300' } }
        },
        datalabels: {
            color: '#ffffff',
            font: { weight: 'bold', size: 10 },
            anchor: 'end',
            align: 'top'
        }
    },
    scales: {
        x: { ticks: { color: configCores.texto }, grid: { display: false } },
        y: { ticks: { color: configCores.texto }, grid: { color: configCores.grid } }
    }
};

async function render() {
    try {
        const res = await fetch('dados.json');
        const d = await res.json();

        // 1. Colunas
        new Chart(document.getElementById('chartVendas'), {
            type: 'bar',
            data: {
                labels: d.vendas_mensais.labels,
                datasets: [{
                    label: 'Vendas Mensais',
                    data: d.vendas_mensais.valores,
                    backgroundColor: configCores.preenchimento,
                    borderColor: configCores.borda,
                    borderWidth: 1
                }]
            },
            options: baseOptions
        });

        // 2. Rosca
        new Chart(document.getElementById('chartRosca'), {
            type: 'doughnut',
            data: {
                labels: d.quadrantes.labels,
                datasets: [{
                    data: d.quadrantes.valores,
                    backgroundColor: [
                        'rgba(255, 255, 255, 0.5)',
                        'rgba(255, 255, 255, 0.3)',
                        'rgba(255, 255, 255, 0.15)',
                        'rgba(255, 255, 255, 0.05)'
                    ],
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1
                }]
            },
            options: {
                ...baseOptions,
                plugins: { ...baseOptions.plugins, datalabels: { anchor: 'center' } },
                scales: { x: { display: false }, y: { display: false } }
            }
        });

        // 3. Linha
        new Chart(document.getElementById('chartLinha'), {
            type: 'line',
            data: {
                labels: d.evolucao_performance.labels,
                datasets: [{
                    label: 'Evolução',
                    data: d.evolucao_performance.valores,
                    borderColor: '#ffffff',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: baseOptions
        });

        // 4. Barras Horizontais
        new Chart(document.getElementById('chartBarras'), {
            type: 'bar',
            data: {
                labels: d.top_produtos.labels,
                datasets: [{
                    label: 'Top Ativos',
                    data: d.top_produtos.valores,
                    backgroundColor: configCores.preenchimento,
                    borderColor: configCores.borda,
                    borderWidth: 1
                }]
            },
            options: {
                ...baseOptions,
                indexAxis: 'y',
                scales: {
                    x: { ticks: { color: configCores.texto }, grid: { color: configCores.grid } },
                    y: { ticks: { color: configCores.texto }, grid: { display: false } }
                }
            }
        });

    } catch (e) {
        console.error("Erro carregando dados:", e);
    }
}

window.onload = render;