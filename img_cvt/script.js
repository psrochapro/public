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
    
    const currentDimLabel = document.getElementById('currentDim');
    const finalDimLabel = document.getElementById('finalDim');
    const targetWidthInput = document.getElementById('targetWidth');
    
    let cropper = null;
    let colorRemovalActive = false;

    // Helper: Verifica se o navegador suporta codificação nativa para o formato
    function isFormatSupported(format) {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 1;
        return canvas.toDataURL(format).indexOf(format) !== -1;
    }

    // Função central para atualizar dimensões e peso estimado
    function updatePreviews() {
        if (!cropper) return;

        // 1. Obter dimensões reais do corte atual
        const cropData = cropper.getData(true);
        const cropW = Math.round(cropData.width);
        const cropH = Math.round(cropData.height);
        currentDimLabel.textContent = `${cropW} x ${cropH} px`;

        // 2. Lógica de Redimensionamento com Validação
        let finalW = cropW;
        let finalH = cropH;
        let userValue = parseInt(targetWidthInput.value);
        
        if (!isNaN(userValue) && userValue > 0) {
            finalW = userValue;
            finalH = Math.round((userValue * cropH) / cropW);
        } else if (targetWidthInput.value !== "" && userValue <= 0) {
            // Resetar se o usuário digitar valores inválidos (ex: negativos)
            targetWidthInput.value = "";
        }

        finalDimLabel.textContent = `${finalW} x ${finalH} px`;

        // 3. Gerar canvas temporário para calcular o peso (Blob)
        let canvas = cropper.getCroppedCanvas({
            width: finalW,
            height: finalH,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });

        if (colorRemovalActive) canvas = applyTransparency(canvas);

        const format = exportFormat.value;
        const quality = parseFloat(exportQuality.value);

        canvas.toBlob((blob) => {
            if (!blob) return;
            const sizeInKb = (blob.size / 1024).toFixed(1);
            fileSizeDisplay.textContent = sizeInKb > 1000 
                ? (sizeInKb/1024).toFixed(2) + ' MB' 
                : sizeInKb + ' KB';
            sizeBadge.style.display = 'block';
        }, format, quality);
    }

    // Inicialização ao carregar imagem
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
                    crop: updatePreviews, // Atualiza enquanto o usuário ajusta o corte
                    ready: () => {
                        const data = cropper.getData(true);
                        targetWidthInput.placeholder = Math.round(data.width);
                        checkFormatSupport();
                        updatePreviews();
                    }
                });
                downloadBtn.disabled = false;
            };
            reader.readAsDataURL(file);
        }
    });

    // Listeners para controles da barra lateral
    targetWidthInput.addEventListener('input', updatePreviews);

    exportFormat.addEventListener('change', () => {
        checkFormatSupport();
        updatePreviews();
    });

    exportQuality.addEventListener('input', () => {
        qualityVal.textContent = Math.round(exportQuality.value * 100) + '%';
        updatePreviews();
    });

    toleranceRange.addEventListener('input', () => {
        toleranceVal.textContent = toleranceRange.value;
        updatePreviews();
    });

    btnRemoveColor.addEventListener('click', () => {
        colorRemovalActive = !colorRemovalActive;
        btnRemoveColor.textContent = colorRemovalActive ? "Remoção ATIVA" : "Ativar";
        btnRemoveColor.classList.toggle('btn-primary', colorRemovalActive);
        updatePreviews();
    });

    function checkFormatSupport() {
        const selected = exportFormat.value;
        formatWarning.style.display = !isFormatSupported(selected) ? 'block' : 'none';
    }

    // Processamento de pixels para transparência
    function applyTransparency(canvas) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const hex = removeColorInput.value;
        const rT = parseInt(hex.slice(1, 3), 16), 
              gT = parseInt(hex.slice(3, 5), 16), 
              bT = parseInt(hex.slice(5, 7), 16);
        const tolerance = parseInt(toleranceRange.value);

        for (let i = 0; i < data.length; i += 4) {
            const dist = Math.sqrt((data[i]-rT)**2 + (data[i+1]-gT)**2 + (data[i+2]-bT)**2);
            if (dist < tolerance) data[i+3] = 0;
        }
        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    // Execução do Download
    downloadBtn.addEventListener('click', () => {
        if (!cropper) return;
        
        const cropData = cropper.getData(true);
        let finalW = Math.round(cropData.width);
        let finalH = Math.round(cropData.height);
        
        const userValue = parseInt(targetWidthInput.value);
        if (userValue > 0) {
            finalW = userValue;
            finalH = Math.round((userValue * cropData.height) / cropData.width);
        }

        let canvas = cropper.getCroppedCanvas({
            width: finalW,
            height: finalH,
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
            link.download = `img_master_${finalW}x${finalH}_${Date.now()}.${ext}`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        }, format, quality);
    });

    // Controles de Aspect Ratio
    ratioButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (!cropper) return;
            ratioButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const ratio = parseFloat(button.getAttribute('data-ratio'));
            cropper.setAspectRatio(isNaN(ratio) ? NaN : ratio);
            updatePreviews();
        });
    });
});