const parser = {
    parse(text) {
        const lines = text.split('\n');
        const data = {};
        let currentSection = null;

        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('#')) {
                currentSection = trimmed.substring(1).toLowerCase();
                data[currentSection] = [];
            } else if (currentSection && trimmed !== "") {
                data[currentSection].push(trimmed);
            }
        });

        return data;
    },

    // Parser específico para campos chave-valor (ex: SGPe)
    parseKeyValue(lines) {
        const result = {};
        lines.forEach(line => {
            const parts = line.split(':');
            if (parts.length >= 2) {
                const key = parts[0].trim().toLowerCase();
                const value = parts.slice(1).join(':').trim();
                result[key] = value;
            }
        });
        return result;
    }
};