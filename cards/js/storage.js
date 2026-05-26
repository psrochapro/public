export const storage = {
    save(state) {
        localStorage.setItem('card_studio_v5', JSON.stringify(state));
    },
    load() {
        const data = localStorage.getItem('card_studio_v5');
        return data ? JSON.parse(data) : { cards: [], categories: [], settings: {} };
    }
};