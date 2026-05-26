export async function fetchDados() {
    try {
        const response = await fetch('./dados.json');
        if (!response.ok) throw new Error('Erro ao carregar dados');
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}