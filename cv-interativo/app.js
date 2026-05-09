let cvData = {};

async function init() {
    try {
        const response = await fetch('dados.json');
        cvData = await response.json();
        renderHeader();
        switchTab('pilares');
    } catch (error) {
        console.error("Erro:", error);
    }
}

function renderHeader() {
    const app = document.getElementById('cv-app');
    app.innerHTML = `
        <header class="header-container">
            <img src="${cvData.perfil.foto}" class="profile-img">
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
            <button class="tab-btn" onclick="switchTab('bi', this)">📊 Qualif. BI</button>
            <button class="tab-btn" onclick="switchTab('gestao', this)">⚙️ Qualif. Gestão</button>
            <button class="tab-btn" onclick="switchTab('formacao', this)">🎓 Acadêmico</button>
        </nav>

        <div id="tab-content"></div>

        <footer>
            Currículo Interativo - Paulo Sergio Rocha | Revisão 0 | 2026
        </footer>
    `;
}

function switchTab(tab, btn) {
    if (btn) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    const content = document.getElementById('tab-content');
    content.style.animation = 'none';
    content.offsetHeight;
    content.style.animation = null; 

    let html = '';

    switch(tab) {
        case 'pilares':
            html = `<div class="grid-content">
                ${cvData.pilares_estrategicos.map(p => `
                    <div class="card pilar-card">
                        <strong>${p.tema}</strong> <small>(${p.tempo})</small><br>
                        <p>${p.experiencia}</p>
                    </div>
                `).join('')}
            </div>`;
            break;

        case 'habilidades':
            html = `<div class="grid-content">
                ${cvData.habilidades_detalhadas.map(h => `
                    <div class="card skill-card">
                        <strong>${h.icon} ${h.tema}</strong>
                        <p>${h.desc}</p>
                    </div>
                `).join('')}
            </div>`;
            break;

        case 'bi':
            html = `<h3>📊 Especialização em BI (SQLBI / PBIWG)</h3>
                <ul class="cv-list">
                    ${cvData.especializacoes_bi.map(e => `<li>📍 <strong>${e.ano}</strong> - ${e.curso} (<em>${e.inst}</em>)</li>`).join('')}
                </ul>`;
            break;

        case 'gestao':
            html = `<h3>⚙️ Qualificações em Gestão e Processos</h3>
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