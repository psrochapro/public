const picker = document.getElementById('picker');
const hexText = document.getElementById('hex-value');

// Função para clarear/escurecer cor (HEX)
function adjustColor(hex, amount) {
    return '#' + hex.replace(/^#/, '').replace(/../g, hex => 
        ('0' + Math.min(255, Math.max(0, parseInt(hex, 16) + amount)).toString(16)).substr(-2));
}

const updateTheme = (color) => {
    const root = document.documentElement;
    const light = adjustColor(color, 40);
    const dark = adjustColor(color, -40);

    // Atualiza variáveis CSS
    root.style.setProperty('--primary-color', color);
    root.style.setProperty('--primary-light', light);
    root.style.setProperty('--primary-dark', dark);

    // Atualiza texto HEX
    hexText.textContent = color.toUpperCase();
};

// Evento do Seletor
picker.addEventListener('input', (e) => {
    updateTheme(e.target.value);
});

// Copiar para o clipboard com feedback visual
hexText.addEventListener('click', () => {
    const originalText = hexText.textContent;
    navigator.clipboard.writeText(originalText).then(() => {
        hexText.textContent = "COPIADO! 🎉";
        hexText.style.color = "var(--primary-color)";
        
        setTimeout(() => {
            hexText.textContent = originalText;
            hexText.style.color = "var(--text-main)";
        }, 1000);
    });
});

// Inicialização
updateTheme(picker.value);