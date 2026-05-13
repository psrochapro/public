const canvas = document.getElementById('main-canvas');
const ctx = canvas.getContext('2d');
const inputs = document.querySelectorAll('input, textarea, select');
const btnDownload = document.getElementById('btn-download');
const btnRemoveImg = document.getElementById('btn-remove-img');

let userImage = null;

function init() {
    inputs.forEach(input => input.addEventListener('input', render));
    
    document.getElementById('input-file').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            document.getElementById('input-url').value = '';
            const reader = new FileReader();
            reader.onload = (ev) => loadImage(ev.target.result);
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('input-url').addEventListener('input', (e) => {
        if (e.target.value.trim().startsWith('http')) {
            document.getElementById('input-file').value = '';
            loadImage(e.target.value.trim());
        }
    });

    btnRemoveImg.onclick = () => {
        userImage = null;
        document.getElementById('input-file').value = '';
        document.getElementById('input-url').value = '';
        render();
    };

    render();
}

function loadImage(src) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { userImage = img; render(); };
    img.onerror = () => {
        alert("Erro ao carregar imagem externa. Verifique o link ou faça upload local.");
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
    return (yiq >= 128) ? '#111827' : '#ffffff';
}

function drawBackground(color, width, height, style) {
    if (style === 'gradient') {
        const grd = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width * 0.8);
        grd.addColorStop(0, color);
        // Cria um tom mais escuro da cor base
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, width, height);
        
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; // Overlay de profundidade
        ctx.fillRect(0, 0, width, height);
    } else {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, width, height);
    }
}

