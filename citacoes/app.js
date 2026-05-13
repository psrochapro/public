const canvas = document.getElementById('main-canvas');
const ctx = canvas.getContext('2d');
const inputs = document.querySelectorAll('input, textarea, select');
const btnDownload = document.getElementById('btn-download');

let userImage = null;

function init() {
    inputs.forEach(input => input.addEventListener('input', render));
    document.getElementById('input-file').addEventListener('change', handleFile);
    render();
}

function handleFile(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => { userImage = img; render(); };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function getContrastYIQ(hexcolor){
    hexcolor = hexcolor.replace("#", "");
    const r = parseInt(hexcolor.substr(0,2),16);
    const g = parseInt(hexcolor.substr(2,2),16);
    const b = parseInt(hexcolor.substr(4,2),16);
    const yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? '#1a1a1a' : '#ffffff';
}

// Função aprimorada para calcular altura e desenhar texto
function processText(context, text, x, y, maxWidth, fontSize, fontFace, lineHeightMult = 1.3) {
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';
    context.font = `${fontSize}px ${fontFace}`;

    for (let n = 0; n < words.length; n++) {
        let testLine = currentLine + words[n] + ' ';
        let metrics = context.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
            lines.push(currentLine);
            currentLine = words[n] + ' ';
        } else {
            currentLine = testLine;
        }
    }
    lines.push(currentLine);
    
    const totalHeight = lines.length * (fontSize * lineHeightMult);
    return { lines, totalHeight };
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
    ctx.textAlign = (imgPos === 'top' || !userImage) ? 'center' : 'left';

    let availableAreaY = padding;
    let availableAreaX = padding;
    let availableWidth = width - (padding * 2);
    let availableHeight = height - (padding * 2);

    // 1. Desenhar Imagem e Reservar Espaço
    if (userImage) {
        const imgSize = width * imgSizeFactor;
        let imgX, imgY;

        if (imgPos === 'top') {
            imgX = (width - imgSize) / 2;
            imgY = padding;
            drawImg(userImage, imgX, imgY, imgSize, imgShape, filter);
            availableAreaY = imgY + imgSize + 40;
            availableHeight -= (imgSize + 40);
        } else {
            imgX = padding;
            imgY = (height - imgSize) / 2;
            drawImg(userImage, imgX, imgY, imgSize, imgShape, filter);
            availableAreaX = imgX + imgSize + 50;
            availableWidth -= (imgSize + 50);
        }
    }

    // 2. Lógica de Auto-ajuste de Fonte
    const quoteText = `“${document.getElementById('input-quote').value || 'Sua frase...'}”`;
    const authorText = document.getElementById('input-author').value ? `— ${document.getElementById('input-author').value}` : '';
    const titleText = document.getElementById('input-title').value.toUpperCase();

    let fontSize = (layout === '9:16') ? 70 : 50;
    let textInfo;

    // Loop para diminuir fonte se não couber
    while (fontSize > 20) {
        ctx.font = `bold ${fontSize}px ${fontFace}`;
        textInfo = processText(ctx, quoteText, 0, 0, availableWidth, fontSize, fontFace);
        
        // Verifica se altura do título + citação + autor cabe no espaço
        const totalNeededHeight = (titleText ? 60 : 0) + textInfo.totalHeight + (authorText ? 60 : 0);
        
        if (totalNeededHeight <= availableHeight) break;
        fontSize -= 2;
    }

    // 3. Renderizar Textos
    let currentY = availableAreaY + (availableHeight - (textInfo.totalHeight + (titleText ? 40 : 0))) / 2;
    const anchorX = ctx.textAlign === 'center' ? width / 2 : availableAreaX;

    if (titleText) {
        ctx.font = `bold 24px ${fontFace}`;
        ctx.globalAlpha = 0.5;
        ctx.fillText(titleText, anchorX, currentY);
        ctx.globalAlpha = 1.0;
        currentY += 50;
    }

    ctx.font = fontFace === 'Dancing Script' ? `bold ${fontSize + 20}px ${fontFace}` : `bold ${fontSize}px ${fontFace}`;
    textInfo.lines.forEach((line) => {
        ctx.fillText(line.trim(), anchorX, currentY);
        currentY += fontSize * 1.3;
    });

    if (authorText) {
        currentY += 30;
        ctx.font = `italic ${Math.max(20, fontSize * 0.7)}px ${fontFace}`;
        ctx.fillText(authorText, anchorX, currentY);
    }
}

function drawImg(img, x, y, size, shape, filter) {
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
    
    ctx.strokeStyle = getContrastYIQ(document.getElementById('input-color').value);
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
    link.download = 'citacao.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
};

document.fonts.ready.then(init);