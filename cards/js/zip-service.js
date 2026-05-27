export const zipService = {
    async exportCollection(state) {
        const zip = new JSZip();
        const assets = zip.folder("assets");
        
        const exportData = {
            settings: state.settings,
            categories: state.categories,
            cards: state.cards.map((c, i) => {
                const extension = c.imagem.split(';')[0].split('/')[1] || 'webp';
                const name = `img_${i}.${extension}`;
                
                // Extrai o base64 puro
                const imgParts = c.imagem.split(',');
                if (imgParts.length > 1) {
                    assets.file(name, imgParts[1], {base64: true});
                }
                
                return { ...c, imagem: `assets/${name}` };
            })
        };

        zip.file("dados.json", JSON.stringify(exportData, null, 2));
        
        const blob = await zip.generateAsync({type:"blob"});
        const fileName = (state.settings.collectionName || "colecao")
            .replace(/\s+/g, '-')
            .toLowerCase();
            
        saveAs(blob, `${fileName}.card`);
    },

    exportTextOnly(state) {
        const textOnlyCards = state.cards.map(c => {
            const { imagem, ...textData } = c;
            return textData;
        });
        const exportData = { 
            settings: state.settings, 
            categories: state.categories, 
            cards: textOnlyCards 
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: "application/json"});
        const fileName = `textos-${(state.settings.collectionName || "colecao").replace(/\s+/g, '-').toLowerCase()}.json`;
        saveAs(blob, fileName);
    },

    async importCollection(e, state, callback) {
        const file = e.target.files[0];
        if(!file) return;

        try {
            const zip = await JSZip.loadAsync(file);
            const jsonFile = zip.file("dados.json");
            if (!jsonFile) throw new Error("Arquivo dados.json não encontrado");

            const jsonData = await jsonFile.async("string");
            const json = JSON.parse(jsonData);

            // Converter assets de volta para DataURL
            for(let c of json.cards) {
                const assetFile = zip.file(c.imagem);
                if (assetFile) {
                    const ext = c.imagem.split('.').pop();
                    const base64 = await assetFile.async("base64");
                    c.imagem = `data:image/${ext};base64,${base64}`;
                }
            }

            // Atualiza o estado passado por referência
            state.cards = json.cards || [];
            state.categories = json.categories || [];
            state.settings = { ...state.settings, ...(json.settings || {}) };

            callback();
        } catch (err) { 
            console.error(err);
            alert("Erro ao importar arquivo .card: Arquivo corrompido ou formato inválido."); 
        }
    },

    async importTextOnly(e, state, callback) {
        const file = e.target.files[0];
        if(!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const json = JSON.parse(event.target.result);
                
                if (json.settings) {
                    state.settings = { ...state.settings, ...json.settings };
                }

                if (json.categories) {
                    json.categories.forEach(importCat => {
                        const idx = state.categories.findIndex(c => c.id === importCat.id);
                        if (idx !== -1) state.categories[idx] = importCat;
                        else state.categories.push(importCat);
                    });
                }

                if (json.cards) {
                    json.cards.forEach(importCard => {
                        const existingIdx = state.cards.findIndex(c => c.id === importCard.id);
                        if (existingIdx !== -1) {
                            state.cards[existingIdx] = {
                                ...importCard,
                                imagem: state.cards[existingIdx].imagem 
                            };
                        } else {
                            state.cards.push({
                                ...importCard,
                                imagem: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                            });
                        }
                    });
                }
                callback();
            } catch (err) { 
                console.error(err);
                alert("Erro ao processar o JSON de textos."); 
            }
        };
        reader.readAsText(file);
    }
};