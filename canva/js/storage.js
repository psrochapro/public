export const storage = {
    save(state) {
        localStorage.setItem('card_studio_v3', JSON.stringify(state));
    },
    load() {
        const data = localStorage.getItem('card_studio_v3');
        return data ? JSON.parse(data) : { cards: [], categories: [] };
    }
};