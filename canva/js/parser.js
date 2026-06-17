const parser = {
    /**
     * Transforma o texto bruto do arquivo em um objeto de dados.
     * Suporta tags com conteúdo na mesma linha: #tag Conteúdo
     * E tags com conteúdo em linhas subsequentes: #tag \n Conteúdo
     */
    parse(text) {
        const lines = text.split('\n');
        const data = {};
        let currentSection = null;

        lines.forEach(line => {
            const trimmed = line.trim();
            
            // Verifica se a linha é uma definição de TAG (começa com #)
            if (trimmed.startsWith('#')) {
                const firstSpaceIndex = trimmed.indexOf(' ');
                
                if (firstSpaceIndex !== -1) {
                    // CASO 1: #tag Conteúdo (Conteúdo na mesma linha)
                    // Pega o nome da tag (entre o # e o primeiro espaço)
                    currentSection = trimmed.substring(1, firstSpaceIndex).toLowerCase();
                    // Pega o restante da linha como conteúdo inicial
                    const content = trimmed.substring(firstSpaceIndex).trim();
                    data[currentSection] = [content];
                } else {
                    // CASO 2: #tag (Tag sozinha na linha)
                    currentSection = trimmed.substring(1).toLowerCase();
                    data[currentSection] = [];
                }
            } else if (currentSection && trimmed !== "") {
                // Adiciona linhas de conteúdo subsequentes à tag ativa
                data[currentSection].push(trimmed);
            }
        });

        return data;
    }
};