export const storage = {
    save(state) {
        localStorage.setItem('card_studio_v11', JSON.stringify(state));
    },
    load() {
        const data = localStorage.getItem('card_studio_v11');
        return data ? JSON.parse(data) : { 
            cards: [], 
            categories: [], 
            settings: {
                collectionName: "Nome da Coleção",
                cardWidth: 200,
                cardHeight: 300,
                borderRadius: 0,
                imgSize: 150,
                fontSizeItem: 18,
                fontSizeDesc: 14,
                fontSizeCat: 10
            } 
        };
    }
};