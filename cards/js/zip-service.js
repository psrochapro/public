export const zipService = {
    async exportCollection(state) {
        const zip = new JSZip();
        const assets = zip.folder("assets");
        
        const exportData = {
            settings: state.settings,
            categories: state.categories,
            cards: state.cards.map((c, i) => {
                // Tenta descobrir a extensão real da imagem
                const mime = c.imagem.split(';')[0].split(':')[1] || 'image/webp';
                const ext = mime.split('/')[1] || 'webp';
                const name = `img_${i}.${ext}`;
                
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

    async importCollection(e, state, callback) {
        const file = e.target.files[0];
        if(!file) return;

        try {
            const zip = await JSZip.loadAsync(file);
            
            // Tenta achar o dados.json (em qualquer lugar do zip, caso não esteja na raiz)
            const jsonFile = zip.file(/dados\.json$/i)[0]; 
            if (!jsonFile) throw new Error("Arquivo dados.json não encontrado no pacote.");

            const jsonData = await jsonFile.async("string");
            const json = JSON.parse(jsonData);

            // Migração e Limpeza de Dados (O segredo da correção está aqui)
            const processedCards = [];
            
            for(let c of (json.cards || [])) {
                // 1. Garantir que o card tenha um layout
                if (!c.layout) c.layout = 'icon';
                
                // 2. Tentar recuperar a imagem
                const assetFile = zip.file(c.imagem) || zip.file(c.imagem.replace('assets/', ''));
                
                if (assetFile) {
                    const ext = c.imagem.split('.').pop();
                    const base64 = await assetFile.async("base64");
                    c.imagem = `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${base64}`;
                } else {
                    // Imagem placeholder caso falhe
                    c.imagem = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
                }
                processedCards.push(c);
            }

            // Atualiza o estado com garantias de valores padrão
            state.cards = processedCards;
            state.categories = json.categories || [];
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
        const exportData = { settings: state.settings, categories: state.categories, cards: textOnlyCards };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: "application/json"});
        saveAs(blob, `textos-${Date.now()}.json`);
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
                        if (i !== -1) state.categories[i] = cat; else state.categories.push(cat);
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