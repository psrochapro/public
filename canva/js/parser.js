const parser = {
    parse(text) {
        const lines = text.split('\n');
        const data = { fluxo: [], observacoes: [], mapaEtapas: {} };
        let currentSection = null;
        let currentAtividade = null;

        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('#')) {
                const parts = trimmed.split(' ');
                const tag = parts[0].substring(1).toLowerCase();
                const inlineContent = parts.slice(1).join(' ').trim();

                if (tag === 'etapas') {
                    currentSection = 'mapaEtapas';
                    currentAtividade = null;
                } else if (tag.startsWith('atividade')) {
                    currentAtividade = { numero: inlineContent };
                    data.fluxo.push(currentAtividade);
                    currentSection = 'atividade';
                } else {
                    currentSection = tag;
                    data[currentSection] = inlineContent ? [inlineContent] : [];
                    currentAtividade = null;
                }
            } else if (currentSection === 'mapaEtapas' && trimmed.includes(':')) {
                const [num, ...nameParts] = trimmed.split(':');
                const numKey = num.trim();
                const nameVal = nameParts.join(':').trim();
                if (numKey && nameVal) {
                    data.mapaEtapas[numKey] = nameVal;
                }
            } else if (currentSection === 'atividade' && trimmed.includes(':')) {
                const [key, ...valParts] = trimmed.split(':');
                const keyClean = key.trim().toLowerCase();
                currentAtividade[keyClean] = valParts.join(':').trim();
            } else if (currentSection === 'observacoes' && trimmed !== "") {
                data.observacoes.push(trimmed);
            } else if (currentSection && currentSection !== 'atividade' && currentSection !== 'mapaEtapas' && trimmed !== "") {
                if (Array.isArray(data[currentSection])) {
                    data[currentSection].push(trimmed);
                }
            }
        });
        return data;
    }
};