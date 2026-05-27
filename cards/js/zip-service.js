export const zipService = {
    async exportCollection(state) {
        const zip = new JSZip();
        const assets = zip.folder("assets");
        const exportData = {
            settings: state.settings,
            categories: state.categories,
            cards: state.cards.map((c, i) => {
                const name = `img_${i}.webp`;
                const base64Data = c.imagem.includes(',') ? c.imagem.split(',')[1] : c.imagem;
                assets.file(name, base64Data, {base64: true});
                return { ...c, imagem: `assets/${name}` };
            })
        };
        zip.file("dados.json", JSON.stringify(exportData, null, 2));
        const blob = await zip.generateAsync({type:"blob"});
        const fileName = (state.settings.collectionName || "colecao").replace(/\s+/g, '-').toLowerCase();
        saveAs(blob, `${fileName}.card`);
    },

    async importCollection(e) {
        const file = e.target.files[0];
        if(!file) return null;
        try {
            const zip = await JSZip.loadAsync(file);
            const jsonStr = await zip.file("dados.json").async("string");
            const json = JSON.parse(jsonStr);
            
            for(let c of json.cards) {
                const imgData = await zip.file(c.imagem).async("base64");
                c.imagem = `data:image/webp;base64,${imgData}`;
            }
            return json;
        } catch (err) { 
            alert("Erro ao ler arquivo .card"); 
            return null;
        }
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

    async importTextOnly(e) {
        const file = e.target.files[0];
        if(!file) return null;
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                try { resolve(JSON.parse(event.target.result)); } 
                catch (err) { alert("Erro JSON"); resolve(null); }
            };
            reader.readAsText(file);
        });
    }
};