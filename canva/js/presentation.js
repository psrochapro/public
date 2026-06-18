const presentation = {
    isPresentationMode: false,
    currentStep: -1, // -1: Título, 0-10: Itens de Levantamento, 11+: Etapas
    etapasDisponiveis: [],

    init() {
        document.getElementById('btn-presentation').addEventListener('click', () => this.togglePresentation());
        document.getElementById('pres-next').addEventListener('click', () => this.next());
        document.getElementById('pres-prev').addEventListener('click', () => this.prev());
        document.getElementById('pres-exit').addEventListener('click', () => this.togglePresentation());

        // Teclado
        window.addEventListener('keydown', (e) => {
            if (!this.isPresentationMode) return;
            if (e.key === 'ArrowRight') this.next();
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'Escape') this.togglePresentation();
        });
    },

    togglePresentation() {
        this.isPresentationMode = !this.isPresentationMode;
        document.body.classList.toggle('presentation-mode', this.isPresentationMode);
        
        if (this.isPresentationMode) {
            this.currentStep = -1;
            this.mapearEtapas();
            this.updateView();
        } else {
            this.clearFocus();
        }
    },

    mapearEtapas() {
        const rows = document.querySelectorAll('.activity-row-card');
        const etapas = new Set();
        rows.forEach(row => etapas.add(row.getAttribute('data-etapa')));
        this.etapasDisponiveis = Array.from(etapas).sort((a, b) => a - b);
    },

    updateView() {
        this.clearFocus();
        const surveyCards = document.querySelectorAll('.survey-card');
        const presInfo = document.getElementById('pres-info');

        if (this.currentStep === -1) {
            // Foco no Título e Dashboard
            document.querySelector('.process-title-header').classList.add('pres-focus');
            document.querySelector('.header-dashboard').classList.add('pres-focus');
            presInfo.innerText = "Visão Geral";
        } 
        else if (this.currentStep >= 0 && this.currentStep <= 10) {
            // Foco nos 11 itens
            const card = surveyCards[this.currentStep];
            card.classList.add('pres-focus');
            card.classList.add('active-reveal');
            presInfo.innerText = `Levantamento: ${this.currentStep + 1} de 11`;
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } 
        else {
            // Foco nas Etapas de Atividades
            const indexEtapa = this.currentStep - 11;
            if (indexEtapa < this.etapasDisponiveis.length) {
                const etapaAtual = this.etapasDisponiveis[indexEtapa];
                const rows = document.querySelectorAll(`.activity-row-card[data-etapa="${etapaAtual}"]`);
                rows.forEach(r => r.classList.add('active-etapa'));
                if (rows[0]) rows[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                presInfo.innerText = `Atividades: Etapa ${etapaAtual}`;
            } else {
                // Fim
                this.currentStep = this.etapasDisponiveis.length + 11;
                presInfo.innerText = "Fim da Apresentação";
            }
        }
    },

    next() {
        const totalSteps = 11 + this.etapasDisponiveis.length;
        if (this.currentStep < totalSteps - 1) {
            this.currentStep++;
            this.updateView();
        }
    },

    prev() {
        if (this.currentStep > -1) {
            this.currentStep--;
            this.updateView();
        }
    },

    clearFocus() {
        document.querySelectorAll('.pres-focus').forEach(el => el.classList.remove('pres-focus'));
        document.querySelectorAll('.active-etapa').forEach(el => el.classList.remove('active-etapa'));
        // Não removemos 'active-reveal' para manter as pílulas que já foram mostradas
    }
};

// Iniciar quando o DOM carregar
window.addEventListener('DOMContentLoaded', () => presentation.init());