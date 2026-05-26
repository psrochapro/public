export const zipService = {
    async exportCollection(state) {
        const zip = new JSZip();
        const assets = zip.folder("assets");
        const exportData = {
            settings: state.settings,
            categories: state.categories,
            cards: state.cards.map((c, i) => {
                const name = `img_${i}.png`;
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
                c.imagem = `data:image/png;base64,${imgData}`;
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
                const mergedCards = json.cards.map(importedCard => {
                    const existingCard = state.cards.find(c => c.id === importedCard.id);
                    return { ...importedCard, imagem: existingCard ? existingCard.imagem : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" };
                });
                state.cards = mergedCards;
                state.categories = json.categories || state.categories;
                state.settings = json.settings || state.settings;
                callback();
                alert("Importado!");
            } catch (err) { alert("Erro JSON"); }
        };
        reader.readAsText(file);
    }
};