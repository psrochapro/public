// Seleção de elementos do DOM
const picker = document.getElementById('picker');
const preview = document.getElementById('preview');
const hexText = document.getElementById('hex-value');

/**
 * Atualiza os elementos visuais da interface
 * @param {string} color - O valor hexadecimal da cor
 */
const updateUI = (color) => {
    const upperColor = color.toUpperCase();
    preview.style.backgroundColor = upperColor;
    hexText.textContent = upperColor;
};

// Evento de entrada (dispara enquanto o usuário arrasta o seletor)
picker.addEventListener('input', (event) => {
    updateUI(event.target.value);
});

// Funcionalidade de copiar para o clipboard
hexText.addEventListener('click', () => {
    const text = hexText.textContent;
    navigator.clipboard.writeText(text).then(() => {
        // Feedback visual simples
        const originalText = text;
        hexText.textContent = "COPIADO!";
        setTimeout(() => hexText.textContent = originalText, 1000);
    });
});