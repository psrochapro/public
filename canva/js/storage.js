export const storage = {
    save(state) {
        localStorage.setItem('card_studio_v2', JSON.stringify(state));
    },
    load() {
        const data = localStorage.getItem('card_studio_v2');
        return data ? JSON.parse(data) : { cards: [], categories: [] };
    }
};