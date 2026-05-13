const canvas = document.getElementById('main-canvas');
const ctx = canvas.getContext('2d');
const inputs = document.querySelectorAll('input, textarea, select');
const btnDownload = document.getElementById('btn-download');

let userImage = null;

function init() {
    inputs.forEach(input => input.addEventListener('input', render));
    
    // File upload
    document.getElementById('input-file').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => loadImage(ev.target.result);
            reader.readAsDataURL(file);
        }
    });

    // URL upload
    document.getElementById('input-url').addEventListener('input', (e) => {
        if (e.target.value.startsWith('http')) {
            loadImage(e.target.value);
        }
    });

    render();
}

function loadImage(src) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
        userImage = img;
        render();
    };
    img.src = src;
}

function getContrastYIQ(hexcolor){
    hexcolor = hexcolor.replace("#", "");
    const r = parseInt(hexcolor.substr(0,2),16);
    const g = parseInt(hexcolor.substr(2,2),16);
    const b = parseInt(hexcolor.substr(4,2),16);
    const yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? '#1a1a1a' : '#ffffff';
}

// Função de quebra de linha com detecção de Script
function processText(context, text, maxWidth, fontSize, fontFace) {
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';
    context.font = `${fontSize}px "${fontFace}"`;

    // Multiplicador de espaçamento: Script precisa de mais ar vertical
    const spacingFactor = fontFace === 'Dancing Script' ? 1.5 : 1.3;

    for (let n = 0; n < words.length; n++) {
        let testLine = currentLine + words[n] + ' ';
        let metrics = context.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
            lines.push(currentLine.trim());
            currentLine = words[n] + ' ';
        } else {
            currentLine = testLine;
        }
    }
    lines.push(currentLine.trim());
    
    return {
        lines,
        totalHeight: lines.length * (fontSize * spacingFactor),
        lineHeight: fontSize * spacingFactor
    };
}

function render() {
    const layout = document.getElementById('input-layout').value;
    const themeColor = document.getElementById('input-color').value;
    const fontFace = document.getElementById('input-font').value;
    const padding = parseInt(document.getElementById('input-padding').value);
    const imgPos = document.getElementById('input-img-pos').value;
    const imgShape = document.getElementById('input-img-shape').value;
    const imgSizeFactor = document.getElementById('input-img-size').value / 100;
    const filter = document.getElementById('input-filter').value;

    let width = 1080;
    let height = 1080;
    if (layout === '16:9') height = 608;
    if (layout === '9:16') height = 1920;

    canvas.width = width;
    canvas.height = height;

    // Fundo
    ctx.fillStyle = themeColor;
    ctx.fillRect(0, 0, width, height);

    const textColor = getContrastYIQ(themeColor);
    ctx.fillStyle = textColor;
    
    let safeWidth = width - (padding * 2);
    let safeHeight = height - (padding * 2);
    let currentY = padding;
    let textAnchorX = width / 2;

    // 1. Renderizar Imagem e ajustar espaço disponível
    if (userImage) {
        const imgSize = width * imgSizeFactor;
        if (imgPos === 'top') {
            const imgX = (width - imgSize) / 2;
            drawImg(userImage, imgX, padding, imgSize, imgShape, filter, textColor);
            currentY = padding + imgSize + 40;
            safeHeight -= (imgSize + 40);
            ctx.textAlign = 'center';
        } else {
            const imgY = (height - imgSize) / 2;
            drawImg(userImage, padding, imgY, imgSize, imgShape, filter, textColor);
            textAnchorX = padding + imgSize + 60;
            safeWidth = width - textAnchorX - padding;
            ctx.textAlign = 'left';
        }
    } else {
        ctx.textAlign = 'center';
    }

    // 2. Lógica de Redimensionamento Dinâmico (Auto-Fit)
    const titleText = document.getElementById('input-title').value.toUpperCase();
    const quoteText = `“${document.getElementById('input-quote').value || ''}”`;
    const authorText = document.getElementById('input-author').value;
    const yearText = document.getElementById('input-year').value;
    const fullAuthor = authorText ? `— ${authorText}${yearText ? ', ' + yearText : ''}` : '';

    let fontSize = (layout === '9:16') ? 80 : 55;
    let textData;

    // Loop de segurança: reduz a fonte até caber na altura restante
    while (fontSize > 15) {
        textData = processText(ctx, quoteText, safeWidth, fontSize, fontFace);
        const titleH = titleText ? 50 : 0;
        const authorH = fullAuthor ? 60 : 0;
        
        if ((textData.totalHeight + titleH + authorH) <= safeHeight) break;
        fontSize -= 2;
    }

    // 3. Desenhar Textos
    // Centralizar bloco de texto verticalmente no espaço que sobrou
    const totalBlockHeight = textData.totalHeight + (titleText ? 50 : 0) + (fullAuthor ? 60 : 0);
    const startY = currentY + (safeHeight - totalBlockHeight) / 2;
    let drawY = startY;

    // Título
    if (titleText) {
        ctx.font = `bold 24px Montserrat`;
        ctx.globalAlpha = 0.5;
        ctx.fillText(titleText, textAnchorX, drawY);
        ctx.globalAlpha = 1.0;
        drawY += 60;
    }

    // Citação
    ctx.font = `${fontSize}px "${fontFace}"`;
    if (fontFace === 'Dancing Script') ctx.font = `700 ${fontSize + 15}px "${fontFace}"`;

    textData.lines.forEach(line => {
        ctx.fillText(line, textAnchorX, drawY + fontSize);
        drawY += textData.lineHeight;
    });

    // Autor
    if (fullAuthor) {
        drawY += 40;
        ctx.font = `italic ${Math.max(22, fontSize * 0.6)}px "${fontFace}"`;
        ctx.globalAlpha = 0.8;
        ctx.fillText(fullAuthor, textAnchorX, drawY);
    }
}

function drawImg(img, x, y, size, shape, filter, borderColor) {
    ctx.save();
    ctx.filter = filter;
    
    if (shape === 'circle') {
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
        ctx.clip();
    }
    
    const aspect = img.width / img.height;
    let sw, sh, sx, sy;
    if (aspect > 1) {
        sh = img.height; sw = img.height;
        sx = (img.width - sw) / 2; sy = 0;
    } else {
        sw = img.width; sh = img.width;
        sx = 0; sy = (img.height - sh) / 2;
    }
    
    ctx.drawImage(img, sx, sy, sw, sh, x, y, size, size);
    ctx.restore();
    
    // Borda sutil
    ctx.strokeStyle = borderColor;
    ctx.globalAlpha = 0.2;
    ctx.lineWidth = 2;
    if (shape === 'circle') {
        ctx.beginPath(); ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2); ctx.stroke();
    } else {
        ctx.strokeRect(x, y, size, size);
    }
    ctx.globalAlpha = 1.0;
}

btnDownload.onclick = () => {
    const link = document.createElement('a');
    link.download = 'citacao-pro.png';
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
};

document.fonts.ready.then(init);