function switchTab(tab, btn) {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(t => t.classList.remove('active'));
    if(btn && btn.classList.contains('tab-btn')) btn.classList.add('active');

    const content = document.getElementById('tab-content');
    let html = '';

    switch(tab) {
        case 'pilares':
            html = `<div class="grid-content">${cvData.pilares_estrategicos.map(p => `
                <div class="card">
                    <strong style="color:var(--primary)">${p.tema}</strong> <small>(${p.tempo})</small>
                    <p style="font-size:0.9rem; margin-top:8px">${p.experiencia}</p>
                </div>`).join('')}</div>`;
            break;
        case 'habilidades':
            html = `<div class="grid-content">${cvData.habilidades_detalhadas.map(h => `
                <div class="card">
                    <strong>${h.icon} ${h.tema}</strong>
                    <p style="font-size:0.85rem; margin-top:5px; color:#64748b">${h.desc}</p>
                </div>`).join('')}</div>`;
            break;
        case 'bi':
            html = `<h3>📊 Especialização BI</h3>
                    <table class="cv-table">
                        <thead>
                            <tr>
                                <th>Categoria</th>
                                <th>Descrição</th>
                                <th>Instituição</th>
                                <th>Ano/Período</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${cvData.especializacoes_bi.map(e => `
                            <tr>
                                <td data-label="Categoria">${e.categoria}</td>
                                <td data-label="Descrição">${e.curso}</td>
                                <td data-label="Instituição">${e.inst}</td>
                                <td data-label="Ano/Período">${e.ano}</td>
                            </tr>`).join('')}
                        </tbody>
                    </table>`;
            break;
        case 'gestao':
            html = `<h3>⚙️ Qualificação Gestão</h3>
                    <table class="cv-table">
                        <thead>
                            <tr>
                                <th>Categoria</th>
                                <th>Curso / Certificação</th>
                                <th>Instituição</th>
                                <th>Ano</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${cvData.especializacoes_gestao.map(g => `
                            <tr>
                                <td data-label="Categoria">${g.categoria}</td>
                                <td data-label="Curso">${g.curso} ${g.ch ? `(${g.ch})` : ''}</td>
                                <td data-label="Instituição">${g.inst}</td>
                                <td data-label="Ano">${g.ano}</td>
                            </tr>`).join('')}
                        </tbody>
                    </table>`;
            break;
        case 'formacao':
            html = `<h3>🎓 Formação Acadêmica</h3>
                    <table class="cv-table">
                        <thead>
                            <tr>
                                <th>Categoria</th>
                                <th>Descrição</th>
                                <th>Instituição</th>
                                <th>Ano/Período</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${cvData.formacao_academica.map(f => `
                            <tr>
                                <td data-label="Categoria">${f.categoria}</td>
                                <td data-label="Descrição">${f.curso}</td>
                                <td data-label="Instituição">${f.inst}</td>
                                <td data-label="Ano/Período">${f.periodo}</td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                    
                    <h3 style="margin-top:30px">🌎 Fluência na Língua Inglesa</h3>
                    <table class="cv-table">
                        <thead>
                            <tr>
                                <th>Certificação</th>
                                <th>Nível / Resultado</th>
                                <th>Instituição</th>
                                <th>Ano</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${cvData.fluencia_ingles.map(i => `
                            <tr>
                                <td data-label="Certificação">${i.cert}</td>
                                <td data-label="Nível">${i.nivel}</td>
                                <td data-label="Instituição">${i.inst}</td>
                                <td data-label="Ano">${i.ano}</td>
                            </tr>`).join('')}
                        </tbody>
                    </table>`;
            break;
    }
    content.innerHTML = html;
}