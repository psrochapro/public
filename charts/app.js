Chart.register(ChartDataLabels);

// Paleta Minimalista (Vidro/Neutral)
const cores = {
    primaria: 'rgba(255, 255, 255, 0.8)',      // Branco sólido suave
    primariaTrans: 'rgba(255, 255, 255, 0.15)', // Vidro fundo
    secundaria: 'rgba(200, 200, 200, 0.5)',     // Cinza médio
    texto: 'rgba(255, 255, 255, 0.7)',          // Texto suave
    grid: 'rgba(255, 255, 255, 0.05)',
    paletaDoughnut: [
        'rgba(255, 255, 255, 0.6)',
        'rgba(255, 255, 255, 0.4)',
        'rgba(255, 255, 255, 0.2)',
        'rgba(255, 255, 255, 0.1)'
    ]
};

const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            labels: { color: cores.texto, font: { size: 10, weight: '300' }, boxWidth: 10 }
        },
        datalabels: {
            color: '#ffffff',
            font: { weight: '300', size: 9 },
            anchor: 'end',
            align: 'top',
            formatter: Math.round
        }
    },
    scales: {
        x: { ticks: { color: cores.texto, font: { size: 9 } }, grid: { display: false } },
        y: { ticks: { color: cores.texto, font: { size: 9 } }, grid: { color: cores.grid } }
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
                    label: 'Volume Mensal',
                    data: d.vendas_mensais.valores,
                    backgroundColor: cores.primariaTrans,
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                    borderWidth: 1
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
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1
                }]
            },
            options: {
                ...baseOptions,
                plugins: {
                    ...baseOptions.plugins,
                    datalabels: { color: '#fff', anchor: 'center', align: 'center' }
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
                    label: 'Performance',
                    data: d.evolucao_performance.valores,
                    borderColor: 'rgba(255, 255, 255, 0.6)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: '#ffffff'
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
                    label: 'Ranking Ativos',
                    data: d.top_produtos.valores,
                    backgroundColor: cores.primariaTrans,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    borderWidth: 1
                }]
            },
            options: {
                ...baseOptions,
                indexAxis: 'y',
                scales: {
                    x: { ticks: { color: cores.texto }, grid: { color: cores.grid } },
                    y: { ticks: { color: cores.texto }, grid: { display: false } }
                }
            }
        });

    } catch (err) {
        console.error("Erro:", err);
    }
}

window.onload = init;