async function carregarGrafico() {
    // 1. Busca os dados do arquivo JSON
    const resposta = await fetch('dados.json');
    const dados = await resposta.json();

    // 2. Seleciona o elemento canvas
    const ctx = document.getElementById('meuGrafico').getContext('2d');

    // 3. Cria o gráfico
    new Chart(ctx, {
        type: 'bar', // Tipo do gráfico (pode ser 'line', 'pie', etc)
        data: {
            labels: dados.labels,
            datasets: [{
                label: dados.titulo,
                data: dados.valores,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Inicializa a função
carregarGrafico();