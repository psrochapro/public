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
    }
};