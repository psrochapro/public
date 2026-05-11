// Seleção de elementos
const picker = document.getElementById('picker');
const hexText = document.getElementById('hex-value');
const badge = document.getElementById('accessibility-badge');

/**
 * Ajusta a luminosidade de uma cor HEX
 * @param {string} hex - Cor original
 * @param {number} amount - Valor positivo para clarear, negativo para escurecer
 */
function adjustColor(hex, amount) {
    return '#' + hex.replace(/^#/, '').replace(/../g, char => 
        ('0' + Math.min(255, Math.max(0, parseInt(char, 16) + amount)).toString(16)).substr(-2));
}

/**
 * Calcula o contraste ideal (Preto ou Branco) para o fundo fornecido
 */
function getContrastYIQ(hexcolor){
    hexcolor = hexcolor.replace("#", "");
    const r = parseInt(hexcolor.substr(0,2),16);
    const g = parseInt(hexcolor.substr(2,2),16);
    const b = parseInt(hexcolor.substr(4,2),16);
    const yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? 'black' : 'white';
}

/**
 * Converte RGB (do computed style) para HEX
 */
function rgbToHex(rgb) {
    const rgbValues = rgb.match(/\d+/g);
    const r = parseInt(rgbValues[0]).toString(16).padStart(2, '0');
    const g = parseInt(rgbValues[1]).toString(16).padStart(2, '0');
    const b = parseInt(rgbValues[2]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
}

/**
 * Atualiza toda a interface do app
 */
const updateTheme = (color) => {
    const root = document.documentElement;
    const light = adjustColor(color, 45);
    const dark = adjustColor(color, -45);
    const contrast = getContrastYIQ(color);

    // Atualiza variáveis CSS globais
    root.style.setProperty('--primary-color', color);
    root.style.setProperty('--primary-light', light);
    root.style.setProperty('--primary-dark', dark);

    // Atualiza textos
    hexText.textContent = color.toUpperCase();
    
    // Atualiza o Badge de Acessibilidade
    if (contrast === 'white') {
        badge.textContent = "CONSTRATE: BOM (TEXTO BRANCO)";
        badge.className = "badge-check badge-pass";
    } else {
        badge.textContent = "CONTRASTE: BAIXO (REQUER TEXTO ESCURO)";
        badge.className = "badge-check badge-fail";
    }
};

// Eventos do seletor principal
picker.addEventListener('input', (e) => {
    updateTheme(e.target.value);
});

// Tornar as variações da paleta clicáveis
document.querySelectorAll('.swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
        const computedColor = window.getComputedStyle(swatch).backgroundColor;
        const hexColor = rgbToHex(computedColor);
        picker.value = hexColor;
        updateTheme(hexColor);
    });
});

// Funcionalidade de copiar
hexText.addEventListener('click', () => {
    const originalText = hexText.textContent;
    navigator.clipboard.writeText(originalText).then(() => {
        hexText.textContent = "COPIADO! 🎉";
        setTimeout(() => {
            hexText.textContent = originalText;
        }, 1000);
    });
});

// Inicialização
updateTheme(picker.value);