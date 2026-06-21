const editor = {
    container: null,
    input: null,
    highlight: null,
    toggleBtn: null,
    resizer: null,
    isResizing: false,

    init() {
        this.container = document.getElementById('editor-container');
        this.input = document.getElementById('editor-input');
        this.highlight = document.getElementById('editor-highlight');
        this.toggleBtn = document.getElementById('editor-toggle');
        this.resizer = document.getElementById('editor-resizer');
        if (!this.input) return;

        this.input.addEventListener('input', () => this.syncAndRender());
        this.input.addEventListener('scroll', () => {
            this.highlight.scrollTop = this.input.scrollTop;
        });

        this.toggleBtn.addEventListener('click', () => {
            this.container.classList.toggle('editor-collapsed');
        });

        this.resizer.addEventListener('mousedown', (e) => {
            this.isResizing = true;
            document.body.style.cursor = 'col-resize';
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isResizing) return;
            let newWidth = e.clientX;
            if (newWidth < 300) newWidth = 300;
            this.container.style.width = `${newWidth}px`;
        });

        document.addEventListener('mouseup', () => {
            this.isResizing = false;
            document.body.style.cursor = 'default';
        });
    },

    insertActivity() {
        const text = this.input.value;
        const regex = /#atividade\s+(\d+)/g;
        let match;
        let lastNum = 0;
        let lastMatchIndex = -1;
        while ((match = regex.exec(text)) !== null) {
            lastNum = parseInt(match[1]);
            lastMatchIndex = match.index;
        }
        const nextNum = lastNum + 1;
        const templateStr = `#atividade ${nextNum}\nEtapa: \nFornecedor: \nInsumos: \nAtor: \nAtividades: \nRegra: \nSaídas: \nCliente: \n`;
        let insertPos = text.length;
        if (lastMatchIndex !== -1) {
            const nextSection = text.indexOf('#', lastMatchIndex + 1);
            if (nextSection !== -1) insertPos = nextSection;
        }
        const textBefore = text.substring(0, insertPos).trimEnd();
        const textAfter = text.substring(insertPos).trimStart();
        const newText = textBefore + (textBefore ? "\n\n" : "") + templateStr + (textAfter ? "\n" : "") + textAfter;
        this.setContent(newText);
        this.input.focus();
    },

    reorderActivities() {
        let text = this.input.value;
        let count = 1;
        const newText = text.replace(/(#atividade\s+)(\d+)/g, (match, prefix) => {
            return prefix + (count++);
        });
        this.setContent(newText);
    },

    insertTemplate() {
        const templateText = template.getTemplateContent();
        if (this.input.value.trim() !== "" && !confirm("Substituir conteúdo atual?")) return;
        this.setContent(templateText);
    },

    setContent(text) {
        if (!this.input) return;
        this.input.value = text;
        this.syncAndRender();
    },

    syncAndRender() {
        const text = this.input.value;
        this.updateHighlight(text);
        persistence.saveToLocal(text);
        try {
            const data = parser.parse(text);
            renderer.render(data);
        } catch (e) { console.warn("Erro no processamento."); }
    },

    updateHighlight(text) {
        let html = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        html = html.replace(/(#[A-Za-z0-9À-ÿ]+)/g, '<span class="hl-tag">$1</span>');
        html = html.replace(/(^|\n)([A-Za-z0-9À-ÿ\s]+:)/g, '$1<span class="hl-label">$2</span>');
        html = html.replace(/(Regra:|Lógica:)/gi, '<span class="hl-logic">$1</span>');
        html = html.replace(/(^|\n)(\d+):/g, '$1<span class="hl-step-num">$2:</span>');
        this.highlight.innerHTML = html + "\n\n";
    }
};