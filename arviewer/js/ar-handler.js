window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const imgUrl = urlParams.get('img');

    if (imgUrl) {
        const arImage = document.getElementById('ar-image');
        
        // Use a standard Image object to pre-calculate aspect ratio
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imgUrl;

        img.onload = () => {
            // Set the source directly on the a-image entity
            arImage.setAttribute('src', imgUrl);
            
            // Adjust aspect ratio
            const width = img.naturalWidth;
            const height = img.naturalHeight;
            const ratio = width / height;
            
            // Set base scale (adjusting 2.0 as a standard size)
            if (ratio > 1) {
                arImage.setAttribute('width', 2);
                arImage.setAttribute('height', 2 / ratio);
            } else {
                arImage.setAttribute('width', 2 * ratio);
                arImage.setAttribute('height', 2);
            }
            
            console.log('AR Image loaded successfully:', imgUrl);
        };

        img.onerror = () => {
            console.error('Failed to load image at:', imgUrl);
            alert('Error loading image. Please check the file path.');
        };
    } else {
        alert('No image specified for AR view.');
        window.location.href = 'index.html';
    }
};