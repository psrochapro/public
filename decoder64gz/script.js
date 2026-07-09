document.addEventListener('DOMContentLoaded', () => {
    const inputArea = document.getElementById('inputData');
    const outputArea = document.getElementById('outputData');
    const decodeBtn = document.getElementById('decodeBtn');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');

    async function decodeGzipBase64(base64String) {
        try {
            const cleanBase64 = base64String.trim().replace(/\s/g, '');
            const binaryString = atob(cleanBase64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            const stream = new Blob([bytes]).stream();
            const decompressedStream = stream.pipeThrough(new DecompressionStream('gzip'));
            const response = new Response(decompressedStream);
            return await response.text();
        } catch (error) {
            throw new Error('Formato inválido ou falha na descompressão.');
        }
    }

    function extractBase64(input) {
        if (input.includes('#data=')) {
            return input.split('#data=')[1];
        }
        if (input.includes('?data=')) {
            const urlParams = new URLSearchParams(input.split('?')[1]);
            return urlParams.get('data');
        }
        return input;
    }

    const handleDecode = async () => {
        const inputVal = inputArea.value.trim();
        if (!inputVal) return;

        outputArea.value = 'Processando...';
        
        try {
            const base64Part = extractBase64(inputVal);
            const decodedText = await decodeGzipBase64(base64Part);
            outputArea.value = decodedText;
        } catch (error) {
            outputArea.value = 'Erro: ' + error.message;
        }
    };

    decodeBtn.addEventListener('click', handleDecode);

    copyBtn.addEventListener('click', () => {
        if (!outputArea.value || outputArea.value.startsWith('Erro:')) return;
        
        navigator.clipboard.writeText(outputArea.value).then(() => {
            const originalText = copyBtn.innerText;
            copyBtn.innerText = 'Copiado!';
            copyBtn.style.color = '#10b981';
            setTimeout(() => {
                copyBtn.innerText = originalText;
                copyBtn.style.color = '';
            }, 2000);
        });
    });

    clearBtn.addEventListener('click', () => {
        inputArea.value = '';
        outputArea.value = '';
        inputArea.focus();
    });
});