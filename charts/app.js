Chart.register(ChartDataLabels);

// Configuração padrão comum para todos os gráficos
const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        datalabels: {
            color: '#00ffff',
            font: { weight: 'bold' },
            offset: 4,
            align: 'end',
            anchor: 'end'
        },
        legend: {
            labels: { color: '#ffffff', font: { size: 12 } }
        }
    },
    scales: {
        x: { ticks: { color: '#b0c4de' }, grid: { display: false } },
        y: { ticks: { color: '#b0c4de' }, grid: { color: 'rgba(255,255,255,0.1)' } }
    }
};

async function initDashboard() {
    try {
        const res = await fetch('dados.json');
        const d = await res.json();

        // 1. Gráfico de Colunas (Vendas Mensais)
        new Chart(document.getElementById('chartVendas'), {
            type: 'bar',
            data: {
                labels: d.vendasMensais.labels,
                datasets: [{
                    label: d.vendasMensais.titulo,
                    data: d.vendasMensais.valores,
                    backgroundColor: 'rgba(0, 255, 255, 0.4)',
                    borderColor: '#00ffff',
                    borderWidth: 1
                }]
            },
            options: commonOptions
        });

        // 2. Gráfico de Rosca (Quadrantes)
        new Chart(document.getElementById('chartRosca'), {
            type: 'doughnut',
            data: {
                labels: d.quadrantes.labels,
                datasets: [{
                    data: d.quadrantes.valores,
                    backgroundColor: [
                        'rgba(0, 255, 255, 0.6)',
                        'rgba(0, 150, 255, 0.6)',
                        'rgba(255, 0, 255, 0.6)',
                        'rgba(100, 100, 255, 0.6)'
                    ],
                    borderColor: '#fff',
                    borderWidth: 1
                }]
            },
            options: { 
                ...commonOptions, 
                scales: { x: { display: false }, y: { display: false } } 
            }
        });

        // 3. Gráfico de Linhas (Evolução)
        new Chart(document.getElementById('chartLinha'), {
            type: 'line',
            data: {
                labels: d.evolucao.labels,
                datasets: [{
                    label: d.evolucao.titulo,
                    data: d.evolucao.valores,
                    borderColor: '#00ffff',
                    backgroundColor: 'rgba(0, 255, 255, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: commonOptions
        });

        // 4. Gráfico de Barras Horizontais (Top Produtos)
        new Chart(document.getElementById('chartBarras'), {
            type: 'bar',
            data: {
                labels: d.topProdutos.labels,
                datasets: [{
                    label: d.topProdutos.titulo,
                    data: d.topProdutos.valores,
                    backgroundColor: 'rgba(0, 255, 255, 0.4)',
                    borderColor: '#00ffff',
                    borderWidth: 1
                }]
            },
            options: { 
                ...commonOptions, 
                indexAxis: 'y' // Transforma em barras horizontais
            }
        });

    } catch (e) {
        console.error("Erro ao carregar dados:", e);
        document.body.innerHTML += `<p style="color:red; position:fixed; top:0">Erro de CORS ou JSON: ${e.message}</p>`;
    }
}

initDashboard();