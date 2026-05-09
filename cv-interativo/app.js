let cvData = {};

async function init() {
    try {
        const response = await fetch('dados.json');
        cvData = await response.json();
        renderHeader();
        switchTab('pilares'); // Aba inicial
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
                <div class="subtitle">💼 ${cvData.perfil.titulo}</div>
                <ul class="resumo-list">
                    ${cvData.perfil.resumo.map(r => `<li>🔹 ${r}</li>`).join('')}
                </ul>
                <div class="contatos">
                    📧 ${cvData.perfil.contatos.email} | 📱 ${cvData.perfil.contatos.whatsapp} | 
                    🔗 <a href="${cvData.perfil.contatos.portfolio}" target="_blank">Portfólio</a>
                </div>
            </div>
        </header>

        <nav class="nav-tabs">
            <button class="tab-btn active" onclick="switchTab('pilares', this)">🚀 Pilares</button>
            <button class="tab-btn" onclick="switchTab('habilidades', this)">🛠️ Habilidades</button>
            <button class="tab-btn" onclick="switchTab('qualificacoes', this)">📊 Qualificações</button>
            <button class="tab-btn" onclick="switchTab('formacao', this)">🎓 Acadêmico</button>
        </nav>

        <div id="tab-content"></div>

        <footer>
            Currículo - Paulo Sergio Rocha | Revisão 0 | 29/04/2026
        </footer>
    `;
}

function switchTab(tab, btn) {
    // Atualizar botões ativos
    if (btn) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    const content = document.getElementById('tab-content');
    content.style.animation = 'none'; // Reset animação
    content.offsetHeight; // Trigger reflow
    content.style.animation = null; 

    let html = '';

    switch(tab) {
        case 'pilares':
            html = `<div class="grid-content">
                ${cvData.pilares_estrategicos.map(p => `
                    <div class="card">
                        <strong>💎 ${p.tema}</strong> (${p.tempo})<br>
                        <p>${p.experiencia}</p>
                    </div>
                `).join('')}
            </div>`;
            break;

        case 'habilidades':
            html = `<div class="grid-content">
                ${cvData.habilidades_detalhadas.map(h => `
                    <div class="card" style="border-left-color: var(--primary)">
                        <strong>✅ ${h.tema}</strong>
                        <p>${h.desc}</p>
                    </div>
                `).join('')}
            </div>`;
            break;

        case 'qualificacoes':
            html = `
                <h3>📊 BI & Data Analytics (SQLBI / PBIWG)</h3>
                <ul class="cv-list">
                    ${cvData.especializacoes_bi.map(e => `<li>📌 <strong>${e.ano}</strong> - ${e.curso} (<em>${e.inst}</em>)</li>`).join('')}
                </ul>
                <h3 style="margin-top:20px">⚙️ Gestão, Processos e Qualidade</h3>
                <ul class="cv-list">
                    ${cvData.especializacoes_gestao.map(g => `<li>⚡ <strong>${g.ano}</strong> - ${g.curso} (<em>${g.inst} - ${g.ch}</em>)</li>`).join('')}
                </ul>
            `;
            break;

        case 'formacao':
            html = `
                <h3>🎓 Formação Acadêmica</h3>
                <ul class="cv-list">
                    ${cvData.formacao_academica.map(f => `<li>🎓 <strong>${f.periodo}</strong> - ${f.nivel}: ${f.curso} (<em>${f.inst}</em>)</li>`).join('')}
                </ul>
                <h3 style="margin-top:20px">🌎 Fluência em Inglês (Certificações)</h3>
                <ul class="cv-list">
                    ${cvData.fluencia_ingles.map(i => `<li>🌎 <strong>${i.ano}</strong> - ${i.cert}: ${i.nivel} (<em>${i.inst}</em>)</li>`).join('')}
                </ul>
            `;
            break;
    }

    content.innerHTML = html;
}

init();