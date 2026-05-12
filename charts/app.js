Chart.register(ChartDataLabels);

const cores = {
    primaria: '#00ffff',
    primariaTrans: 'rgba(0, 255, 255, 0.2)',
    secundaria: '#0080ff',
    texto: '#e0f7fa',
    grid: 'rgba(255, 255, 255, 0.05)'
};

// Opções Genéricas
const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            labels: { color: cores.texto, font: { size: 10 }, boxWidth: 10 }
        },
        datalabels: {
            color: cores.texto,
            font: { weight: 'bold', size: 9 },
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
        if (!response.ok) throw new Error("Erro ao carregar JSON");
        const d = await response.json();

        // 1. COLUNAS (Vendas)
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

        // 2. ROSCA (Distribuição)
        new Chart(document.getElementById('chartRosca'), {
            type: 'doughnut',
            data: {
                labels: d.quadrantes.labels,
                datasets: [{
                    data: d.quadrantes.valores,
                    backgroundColor: ['#00ffff', '#0080ff', '#0040ff', '#00cccc'],
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

        // 3. LINHA (Evolução)
        new Chart(document.getElementById('chartLinha'), {
            type: 'line',
            data: {
                labels: d.evolucao_performance.labels,
                datasets: [{
                    label: d.evolucao_performance.titulo,
                    data: d.evolucao_performance.valores,
                    borderColor: cores.primaria,
                    backgroundColor: 'rgba(0, 255, 255, 0.05)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 2
                }]
            },
            options: baseOptions
        });

        // 4. BARRAS HORIZONTAIS (Top Ativos) - CORREÇÃO AQUI
        new Chart(document.getElementById('chartBarras'), {
            type: 'bar',
            data: {
                labels: d.top_produtos.labels,
                datasets: [{
                    label: d.top_produtos.titulo,
                    data: d.top_produtos.valores,
                    backgroundColor: 'rgba(0, 128, 255, 0.4)',
                    borderColor: cores.secundaria,
                    borderWidth: 1.5
                }]
            },
            options: {
                ...baseOptions,
                indexAxis: 'y', // Ativa horizontal
                plugins: {
                    ...baseOptions.plugins,
                    datalabels: { align: 'right', anchor: 'end', color: cores.texto }
                },
                scales: {
                    x: { // No horizontal, o X é o eixo de VALORES
                        ticks: { color: cores.texto, font: { size: 9 } },
                        grid: { color: cores.grid }
                    },
                    y: { // No horizontal, o Y é o eixo de LABELS
                        ticks: { color: cores.texto, font: { size: 9 } },
                        grid: { display: false }
                    }
                }
            }
        });

    } catch (err) {
        console.error("Erro no Dashboard:", err);
    }
}

window.onload = init;