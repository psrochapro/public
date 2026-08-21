document.addEventListener('DOMContentLoaded', function () {
    const imageInput = document.getElementById('imageInput');
    const imageSource = document.getElementById('imageSource');
    const placeholder = document.getElementById('uploadPlaceholder');
    const ratioButtons = document.querySelectorAll('#ratioControls .btn');
    const downloadBtn = document.getElementById('downloadBtn');
    const exportFormat = document.getElementById('exportFormat');
    const exportQuality = document.getElementById('exportQuality');
    const btnRemoveColor = document.getElementById('btnRemoveColor');
    const removeColorInput = document.getElementById('removeColor');
    const keepTransparentCheckbox = document.getElementById('keepTransparent');
    
    let cropper = null;
    let colorRemovalActive = false;

    // 1. Lidar com o Upload
    imageInput.addEventListener('change', function (e) {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            const reader = new FileReader();

            reader.onload = function (event) {
                if (cropper) {
                    cropper.destroy();
                }

                imageSource.src = event.target.result;
                placeholder.style.display = 'none';

                cropper = new Cropper(imageSource, {
                    viewMode: 1,
                    dragMode: 'move',
                    autoCropArea: 1,
                    restore: false,
                    guides: true,
                    center: true,
                    highlight: false,
                    cropBoxMovable: true,
                    cropBoxResizable: true,
                    toggleDragModeOnDblclick: false,
                });

                downloadBtn.disabled = false;
            };
            reader.readAsDataURL(file);
        }
    });

    // 2. Controles de Proporção (Aspect Ratio)
    ratioButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (!cropper) return;
            ratioButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const ratio = parseFloat(button.getAttribute('data-ratio'));
            cropper.setAspectRatio(isNaN(ratio) ? NaN : ratio);
        });
    });

    // Toggle para ativação da remoção de cor
    btnRemoveColor.addEventListener('click', () => {
        colorRemovalActive = !colorRemovalActive;
        btnRemoveColor.textContent = colorRemovalActive ? "Desativar Remoção" : "Remover";
        btnRemoveColor.classList.toggle('btn-primary', colorRemovalActive);
        
        if(colorRemovalActive) {
            alert("A cor selecionada será removida da imagem final ao baixar.");
        }
    });

    // 3. Processamento de Transparência por Pixel
    function applyTransparency(canvas) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        const hex = removeColorInput.value;
        const rTarget = parseInt(hex.slice(1, 3), 16);
        const gTarget = parseInt(hex.slice(3, 5), 16);
        const bTarget = parseInt(hex.slice(5, 7), 16);
        
        // Tolerância (quão perto da cor precisa estar para sumir)
        const tolerance = 40; 

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const distance = Math.sqrt(
                Math.pow(r - rTarget, 2) +
                Math.pow(g - gTarget, 2) +
                Math.pow(b - bTarget, 2)
            );

            if (distance < tolerance) {
                data[i + 3] = 0; // Define Alpha como 0 (transparente)
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    // 4. Download e Conversão
    downloadBtn.addEventListener('click', () => {
        if (!cropper) return;

        // Opções do Canvas para manter alta qualidade
        let canvas = cropper.getCroppedCanvas({
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high',
        });

        // Se a remoção de cor estiver ativa, processamos os pixels agora
        if (colorRemovalActive) {
            canvas = applyTransparency(canvas);
        }

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
});