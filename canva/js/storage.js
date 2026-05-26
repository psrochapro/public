export const storage = {
    save(state) {
        localStorage.setItem('card_studio_data', JSON.stringify(state));
    },
    load() {
        const data = localStorage.getItem('card_studio_data');
        return data ? JSON.parse(data) : { cards: [], categories: [] };
    }
};