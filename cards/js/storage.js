export const storage = {
    save(state) {
        localStorage.setItem('card_studio_v7', JSON.stringify(state));
    },
    load() {
        const data = localStorage.getItem('card_studio_v7');
        return data ? JSON.parse(data) : { 
            cards: [], 
            categories: [], 
            settings: {
                collectionName: "Nome da Coleção",
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