const parser = {
    parse(text) {
        const lines = text.split('\n');
        const data = { fluxo: [] };
        let currentSection = null;
        let currentAtividade = null;

        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('#')) {
                const parts = trimmed.split(' ');
                const tag = parts[0].substring(1).toLowerCase();
                const inlineContent = parts.slice(1).join(' ').trim();

                // Novo mapeamento: #atividade em vez de #etapa
                if (tag.startsWith('atividade') || tag.startsWith('etapa')) {
                    currentAtividade = {};
                    data.fluxo.push(currentAtividade);
                    currentSection = 'atividade';
                } else {
                    currentSection = tag;
                    data[currentSection] = inlineContent ? [inlineContent] : [];
                    currentAtividade = null;
                }
            } else if (currentSection === 'atividade' && trimmed.includes(':')) {
                const [key, ...valParts] = trimmed.split(':');
                const keyClean = key.trim().toLowerCase();
                currentAtividade[keyClean] = valParts.join(':').trim();
            } else if (currentSection && currentSection !== 'atividade' && trimmed !== "") {
                data[currentSection].push(trimmed);
            }
        });
        return data;
    }
};