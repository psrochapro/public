const canvas = document.getElementById('main-canvas');
const ctx = canvas.getContext('2d');
const inputs = document.querySelectorAll('input, textarea, select');
const btnDownload = document.getElementById('btn-download');

let userImage = null;

// Configurações iniciais
const settings = {
    baseSize: 1080,
    padding: 60,
    get contrastColor() {
        return getContrastYIQ(document.getElementById('input-color').value);
    }
};

// Inicialização
function init() {
    inputs.forEach(input => input.addEventListener('input', render));
    window.addEventListener('resize', render);
    
    // Upload de Imagem Local
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

    // Upload de Imagem via URL
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

function getContrastYIQ(hexcolor){
    hexcolor = hexcolor.replace("#", "");
    const r = parseInt(hexcolor.substr(0,2),16);
    const g = parseInt(hexcolor.substr(2,2),16);
    const b = parseInt(hexcolor.substr(4,2),16);
    const yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let testY = y;

    for(let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = context.measureText(testLine);
        let testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
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

async function render() {
    const layout = document.getElementById('input-layout').value;
    const themeColor = document.getElementById('input-color').value;
    const font = document.getElementById('input-font').value;
    const padding = parseInt(document.getElementById('input-padding').value);
    const filter = document.getElementById('input-filter').value;
    const focusY = document.getElementById('input-focus').value / 100;

    // Definir dimensões
    let width = settings.baseSize;
    let height = settings.baseSize;
    if (layout === '16:9') height = width * (9/16);
    if (layout === '9:16') height = width * (16/9);

    canvas.width = width;
    canvas.height = height;

    // 1. Fundo
    ctx.fillStyle = themeColor;
    ctx.fillRect(0, 0, width, height);

    // 2. Desenhar Imagem
    if (userImage) {
        ctx.save();
        ctx.filter = filter;
        
        // Simular Object-fit: cover
        const imgRatio = userImage.width / userImage.height;
        const canvasRatio = width / height;
        let drawW, drawH, drawX, drawY;

        if (imgRatio > canvasRatio) {
            drawH = height;
            drawW = height * imgRatio;
            drawX = (width - drawW) / 2;
            drawY = 0;
        } else {
            drawW = width;
            drawH = width / imgRatio;
            drawX = 0;
            drawY = (height - drawH) * focusY;
        }

        ctx.drawImage(userImage, drawX, drawY, drawW, drawH);
        ctx.restore();

        // Overlay suave para leitura
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillRect(0,0, width, height);
    }

    // 3. Textos
    const textColor = settings.contrastColor;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    
    const safeArea = width - (padding * 2);
    let currentY = padding + 40;

    // Título
    const title = document.getElementById('input-title').value.toUpperCase();
    if (title) {
        ctx.font = `bold 30px ${font}`;
        ctx.fillText(title, width/2, currentY);
        currentY += 60;
    }

    // Citação
    const quote = `“${document.getElementById('input-quote').value || 'Sua frase inspiradora aparecerá aqui.'}”`;
    ctx.font = font === 'Dancing Script' ? `italic 80px ${font}` : `bold 60px ${font}`;
    currentY = wrapText(ctx, quote, width/2, currentY + 40, safeArea, 70);

    // Autor e Ano
    const author = document.getElementById('input-author').value;
    const year = document.getElementById('input-year').value;
    if (author) {
        currentY += 60;
        ctx.font = `40px ${font}`;
        ctx.fillText(author + (year ? `, ${year}` : ''), width/2, currentY);
    }

    // Moldura decorativa
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(padding/2, padding/2, width - padding, height - padding);
}

// Download
btnDownload.onclick = () => {
    const link = document.createElement('a');
    link.download = 'citacao-pro.png';
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
};

// Iniciar
document.fonts.ready.then(init);