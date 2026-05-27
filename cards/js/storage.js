export const storage = {
    save(state) {
        localStorage.setItem('card_studio_v2_final', JSON.stringify(state));
    },
    load() {
        const data = localStorage.getItem('card_studio_v2_final');
        return data ? JSON.parse(data) : { 
            cards: [], 
            categories: [], 
            settings: {
                collectionName: "Nome da Coleção",
                cardWidth: 280, cardHeight: 400, borderRadius: 20, imgSize: 150,
                fontSizeItem: 18, fontSizeDesc: 16, fontSizeCat: 11,
                viewBg: "#f3f6f9", viewTitleColor: "#1e293b"
            } 
        };
    }
};