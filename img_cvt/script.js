document.addEventListener('DOMContentLoaded', function () {
    const imageInput = document.getElementById('imageInput');
    const imageSource = document.getElementById('imageSource');
    const placeholder = document.getElementById('uploadPlaceholder');
    const ratioButtons = document.querySelectorAll('#ratioControls .btn');
    const downloadBtn = document.getElementById('downloadBtn');
    const exportFormat = document.getElementById('exportFormat');
    const exportQuality = document.getElementById('exportQuality');
    const qualityVal = document.getElementById('qualityVal');
    const btnRemoveColor = document.getElementById('btnRemoveColor');
    const removeColorInput = document.getElementById('removeColor');
    const toleranceRange = document.getElementById('toleranceRange');
    const toleranceVal = document.getElementById('toleranceVal');
    const formatWarning = document.getElementById('formatWarning');
    const fileSizeDisplay = document.getElementById('fileSizeDisplay');
    const sizeBadge = document.getElementById('sizeBadge');
    
    let cropper = null;
    let colorRemovalActive = false;

    // Helper: Verifica suporte real a formatos
    function isFormatSupported(format) {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 1;
        return canvas.toDataURL(format).indexOf(format) !== -1;
    }

    // Função para calcular e mostrar o tamanho em tempo real
    function updateSizePreview() {
        if (!cropper) return;

        // Pegamos o canvas do recorte atual
        let canvas = cropper.getCroppedCanvas({
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });

        if (colorRemovalActive) {
            canvas = applyTransparency(canvas, false); // false para não clonar desnecessariamente
        }

        const format = exportFormat.value;
        const quality = parseFloat(exportQuality.value);

        // toBlob é assíncrono, então o preview tem um leve delay natural
        canvas.toBlob((blob) => {
            if (!blob) return;
            const sizeInKb = (blob.size / 1024).toFixed(1);
            fileSizeDisplay.textContent = sizeInKb > 1000 
                ? (sizeInKb/1024).toFixed(2) + ' MB' 
                : sizeInKb + ' KB';
            
            sizeBadge.style.display = 'block';
        }, format, quality);
    }

    // 1. Upload
    imageInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (cropper) cropper.destroy();
                imageSource.src = event.target.result;
                placeholder.style.display = 'none';
                
                cropper = new Cropper(imageSource, {
                    viewMode: 1,
                    dragMode: 'move',
                    autoCropArea: 1,
                    responsive: true,
                    // Evento disparado sempre que o corte muda
                    cropend: updateSizePreview, 
                    ready: () => {
                        checkFormatSupport();
                        updateSizePreview();
                    }
                });
                downloadBtn.disabled = false;
            };
            reader.readAsDataURL(file);
        }
    });

    // 2. Eventos que disparam a atualização do tamanho
    exportFormat.addEventListener('change', () => {
        checkFormatSupport();
        updateSizePreview();
    });

    exportQuality.addEventListener('input', () => {
        qualityVal.textContent = Math.round(exportQuality.value * 100) + '%';
    });

    // Quando soltar o slider de qualidade, atualiza o tamanho (evita processamento excessivo)
    exportQuality.addEventListener('change', updateSizePreview);

    toleranceRange.addEventListener('input', () => {
        toleranceVal.textContent = toleranceRange.value;
    });

    toleranceRange.addEventListener('change', updateSizePreview);

    btnRemoveColor.addEventListener('click', () => {
        colorRemovalActive = !colorRemovalActive;
        btnRemoveColor.textContent = colorRemovalActive ? "Remoção ATIVA" : "Ativar Remoção";
        btnRemoveColor.classList.toggle('btn-primary', colorRemovalActive);
        updateSizePreview();
    });

    // 3. Auxiliares
    function checkFormatSupport() {
        const selected = exportFormat.value;
        formatWarning.style.display = !isFormatSupported(selected) ? 'block' : 'none';
    }

    function applyTransparency(canvas) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const hex = removeColorInput.value;
        const rT = parseInt(hex.slice(1, 3), 16), gT = parseInt(hex.slice(3, 5), 16), bT = parseInt(hex.slice(5, 7), 16);
        const tolerance = parseInt(toleranceRange.value);

        for (let i = 0; i < data.length; i += 4) {
            const dist = Math.sqrt((data[i]-rT)**2 + (data[i+1]-gT)**2 + (data[i+2]-bT)**2);
            if (dist < tolerance) data[i+3] = 0;
        }
        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    // 4. Download Final
    downloadBtn.addEventListener('click', () => {
        if (!cropper) return;

        let canvas = cropper.getCroppedCanvas({
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });

        if (colorRemovalActive) canvas = applyTransparency(canvas);

        const format = exportFormat.value;
        const quality = parseFloat(exportQuality.value);
        const ext = format.split('/')[1].replace('jpeg', 'jpg');

        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `export_${Date.now()}.${ext}`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        }, format, quality);
    });

    // Ratios
    ratioButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (!cropper) return;
            ratioButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const ratio = parseFloat(button.getAttribute('data-ratio'));
            cropper.setAspectRatio(isNaN(ratio) ? NaN : ratio);
            updateSizePreview(); // Atualiza tamanho se mudar o corte
        });
    });
});