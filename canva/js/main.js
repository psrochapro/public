document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        
        // Ao importar, o editor.setContent já cuida de salvar no LocalStorage
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

// Inicialização Orquestrada
window.addEventListener('load', async () => {
    // 1. Inicia os componentes básicos
    if (typeof editor !== 'undefined') {
        editor.init();
    }

    // 2. Tenta carregar dados da URL (Prioridade 1)
    const urlContent = await share.checkUrl();
    
    if (urlContent) {
        editor.setContent(urlContent);
        console.log("Dados carregados via Link.");
    } else {
        // 3. Se não houver URL, tenta carregar do LocalStorage (Prioridade 2)
        const localDraft = persistence.loadFromLocal();
        if (localDraft && localDraft.trim() !== "") {
            editor.setContent(localDraft);
            console.log("Rascunho restaurado do navegador.");
        }
    }
});