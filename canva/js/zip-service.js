export const zipService = {
    async exportCollection(state) {
        const zip = new JSZip();
        const assets = zip.folder("assets");
        
        const exportData = {
            categories: state.categories,
            cards: state.cards.map((c, i) => {
                const name = `img_${i}.png`;
                assets.file(name, c.imagem.split(',')[1], {base64: true});
                return { ...c, imagem: `assets/${name}` };
            })
        };

        zip.file("dados.json", JSON.stringify(exportData, null, 2));
        const blob = await zip.generateAsync({type:"blob"});
        saveAs(blob, "colecao-cards.card");
    },

    async importCollection(e, callback) {
        const file = e.target.files[0];
        if(!file) return;
        const zip = await JSZip.loadAsync(file);
        const json = JSON.parse(await zip.file("dados.json").async("string"));
        
        for(let c of json.cards) {
            const imgData = await zip.file(c.imagem).async("base64");
            c.imagem = `data:image/png;base64,${imgData}`;
        }

        import('./main.js').then(m => {
            m.state.cards = json.cards;
            m.state.categories = json.categories;
            callback();
        });
    }
};