export const zipService = {
    async exportCollection(state) {
        const zip = new JSZip();
        const assets = zip.folder("assets");
        const exportData = {
            settings: state.settings,
            categories: state.categories,
            cards: state.cards.map((c, i) => {
                const name = `img_${i}.webp`;
                assets.file(name, c.imagem.split(',')[1], {base64: true});
                return { ...c, imagem: `assets/${name}` };
            })
        };
        zip.file("dados.json", JSON.stringify(exportData, null, 2));
        const blob = await zip.generateAsync({type:"blob"});
        const fileName = (state.settings.collectionName || "colecao").replace(/\s+/g, '-').toLowerCase();
        saveAs(blob, `${fileName}.card`);
    },

    exportTextOnly(state) {
        const textOnlyCards = state.cards.map(c => {
            const { imagem, ...textData } = c;
            return textData;
        });
        const exportData = { settings: state.settings, categories: state.categories, cards: textOnlyCards };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: "application/json"});
        const fileName = `textos-${(state.settings.collectionName || "colecao").replace(/\s+/g, '-').toLowerCase()}.json`;
        saveAs(blob, fileName);
    },

    async importCollection(e, callback) {
        const file = e.target.files[0];
        if(!file) return;
        try {
            const zip = await JSZip.loadAsync(file);
            const json = JSON.parse(await zip.file("dados.json").async("string"));
            for(let c of json.cards) {
                const imgData = await zip.file(c.imagem).async("base64");
                c.imagem = `data:image/webp;base64,${imgData}`;
            }
            import('./main.js').then(m => {
                m.state.cards = json.cards;
                m.state.categories = json.categories;
                m.state.settings = json.settings || m.state.settings;
                callback();
            });
        } catch (err) { alert("Erro .card"); }
    },

    async importTextOnly(e, callback) {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const json = JSON.parse(event.target.result);
                const { state } = await import('./main.js');
                
                // 1. Atualizar Configurações (Garantindo que números sejam números)
                if (json.settings) {
                    const s = json.settings;
                    state.settings = {
                        ...state.settings,
                        ...s,
                        cardWidth: parseInt(s.cardWidth) || state.settings.cardWidth,
                        cardHeight: parseInt(s.cardHeight) || state.settings.cardHeight,
                        imgSize: parseInt(s.imgSize) || state.settings.imgSize,
                        fontSizeItem: parseInt(s.fontSizeItem) || state.settings.fontSizeItem,
                        fontSizeDesc: parseInt(s.fontSizeDesc) || state.settings.fontSizeDesc,
                        fontSizeCat: parseInt(s.fontSizeCat) || state.settings.fontSizeCat
                    };
                }

                // 2. Atualizar Categorias (Merge por ID)
                if (json.categories) {
                    json.categories.forEach(importCat => {
                        const idx = state.categories.findIndex(c => c.id === importCat.id);
                        if (idx !== -1) state.categories[idx] = importCat;
                        else state.categories.push(importCat);
                    });
                }

                // 3. Atualizar Cards (Smart Merge)
                if (json.cards) {
                    json.cards.forEach(importCard => {
                        const existingIdx = state.cards.findIndex(c => c.id === importCard.id);
                        
                        if (existingIdx !== -1) {
                            // Se o card já existe, atualizamos o texto mas MANTEMOS a imagem atual
                            state.cards[existingIdx] = {
                                ...importCard,
                                imagem: state.cards[existingIdx].imagem // Preserva a imagem do navegador
                            };
                        } else {
                            // Se o card é novo, adicionamos com um placeholder cinza
                            state.cards.push({
                                ...importCard,
                                imagem: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                            });
                        }
                    });
                }

                callback();
                alert("Importação concluída com sucesso! (Cards novos e textos atualizados)");
            } catch (err) { 
                console.error(err);
                alert("Erro ao processar o arquivo JSON."); 
            }
        };
        reader.readAsText(file);
    }
};