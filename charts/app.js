// Registrar o plugin datalabels
Chart.register(ChartDataLabels);

const corCiano = 'rgba(0, 255, 255, 0.6)';
const corBorda = '#00ffff';
const corBranca = '#ffffff';

// Função auxiliar para as opções dos gráficos
function getBaseOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                color: corBranca,
                anchor: 'end',
                align: 'top',
                font: { weight: 'bold', size: 10 }
            },
            legend: {
                labels: { color: corBranca, font: { size: 12 } }
            }
        },
        scales: {
            x: { ticks: { color: corBranca }, grid: { display: false } },
            y: { 
                beginAtZero: true, 
                ticks: { color: corBranca }, 
                grid: { color: 'rgba(255,255,255,0.1)' } 
            }
        }
    };
}

async function renderCharts() {
    const errorDiv = document.getElementById('error-message');
    
    try {
        // Busca o JSON no mesmo diretório do app.js
        const response = await fetch('dados.json');
        
        if (!response.ok) {
            throw new Error(`Erro HTTP! status: ${response.status} - Verifique se o dados.json está na pasta.`);
        }

        const d = await response.json();

        // 1. Gráfico de Colunas
        new Chart(document.getElementById('chartVendas'), {
            type: 'bar',
            data: {
                labels: d.vendas_mensais.labels,
                datasets: [{
                    label: d.vendas_mensais.titulo,
                    data: d.vendas_mensais.valores,
                    backgroundColor: corCiano,
                    borderColor: corBorda,
                    borderWidth: 1
                }]
            },
            options: getBaseOptions()
        });

        // 2. Gráfico de Rosca
        new Chart(document.getElementById('chartRosca'), {
            type: 'doughnut',
            data: {
                labels: d.quadrantes.labels,
                datasets: [{
                    data: d.quadrantes.valores,
                    backgroundColor: [
                        'rgba(0, 255, 255, 0.7)',
                        'rgba(0, 150, 255, 0.7)',
                        'rgba(0, 80, 255, 0.7)',
                        'rgba(100, 255, 255, 0.7)'
                    ],
                    borderColor: '#001a33',
                    borderWidth: 2
                }]
            },
            options: {
                ...getBaseOptions(),
                scales: { x: { display: false }, y: { display: false } }
            }
        });

        // 3. Gráfico de Linhas
        new Chart(document.getElementById('chartLinha'), {
            type: 'line',
            data: {
                labels: d.evolucao_performance.labels,
                datasets: [{
                    label: d.evolucao_performance.titulo,
                    data: d.evolucao_performance.valores,
                    borderColor: corBorda,
                    backgroundColor: 'rgba(0, 255, 255, 0.1)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: getBaseOptions()
        });

        // 4. Gráfico de Barras Horizontais
        new Chart(document.getElementById('chartBarras'), {
            type: 'bar',
            data: {
                labels: d.top_produtos.labels,
                datasets: [{
                    label: d.top_produtos.titulo,
                    data: d.top_produtos.valores,
                    backgroundColor: 'rgba(0, 200, 255, 0.6)',
                    borderColor: corBorda,
                    borderWidth: 1
                }]
            },
            options: {
                ...getBaseOptions(),
                indexAxis: 'y'
            }
        });

    } catch (err) {
        console.error("Erro detalhado:", err);
        errorDiv.innerText = "ERRO AO CARREGAR GRÁFICOS: " + err.message;
    }
}

// Inicia a execução apenas quando a janela carregar
window.onload = renderCharts;