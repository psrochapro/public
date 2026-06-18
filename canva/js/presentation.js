const presentation = {
    isPresentationMode: false,
    currentStep: -1, 
    totalRows: 0,

    init() {
        document.getElementById('btn-presentation').addEventListener('click', () => this.togglePresentation());
        document.getElementById('pres-next').addEventListener('click', () => this.next());
        document.getElementById('pres-prev').addEventListener('click', () => this.prev());
        document.getElementById('pres-exit').addEventListener('click', () => this.togglePresentation());

        window.addEventListener('keydown', (e) => {
            if (!this.isPresentationMode) return;
            if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); this.next(); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); this.prev(); }
            if (e.key === 'Escape') this.togglePresentation();
        });
    },

    togglePresentation() {
        this.isPresentationMode = !this.isPresentationMode;
        document.body.classList.toggle('presentation-mode', this.isPresentationMode);
        
        if (this.isPresentationMode) {
            this.currentStep = -1;
            this.totalRows = document.querySelectorAll('.activity-row-card').length;
            this.updateView();
        } else {
            this.clearFocus();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    },

    updateView() {
        this.clearFocus();
        const surveyCards = document.querySelectorAll('.survey-card');
        const flowRows = document.querySelectorAll('.activity-row-card');
        const presInfo = document.getElementById('pres-info');

        if (this.currentStep === -1) {
            // Título e Dashboard
            const header = document.querySelector('.process-title-header');
            const dash = document.querySelector('.header-dashboard');
            header.classList.add('pres-focus');
            dash.classList.add('pres-focus');
            presInfo.innerText = "Introdução";
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } 
        else if (this.currentStep >= 0 && this.currentStep <= 10) {
            // Foco nos 11 Itens
            const card = surveyCards[this.currentStep];
            card.classList.add('pres-focus');
            card.classList.add('active-reveal');
            presInfo.innerText = `Levantamento: ${this.currentStep + 1} / 11`;
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } 
        else {
            // Foco nas Atividades (Linha por Linha para evitar erro em etapas repetidas)
            const rowIndex = this.currentStep - 11;
            if (rowIndex < flowRows.length) {
                const row = flowRows[rowIndex];
                row.classList.add('pres-focus');
                row.classList.add('active-row');
                const etapa = row.querySelector('.step-num').innerText;
                presInfo.innerText = `Atividade ${rowIndex + 1} (Etapa ${etapa})`;
                row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                presInfo.innerText = "Fim do Fluxo";
            }
        }
    },

    next() {
        const max = 11 + this.totalRows;
        if (this.currentStep < max - 1) {
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
        document.querySelectorAll('.active-row').forEach(el => el.classList.remove('active-row'));
        // active-reveal permanece para manter o que já foi apresentado
    }
};

window.addEventListener('DOMContentLoaded', () => presentation.init());