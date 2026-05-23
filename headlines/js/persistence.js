/**
 * PERSISTENCE MODULE
 * Handles Saving (.news), Loading (Legacy .json / .news), and PNG Export.
 */

function setupPersistence() {
    // Helper to prevent crashes if a button is missing in HTML
    const safeClick = (id, callback) => {
        const el = document.getElementById(id);
        if (el) {
            el.onclick = callback;
        } else {
            console.warn(`Aviso: Botão/Elemento ID '${id}' não encontrado para persistência.`);
        }
    };

    // --- 1. SAVE AS .NEWS (MODERN ZIP FORMAT) ---
    safeClick('btn-export-json', async () => {
        const zip = new JSZip();
        
        // Deep copy of state to modify paths for the ZIP package
        const saveState = JSON.parse(JSON.stringify(state));
        
        // Helper to convert base64 (Canvas/FileReader) to binary Blob
        const b64ToBlob = (b64) => {
            if(!b64 || !b64.startsWith('data:')) return null;
            try {
                const parts = b64.split(',');
                const byteString = atob(parts[1]);
                const mimeString = parts[0].split(':')[1].split(';')[0];
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
                return new Blob([ab], {type: mimeString});
            } catch (e) {
                console.error("Erro ao converter imagem para o pacote:", e);
                return null;
            }
        };

        const assets = zip.folder("assets");

        // Process Main Image
        const mainImgBlob = b64ToBlob(saveState.noticiaPrincipal.imagem_url);
        if(mainImgBlob) { 
            assets.file("main.jpg", mainImgBlob); 
            saveState.noticiaPrincipal.imagem_url = "assets/main.jpg"; 
        }
        
        // Process Logo
        const logoImgBlob = b64ToBlob(saveState.config.logo_url);
        if(logoImgBlob) { 
            assets.file("logo.png", logoImgBlob); 
            saveState.config.logo_url = "assets/logo.png"; 
        }

        // Process Mini News Thumbs
        for(let i = 0; i < saveState.miniNoticias.length; i++) {
            const thumbBlob = b64ToBlob(saveState.miniNoticias[i].thumb_url);
            if(thumbBlob) { 
                const ext = thumbBlob.type.split('/')[1] || 'jpg';
                const filename = `thumb_${i}.${ext}`;
                assets.file(filename, thumbBlob); 
                saveState.miniNoticias[i].thumb_url = `assets/${filename}`; 
            }
        }

        // Add the logic/text data
        zip.file("project.json", JSON.stringify(saveState, null, 2));

        // Generate and Download
        const content = await zip.generateAsync({type: "blob"});
        let fileName = document.getElementById('export-filename')?.value.trim() || 'snapshot';
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = fileName.replace('.json', '') + ".news";
        link.click();
    });

    // --- 2. OPEN FILE (.NEWS OR .JSON) ---
    const fileInput = document.getElementById('import-json-file');
    if (fileInput) {
        fileInput.accept = ".news, .json";
        
        safeClick('btn-trigger-import', () => fileInput.click());
        
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    if (file.name.toLowerCase().endsWith('.json')) {
                        // --- LEGACY JSON HANDLING ---
                        state = JSON.parse(event.target.result);
                        sanitizeState();
                    } else {
                        // --- MODERN .NEWS (ZIP) HANDLING ---
                        const zip = await JSZip.loadAsync(event.target.result);
                        const jsonStr = await zip.file("project.json").async("string");
                        state = JSON.parse(jsonStr);

                        // Convert binary assets back to base64 for browser rendering
                        const mainFileB64 = await zip.file(state.noticiaPrincipal.imagem_url).async("base64");
                        state.noticiaPrincipal.imagem_url = `data:image/jpeg;base64,${mainFileB64}`;

                        const logoFileB64 = await zip.file(state.config.logo_url).async("base64");
                        state.config.logo_url = `data:image/png;base64,${logoFileB64}`;

                        for(let i = 0; i < state.miniNoticias.length; i++) {
                            const tFileB64 = await zip.file(state.miniNoticias[i].thumb_url).async("base64");
                            state.miniNoticias[i].thumb_url = `data:image/jpeg;base64,${tFileB64}`;
                        }
                    }
                    
                    // Update UI and Design
                    syncSidebarWithState();
                    applyTypographyToCSS();
                    render();
                    updateColors();
                } catch (err) {
                    console.error("Erro ao carregar o arquivo:", err);
                    alert("Erro ao ler o arquivo. Certifique-se de que é um JSON ou .news válido.");
                }
            };

            if (file.name.toLowerCase().endsWith('.json')) reader.readAsText(file);
            else reader.readAsArrayBuffer(file);
        };
    }

    // --- 3. PNG EXPORT ---
    safeClick('btn-export-png', () => {
        const stage = document.getElementById('snapshot-stage');
        if(!stage) return;
        
        const btn = document.getElementById('btn-export-png');
        const originalText = btn.innerText;
        btn.innerText = "Gerando em 4K...";
        btn.disabled = true;

        html2canvas(stage, { 
            scale: 3, 
            useCORS: true, 
            allowTaint: true, 
            backgroundColor: null 
        }).then(canvas => {
            const image = canvas.toDataURL("image/png", 1.0);
            const link = document.createElement('a');
            link.href = image;
            link.download = `snapshot-${new Date().getTime()}.png`;
            link.click();
            btn.innerText = originalText;
            btn.disabled = false;
        }).catch(err => {
            console.error("Erro no export PNG:", err);
            btn.innerText = originalText;
            btn.disabled = false;
        });
    });

    // --- 4. THEME SYSTEM ---
    safeClick('btn-export-theme', () => {
        const themeData = { 
            config: JSON.parse(JSON.stringify(state.config)), 
            layoutSettings: JSON.parse(JSON.stringify(state.layoutSettings)) 
        };
        // Remove content-specific data from theme
        delete themeData.config.logo_url; 
        delete themeData.config.layout;

        const dataStr = JSON.stringify(themeData, null, 2);
        const link = document.createElement('a');
        link.href = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const baseName = document.getElementById('export-filename')?.value || 'projeto';
        link.download = `tema_${baseName}.json`;
        link.click();
    });

    const themeFileInput = document.getElementById('import-theme-file');
    if (themeFileInput) {
        safeClick('btn-trigger-theme-import', () => themeFileInput.click());
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
                syncSidebarWithState(); 
                applyTypographyToCSS(); 
                render(); 
                updateColors();
            };
            reader.readAsText(file);
        };
    }
}