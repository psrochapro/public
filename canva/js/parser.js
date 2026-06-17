const parser = {
    parse(text) {
        const lines = text.split('\n');
        const data = {};
        let currentSection = null;

        lines.forEach(line => {
            const trimmed = line.trim();
            
            if (trimmed.startsWith('#')) {
                // Divide a linha para ver se tem conteúdo após a tag (ex: #nome Titulo)
                const firstSpaceIndex = trimmed.indexOf(' ');
                
                if (firstSpaceIndex !== -1) {
                    // Caso tenha conteúdo na mesma linha da tag
                    currentSection = trimmed.substring(1, firstSpaceIndex).toLowerCase();
                    const content = trimmed.substring(firstSpaceIndex).trim();
                    data[currentSection] = [content];
                } else {
                    // Caso a tag esteja sozinha na linha
                    currentSection = trimmed.substring(1).toLowerCase();
                    data[currentSection] = [];
                }
            } else if (currentSection && trimmed !== "") {
                // Adiciona conteúdo das linhas abaixo da tag
                data[currentSection].push(trimmed);
            }
        });

        return data;
    }
};