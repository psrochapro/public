// Registro do Plugin
Chart.register(ChartDataLabels);

// Paleta de Cores Blueprint
const cores = {
    primaria: '#00ffff',
    primariaTrans: 'rgba(0, 255, 255, 0.3)',
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

// Opções base reaproveitáveis
const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 20 } },
    plugins: {
        legend: {
            display: true,
            position: 'top',
            labels: { color: cores.texto, font: { size: 12, weight: '500' }, padding: 20 }
        },
        datalabels: {
            color: cores.texto,
            font: { weight: 'bold', size: 11 },
            anchor: 'end',
            align: 'top',
            offset: 4,
            formatter: (v) => v
        }
    },
    scales: {
        x: { 
            ticks: { color: cores.texto }, 
            grid: { display: false } 
        },
        y: { 
            beginAtZero: true,
            ticks: { color: cores.texto },
            grid: { color: cores.grid }
        }
    }
};

async function init() {
    try {
        const response = await fetch('dados.json');
        if (!response.ok) throw new Error("JSON não encontrado");
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
                    borderWidth: 2,
                    borderRadius: 4
                }]
            },
            options: baseOptions
        });

        // 2. ROSCA (Doughnut) - Customizado
        new Chart(document.getElementById('chartRosca'), {
            type: 'doughnut',
            data: {
                labels: d.quadrantes.labels,
                datasets: [{
                    data: d.quadrantes.valores,
                    backgroundColor: cores.paletaDoughnut,
                    borderColor: '#000d1a',
                    borderWidth: 3
                }]
            },
            options: {
                ...baseOptions,
                plugins: {
                    ...baseOptions.plugins,
                    datalabels: {
                        color: '#fff',
                        anchor: 'center',
                        align: 'center',
                        font: { size: 14, weight: 'bold' }
                    }
                },
                scales: { x: { display: false }, y: { display: false } }
            }
        });

        // 3. LINHA (Evolução)
        new Chart(document.getElementById('chartLinha'), {
            type: 'line',
            data: {
                labels: d.evolucao_performance.labels,
                datasets: [{
                    label: d.evolucao_performance.titulo,
                    data: d.evolucao_performance.valores,
                    borderColor: cores.primaria,
                    backgroundColor: 'rgba(0, 255, 255, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: cores.primaria
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
                    borderWidth: 2,
                    borderRadius: 4
                }]
            },
            options: {
                ...baseOptions,
                indexAxis: 'y',
                plugins: {
                    ...baseOptions.plugins,
                    datalabels: {
                        ...baseOptions.plugins.datalabels,
                        anchor: 'end',
                        align: 'right'
                    }
                }
            }
        });

    } catch (err) {
        console.error("Erro:", err);
    }
}

window.onload = init;