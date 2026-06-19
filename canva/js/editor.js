/* 
   ARQUIVO: js/editor.js
   FUNÇÃO: Controle de interface, Redimensionamento, Highlighting e Utilitários de Edição.
*/

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

        // 1. Listeners de Edição
        this.input.addEventListener('input', () => {
            this.syncAndRender();
        });

        this.input.addEventListener('scroll', () => {
            this.highlight.scrollTop = this.input.scrollTop;
        });

        // 2. Toggle Abrir/Fechar
        this.toggleBtn.addEventListener('click', () => {
            this.container.classList.toggle('editor-collapsed');
        });

        // 3. Lógica de Redimensionamento (Resize)
        this.resizer.addEventListener('mousedown', (e) => {
            this.isResizing = true;
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isResizing) return;
            let newWidth = e.clientX;
            if (newWidth < 300) newWidth = 300;
            if (newWidth > window.innerWidth * 0.8) newWidth = window.innerWidth * 0.8;
            this.container.style.width = `${newWidth}px`;
        });

        document.addEventListener('mouseup', () => {
            if (this.isResizing) {
                this.isResizing = false;
                document.body.style.cursor = 'default';
                document.body.style.userSelect = 'auto';
            }
        });

        // Carregar conteúdo inicial
        const currentData = persistence.getContentString();
        if (currentData) {
            this.setContent(currentData);
        }
    },

    // Nova Funcionalidade: Reordenar Atividades 1, 2, 3...
    reorderActivities() {
        let text = this.input.value;
        let count = 1;

        // Regex: Busca "#atividade" seguido de espaço(s) e número(s)
        // O replace usa uma função callback para incrementar o contador a cada achado
        const newText = text.replace(/(#atividade\s+)(\d+)/g, (match, prefix, oldNumber) => {
            const replaced = prefix + count;
            count++;
            return replaced;
        });

        this.setContent(newText);
    },

    insertTemplate() {
        const templateText = template.getTemplateContent();
        const currentText = this.input.value.trim();

        if (currentText !== "") {
            const confirmar = confirm("Isso substituirá o conteúdo atual pelo template. Deseja continuar?");
            if (!confirmar) return;
        }

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
        try {
            const data = parser.parse(text);
            renderer.render(data);
        } catch (e) {
            console.warn("Aguardando input válido...");
        }
    },

    updateHighlight(text) {
        let html = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        html = html.replace(/(#[A-Za-zÀ-ÖØ-öø-ÿ0-9]+)/g, '<span class="hl-tag">$1</span>');
        html = html.replace(/(^|\n)([A-Za-zÀ-ÖØ-öø-ÿ\s]+:)/g, '$1<span class="hl-label">$2</span>');
        html = html.replace(/(Regra:|Lógica:)/gi, '<span class="hl-logic">$1</span>');

        this.highlight.innerHTML = html + "\n\n";
    }
};