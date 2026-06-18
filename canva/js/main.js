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
});

// Ao carregar a página, verifica se veio de um link compartilhado (Async)
window.addEventListener('load', async () => {
    await share.checkUrl();
});