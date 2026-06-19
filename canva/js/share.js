const share = {
    // Helper para feedback visual sem alert()
    showToast(msg) {
        console.log("Status: " + msg); // Placeholder para um futuro sistema de toast
    },

    async generateShareLink() {
        const rawContent = persistence.getContentString();
        if (!rawContent || rawContent.trim() === "") {
            alert("⚠️ Nada para compartilhar.");
            return;
        }

        try {
            const stream = new Blob([rawContent]).stream();
            const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));
            const response = new Response(compressedStream);
            const compressedBuffer = await response.arrayBuffer();
            
            const bytes = new Uint8Array(compressedBuffer);
            let binary = '';
            for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            const base64 = btoa(binary);
            
            const baseUrl = window.location.origin + window.location.pathname;
            const shareUrl = `${baseUrl}#data=${base64}`;

            await navigator.clipboard.writeText(shareUrl);
            alert("🔗 Link de compartilhamento copiado!");
            
        } catch (e) {
            console.error(e);
            alert("❌ Erro ao gerar link.");
        }
    },

    async checkUrl() {
        const hash = window.location.hash;
        if (!hash.startsWith('#data=')) return null;

        const base64 = hash.substring(6);

        try {
            const binaryString = atob(base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            const stream = new Blob([bytes]).stream();
            const decompressedStream = stream.pipeThrough(new DecompressionStream('gzip'));
            const text = await new Response(decompressedStream).text();

            // Limpa o hash da URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            return text; // Retorna o texto para ser usado pelo main.js
        } catch (e) {
            console.error("Erro ao descomprimir dados:", e);
            alert("❌ O link é inválido ou está corrompido.");
            return null;
        }
    }
};