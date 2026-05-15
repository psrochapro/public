const canvas = document.getElementById('main-canvas');
const ctx = canvas.getContext('2d');
const inputs = document.querySelectorAll('input, textarea, select');
const btnDownload = document.getElementById('btn-download');
const btnRemoveImg = document.getElementById('btn-remove-img');

// Elementos de Gerenciamento
const btnSaveJson = document.getElementById('btn-save-json');
const btnLoadJson = document.getElementById('btn-load-json');
const inputImportJson = document.getElementById('input-import-json');

let userImage = null;

function init() {
    inputs.forEach(input => {
        if (input.id !== 'input-import-json') {
            input.addEventListener('input', render);
        }
    });
    
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

    // Listeners para JSON
    btnSaveJson.onclick = exportProject;
    btnLoadJson.onclick = () => inputImportJson.click();
    inputImportJson.onchange = importProject;

    render();
}

function loadImage(src) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { userImage = img; render(); };
    img.onerror = () => {
        userImage = null;
        render();
    };
    img.src = src;
}

// Funções de Gerenciamento de Projeto (JSON)
function exportProject() {
    const projectData = {
        settings: {},
        imageData: null
    };

    // Salva todos os valores dos inputs
    inputs.forEach(input => {
        if (input.id && input.id !== 'input-file' && input.id !== 'input-import-json') {
            projectData.settings[input.id] = input.value;
        }
    });

    // Se houver imagem, converte para Base64 para salvar dentro do JSON
    if (userImage) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = userImage.width;
        tempCanvas.height = userImage.height;
        const tCtx = tempCanvas.getContext('2d');
        tCtx.drawImage(userImage, 0, 0);
        projectData.imageData = tempCanvas.toDataURL('image/png');
    }

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `citacao-projeto-${new Date().getTime()}.json`;
    link.click();
}

function importProject(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const projectData = JSON.parse(ev.target.result);
            
            // Restaura configurações
            for (const id in projectData.settings) {
                const el = document.getElementById(id);
                if (el) el.value = projectData.settings[id];
            }

            // Restaura imagem
            if (projectData.imageData) {
                loadImage(projectData.imageData);
            } else {
                userImage = null;
                render();
            }
        } catch (err) {
            alert("Erro ao ler o arquivo JSON.");
            console.error(err);
        }
    };
    reader.readAsText(file);
}

function getContrastYIQ(hexcolor){
    hexcolor = hexcolor.replace("#", "");
    const r = parseInt(hexcolor.substr(0,2),16);
    const g = parseInt(hexcolor.substr(2,2),16);
    const b = parseInt(hexcolor.substr(4,2),16);
    const yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
}

function drawBackground(color, width, height, style) {
    ctx.save();
    if (style === 'gradient') {
        const grd = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
        grd.addColorStop(0, color);
        grd.addColorStop(1, "#000000");
        ctx.fillStyle = grd;
    } else {
        ctx.fillStyle = color;
    }
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
}

function drawBackgroundPattern(color, width, height, userOpacity, patternType) {
    if (userOpacity <= 0) return;
    ctx.save();
    const contrastColor = getContrastYIQ(color);
    ctx.strokeStyle = contrastColor;
    ctx.fillStyle = contrastColor;
    ctx.globalAlpha = userOpacity / 350;

    switch(patternType) {
        case 'circles':
            for(let i = 0; i < 8; i++) {
                ctx.beginPath();
                ctx.lineWidth = 2;
                ctx.arc(width/2, height/2, 100 + (i*130), 0, Math.PI * 2);
                ctx.stroke();
            }
            break;
        case 'grid':
            const spacing = 60;
            for(let x = 0; x < width; x += spacing) {
                for(let y = 0; y < height; y += spacing) {
                    ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
                }
            }
            break;
        case 'diagonals':
            ctx.lineWidth = 15;
            for(let i = -height; i < width; i += 100) {
                ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + height, height); ctx.stroke();
            }
            break;
        case 'bubbles':
            for(let i = 0; i < 20; i++) {
                ctx.beginPath();
                const bX = (i * 137.5) % width;
                const bY = (i * 241.1) % height;
                ctx.arc(bX, bY, 30 + (i * 5), 0, Math.PI * 2); ctx.stroke();
            }
            break;
    }
    ctx.restore();
}

function processText(context, text, maxWidth, fontSize, fontFace) {
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';
    context.font = `${fontSize}px "${fontFace}"`;
    const safeMaxWidth = fontFace === 'Dancing Script' ? maxWidth * 0.85 : maxWidth;

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
    return { lines, lineHeight: fontSize * (fontFace === 'Dancing Script' ? 1.4 : 1.25) };
}

function drawImgWithFrame(img, x, y, size, shape, filter, accentColor, borderWeight, focusYPercent, zoomPercent) {
    ctx.save();
    
    if (borderWeight > 0) {
        ctx.shadowColor = "rgba(0,0,0,0.3)";
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 10;
    }

    ctx.save();
    ctx.beginPath();
    if (shape === 'circle') {
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    } else {
        ctx.rect(x, y, size, size);
    }
    ctx.clip();

    ctx.filter = filter;

    const zoomFactor = zoomPercent / 100;
    const imgRatio = img.width / img.height;
    
    let drawW, drawH;
    if (imgRatio > 1) {
        drawH = size * zoomFactor;
        drawW = drawH * imgRatio;
    } else {
        drawW = size * zoomFactor;
        drawH = drawW / imgRatio;
    }

    const dx = x + (size - drawW) / 2;
    const dy = y + (size - drawH) * (focusYPercent / 100);

    ctx.drawImage(img, 0, 0, img.width, img.height, dx, dy, drawW, drawH);
    ctx.restore();

    if (borderWeight > 0) {
        ctx.save();
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = borderWeight;
        if (shape === 'circle') {
            ctx.beginPath(); 
            ctx.arc(x + size / 2, y + size / 2, size / 2 + borderWeight / 2, 0, Math.PI * 2); 
            ctx.stroke();
        } else {
            ctx.strokeRect(x - borderWeight / 2, y - borderWeight / 2, size + borderWeight, size + borderWeight);
        }
        ctx.restore();
    }
    ctx.restore();
}

