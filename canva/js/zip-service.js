export const zipService = {
    async exportCollection(state) {
        const zip = new JSZip();
        const assetsFolder = zip.folder("assets");
        
        // Criamos uma cópia dos dados para o JSON, mas trocamos o Base64 por caminhos de arquivo
        const exportData = {
            categories: state.categories,
            cards: state.cards.map((card, index) => {
                const fileName = `img_${index}.png`;
                // Extrair apenas o dado binário do Base64
                const base64Data = card.imagem.split(',')[1];
                assetsFolder.file(fileName, base64Data, {base64: true});
                
                return {
                    ...card,
                    imagem: `assets/${fileName}`
                };
            })
        };

        zip.file("dados.json", JSON.stringify(exportData, null, 2));

        const content = await zip.generateAsync({type: "blob"});
        saveAs(content, "minha-colecao.card");
    },

    async importCollection(event, callback) {
        const file = event.target.files[0];
        if (!file) return;

        const zip = await JSZip.loadAsync(file);
        const jsonData = await zip.file("dados.json").async("string");
        const parsed = JSON.parse(jsonData);

        // Converter caminhos de imagem de volta para Base64 para uso imediato
        for (let card of parsed.cards) {
            const imgFile = zip.file(card.imagem);
            if (imgFile) {
                const base64 = await imgFile.async("base64");
                card.imagem = `data:image/png;base64,${base64}`;
            }
        }

        // Atualizar o estado global (este exemplo substitui o existente)
        import('../js/main.js').then(m => {
            m.state.cards = parsed.cards;
            m.state.categories = parsed.categories;
            callback();
        });
    }
};