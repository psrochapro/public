export const zipService = {
    async exportCollection(state) {
        const zip = new JSZip();
        const assets = zip.folder("assets");
        
        // Exportar Cards
        const exportedCards = state.cards.map((c, i) => {
            const mime = c.imagem.split(';')[0].split(':')[1] || 'image/webp';
            const ext = mime.split('/')[1] || 'webp';
            const name = `img_${i}.${ext}`;
            
            const imgParts = c.imagem.split(',');
            if (imgParts.length > 1) {
                assets.file(name, imgParts[1], {base64: true});
            }
            return { ...c, imagem: `assets/${name}` };
        });

        // Exportar Categorias (incluindo imagens de fundo se existirem)
        const exportedCategories = state.categories.map((cat, i) => {
            if (cat.bgType === 'image' && cat.catBgImage && cat.catBgImage.startsWith('data:')) {
                const mime = cat.catBgImage.split(';')[0].split(':')[1] || 'image/webp';
                const ext = mime.split('/')[1] || 'webp';
                const name = `cat_bg_${i}.${ext}`;
                const imgParts = cat.catBgImage.split(',');
                assets.file(name, imgParts[1], {base64: true});
                return { ...cat, catBgImage: `assets/${name}` };
            }
            return cat;
        });

        const exportData = {
            settings: state.settings,
            categories: exportedCategories,
            cards: exportedCards
        };

        zip.file("dados.json", JSON.stringify(exportData, null, 2));
        
        const blob = await zip.generateAsync({type:"blob"});
        const fileName = (state.settings.collectionName || "colecao")
            .replace(/\s+/g, '-')
            .toLowerCase();
            
        saveAs(blob, `${fileName}.card`);
    },

    async importCollection(e, state, callback) {
        const file = e.target.files[0];
        if(!file) return;

        try {
            const zip = await JSZip.loadAsync(file);
            const jsonFile = zip.file(/dados\.json$/i)[0]; 
            if (!jsonFile) throw new Error("Arquivo dados.json não encontrado no pacote.");

            const jsonData = await jsonFile.async("string");
            const json = JSON.parse(jsonData);

            // Importar Cards
            const processedCards = [];
            for(let c of (json.cards || [])) {
                if (!c.layout) c.layout = 'icon';
                const assetFile = zip.file(c.imagem) || zip.file(c.imagem.replace('assets/', ''));
                if (assetFile) {
                    const ext = c.imagem.split('.').pop();
                    const base64 = await assetFile.async("base64");
                    c.imagem = `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${base64}`;
                } else {
                    c.imagem = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
                }
                processedCards.push(c);
            }

            // Importar Categorias
            const processedCats = [];
            for(let cat of (json.categories || [])) {
                // Retrocompatibilidade
                if (!cat.bgType) cat.bgType = 'color';
                
                if (cat.bgType === 'image' && cat.catBgImage) {
                    const assetFile = zip.file(cat.catBgImage) || zip.file(cat.catBgImage.replace('assets/', ''));
                    if (assetFile) {
                        const ext = cat.catBgImage.split('.').pop();
                        const base64 = await assetFile.async("base64");
                        cat.catBgImage = `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${base64}`;
                    }
                }
                processedCats.push(cat);
            }

            state.cards = processedCards;
            state.categories = processedCats;
            state.settings = {
                collectionName: json.settings?.collectionName || "Nova Coleção",
                cardWidth: parseInt(json.settings?.cardWidth) || 280,
                cardHeight: parseInt(json.settings?.cardHeight) || 400,
                borderRadius: parseInt(json.settings?.borderRadius) || 0,
                imgSize: parseInt(json.settings?.imgSize) || 150,
                fontSizeItem: parseInt(json.settings?.fontSizeItem) || 18,
                fontSizeDesc: parseInt(json.settings?.fontSizeDesc) || 14,
                fontSizeCat: parseInt(json.settings?.fontSizeCat) || 10,
                viewportBg: json.settings?.viewportBg || "#f3f6f9",
                titleColor: json.settings?.titleColor || "#1e293b"
            };

            callback();
        } catch (err) { 
            console.error("Erro detalhado:", err);
            alert("Erro ao importar: " + err.message); 
        }
    },

    exportTextOnly(state) {
        const textOnlyCards = state.cards.map(c => {
            const { imagem, ...textData } = c;
            return textData;
        });
        // Remove imagens das categorias na exportação de texto
        const textOnlyCats = state.categories.map(cat => {
            const { catBgImage, ...textCat } = cat;
            return textCat;
        });
        const exportData = { settings: state.settings, categories: textOnlyCats, cards: textOnlyCards };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: "application/json"});
        
        const fileName = (state.settings.collectionName || "colecao")
            .replace(/\s+/g, '-')
            .toLowerCase();

        saveAs(blob, `textos-${fileName}.json`);
    },

    async importTextOnly(e, state, callback) {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const json = JSON.parse(event.target.result);
                if (json.settings) state.settings = { ...state.settings, ...json.settings };
                if (json.categories) {
                    json.categories.forEach(cat => {
                        const i = state.categories.findIndex(c => c.id === cat.id);
                        if (i !== -1) {
                            // Preserva imagem de fundo existente se for apenas importação de texto
                            const existingImg = state.categories[i].catBgImage;
                            state.categories[i] = { ...cat, catBgImage: existingImg };
                        } else {
                            state.categories.push(cat);
                        }
                    });
                }
                if (json.cards) {
                    json.cards.forEach(newCard => {
                        const i = state.cards.findIndex(c => c.id === newCard.id);
                        if (i !== -1) state.cards[i] = { ...newCard, imagem: state.cards[i].imagem };
                        else state.cards.push({ ...newCard, imagem: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" });
                    });
                }
                callback();
            } catch (e) { alert("Erro no JSON"); }
        };
        reader.readAsText(file);
    }
};