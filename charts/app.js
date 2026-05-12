// Verifica se o Chart foi carregado antes de tentar registrar o plugin
if (typeof Chart !== 'undefined') {
    Chart.register(ChartDataLabels);
} else {
    alert("Erro: A biblioteca de gráficos não pôde ser carregada do servidor. Verifique sua conexão.");
}

const paletaVidro = {
    texto: 'rgba(255, 255, 255, 0.6)',
    grid: 'rgba(255, 255, 255, 0.05)',
    barras: 'rgba(255, 255, 255, 0.2)',
    borda: 'rgba(255, 255, 255, 0.4)',
    branca: '#ffffff'
};

const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: { color: paletaVidro.texto, font: { size: 10, weight: '300' } }
        },
        datalabels: {
            color: paletaVidro.branca,
            font: { weight: 'bold', size: 10 },
            anchor: 'end',
            align: 'top'
        }
    },
    scales: {
        x: { ticks: { color: paletaVidro.texto }, grid: { display: false } },
        y: { ticks: { color: paletaVidro.texto }, grid: { color: paletaVidro.grid } }
    }
};

async function init() {
    try {
        const res = await fetch('dados.json');
        if (!res.ok) throw new Error("Erro ao ler dados.json");
        const d = await res.json();

        // 1. Vendas Mensais (Colunas)
        new Chart(document.getElementById('chartVendas'), {
            type: 'bar',
            data: {
                labels: d.vendas_mensais.labels,
                datasets: [{
                    label: d.vendas_mensais.titulo,
                    data: d.vendas_mensais.valores,
                    backgroundColor: paletaVidro.barras,
                    borderColor: paletaVidro.borda,
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: baseOptions
        });

        // 2. Regional (Rosca)
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

        // 3. Performance (Linha)
        new Chart(document.getElementById('chartLinha'), {
            type: 'line',
            data: {
                labels: d.evolucao_performance.labels,
                datasets: [{
                    label: d.evolucao_performance.titulo,
                    data: d.evolucao_performance.valores,
                    borderColor: paletaVidro.branca,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3
                }]
            },
            options: baseOptions
        });

        // 4. Ranking Ativos (Barras Horizontais)
        new Chart(document.getElementById('chartBarras'), {
            type: 'bar',
            data: {
                labels: d.top_produtos.labels,
                datasets: [{
                    label: d.top_produtos.titulo,
                    data: d.top_produtos.valores,
                    backgroundColor: paletaVidro.barras,
                    borderColor: paletaVidro.borda,
                    borderWidth: 1
                }]
            },
            options: {
                ...baseOptions,
                indexAxis: 'y',
                scales: {
                    x: { ticks: { color: paletaVidro.texto }, grid: { color: paletaVidro.grid } },
                    y: { ticks: { color: paletaVidro.texto }, grid: { display: false } }
                }
            }
        });

    } catch (e) {
        console.error(e);
    }
}

window.onload = init;