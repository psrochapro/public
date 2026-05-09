async function loadCV() {
    try {
        const response = await fetch('dados.json');
        const data = await response.json();
        renderCV(data);
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
    }
}

function renderCV(data) {
    const app = document.getElementById('cv-app');
    
    app.innerHTML = `
        <header class="header-container">
            <img src="${data.perfil.foto}" alt="${data.perfil.nome}" class="profile-img">
            <div class="header-text">
                <h1>${data.perfil.nome}</h1>
                <div class="subtitle">💼 ${data.perfil.titulo}</div>
                <ul class="resumo-list">
                    ${data.perfil.resumo.map(item => `<li>🔹 ${item}</li>`).join('')}
                </ul>
                <p class="contatos">
                    <strong>📧</strong> ${data.perfil.contatos.email} | 
                    <strong>📱</strong> ${data.perfil.contatos.whatsapp} | 
                    <strong>🔗</strong> <a href="${data.perfil.contatos.portfolio}" target="_blank">Portfólio</a>
                </p>
            </div>
        </header>

        <h2 class="section-title">🚀 Pilares Estratégicos</h2>
        <div class="grid-pilares">
            ${data.pilares_estrategicos.map(p => `
                <div class="pilar-card">
                    <h3>💎 ${p.tema}</h3>
                    <small>⏳ ${p.tempo}</small>
                    <p>${p.experiencia}</p>
                </div>
            `).join('')}
        </div>

        <h2 class="section-title">🛠️ Principais Habilidades (Detalhadas)</h2>
        <div class="grid-habilidades">
            ${data.habilidades_detalhadas.map(h => `
                <div class="habilidade-item">
                    <strong>✅ ${h.tema}:</strong> ${h.desc}
                </div>
            `).join('')}
        </div>

        <h2 class="section-title">📊 Especialização em BI (Qualificações Internacionais)</h2>
        <ul class="cv-list">
            ${data.especializacoes_bi.map(e => `
                <li>🏅 <strong>${e.ano}</strong> - ${e.curso} | <em>${e.inst}</em></li>
            `).join('')}
        </ul>

        <h2 class="section-title">⚙️ Gestão por Processos e Qualidade</h2>
        <ul class="cv-list">
            ${data.especializacoes_gestao.map(g => `
                <li>⚡ <strong>${g.ano}</strong> - ${g.curso} (${g.inst} - ${g.ch})</li>
            `).join('')}
        </ul>

        <h2 class="section-title">🎓 Formação Acadêmica</h2>
        <ul class="cv-list">
            ${data.formacao_academica.map(f => `
                <li>🎓 <strong>${f.periodo}</strong> - ${f.nivel}: ${f.curso} (${f.inst})</li>
            `).join('')}
        </ul>

        <h2 class="section-title">🌍 Fluência na Língua Inglesa</h2>
        <ul class="cv-list">
            ${data.fluencia_ingles.map(i => `
                <li>🌎 <strong>${i.ano}</strong> - ${i.cert}: ${i.nivel} (<em>${i.inst}</em>)</li>
            `).join('')}
        </ul>

        <footer style="margin-top: 40px; font-size: 0.8rem; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px;">
            Currículo - Paulo Sergio Rocha | Revisão 0 | Data: 29/04/2026
        </footer>
    `;
}

loadCV();