document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        
        if (typeof editor !== 'undefined') {
            editor.setContent(text);
        } else {
            const data = parser.parse(text);
            renderer.render(data);
        }
    };
    reader.readAsText(file);

    this.value = '';
});

// Ao carregar a página
window.addEventListener('load', async () => {
    // 1. Verifica se existe dado na URL (Prioridade Máxima)
    const urlDataPresent = window.location.hash.startsWith('#data=');
    if (urlDataPresent) {
        await share.checkUrl();
    }

    // 2. Inicializa o editor
    if (typeof editor !== 'undefined') {
        editor.init();

        // 3. Se a URL estava vazia, tenta carregar do LocalStorage
        if (!urlDataPresent) {
            const localDraft = persistence.loadFromLocal();
            if (localDraft && localDraft.trim() !== "") {
                editor.setContent(localDraft);
                console.log("Rascunho restaurado do LocalStorage.");
            }
        }
    }
});