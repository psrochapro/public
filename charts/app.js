// Registrar o plugin de rótulos de dados globalmente
Chart.register(ChartDataLabels);

async function carregarGrafico() {
    try {
        const resposta = await fetch('dados.json');
        if (!resposta.ok) throw new Error('Não foi possível carregar o JSON');
        
        const dados = await resposta.json();
        const ctx = document.getElementById('meuGrafico').getContext('2d');

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dados.labels,
                datasets: [{
                    label: dados.titulo,
                    data: dados.valores,
                    backgroundColor: 'rgba(0, 255, 255, 0.4)', // Ciano translúcido
                    borderColor: '#00ffff', // Borda ciano sólida
                    borderWidth: 2,
                    borderRadius: 8,
                    hoverBackgroundColor: 'rgba(0, 255, 255, 0.6)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    // Configuração dos Rótulos de Dados (Datalabels)
                    datalabels: {
                        color: '#ffffff',
                        anchor: 'end',
                        align: 'top',
                        offset: 5,
                        font: {
                            weight: 'bold',
                            size: 14
                        },
                        formatter: (value) => value // Exibe o valor puro
                    },
                    legend: {
                        display: true,
                        labels: {
                            color: '#ffffff',
                            font: { size: 14 }
                        }
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)'
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#ffffff' },
                        grid: { display: false } // Remove grade vertical interna
                    },
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#ffffff' },
                        grid: { 
                            color: 'rgba(255, 255, 255, 0.1)',
                            drawBorder: false 
                        }
                    }
                }
            }
        });
    } catch (erro) {
        console.error('Erro na aplicação:', erro);
    }
}

carregarGrafico();