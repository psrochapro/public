const picker = document.getElementById('picker');
const hexText = document.getElementById('hex-value');
const badge = document.getElementById('accessibility-badge');
const copyCssBtn = document.getElementById('copy-css');

function adjustColor(hex, amount) {
    return '#' + hex.replace(/^#/, '').replace(/../g, char => 
        ('0' + Math.min(255, Math.max(0, parseInt(char, 16) + amount)).toString(16)).substr(-2));
}

function getContrastYIQ(hexcolor){
    hexcolor = hexcolor.replace("#", "");
    const r = parseInt(hexcolor.substr(0,2),16);
    const g = parseInt(hexcolor.substr(2,2),16);
    const b = parseInt(hexcolor.substr(4,2),16);
    const yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
}

function rgbToHex(rgb) {
    const rgbValues = rgb.match(/\d+/g);
    return `#${((1 << 24) + (parseInt(rgbValues[0]) << 16) + (parseInt(rgbValues[1]) << 8) + parseInt(rgbValues[2])).toString(16).slice(1)}`;
}

const updateTheme = (color) => {
    const root = document.documentElement;
    const light = adjustColor(color, 45);
    const dark = adjustColor(color, -45);
    const contrastColor = getContrastYIQ(color);

    root.style.setProperty('--primary-color', color);
    root.style.setProperty('--primary-light', light);
    root.style.setProperty('--primary-dark', dark);
    root.style.setProperty('--primary-contrast', contrastColor);

    hexText.textContent = color.toUpperCase();
    
    if (contrastColor === '#ffffff') {
        badge.textContent = "CONTRASTE: BOM (TEXTO BRANCO)";
        badge.className = "badge-check badge-pass";
    } else {
        badge.textContent = "CONTRASTE: BAIXO (REQUER TEXTO ESCURO)";
        badge.className = "badge-check badge-fail";
    }
};

picker.addEventListener('input', (e) => updateTheme(e.target.value));

document.querySelectorAll('.swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
        const hexColor = rgbToHex(window.getComputedStyle(swatch).backgroundColor);
        picker.value = hexColor;
        updateTheme(hexColor);
    });
});

// Copiar HEX
hexText.addEventListener('click', () => {
    const text = hexText.textContent;
    navigator.clipboard.writeText(text).then(() => {
        hexText.textContent = "COPIADO! 🎉";
        setTimeout(() => hexText.textContent = text, 1000);
    });
});

// NOVO: Copiar variáveis CSS
copyCssBtn.addEventListener('click', () => {
    const color = picker.value;
    const light = adjustColor(color, 45);
    const dark = adjustColor(color, -45);
    const contrast = getContrastYIQ(color);

    const cssCode = `--primary: ${color};\n--primary-light: ${light};\n--primary-dark: ${dark};\n--contrast: ${contrast};`;
    
    navigator.clipboard.writeText(cssCode).then(() => {
        const originalText = copyCssBtn.textContent;
        copyCssBtn.textContent = "CÓDIGO COPIADO!";
        setTimeout(() => copyCssBtn.textContent = originalText, 1500);
    });
});

updateTheme(picker.value);