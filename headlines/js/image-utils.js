async function cropImage(url, targetRatio) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            let sw, sh, sx, sy;
            if (img.width / img.height > targetRatio) {
                sh = img.height; sw = img.height * targetRatio;
                sx = (img.width - sw) / 2; sy = 0;
            } else {
                sw = img.width; sh = img.width / targetRatio;
                sx = 0; sy = (img.height - sh) / 2;
            }
            canvas.width = 1600; canvas.height = 1600 / targetRatio;
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.95));
        };
        img.onerror = () => resolve(url);
        img.src = url;
    });
}

function handleImageUpload(id, callback) {
    const el = document.getElementById(id);
    if(el) {
        el.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => callback(ev.target.result);
                reader.readAsDataURL(file);
            }
        };
    }
}