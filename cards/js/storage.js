export const storage = {
    save(state) {
        // Desativado: Não salva no LocalStorage para evitar erro de cota (limite de 5MB do navegador).
        // Os dados agora ficam guardados apenas na memória RAM durante o uso.
        // O usuário é responsável por clicar em "Salvar" para gerar o arquivo .card.
        console.log("Card Studio: Alterações mantidas em memória.");
    },
    load() {
        // Sempre inicia com um projeto vazio ou padrões ao recarregar a página.
        // Isso força o usuário a importar seu arquivo .card para continuar o trabalho.
        return { 
            cards: [], 
            categories: [], 
            settings: {
                collectionName: "Nova Coleção",
                cardWidth: 280,
                cardHeight: 400,
                borderRadius: 12,
                imgSize: 150,
                fontSizeItem: 18,
                fontSizeDesc: 14,
                fontSizeCat: 10,
                viewportBg: "#f3f6f9",
                titleColor: "#1e293b"
            } 
        };
    }
};