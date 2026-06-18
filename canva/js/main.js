document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const data = parser.parse(text);
        renderer.render(data);
    };
    reader.readAsText(file);

    // Limpa o valor do input para permitir que o mesmo arquivo seja re-importado
    // Isso resolve o problema do evento 'change' não disparar para nomes idênticos
    this.value = '';
});

// Ao carregar a página, verifica se veio de um link compartilhado (Async)
window.addEventListener('load', async () => {
    await share.checkUrl();
});