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
    
    inputFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            inputURL.value = '';
            const reader = new FileReader();
            reader.onload = (ev) => loadImage(ev.target.result);
            reader.readAsDataURL(file);
        }
    });

    inputURL.addEventListener('input', (e) => {
        if (e.target.value.trim().startsWith('http')) {
            inputFile.value = '';
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
    img.crossOrigin = "anonymous";
    img.onload = () => { userImage = img; render(); };
    img.onerror = () => {
        alert("Erro de CORS ou Link inválido. Tente baixar a imagem e fazer o upload local.");
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

function drawBackgroundPattern(color, width, height, userOpacity) {
    if (userOpacity <= 0) return;
    
    ctx.save();
    const contrastColor = getContrastYIQ(color);
    ctx.strokeStyle = contrastColor;
    ctx.fillStyle = contrastColor;

    // Círculos
    ctx.globalAlpha = userOpacity / 100;
    for(let i = 0; i < 6; i++) {
        ctx.beginPath();
        const radius = 100 + (Math.random() * 250);
        ctx.lineWidth = 1 + (Math.random() * 4);
        ctx.arc(Math.random() * width, Math.random() * height, radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Linhas
    ctx.globalAlpha = (userOpacity / 100) * 0.5;
    ctx.lineWidth = 2;
    for(let i = -height; i < width; i += 60) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + height, height);
        ctx.stroke();
    }
    ctx.restore();
}

function processText(context, text, maxWidth, fontSize, fontFace) {
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';
    context.font = `${fontSize}px "${fontFace}"`;

    const safeMaxWidth = fontFace === 'Dancing Script' ? maxWidth * 0.82 : maxWidth;

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

function drawImgWithFrame(img, x, y, size, shape, filter, accentColor) {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 15;

    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3;
    if (shape === 'circle') {
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/2 + 12, 0, Math.PI * 2);
        ctx.stroke();
    } else {
        ctx.strokeRect(x - 12, y - 12, size + 24, size + 24);
    }
    
    ctx.shadowColor = "transparent";
    
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

    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 1.5;
    if (shape === 'circle') {
        ctx.beginPath(); ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2); ctx.stroke();
    } else {
        ctx.strokeRect(x, y, size, size);
    }
    ctx.restore();
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
    const bgOpacity = document.getElementById('input-bg-opacity').value;
    const borderOpacity = document.getElementById('input-border-opacity').value;

    let width = 1080;
    let height = 1080;
    if (layout === '16:9') height = 608;
    if (layout === '9:16') height = 1920;

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = themeColor;
    ctx.fillRect(0, 0, width, height);

    drawBackgroundPattern(themeColor, width, height, bgOpacity);

    const textColor = getContrastYIQ(themeColor);
    
    // Borda do Card Controlada pelo Usuário
    if (borderOpacity > 0) {
        ctx.strokeStyle = textColor;
        ctx.globalAlpha = borderOpacity / 100;
        ctx.lineWidth = 20;
        ctx.strokeRect(10, 10, width - 20, height - 20);
        ctx.globalAlpha = 1.0;
    }

    let safeWidth = width - (padding * 2);
    let safeHeight = height - (padding * 2);
    let currentY = padding;
    let textAnchorX = width / 2;

    if (userImage) {
        const imgSize = width * imgSizeFactor;
        if (imgPos === 'top') {
            const imgX = (width - imgSize) / 2;
            drawImgWithFrame(userImage, imgX, padding, imgSize, imgShape, filter, textColor);
            currentY = padding + imgSize + 80;
            safeHeight -= (imgSize + 80);
            ctx.textAlign = 'center';
        } else {
            const imgY = (height - imgSize) / 2;
            drawImgWithFrame(userImage, padding, imgY, imgSize, imgShape, filter, textColor);
            textAnchorX = padding + imgSize + 90;
            safeWidth = width - textAnchorX - padding;
            ctx.textAlign = 'left';
        }
    } else {
        ctx.textAlign = 'center';
    }

    ctx.fillStyle = textColor;
    const titleText = document.getElementById('input-title').value.toUpperCase();
    const quoteText = `“${document.getElementById('input-quote').value || ''}”`;
    const authorText = document.getElementById('input-author').value;
    const yearText = document.getElementById('input-year').value;
    const fullAuthor = authorText ? `— ${authorText}${yearText ? ', ' + yearText : ''}` : '';

    let fontSize = (layout === '9:16') ? 85 : 60;
    if (fontFace === 'Dancing Script') fontSize += 15;

    let textData;
    let titleFontSize;

    while (fontSize > 15) {
        textData = processText(ctx, quoteText, safeWidth, fontSize, fontFace);
        titleFontSize = Math.max(24, fontSize * 0.55);
        const totalH = (titleText ? titleFontSize + 40 : 0) + textData.totalHeight + (fullAuthor ? 60 : 0);
        if (totalH <= safeHeight) break;
        fontSize -= 2;
    }

    const startY = currentY + (safeHeight - ((titleText ? titleFontSize + 40 : 0) + textData.totalHeight + (fullAuthor ? 60 : 0))) / 2;
    let drawY = startY;

    if (titleText) {
        ctx.font = `bold ${titleFontSize}px Montserrat`;
        ctx.globalAlpha = 0.6;
        ctx.fillText(titleText, textAnchorX, drawY + titleFontSize);
        ctx.globalAlpha = 1.0;
        drawY += titleFontSize + 40;
    }

    ctx.font = `${fontSize}px "${fontFace}"`;
    if (fontFace === 'Dancing Script') ctx.font = `700 ${fontSize + 15}px "${fontFace}"`;

    textData.lines.forEach(line => {
        const xPos = (ctx.textAlign === 'center' && fontFace === 'Dancing Script') ? textAnchorX + 10 : textAnchorX;
        ctx.fillText(line, xPos, drawY + fontSize * 0.8);
        drawY += textData.lineHeight;
    });

    if (fullAuthor) {
        drawY += 40;
        ctx.font = `italic ${Math.max(26, fontSize * 0.5)}px "${fontFace}"`;
        ctx.globalAlpha = 0.8;
        ctx.fillText(fullAuthor, textAnchorX, drawY);
    }
}

btnDownload.onclick = () => {
    const link = document.createElement('a');
    link.download = 'citacao-personalizada.png';
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
};

document.fonts.ready.then(init);