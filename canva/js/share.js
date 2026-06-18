const share = {
    // Gera o link e copia para o clipboard
    generateShareLink() {
        const rawContent = persistence.getContentString();
        if (!rawContent || rawContent.trim() === "") {
            alert("Não há dados para compartilhar. Importe um arquivo primeiro.");
            return;
        }

        try {
            // Codificação segura para UTF-8 (Base64)
            const encodedData = btoa(unescape(encodeURIComponent(rawContent)));
            const baseUrl = window.location.origin + window.location.pathname;
            const shareUrl = `${baseUrl}?data=${encodedData}`;

            // Copiar para o clipboard
            navigator.clipboard.writeText(shareUrl).then(() => {
                alert("Link de compartilhamento copiado para o clipboard!");
            }).catch(err => {
                console.error('Erro ao copiar:', err);
                alert("Link gerado: " + shareUrl);
            });
        } catch (e) {
            console.error(e);
            alert("Erro ao gerar link. O arquivo pode ser grande demais.");
        }
    },

    // Verifica se existe dado na URL ao carregar a página
    checkUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const encodedData = urlParams.get('data');

        if (encodedData) {
            try {
                const decodedContent = decodeURIComponent(escape(atob(encodedData)));
                const data = parser.parse(decodedContent);
                renderer.render(data);
                
                // Limpar a URL para ficar esteticamente melhor sem remover os dados da memória
                window.history.replaceState({}, document.title, window.location.pathname);
            } catch (e) {
                console.error("Erro ao decodificar dados da URL:", e);
            }
        }
    }
};