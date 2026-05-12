Chart.register(ChartDataLabels);

// Configurações de cores neutras/vidro
const paleta = {
    linha: 'rgba(255, 255, 255, 0.8)',
    preenchimento: 'rgba(255, 255, 255, 0.15)',
    texto: 'rgba(255, 255, 255, 0.6)',
    grid: 'rgba(255, 255, 255, 0.05)',
    branca: '#ffffff'
};

const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            labels: { color: paleta.texto, font: { size: 11, weight: '300' }, boxWidth: 10 }
        },
        datalabels: {
            color: paleta.branca,
            font: { weight: 'bold', size: 10 },
            anchor: 'end',
            align: 'top',
            offset: 2,
            formatter: (val) => val
        }
    },
    scales: {
        x: { ticks: { color: paleta.texto, font: { size: 10 } }, grid: { display: false } },
        y: { 
            beginAtZero: true, 
            ticks: { color: paleta.texto, font: { size: 10 } }, 
            grid: { color: paleta.grid } 
        }
    }
};

async function carregarDashboard() {
    try {
        const resp = await fetch('dados.json');
        if (!resp.ok) throw new Error("Não foi possível carregar o JSON");
        const d = await resp.json();

        // 1. Colunas (Vendas)
        new Chart(document.getElementById('chartVendas'), {
            type: 'bar',
            data: {
                labels: d.vendas_mensais.labels,
                datasets: [{
                    label: d.vendas_mensais.titulo,
                    data: d.vendas_mensais.valores,
                    backgroundColor: paleta.preenchimento,
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    borderWidth: 1,
                    borderRadius: 5
                }]
            },
            options: commonOptions
        });

        // 2. Rosca (Distribuição)
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
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 1
                }]
            },
            options: {
                ...commonOptions,
                plugins: {
                    ...commonOptions.plugins,
                    datalabels: { anchor: 'center', align: 'center', color: '#fff' }
                },
                scales: { x: { display: false }, y: { display: false } }
            }
        });

        // 3. Linha (Evolução)
        new Chart(document.getElementById('chartLinha'), {
            type: 'line',
            data: {
                labels: d.evolucao_performance.labels,
                datasets: [{
                    label: d.evolucao_performance.titulo,
                    data: d.evolucao_performance.valores,
                    borderColor: paleta.linha,
                    backgroundColor: paleta.preenchimento,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: paleta.branca
                }]
            },
            options: commonOptions
        });

        // 4. Barras Horizontais (Ranking)
        new Chart(document.getElementById('chartBarras'), {
            type: 'bar',
            data: {
                labels: d.top_produtos.labels,
                datasets: [{
                    label: d.top_produtos.titulo,
                    data: d.top_produtos.valores,
                    backgroundColor: paleta.preenchimento,
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    borderWidth: 1,
                    borderRadius: 5
                }]
            },
            options: {
                ...commonOptions,
                indexAxis: 'y',
                plugins: {
                    ...commonOptions.plugins,
                    datalabels: { align: 'right', anchor: 'end' }
                }
            }
        });

    } catch (err) {
        console.error("Houston, we have a problem:", err);
    }
}

window.onload = carregarDashboard;