const parser = {
    parse(text) {
        const lines = text.split('\n');
        const data = { fluxo: [], observacoes: [] };
        let currentSection = null;
        let currentAtividade = null;

        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('#')) {
                const parts = trimmed.split(' ');
                const tag = parts[0].substring(1).toLowerCase();
                const inlineContent = parts.slice(1).join(' ').trim();

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
            } else if (currentSection === 'observacoes' && trimmed !== "") {
                data.observacoes.push(trimmed);
            } else if (currentSection && currentSection !== 'atividade' && trimmed !== "") {
                if (Array.isArray(data[currentSection])) {
                    data[currentSection].push(trimmed);
                }
            }
        });
        return data;
    }
};