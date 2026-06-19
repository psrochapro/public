/* 
   ARQUIVO: js/presentation.js
   FUNÇÃO: Lógica de navegação sequencial agrupada por Etapas com Smart Scroll compensado.
*/

const presentation = {
    isPresentationMode: false,
    currentStep: -1, 
    uniqueSteps: [],

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
            this.calculateUniqueSteps();
            this.updateView();
        } else {
            this.clearFocus();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    },

    calculateUniqueSteps() {
        const rows = document.querySelectorAll('.activity-row-card');
        const steps = new Set();
        rows.forEach(row => {
            const etapa = row.getAttribute('data-etapa') || "1";
            steps.add(etapa);
        });
        this.uniqueSteps = Array.from(steps).sort((a, b) => parseInt(a) - parseInt(b));
    },

    updateView() {
        this.clearFocus();
        const surveyCards = document.querySelectorAll('.survey-card');
        const presInfo = document.getElementById('pres-info');

        if (this.currentStep === -1) {
            const header = document.querySelector('.process-title-header');
            const dash = document.querySelector('.header-dashboard');
            header.classList.add('pres-focus');
            dash.classList.add('pres-focus');
            presInfo.innerText = "Introdução do Processo";
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } 
        else if (this.currentStep >= 0 && this.currentStep <= 10) {
            const card = surveyCards[this.currentStep];
            if (card) {
                card.classList.add('pres-focus');
                card.classList.add('active-reveal');
                presInfo.innerText = `Levantamento: ${this.currentStep + 1} / 11`;
                this.smartScroll(card);
            }
        } 
        else {
            const stepIdx = this.currentStep - 11;
            const targetEtapa = this.uniqueSteps[stepIdx];

            if (targetEtapa) {
                const groupRows = document.querySelectorAll(`.activity-row-card[data-etapa="${targetEtapa}"]`);
                groupRows.forEach(row => {
                    row.classList.add('pres-focus');
                    row.classList.add('active-row');
                });
                
                presInfo.innerText = `Fluxo: Etapa ${targetEtapa} (${this.uniqueSteps.indexOf(targetEtapa) + 1} de ${this.uniqueSteps.length})`;
                
                if (groupRows.length > 0) {
                    this.smartScroll(groupRows[0], true); // true indica que é fluxo (precisa compensar cabeçalho)
                }
            } else {
                presInfo.innerText = "Fim da Apresentação";
            }
        }
    },

    // Scroll inteligente compensando o cabeçalho fixo na tabela
    smartScroll(element, isFlow = false) {
        // Compensação: 80px para cards normais, 120px para o fluxo (para não bater no sticky header)
        const offset = isFlow ? 120 : 150; 
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
            top: elementPosition - offset,
            behavior: 'smooth'
        });
    },

    next() {
        const totalStepsCount = 11 + this.uniqueSteps.length;
        if (this.currentStep < totalStepsCount - 1) {
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
    }
};

window.addEventListener('DOMContentLoaded', () => presentation.init());