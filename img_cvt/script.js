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

    // Função para verificar suporte real a formatos
    function isFormatSupported(format) {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 1;
        return canvas.toDataURL(format).indexOf(format) !== -1;
    }

    // Atualiza avisos de formato
    function checkFormatSupport() {
        const selected = exportFormat.value;
        if (!isFormatSupported(selected)) {
            formatWarning.style.display = 'block';
        } else {
            formatWarning.style.display = 'none';
        }
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
                    responsive: true
                });
                downloadBtn.disabled = false;
                sizeBadge.style.display = 'block';
                checkFormatSupport();
            };
            reader.readAsDataURL(file);
        }
    });

    // 2. Ratios
    ratioButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (!cropper) return;
            ratioButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const ratio = parseFloat(button.getAttribute('data-ratio'));
            cropper.setAspectRatio(isNaN(ratio) ? NaN : ratio);
        });
    });

    // 3. UI Updates
    exportQuality.addEventListener('input', () => {
        qualityVal.textContent = Math.round(exportQuality.value * 100) + '%';
    });

    toleranceRange.addEventListener('input', () => {
        toleranceVal.textContent = toleranceRange.value;
    });

    exportFormat.addEventListener('change', checkFormatSupport);

    btnRemoveColor.addEventListener('click', () => {
        colorRemovalActive = !colorRemovalActive;
        btnRemoveColor.textContent = colorRemovalActive ? "Remoção ATIVA" : "Ativar Remoção";
        btnRemoveColor.classList.toggle('btn-primary', colorRemovalActive);
    });

    // 4. Processamento de Pixels
    function applyTransparency(canvas) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        const hex = removeColorInput.value;
        const rT = parseInt(hex.slice(1, 3), 16);
        const gT = parseInt(hex.slice(3, 5), 16);
        const bT = parseInt(hex.slice(5, 7), 16);
        const tolerance = parseInt(toleranceRange.value);

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i+1], b = data[i+2];
            // Distância Euclidiana simplificada
            const dist = Math.sqrt((r-rT)**2 + (g-gT)**2 + (b-bT)**2);
            if (dist < tolerance) data[i+3] = 0;
        }
        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    // 5. Download e Cálculo de Tamanho
    downloadBtn.addEventListener('click', () => {
        if (!cropper) return;

        let canvas = cropper.getCroppedCanvas({
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });

        if (colorRemovalActive) {
            canvas = applyTransparency(canvas);
        }

        const format = exportFormat.value;
        const quality = parseFloat(exportQuality.value);
        const ext = format.split('/')[1].replace('jpeg', 'jpg');

        canvas.toBlob((blob) => {
            // Mostrar tamanho no UI
            const sizeInKb = (blob.size / 1024).toFixed(1);
            fileSizeDisplay.textContent = sizeInKb > 1000 
                ? (sizeInKb/1024).toFixed(2) + ' MB' 
                : sizeInKb + ' KB';

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `image_master_${Date.now()}.${ext}`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        }, format, quality);
    });
});