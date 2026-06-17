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
        // Cabeçalho
        document.getElementById('val-nome').innerText = (data.nome || ['---']).join(' ');
        document.getElementById('val-macroprocesso').innerText = (data.macroprocesso || ['---']).join(' ');
        document.getElementById('val-area').innerText = (data.area || ['---']).join(' ');
        document.getElementById('val-dono').innerText = (data.dono || ['---']).join(' ');
        document.getElementById('val-objetivo').innerText = (data.objetivo || ['---']).join(' ');

        // Tabela 1
        const tbody = document.getElementById('table-body');
        tbody.innerHTML = '';
        this.config.forEach((item, index) => {
            let rawData = data[item.id] || data[item.id.replace('saidas', 'saídas')] || [];
            let itemsToRender = [];
            rawData.forEach(line => itemsToRender.push(...line.split(',').map(p => p.trim()).filter(p => p !== "")));
            
            const pillsHtml = itemsToRender.map(txt => `<span class="pill">${txt}</span>`).join('');
            tbody.innerHTML += `
                <tr>
                    <td style="text-align:center; font-weight:bold; color:#666">${index + 1}</td>
                    <td style="font-size:24px;text-align:center">${item.icon}</td>
                    <td><div class="item-title">${item.label}</div></td>
                    <td><div class="item-desc">${item.desc}</div></td>
                    <td><div class="pill-container">${pillsHtml || '---'}</div></td>
                </tr>`;
        });

        // Tabela 2 (Fluxo)
        const flowBody = document.getElementById('flow-body');
        flowBody.innerHTML = '';
        if (data.fluxo && data.fluxo.length > 0) {
            data.fluxo.forEach(etapa => {
                flowBody.innerHTML += `
                    <tr>
                        <td style="text-align:center; font-weight:bold">${etapa.id}</td>
                        <td>${etapa.fornecedor || ''}</td>
                        <td>${etapa.insumos || ''}</td>
                        <td>${etapa.ator || ''}</td>
                        <td>${etapa.atividades || ''}</td>
                        <td>${etapa.saídas || etapa.saidas || ''}</td>
                        <td>${etapa.cliente || ''}</td>
                    </tr>`;
            });
        }
    }
};