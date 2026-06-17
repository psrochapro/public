const renderer = {
    config: [
        { id: 'atores', label: 'Atores Envolvidos', icon: '👥', desc: 'Quem são os participantes (pessoas, cargos, setores...) que desempenham atividades?' },
        { id: 'entradas', label: 'Principais Entradas', icon: '📥', desc: 'Quais os fatos que iniciam o processo? Podem ser materiais ou eventos intangíveis.' },
        { id: 'saidas', label: 'Principais Saídas', icon: '📤', desc: 'Quais resultados gerados no processo? (agendamento, documentos, formulários).' },
        { id: 'interessados', label: 'Interessados', icon: '👤', desc: 'Quem são os beneficiários do processo, a quem se destinam os resultados gerados?' },
        { id: 'normas', label: 'Leis e Normas Aplicadas', icon: '⚖️', desc: 'Quais leis, decretos ou instruções normativas disciplinam a execução do processo?' },
        { id: 'lgpd', label: 'Gestão LGPD', icon: '🛡️', desc: 'Ao executar uma instância do processo, quais os dados pessoais envolvidos?' },
        { id: 'recursos', label: 'Recursos Tecnológicos', icon: '💻', desc: 'Há integração de sistemas? Há possibilidade de aprimoramento?' },
        { id: 'documentos', label: 'Gestão Documental CPAD', icon: '📄', desc: 'Quais os documentos presentes e suas respectivas temporalidades de guarda?' },
        { id: 'sgpe', label: 'Parâmetros SGPE', icon: '⌨️', desc: 'Define os parâmetros do SGPe: Assunto, Classe e Sigilo.' },
        { id: 'indicadores', label: 'Indicadores de Performance', icon: '📊', desc: 'Quais os indicadores utilizados para apuração do resultado do processo?' },
        { id: 'gatilho', label: 'Gatilho de Início', icon: '☝️', desc: 'O que dá início ao processo? E-mail, Chamado, Formulário, etc.' }
    ],

    render(data) {
        // Render Header
        document.getElementById('val-nome').innerText = (data.nome || ['---']).join(' ');
        document.getElementById('val-macroprocesso').innerText = (data.macroprocesso || ['---']).join(' ');
        document.getElementById('val-area').innerText = (data.area || ['---']).join(' ');
        document.getElementById('val-dono').innerText = (data.dono || ['---']).join(' ');
        document.getElementById('val-objetivo').innerText = (data.objetivo || ['---']).join(' ');

        // Render Survey Cards
        const surveyContainer = document.getElementById('survey-container');
        surveyContainer.innerHTML = '';
        
        this.config.forEach((item, index) => {
            let rawData = data[item.id] || data[item.id.replace('saidas', 'saídas')] || [];
            let itemsToRender = [];
            rawData.forEach(line => itemsToRender.push(...line.split(',').map(p => p.trim()).filter(p => p !== "")));
            
            const pillsHtml = itemsToRender.map(txt => `<span class="pill">${txt}</span>`).join('');
            
            surveyContainer.innerHTML += `
                <div class="survey-card">
                    <div class="card-info-side">
                        <div class="card-num">${(index + 1).toString().padStart(2, '0')}</div>
                        <div class="card-icon-box">${item.icon}</div>
                        <div class="card-text-content">
                            <div class="card-item-name">${item.label}</div>
                            <div class="card-item-desc">${item.desc}</div>
                        </div>
                    </div>
                    <div class="card-responses-side">
                        <div class="pill-container">${pillsHtml || '<span style="color:#ccc">---</span>'}</div>
                    </div>
                </div>`;
        });

        // Render Flow
        const flowBody = document.getElementById('flow-body');
        flowBody.innerHTML = '';
        if (data.fluxo) {
            data.fluxo.forEach(item => {
                flowBody.innerHTML += `
                    <tr>
                        <td style="text-align:center; font-weight:bold">${item.etapa || '-'}</td>
                        <td>${item.fornecedor || ''}</td>
                        <td>${item.insumos || ''}</td>
                        <td>${item.ator || ''}</td>
                        <td>${item.atividades || ''}</td>
                        <td>${item.saídas || item.saidas || ''}</td>
                        <td>${item.cliente || ''}</td>
                    </tr>`;
            });
        }
    }
};