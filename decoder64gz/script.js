document.addEventListener('DOMContentLoaded', () => {
    const inputArea = document.getElementById('inputData');
    const outputArea = document.getElementById('outputData');
    const decodeBtn = document.getElementById('decodeBtn');

    async function decodeGzipBase64(base64String) {
        try {
            // Limpa a string de possíveis espaços ou quebras de linha
            const cleanBase64 = base64String.trim().replace(/\s/g, '');
            
            // Converte Base64 para Uint8Array
            const binaryString = atob(cleanBase64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // Decompressão Gzip usando DecompressionStream API
            const stream = new Blob([bytes]).stream();
            const decompressedStream = stream.pipeThrough(new DecompressionStream('gzip'));
            
            const response = new Response(decompressedStream);
            const text = await response.text();
            
            return text;
        } catch (error) {
            throw new Error('Falha ao decodificar: Verifique se o formato está correto.');
        }
    }

    function extractBase64(input) {
        // Verifica se é um link com o padrão #data=
        if (input.includes('#data=')) {
            return input.split('#data=')[1];
        }
        // Se houver parâmetros de query ?data=
        if (input.includes('?data=')) {
            const urlParams = new URLSearchParams(input.split('?')[1]);
            return urlParams.get('data');
        }
        // Caso contrário, assume que é a string pura
        return input;
    }

    decodeBtn.addEventListener('click', async () => {
        const inputVal = inputArea.value.trim();
        
        if (!inputVal) {
            alert('Por favor, insira um link ou código Base64.');
            return;
        }

        outputArea.value = 'Processando...';

        try {
            const base64Part = extractBase64(inputVal);
            const decodedText = await decodeGzipBase64(base64Part);
            outputArea.value = decodedText;
        } catch (error) {
            outputArea.value = 'Erro: ' + error.message;
        }
    });
});