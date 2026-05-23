/**
 * PERSISTENCE MODULE
 * Handles Saving (.news), Loading (Legacy .json / .news), and PNG Export.
 */

function setupPersistence() {
    const safeClick = (id, callback) => {
        const el = document.getElementById(id);
        if (el) el.onclick = callback;
    };

    // --- NEW PROJECT LOGIC ---
    safeClick('btn-new-project', async () => {
        if (confirm("Deseja iniciar um novo projeto? Todas as alterações não salvas serão perdidas.")) {
            try {
                const response = await fetch('dados.json');
                state = await response.json();
                sanitizeState();
                
                // Reset images to default
                state.noticiaPrincipal.imagem_url = await cropImage(state.noticiaPrincipal.imagem_url, 4/3);
                for (let i = 0; i < state.miniNoticias.length; i++) {
                    state.miniNoticias[i].thumb_url = await cropImage(state.miniNoticias[i].thumb_url, 1/1);
                }

                syncSidebarWithState();
                applyTypographyToCSS();
                render();
                updateColors();
            } catch (e) {
                console.error("Erro ao resetar projeto:", e);
            }
        }
    });

    // --- SAVE AS .NEWS ---
    safeClick('btn-export-json', async () => {
        const zip = new JSZip();
        const saveState = JSON.parse(JSON.stringify(state));
        
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
            } catch (e) { return null; }
        };

        const assets = zip.folder("assets");
        const mainImgBlob = b64ToBlob(saveState.noticiaPrincipal.imagem_url);
        if(mainImgBlob) { assets.file("main.jpg", mainImgBlob); saveState.noticiaPrincipal.imagem_url = "assets/main.jpg"; }
        
        const logoImgBlob = b64ToBlob(saveState.config.logo_url);
        if(logoImgBlob) { assets.file("logo.png", logoImgBlob); saveState.config.logo_url = "assets/logo.png"; }

        for(let i = 0; i < saveState.miniNoticias.length; i++) {
            const thumbBlob = b64ToBlob(saveState.miniNoticias[i].thumb_url);
            if(thumbBlob) { 
                assets.file(`thumb_${i}.jpg`, thumbBlob); 
                saveState.miniNoticias[i].thumb_url = `assets/thumb_${i}.jpg`; 
            }
        }

        zip.file("project.json", JSON.stringify(saveState, null, 2));
        const content = await zip.generateAsync({type: "blob"});
        const fileName = document.getElementById('export-filename')?.value.trim() || 'snapshot';
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = fileName.replace('.json', '') + ".news";
        link.click();
    });

    // --- OPEN FILE ---
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
                        state = JSON.parse(event.target.result);
                        sanitizeState();
                    } else {
                        const zip = await JSZip.loadAsync(event.target.result);
                        const jsonStr = await zip.file("project.json").async("string");
                        state = JSON.parse(jsonStr);
                        const mainFileB64 = await zip.file(state.noticiaPrincipal.imagem_url).async("base64");
                        state.noticiaPrincipal.imagem_url = `data:image/jpeg;base64,${mainFileB64}`;
                        const logoFileB64 = await zip.file(state.config.logo_url).async("base64");
                        state.config.logo_url = `data:image/png;base64,${logoFileB64}`;
                        for(let i = 0; i < state.miniNoticias.length; i++) {
                            const tFileB64 = await zip.file(state.miniNoticias[i].thumb_url).async("base64");
                            state.miniNoticias[i].thumb_url = `data:image/jpeg;base64,${tFileB64}`;
                        }
                    }
                    syncSidebarWithState(); applyTypographyToCSS(); render(); updateColors();
                } catch (err) { alert("Erro ao ler o arquivo."); }
            };
            if (file.name.toLowerCase().endsWith('.json')) reader.readAsText(file);
            else reader.readAsArrayBuffer(file);
        };
    }

    // --- PNG EXPORT ---
    safeClick('btn-export-png', () => {
        const stage = document.getElementById('snapshot-stage');
        const btn = document.getElementById('btn-export-png');
        btn.innerText = "Gerando 4K..."; btn.disabled = true;
        html2canvas(stage, { scale: 3, useCORS: true, allowTaint: true, backgroundColor: null }).then(canvas => {
            const link = document.createElement('a');
            link.href = canvas.toDataURL("image/png", 1.0);
            link.download = `snapshot-${new Date().getTime()}.png`;
            link.click();
            btn.innerText = "Baixar PNG Alta Resolução"; btn.disabled = false;
        });
    });

    // --- THEME SYSTEM ---
    safeClick('btn-export-theme', () => {
        const themeData = { config: JSON.parse(JSON.stringify(state.config)), layoutSettings: JSON.parse(JSON.stringify(state.layoutSettings)) };
        delete themeData.config.logo_url; delete themeData.config.layout;
        const dataStr = JSON.stringify(themeData, null, 2);
        const link = document.createElement('a');
        link.href = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        link.download = `tema_${document.getElementById('export-filename')?.value || 'projeto'}.json`;
        link.click();
    });

    const themeInput = document.getElementById('import-theme-file');
    if (themeInput) {
        safeClick('btn-trigger-theme-import', () => themeInput.click());
        themeInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                const imp = JSON.parse(ev.target.result);
                if(imp.config) {
                    const { badge_text, logo_url, layout } = state.config;
                    state.config = { ...state.config, ...imp.config, badge_text, logo_url, layout };
                }
                if(imp.layoutSettings) state.layoutSettings = imp.layoutSettings;
                syncSidebarWithState(); applyTypographyToCSS(); render(); updateColors();
            };
            reader.readAsText(file);
        };
    }
}