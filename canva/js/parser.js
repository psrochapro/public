const parser = {
    parse(text) {
        const lines = text.split('\n');
        const data = { fluxo: [] };
        let currentSection = null;
        let currentEtapa = null;

        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('#')) {
                const parts = trimmed.split(' ');
                const tag = parts[0].substring(1).toLowerCase();
                const inlineContent = parts.slice(1).join(' ').trim();

                if (tag.startsWith('etapa')) {
                    currentEtapa = { id: inlineContent || (data.fluxo.length + 1) };
                    data.fluxo.push(currentEtapa);
                    currentSection = 'etapa';
                } else {
                    currentSection = tag;
                    data[currentSection] = inlineContent ? [inlineContent] : [];
                    currentEtapa = null;
                }
            } else if (currentSection === 'etapa' && trimmed.includes(':')) {
                const [key, ...valParts] = trimmed.split(':');
                const keyClean = key.trim().toLowerCase();
                currentEtapa[keyClean] = valParts.join(':').trim();
            } else if (currentSection && currentSection !== 'etapa' && trimmed !== "") {
                data[currentSection].push(trimmed);
            }
        });
        return data;
    }
};