function drawBackgroundPattern(color, width, height, userOpacity) {
    if (userOpacity <= 0) return;
    ctx.save();
    const contrastColor = getContrastYIQ(color);
    ctx.strokeStyle = contrastColor;
    ctx.globalAlpha = userOpacity / 150; // Atenuação para não poluir

    for(let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.lineWidth = 1 + (i % 3);
        ctx.arc(width * (i/8), height * (i/8), 100 + (i*50), 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.restore();
}

function processText(context, text, maxWidth, fontSize, fontFace) {
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';
    context.font = `${fontSize}px "${fontFace}"`;
    const safeMaxWidth = fontFace === 'Dancing Script' ? maxWidth * 0.8 : maxWidth;

    for (let n = 0; n < words.length; n++) {
        let testLine = currentLine + words[n] + ' ';
        if (context.measureText(testLine).width > safeMaxWidth && n > 0) {
            lines.push(currentLine.trim());
            currentLine = words[n] + ' ';
        } else {
            currentLine = testLine;
        }
    }
    lines.push(currentLine.trim());
    return { lines, lineHeight: fontSize * (fontFace === 'Dancing Script' ? 1.4 : 1.2) };
}

function drawImgWithFrame(img, x, y, size, shape, filter, accentColor, borderWeight) {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 15;

    ctx.filter = filter;
    if (shape === 'circle') {
        ctx.beginPath(); ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2); ctx.clip();
    }
    
    const aspect = img.width / img.height;
    let sw = img.width, sh = img.height, sx = 0, sy = 0;
    if (aspect > 1) { sw = sh; sx = (img.width - sw) / 2; }
    else { sh = sw; sy = (img.height - sh) / 2; }
    
    ctx.drawImage(img, sx, sy, sw, sh, x, y, size, size);
    ctx.restore();

    if (borderWeight > 0) {
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = borderWeight;
        if (shape === 'circle') {
            ctx.beginPath(); ctx.arc(x + size/2, y + size/2, size/2 + borderWeight/2, 0, Math.PI * 2); ctx.stroke();
        } else {
            ctx.strokeRect(x - borderWeight/2, y - borderWeight/2, size + borderWeight, size + borderWeight);
        }
    }
}

function render() {
    const layout = document.getElementById('input-layout').value;
    const themeColor = document.getElementById('input-color').value;
    const bgStyle = document.getElementById('input-bg-style').value;
    const fontFace = document.getElementById('input-font').value;
    const padding = 100;
    const imgPos = document.getElementById('input-img-pos').value;
    const imgShape = document.getElementById('input-img-shape').value;
    const imgSizeFactor = document.getElementById('input-img-size').value / 100;
    const imgBorderWeight = parseInt(document.getElementById('input-img-border-weight').value);
    const filter = document.getElementById('input-filter').value;
    const bgOpacity = document.getElementById('input-bg-opacity').value;
    const borderOpacity = document.getElementById('input-border-opacity').value;

    let width = 1080, height = 1080;
    if (layout === '16:9') height = 608;
    if (layout === '9:16') height = 1920;
    canvas.width = width; canvas.height = height;

    // 1. Fundo e Padrões
    drawBackground(themeColor, width, height, bgStyle);
    drawBackgroundPattern(themeColor, width, height, bgOpacity);

    const textColor = getContrastYIQ(themeColor);
    
    // 2. Borda Decorativa do Card
    if (borderOpacity > 0) {
        ctx.strokeStyle = textColor;
        ctx.globalAlpha = borderOpacity / 100;
        ctx.lineWidth = 15;
        ctx.strokeRect(25, 25, width - 50, height - 50);
        ctx.globalAlpha = 1.0;
    }

    let safeWidth = width - (padding * 2);
    let safeHeight = height - (padding * 2);
    let currentY = padding;
    let textAnchorX = width / 2;

    // 3. Imagem
    if (userImage) {
        const imgSize = width * imgSizeFactor;
        if (imgPos === 'top') {
            drawImgWithFrame(userImage, (width - imgSize) / 2, padding, imgSize, imgShape, filter, textColor, imgBorderWeight);
            currentY = padding + imgSize + 60;
            safeHeight -= (imgSize + 60);
            ctx.textAlign = 'center';
        } else {
            drawImgWithFrame(userImage, padding, (height - imgSize) / 2, imgSize, imgShape, filter, textColor, imgBorderWeight);
            textAnchorX = padding + imgSize + 70;
            safeWidth = width - textAnchorX - padding;
            ctx.textAlign = 'left';
        }
    } else {
        ctx.textAlign = 'center';
    }

    // 4. Textos com Sombra para Leitura
    ctx.fillStyle = textColor;
    ctx.shadowColor = "rgba(0,0,0,0.2)";
    ctx.shadowBlur = 4;

    const titleText = document.getElementById('input-title').value.toUpperCase();
    const quoteText = `“${document.getElementById('input-quote').value || ''}”`;
    const authorText = document.getElementById('input-author').value;
    const yearText = document.getElementById('input-year').value;
    const watermark = document.getElementById('input-watermark').value;

    let fontSize = (layout === '9:16') ? 85 : 65;
    let textData, titleSize;

    while (fontSize > 15) {
        textData = processText(ctx, quoteText, safeWidth, fontSize, fontFace);
        titleSize = fontSize * 0.5;
        const totalH = (titleText ? titleSize + 40 : 0) + (textData.lines.length * textData.lineHeight) + 80;
        if (totalH <= safeHeight) break;
        fontSize -= 2;
    }

    let drawY = currentY + (safeHeight - (textData.lines.length * textData.lineHeight)) / 2;

    if (titleText) {
        ctx.font = `bold ${titleSize}px Montserrat`;
        ctx.globalAlpha = 0.6;
        ctx.fillText(titleText, textAnchorX, drawY - 40);
        ctx.globalAlpha = 1.0;
    }

    ctx.font = `${fontSize}px "${fontFace}"`;
    if (fontFace === 'Dancing Script') ctx.font = `700 ${fontSize + 10}px "${fontFace}"`;

    textData.lines.forEach(line => {
        ctx.fillText(line, textAnchorX, drawY);
        drawY += textData.lineHeight;
    });

    if (authorText) {
        ctx.font = `italic ${fontSize * 0.5}px "${fontFace}"`;
        ctx.globalAlpha = 0.8;
        ctx.fillText(`— ${authorText}${yearText ? ', ' + yearText : ''}`, textAnchorX, drawY + 20);
    }

    // 5. Marca d'água
    if (watermark) {
        ctx.globalAlpha = 0.4;
        ctx.font = "bold 20px Montserrat";
        ctx.textAlign = "center";
        ctx.fillText(watermark, width / 2, height - 60);
    }
}

btnDownload.onclick = () => {
    const link = document.createElement('a');
    link.download = 'citacao-premium.png';
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
};

document.fonts.ready.then(init);