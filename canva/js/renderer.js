const renderer = {
    render(data) {
        // Limpar áreas
        document.querySelectorAll('.block-content').forEach(el => el.innerHTML = '');

        // Mapeamento Simples (Listas)
        this.renderList('atores', data.atores);
        this.renderList('entradas', data.entradas);
        this.renderList('saidas', data.saídas || data.saidas);
        this.renderList('interessados', data.interessados);
        this.renderList('lgpd', data.lgpd);
        this.renderList('recursos', data.recursos);
        this.renderList('atividades', data.atividades);
        this.renderList('indicadores', data.indicadores);
        this.renderList('documentos', data.documentos);
        this.renderList('normas', data.normas);

        // Objetivo
        if(data.objetivo) document.getElementById('val-objetivo').innerText = data.objetivo.join(' ');

        // SGPE Especial
        if (data.sgpe) {
            const sgpeData = parser.parseKeyValue(data.sgpe);
            const container = document.getElementById('section-sgpe');
            container.innerHTML = `
                <div class="sgpe-item"><strong>Assunto:</strong><br>${sgpeData.assunto || ''}</div>
                <div class="sgpe-item"><strong>Classe:</strong><br>${sgpeData.classe || ''}</div>
                <div class="sgpe-item"><strong>Sigilo:</strong><br>${sgpeData.sigilo || ''}</div>
            `;
        }
    },

    renderList(id, items) {
        const el = document.getElementById(`section-${id}`);
        if (el && items) {
            el.innerText = items.join('\n');
        }
    }
};