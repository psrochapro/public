const share = {
    // Gera o link comprimido e copia para o clipboard
    async generateShareLink() {
        const rawContent = persistence.getContentString();
        if (!rawContent || rawContent.trim() === "") {
            alert("Não há dados para compartilhar. Importe um arquivo primeiro.");
            return;
        }

        try {
            // 1. Comprimir o texto usando GZIP nativo
            const stream = new Blob([rawContent]).stream();
            const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));
            const chunks = [];
            const reader = compressedStream.getReader();
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
            }
            
            const compressedBuffer = await new Blob(chunks).arrayBuffer();
            
            // 2. Converter o buffer comprimido para Base64
            const base64 = btoa(String.fromCharCode(...new Uint8Array(compressedBuffer)));
            
            // 3. Montar a URL usando HASH (#) para evitar erro de servidor (URI Too Long)
            const baseUrl = window.location.origin + window.location.pathname;
            const shareUrl = `${baseUrl}#data=${base64}`;

            // 4. Copiar para o clipboard
            await navigator.clipboard.writeText(shareUrl);
            alert("Link de compartilhamento comprimido e copiado!");
            
        } catch (e) {
            console.error(e);
            alert("Erro ao gerar link comprimido.");
        }
    },

    // Verifica se existe dado na URL (hash) ao carregar a página
    async checkUrl() {
        const hash = window.location.hash;
        if (!hash.startsWith('#data=')) return;

        const base64 = hash.substring(6);

        try {
            // 1. Converter Base64 para Buffer
            const binaryString = atob(base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // 2. Descomprimir GZIP
            const stream = new Blob([bytes]).stream();
            const decompressedStream = stream.pipeThrough(new DecompressionStream('gzip'));
            const text = await new Response(decompressedStream).text();

            // 3. Renderizar
            const data = parser.parse(text);
            renderer.render(data);
            
            // Limpar o hash da URL para ficar limpo
            window.history.replaceState({}, document.title, window.location.pathname);
        } catch (e) {
            console.error("Erro ao descomprimir dados da URL:", e);
            alert("O link de compartilhamento é inválido ou está corrompido.");
        }
    }
};