export const storage = {
    save(state) {
        // Versão 6: Suporte a Imagens Otimizadas via Canvas
        localStorage.setItem('card_studio_v6', JSON.stringify(state));
    },
    load() {
        const data = localStorage.getItem('card_studio_v6');
        return data ? JSON.parse(data) : { 
            cards: [], 
            categories: [], 
            settings: {
                collectionName: "Canvas de Processos",
                cardWidth: 300,
                cardHeight: 420,
                imgSize: 160,
                fontSizeItem: 18,
                fontSizeDesc: 16,
                fontSizeCat: 11
            } 
        };
    }
};