function render() {
    try {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
        ctx.filter = 'none';

        const layout = document.getElementById('input-layout')?.value || '1:1';
        const themeColor = document.getElementById('input-color')?.value || '#3b82f6';
        const bgStyle = document.getElementById('input-bg-style')?.value || 'solid';
        const patternType = document.getElementById('input-pattern-type')?.value || 'circles';
        const fontFace = document.getElementById('input-font')?.value || 'Montserrat';
        const padding = 100;
        const imgPos = document.getElementById('input-img-pos')?.value || 'top';
        const imgShape = document.getElementById('input-img-shape')?.value || 'circle';
        const imgSizeFactor = (document.getElementById('input-img-size')?.value || 30) / 100;
        const imgBorderWeight = parseInt(document.getElementById('input-img-border-weight')?.value || 4);
        const imgFocusY = parseInt(document.getElementById('input-img-focus')?.value || 50);
        const imgZoom = parseInt(document.getElementById('input-img-zoom')?.value || 100);
        const filter = document.getElementById('input-filter')?.value || 'none';
        const bgOpacity = document.getElementById('input-bg-opacity')?.value || 20;
        const borderOpacity = document.getElementById('input-border-opacity')?.value || 30;

        let width = 1080, height = 1080;
        if (layout === '16:9') height = 608;
        if (layout === '9:16') height = 1920;
        canvas.width = width; canvas.height = height;

        drawBackground(themeColor, width, height, bgStyle);
        drawBackgroundPattern(themeColor, width, height, bgOpacity, patternType);

        const textColor = getContrastYIQ(themeColor);
        
        if (borderOpacity > 0) {
            ctx.save();
            ctx.strokeStyle = textColor;
            ctx.globalAlpha = borderOpacity / 100;
            ctx.lineWidth = 15;
            ctx.strokeRect(25, 25, width - 50, height - 50);
            ctx.restore();
        }

        let safeWidth = width - (padding * 2);
        let safeHeight = height - (padding * 2);
        let currentY = padding;
        let textAnchorX = width / 2;
        const imgContentGap = 35;

        if (userImage) {
            const imgSize = width * imgSizeFactor;
            if (imgPos === 'top') {
                drawImgWithFrame(userImage, (width - imgSize) / 2, padding, imgSize, imgShape, filter, textColor, imgBorderWeight, imgFocusY, imgZoom);
                currentY = padding + imgSize + imgContentGap;
                safeHeight -= (imgSize + imgContentGap);
                ctx.textAlign = 'center';
            } else {
                const imgY = (height - imgSize) / 2;
                drawImgWithFrame(userImage, padding, imgY, imgSize, imgShape, filter, textColor, imgBorderWeight, imgFocusY, imgZoom);
                textAnchorX = padding + imgSize + 45;
                safeWidth = width - textAnchorX - padding;
                ctx.textAlign = 'left';
            }
        } else {
            ctx.textAlign = 'center';
            currentY = height / 5;
        }

        ctx.fillStyle = textColor;
        ctx.textBaseline = 'middle';

        const titleText = document.getElementById('input-title')?.value.toUpperCase() || "";
        const quoteText = `“${document.getElementById('input-quote')?.value || ''}”`;
        const authorText = document.getElementById('input-author')?.value || "";
        const yearText = document.getElementById('input-year')?.value || "";
        const watermark = document.getElementById('input-watermark')?.value || "";

        let fontSize = (layout === '9:16') ? 80 : 60;
        let textData, titleSize;

        while (fontSize > 15) {
            textData = processText(ctx, quoteText, safeWidth, fontSize, fontFace);
            titleSize = Math.max(24, fontSize * 0.5);
            const totalH = (titleText ? titleSize + 30 : 0) + textData.lines.length * textData.lineHeight + 50;
            if (totalH <= safeHeight) break;
            fontSize -= 2;
        }

        let drawY = currentY + (safeHeight - (textData.lines.length * textData.lineHeight)) / 2;

        if (titleText) {
            ctx.save();
            ctx.font = `bold ${titleSize}px Montserrat`;
            ctx.globalAlpha = 0.5;
            ctx.fillText(titleText, textAnchorX, drawY - titleSize - 15);
            ctx.restore();
        }

        ctx.font = `${fontSize}px "${fontFace}"`;
        if (fontFace === 'Dancing Script') ctx.font = `700 ${fontSize + 15}px "${fontFace}"`;

        textData.lines.forEach(line => {
            ctx.fillText(line, textAnchorX, drawY);
            drawY += textData.lineHeight;
        });

        if (authorText) {
            ctx.save();
            ctx.font = `italic ${Math.max(22, fontSize * 0.5)}px "${fontFace}"`;
            ctx.globalAlpha = 0.8;
            ctx.fillText(`— ${authorText}${yearText ? ', ' + yearText : ''}`, textAnchorX, drawY + 20);
            ctx.restore();
        }

        if (watermark) {
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.font = "bold 22px Montserrat";
            ctx.textAlign = "center";
            ctx.fillText(watermark, width / 2, height - 60);
            ctx.restore();
        }
    } catch (e) {
        console.error("Render Error:", e);
    }
}

btnDownload.onclick = () => {
    const link = document.createElement('a');
    link.download = 'citacao-pro-final.png';
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
};

document.fonts.ready.then(init);