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
        document.getElementById('val-nome').innerText = (data.nome || ['Nome do Processo']).join(' ');
        document.getElementById('val-macroprocesso').innerText = (data.macroprocesso || ['---']).join(' ');
        document.getElementById('val-area').innerText = (data.area || ['---']).join(' ');
        document.getElementById('val-dono').innerText = (data.dono || ['---']).join(' ');
        document.getElementById('val-objetivo').innerText = (data.objetivo || ['---']).join(' ');

        // Render Table Body
        const tbody = document.getElementById('table-body');
        tbody.innerHTML = '';

        this.config.forEach((item, index) => {
            const row = document.createElement('tr');
            
            // Tratamento de dados para gerar Pills
            // Se o dado vier como lista no TXT ou separado por vírgula em uma linha
            let rawData = data[item.id] || [];
            let itemsToRender = [];
            
            rawData.forEach(line => {
                const parts = line.split(',').map(p => p.trim()).filter(p => p !== "");
                itemsToRender.push(...parts);
            });

            const pillsHtml = itemsToRender.map(txt => `<span class="pill">${txt}</span>`).join('');

            row.innerHTML = `
                <td class="row-index">${index + 1}</td>
                <td class="icon-cell">${item.icon}</td>
                <td><div class="item-title">${item.label}</div></td>
                <td><div class="item-desc">${item.desc}</div></td>
                <td><div class="pill-container">${pillsHtml || '---'}</div></td>
            `;
            tbody.appendChild(row);
        });
    }
};