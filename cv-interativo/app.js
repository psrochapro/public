let cvData = {};

async function init() {
    try {
        const response = await fetch('dados.json');
        cvData = await response.json();
        renderHeader();
        switchTab('pilares', document.querySelector('.tab-btn'));
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
    }
}

function renderHeader() {
    const app = document.getElementById('cv-app');
    app.innerHTML = `
        <div class="container">
            <header class="header-container">
                <img src="${cvData.perfil.foto}" class="profile-img" alt="Foto de Paulo Sergio Rocha">
                <div class="header-text">
                    <h1>${cvData.perfil.nome}</h1>
                    <div class="subtitle">🚀 ${cvData.perfil.titulo}</div>
                    <ul class="resumo-list">
                        ${cvData.perfil.resumo.map(r => `<li>🔹 ${r}</li>`).join('')}
                    </ul>
                    <div class="contatos">
                        📧 ${cvData.perfil.contatos.email} | 📱 ${cvData.perfil.contatos.whatsapp} | 
                        🔗 <a href="${cvData.perfil.contatos.portfolio}" target="_blank">Portfólio</a> |
                        💼 <a href="${cvData.perfil.contatos.linkedin}" target="_blank">LinkedIn</a>
                    </div>
                </div>
            </header>

            <nav class="nav-tabs">
                <button class="tab-btn active" onclick="switchTab('pilares', this)">💎 Pilares</button>
                <button class="tab-btn" onclick="switchTab('habilidades', this)">🛠️ Habilidades</button>
                <button class="tab-btn" onclick="switchTab('bi', this)">📊 Qualificação BI</button>
                <button class="tab-btn" onclick="switchTab('gestao', this)">⚙️ Qualificação Gestão</button>
                <button class="tab-btn" onclick="switchTab('formacao', this)">🎓 Acadêmico</button>
            </nav>

            <div id="tab-content"></div>

            <footer style="text-align: center; margin-top: 40px; font-size: 0.8rem; color: #64748b;">
                Currículo Interativo - Paulo Sergio Rocha | Revisão 0 | 2026
            </footer>
        </div>
    `;
}

function switchTab(tab, btn) {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(t => t.classList.remove('active'));
    if(btn) btn.classList.add('active');

    const content = document.getElementById('tab-content');
    let html = '';

    switch(tab) {
        case 'pilares':
            html = `<div class="grid-content">
                ${cvData.pilares_estrategicos.map(p => `
                    <div class="card">
                        <strong style="color:var(--primary)">${p.tema}</strong> <small>(${p.tempo})</small>
                        <p style="font-size:0.9rem; margin-top:8px">${p.experiencia}</p>
                    </div>
                `).join('')}
            </div>`;
            break;

        case 'habilidades':
            html = `<div class="grid-content">
                ${cvData.habilidades_detalhadas.map(h => `
                    <div class="card" style="border-left-color: var(--primary)">
                        <strong>${h.icon} ${h.tema}</strong>
                        <p style="font-size:0.85rem; margin-top:5px; color:#64748b">${h.desc}</p>
                    </div>
                `).join('')}
            </div>`;
            break;

        case 'bi':
            html = `<h3>📊 Especialização em Business Intelligence</h3>
                <ul class="cv-list">
                    ${cvData.especializacoes_bi.map(e => `<li>📍 <strong>${e.ano}</strong> - ${e.curso} (<em>${e.inst}</em>)</li>`).join('')}
                </ul>`;
            break;

        case 'gestao':
            html = `<h3>⚙️ Qualificações em Gestão, Processos e Qualidade</h3>
                <ul class="cv-list">
                    ${cvData.especializacoes_gestao.map(g => `<li>⚡ <strong>${g.ano}</strong> - ${g.curso} (<em>${g.inst} - ${g.ch}</em>)</li>`).join('')}
                </ul>`;
            break;

        case 'formacao':
            html = `<h3>🎓 Formação Acadêmica</h3>
                <ul class="cv-list">${cvData.formacao_academica.map(f => `<li>🎓 <strong>${f.periodo}</strong> - ${f.nivel}: ${f.curso} (<em>${f.inst}</em>)</li>`).join('')}</ul>
                <h3 style="margin-top:20px">🌎 Fluência e Certificados de Inglês</h3>
                <ul class="cv-list">${cvData.fluencia_ingles.map(i => `<li>🌎 <strong>${i.ano}</strong> - ${i.cert} (${i.nivel})</li>`).join('')}</ul>`;
            break;
    }
    content.innerHTML = html;
}

init();