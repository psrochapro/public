function setupPersistence() {
    // SAVE AS .NEWS (MODERN)
    document.getElementById('btn-export-json').onclick = async () => {
        const zip = new JSZip();
        const saveState = JSON.parse(JSON.stringify(state));
        
        // Helper to convert base64 to blob for the zip
        const b64ToBlob = (b64) => {
            if(!b64 || !b64.startsWith('data:')) return null;
            const byteString = atob(b64.split(',')[1]);
            const mimeString = b64.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
            return new Blob([ab], {type: mimeString});
        };

        // Extract images to assets folder
        const assets = zip.folder("assets");
        const mainImg = b64ToBlob(saveState.noticiaPrincipal.imagem_url);
        if(mainImg) { assets.file("main.jpg", mainImg); saveState.noticiaPrincipal.imagem_url = "assets/main.jpg"; }
        
        const logoImg = b64ToBlob(saveState.config.logo_url);
        if(logoImg) { assets.file("logo.png", logoImg); saveState.config.logo_url = "assets/logo.png"; }

        for(let i=0; i<saveState.miniNoticias.length; i++) {
            const thumb = b64ToBlob(saveState.miniNoticias[i].thumb_url);
            if(thumb) { 
                assets.file(`thumb_${i}.jpg`, thumb); 
                saveState.miniNoticias[i].thumb_url = `assets/thumb_${i}.jpg`; 
            }
        }

        zip.file("project.json", JSON.stringify(saveState, null, 2));

        const content = await zip.generateAsync({type:"blob"});
        let fileName = document.getElementById('export-filename').value.trim() || 'snapshot';
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = fileName.replace('.json', '') + ".news";
        link.click();
    };

    // OPEN .NEWS OR .JSON
    const fileInput = document.getElementById('import-json-file');
    fileInput.accept = ".news, .json";
    
    document.getElementById('btn-trigger-import').onclick = () => fileInput.click();
    
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            if (file.name.endsWith('.json')) {
                // LEGACY JSON LOADING
                state = JSON.parse(event.target.result);
                sanitizeState();
            } else {
                // MODERN .NEWS (ZIP) LOADING
                const zip = await JSZip.loadAsync(event.target.result);
                const jsonStr = await zip.file("project.json").async("string");
                state = JSON.parse(jsonStr);

                // Convert assets back to base64 for the app to render
                const mainFile = await zip.file(state.noticiaPrincipal.imagem_url).async("base64");
                state.noticiaPrincipal.imagem_url = `data:image/jpeg;base64,${mainFile}`;

                const logoFile = await zip.file(state.config.logo_url).async("base64");
                state.config.logo_url = `data:image/png;base64,${logoFile}`;

                for(let i=0; i<state.miniNoticias.length; i++) {
                    const tFile = await zip.file(state.miniNoticias[i].thumb_url).async("base64");
                    state.miniNoticias[i].thumb_url = `data:image/jpeg;base64,${tFile}`;
                }
            }
            
            syncSidebarWithState();
            applyTypographyToCSS();
            render();
            updateColors();
        };

        if (file.name.endsWith('.json')) reader.readAsText(file);
        else reader.readAsArrayBuffer(file);
    };

    // PNG EXPORT (Untouched logic)
    document.getElementById('btn-export-png').onclick = () => {
        const stage = document.getElementById('snapshot-stage');
        const btn = document.getElementById('btn-export-png');
        btn.innerText = "Gerando em 4K...";
        btn.disabled = true;
        html2canvas(stage, { scale: 3, useCORS: true, allowTaint: true, backgroundColor: null }).then(canvas => {
            const image = canvas.toDataURL("image/png", 1.0);
            const link = document.createElement('a');
            link.href = image;
            link.download = `snapshot-${new Date().getTime()}.png`;
            link.click();
            btn.innerText = "Baixar PNG Alta Resolução";
            btn.disabled = false;
        });
    };

    // THEME LOGIC (Remains same functionality)
    document.getElementById('btn-export-theme').onclick = () => {
        const themeData = { config: JSON.parse(JSON.stringify(state.config)), layoutSettings: JSON.parse(JSON.stringify(state.layoutSettings)) };
        delete themeData.config.logo_url; delete themeData.config.layout;
        const dataStr = JSON.stringify(themeData, null, 2);
        const link = document.createElement('a');
        link.href = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        link.download = `tema_${document.getElementById('export-filename').value}.json`;
        link.click();
    };

    const themeFileInput = document.getElementById('import-theme-file');
    document.getElementById('btn-trigger-theme-import').onclick = () => themeFileInput.click();
    themeFileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const importedTheme = JSON.parse(event.target.result);
            if(importedTheme.config) {
                const { badge_text, logo_url, layout } = state.config;
                state.config = { ...state.config, ...importedTheme.config, badge_text, logo_url, layout };
            }
            if(importedTheme.layoutSettings) state.layoutSettings = importedTheme.layoutSettings;
            syncSidebarWithState(); applyTypographyToCSS(); render(); updateColors();
        };
        reader.readAsText(file);
    };
}