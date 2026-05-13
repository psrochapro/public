const canvas = document.getElementById('main-canvas');
const ctx = canvas.getContext('2d');
const inputs = document.querySelectorAll('input, textarea, select');
const btnDownload = document.getElementById('btn-download');
const btnRemoveImg = document.getElementById('btn-remove-img');
const inputURL = document.getElementById('input-url');
const inputFile = document.getElementById('input-file');

let userImage = null;

function init() {
    inputs.forEach(input => input.addEventListener('input', render));
    
    // Upload Local
    inputFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            inputURL.value = ''; // Limpa URL se subir arquivo
            const reader = new FileReader();
            reader.onload = (ev) => loadImage(ev.target.result);
            reader.readAsDataURL(file);
        }
    });

    // URL Externa
    inputURL.addEventListener('change', (e) => {
        if (e.target.value.trim() !== '') {
            inputFile.value = ''; // Limpa arquivo se colar URL
            loadImage(e.target.value.trim());
        }
    });

    btnRemoveImg.onclick = () => {
        userImage = null;
        inputFile.value = '';
        inputURL.value = '';
        render();
    };

    render();
}

function loadImage(src) {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Tenta carregar com CORS
    img.onload = () => {
        userImage = img;
        render();
    };
    img.onerror = () => {
        alert("Não foi possível carregar esta imagem devido a restrições de segurança do site de origem (CORS). Tente baixar a imagem e fazer o upload local.");
        userImage = null;
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

// Lógica de Processamento de Texto com Margem de Segurança para Fontes Script
function processText(context, text, maxWidth, fontSize, fontFace) {
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';
    context.font = `${fontSize}px "${fontFace}"`;

    // Se for Script, reduzimos a largura disponível para evitar vazamento das "caudas" das letras
    const safeMaxWidth = fontFace === 'Dancing Script' ? maxWidth * 0.85 : maxWidth;

    for (let n = 0; n < words.length; n++) {
        let testLine = currentLine + words[n] + ' ';
        let metrics = context.measureText(testLine);
        if (metrics.width > safeMaxWidth && n > 0) {
            lines.push(currentLine.trim());
            currentLine = words[n] + ' ';
        } else {
            currentLine = testLine;
        }
    }
    lines.push(currentLine.trim());
    
    const spacing = fontFace === 'Dancing Script' ? 1.4 : 1.25;
    return {
        lines,
        totalHeight: lines.length * (fontSize * spacing),
        lineHeight: fontSize * spacing
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

    ctx.fillStyle = themeColor;
    ctx.fillRect(0, 0, width, height);

    const textColor = getContrastYIQ(themeColor);
    ctx.fillStyle = textColor;
    
    let safeWidth = width - (padding * 2);
    let safeHeight = height - (padding * 2);
    let currentY = padding;
    let textAnchorX = width / 2;

    if (userImage) {
        const imgSize = width * imgSizeFactor;
        if (imgPos === 'top') {
            const imgX = (width - imgSize) / 2;
            drawImg(userImage, imgX, padding, imgSize, imgShape, filter, textColor);
            currentY = padding + imgSize + 50;
            safeHeight -= (imgSize + 50);
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

    const titleText = document.getElementById('input-title').value.toUpperCase();
    const quoteText = `“${document.getElementById('input-quote').value || ''}”`;
    const authorText = document.getElementById('input-author').value;
    const yearText = document.getElementById('input-year').value;
    const fullAuthor = authorText ? `— ${authorText}${yearText ? ', ' + yearText : ''}` : '';

    let fontSize = (layout === '9:16') ? 85 : 60;
    if (fontFace === 'Dancing Script') fontSize += 15; // Script precisa ser maior para ser legível

    let textData;
    // Loop de Auto-ajuste de fonte
    while (fontSize > 15) {
        textData = processText(ctx, quoteText, safeWidth, fontSize, fontFace);
        const totalH = (titleText ? 50 : 0) + textData.totalHeight + (fullAuthor ? 60 : 0);
        if (totalH <= safeHeight) break;
        fontSize -= 2;
    }

    const startY = currentY + (safeHeight - (textData.totalHeight + (titleText ? 50 : 0) + (fullAuthor ? 60 : 0))) / 2;
    let drawY = startY;

    if (titleText) {
        ctx.font = `bold 22px Montserrat`;
        ctx.globalAlpha = 0.5;
        ctx.fillText(titleText, textAnchorX, drawY);
        ctx.globalAlpha = 1.0;
        drawY += 50;
    }

    ctx.font = `${fontSize}px "${fontFace}"`;
    textData.lines.forEach(line => {
        // No caso do Script centralizado, adicionamos um pequeno offset para compensar a inclinação visual
        const xPos = (ctx.textAlign === 'center' && fontFace === 'Dancing Script') ? textAnchorX + 10 : textAnchorX;
        ctx.fillText(line, xPos, drawY + fontSize * 0.8);
        drawY += textData.lineHeight;
    });

    if (fullAuthor) {
        drawY += 30;
        ctx.font = `italic ${Math.max(22, fontSize * 0.5)}px "${fontFace}"`;
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
    ctx.strokeStyle = borderColor;
    ctx.globalAlpha = 0.2;
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