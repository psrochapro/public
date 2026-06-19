/* 
   ARQUIVO: js/editor.js
   FUNÇÃO: Controle de interface e lógica de Highlighting em tempo real.
*/

const editor = {
    container: null,
    input: null,
    highlight: null,
    toggleBtn: null,

    init() {
        this.container = document.getElementById('editor-container');
        this.input = document.getElementById('editor-input');
        this.highlight = document.getElementById('editor-highlight');
        this.toggleBtn = document.getElementById('editor-toggle');

        if (!this.input) return;

        // Listener para Edição
        this.input.addEventListener('input', () => {
            this.syncAndRender();
        });

        // Sincronizar Scroll
        this.input.addEventListener('scroll', () => {
            this.highlight.scrollTop = this.input.scrollTop;
        });

        // Listener para o Toggle
        this.toggleBtn.addEventListener('click', () => {
            this.container.classList.toggle('editor-collapsed');
        });

        // Carregar conteúdo inicial (caso já exista algo renderizado)
        const currentData = persistence.getContentString();
        if (currentData) {
            this.setContent(currentData);
        }
    },

    setContent(text) {
        if (!this.input) return;
        this.input.value = text;
        this.syncAndRender();
    },

    syncAndRender() {
        const text = this.input.value;
        
        // 1. Aplicar Syntax Highlighting Visual
        this.updateHighlight(text);

        // 2. Disparar Parser e Renderer original
        try {
            const data = parser.parse(text);
            renderer.render(data);
        } catch (e) {
            console.warn("Aguardando input válido para renderizar...");
        }
    },

    updateHighlight(text) {
        // Escapar HTML básico para evitar injeção
        let html = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // Regras de Cores (Regex)
        // Tags #NomeDoCampo
        html = html.replace(/(#[A-Za-zÀ-ÖØ-öø-ÿ0-9]+)/g, '<span class="hl-tag">$1</span>');
        
        // Rótulos como "Ator:", "Insumos:" (Início de linha ou após espaço)
        html = html.replace(/(^|\n)([A-Za-zÀ-ÖØ-öø-ÿ\s]+:)/g, '$1<span class="hl-label">$2</span>');
        
        // Regras de Lógica (BPMN)
        html = html.replace(/(Regra:|Lógica:)/gi, '<span class="hl-logic">$1</span>');

        // Adicionar um caractere extra no final para lidar com quebras de linha no scroll
        this.highlight.innerHTML = html + "\n\n";
    }
};