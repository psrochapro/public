// Registrar o plugin globalmente ANTES de qualquer função
Chart.register(ChartDataLabels);

// Configuração Global de Cores e Estilo
const azulCiano = 'rgba(0, 255, 255, 0.6)';
const azulBorda = '#00ffff';
const corTexto = '#ffffff';

async function carregarDashboard() {
    try {
        // Fetch com caminho relativo para funcionar no GitHub Pages
        const resposta = await fetch('./dados.json');
        
        if (!resposta.ok) throw new Error('Falha ao carregar dados.json');
        
        const dados = await resposta.json();

        // 1. CONFIGURAÇÃO GRÁFICO DE COLUNAS (Vendas)
        new Chart(document.getElementById('chartVendas'), {
            type: 'bar',
            data: {
                labels: dados.vendas_mensais.labels,
                datasets: [{
                    label: dados.vendas_mensais.titulo,
                    data: dados.vendas_mensais.valores,
                    backgroundColor: azulCiano,
                    borderColor: azulBorda,
                    borderWidth: 1
                }]
            },
            options: getBaseOptions()
        });

        // 2. CONFIGURAÇÃO GRÁFICO DE ROSCA (Quadrantes)
        new Chart(document.getElementById('chartRosca'), {
            type: 'doughnut',
            data: {
                labels: dados.quadrantes.labels,
                datasets: [{
                    data: dados.quadrantes.valores,
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

        // 3. CONFIGURAÇÃO GRÁFICO DE LINHAS (Evolução)
        new Chart(document.getElementById('chartLinha'), {
            type: 'line',
            data: {
                labels: dados.evolucao_performance.labels,
                datasets: [{
                    label: dados.evolucao_performance.titulo,
                    data: dados.evolucao_performance.valores,
                    borderColor: azulBorda,
                    backgroundColor: 'rgba(0, 255, 255, 0.1)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: getBaseOptions()
        });

        // 4. CONFIGURAÇÃO GRÁFICO DE BARRAS HORIZONTAIS (Top Produtos)
        new Chart(document.getElementById('chartBarras'), {
            type: 'bar',
            data: {
                labels: dados.top_produtos.labels,
                datasets: [{
                    label: dados.top_produtos.titulo,
                    data: dados.top_produtos.valores,
                    backgroundColor: 'rgba(0, 200, 255, 0.6)',
                    borderColor: azulBorda,
                    borderWidth: 1
                }]
            },
            options: {
                ...getBaseOptions(),
                indexAxis: 'y' // Torna a barra horizontal
            }
        });

    } catch (erro) {
        console.error('Erro na aplicação:', erro);
        document.body.innerHTML += `<div style="color:red; text-align:center; padding:20px;">Erro ao carregar dados: ${erro.message}</div>`;
    }
}

// Função para retornar as opções padrão e evitar repetição de código
function getBaseOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                color: corTexto,
                anchor: 'end',
                align: 'top',
                font: { weight: 'bold', size: 11 },
                formatter: (val) => val
            },
            legend: {
                display: true,
                labels: { color: corTexto, font: { size: 12 } }
            }
        },
        scales: {
            x: { ticks: { color: corTexto }, grid: { display: false } },
            y: { 
                beginAtZero: true, 
                ticks: { color: corTexto }, 
                grid: { color: 'rgba(255,255,255,0.1)' } 
            }
        }
    };
}

// Inicia o carregamento
carregarDashboard();