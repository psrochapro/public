<<<<<<< HEAD
window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const fileName = urlParams.get('img');
=======
window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const imgUrl = urlParams.get('img');
>>>>>>> 9b5c74ddd4ded121001b63787b7f5c788f441937

<<<<<<< HEAD
    if (fileName) {
        const arImage = document.getElementById('ar-image');
        const assetLoader = document.getElementById('asset-loader');
        
        // Reconstruct path relative to the root
        const fullImgPath = 'images/' + fileName;

        // Create asset item for A-Frame
        const imgAsset = document.createElement('img');
        imgAsset.setAttribute('id', 'tex');
        imgAsset.setAttribute('src', fullImgPath);
        imgAsset.setAttribute('crossorigin', 'anonymous');
        assetLoader.appendChild(imgAsset);

        imgAsset.onload = () => {
            // Apply the texture with shader: flat to prevent the "white box" effect
            arImage.setAttribute('src', '#tex');
            
            // Adjust aspect ratio
            const width = imgAsset.naturalWidth;
            const height = imgAsset.naturalHeight;
            const ratio = width / height;
            
            if (ratio > 1) {
                arImage.setAttribute('width', 2.5);
                arImage.setAttribute('height', 2.5 / ratio);
            } else {
                arImage.setAttribute('width', 2.5 * ratio);
                arImage.setAttribute('height', 2.5);
            }
        };

        imgAsset.onerror = () => {
            console.error('Failed to load image at:', fullImgPath);
            alert('Image not found in the images folder.');
        };
    } else {
        alert('No image specified.');
        window.location.href = 'index.html';
    }
};
=======
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
>>>>>>> 9b5c74ddd4ded121001b63787b7f5c788f441937