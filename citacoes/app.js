const canvas = document.getElementById('main-canvas');
const ctx = canvas.getContext('2d');
const inputs = document.querySelectorAll('input, textarea, select');
const btnDownload = document.getElementById('btn-download');

let userImage = null;

// Inicialização e Listeners
function init() {
    inputs.forEach(input => input.addEventListener('input', render));
    window.addEventListener('resize', render);
    
    // Upload de arquivo local
    document.getElementById('input-file').addEventListener('change', (e) => {
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
    });

    // Link de imagem externa
    document.getElementById('input-url').addEventListener('change', (e) => {
        if (e.target.value) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => { userImage = img; render(); };
            img.src = e.target.value;
        }
    });

    render();
}

// Função de Contraste (Calcula se o texto deve ser preto ou branco)
function getContrastYIQ(hexcolor){
    hexcolor = hexcolor.replace("#", "");
    const r = parseInt(hexcolor.substr(0,2),16);
    const g = parseInt(hexcolor.substr(2,2),16);
    const b = parseInt(hexcolor.substr(4,2),16);
    const yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? '#1a1a1a' : '#ffffff';
}

// Função para quebra de linha automática no Canvas
function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    for(let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = context.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    context.fillText(line, x, y);
    return y;
}

// Desenha a imagem cortada corretamente (estilo object-fit: cover)
function drawImageProcessed(img, x, y, size, shape, filter) {
    ctx.save();
    ctx.filter = filter;
    
    if (shape === 'circle') {
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
        ctx.clip();
    }

    const imgRatio = img.width / img.height;
    let sw, sh, sx, sy;

    if (imgRatio > 1) { // Paisagem
        sh = img.height;
        sw = img.height;
        sx = (img.width - sh) / 2;
        sy = 0;
    } else { // Retrato
        sw = img.width;
        sh = img.width;
        sx = 0;
        sy = (img.height - sw) / 2;
    }

    ctx.drawImage(img, sx, sy, sw, sh, x, y, size, size);
    ctx.restore();
}

async function render() {
    // Captura valores atuais
    const layout = document.getElementById('input-layout').value;
    const themeColor = document.getElementById('input-color').value;
    const font = document.getElementById('input-font').value;
    const padding = parseInt(document.getElementById('input-padding').value);
    const imgPos = document.getElementById('input-img-pos').value;
    const imgShape = document.getElementById('input-img-shape').value;
    const imgSizeFactor = document.getElementById('input-img-size').value / 100;
    const filter = document.getElementById('input-filter').value;

    // Configura tamanho do Canvas (High-DPI 1080p base)
    let width = 1080;
    let height = 1080;
    if (layout === '16:9') height = 608;
    if (layout === '9:16') height = 1920;

    canvas.width = width;
    canvas.height = height;

    // 1. Fundo
    ctx.fillStyle = themeColor;
    ctx.fillRect(0, 0, width, height);

    const textColor = getContrastYIQ(themeColor);
    ctx.fillStyle = textColor;

    // Definição de áreas de conteúdo
    let contentAreaX = padding;
    let contentAreaY = padding;
    let contentAreaWidth = width - (padding * 2);

    // 2. Renderizar Imagem
    if (userImage) {
        const imgDisplaySize = width * imgSizeFactor;

        if (imgPos === 'top') {
            const imgX = (width - imgDisplaySize) / 2;
            const imgY = padding;
            drawImageProcessed(userImage, imgX, imgY, imgDisplaySize, imgShape, filter);
            contentAreaY = imgY + imgDisplaySize + 60; // Empurra texto para baixo
            ctx.textAlign = 'center';
        } else {
            // Posicionamento Esquerda (Lateral)
            const imgX = padding;
            const imgY = (height - imgDisplaySize) / 2;
            drawImageProcessed(userImage, imgX, imgY, imgDisplaySize, imgShape, filter);
            contentAreaX = imgX + imgDisplaySize + 60;
            contentAreaWidth = width - contentAreaX - padding;
            contentAreaY = (height / 2) - 100; // Tenta centralizar texto verticalmente
            ctx.textAlign = 'left';
        }
    } else {
        ctx.textAlign = 'center';
        contentAreaY = height / 3;
    }

    const textAnchorX = ctx.textAlign === 'center' ? width / 2 : contentAreaX;

    // 3. Renderizar Textos
    // Título
    const title = document.getElementById('input-title').value.toUpperCase();
    if (title) {
        ctx.font = `bold 28px ${font}`;
        ctx.globalAlpha = 0.6;
        ctx.fillText(title, textAnchorX, contentAreaY);
        ctx.globalAlpha = 1.0;
        contentAreaY += 60;
    }

    // Citação
    const quoteText = document.getElementById('input-quote').value || "Sua citação ou pensamento aparecerá aqui para visualização.";
    const quote = `“${quoteText}”`;
    
    // Ajuste dinâmico de tamanho de fonte baseado na proporção
    const fontSize = layout === '9:16' ? 70 : 55;
    ctx.font = font === 'Dancing Script' ? `700 ${fontSize + 20}px ${font}` : `bold ${fontSize}px ${font}`;
    
    contentAreaY = wrapText(ctx, quote, textAnchorX, contentAreaY + 40, contentAreaWidth, fontSize + 15);

    // Autor e Ano
    const author = document.getElementById('input-author').value;
    const year = document.getElementById('input-year').value;
    if (author) {
        ctx.font = font === 'Dancing Script' ? `400 45px ${font}` : `italic 38px ${font}`;
        ctx.fillText(`— ${author}${year ? ', ' + year : ''}`, textAnchorX, contentAreaY + 70);
    }

    // 4. Detalhe de Moldura (Opcional - Estético)
    ctx.strokeStyle = textColor;
    ctx.globalAlpha = 0.15;
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, width - 40, height - 40);
}

// Função de Download
btnDownload.onclick = () => {
    const link = document.createElement('a');
    link.download = 'citacao-pro-export.png';
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
};

// Garante que as fontes do Google carreguem antes de desenhar
document.fonts.ready.then(init);