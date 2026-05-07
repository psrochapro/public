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
        <header>
            <h1>${data.perfil.nome}</h1>
            <div class="subtitle">${data.perfil.titulo}</div>
            <p>${data.perfil.resumo}</p>
            <p>
                <strong>📧</strong> ${data.perfil.contatos.email} | 
                <strong>📱</strong> ${data.perfil.contatos.whatsapp} | 
                <strong>🔗</strong> <a href="${data.perfil.contatos.portfolio}" target="_blank">Portfólio</a>
            </p>
        </header>

        <h2 class="section-title">🚀 Pilares Estratégicos</h2>
        <div class="grid-pilares">
            ${data.pilares_estrategicos.map(p => `
                <div class="pilar-card">
                    <h3>${p.tema}</h3>
                    <small>${p.tempo}</small>
                    <p style="font-size: 0.85rem">${p.experiencia}</p>
                </div>
            `).join('')}
        </div>

        <h2 class="section-title">🛠️ Competências</h2>
        <div class="competencias-tag">
            ${Object.values(data.competencias).flat().map(tag => `
                <span class="tag">${tag}</span>
            `).join('')}
        </div>

        <h2 class="section-title">📊 Especializações BI (SQLBI / PBIWG)</h2>
        <ul class="cv-list">
            ${data.especializacoes_bi.map(e => `
                <li><strong>${e.ano}</strong> - ${e.curso} (${e.inst})</li>
            `).join('')}
        </ul>

        <h2 class="section-title">🎓 Formação Académica</h2>
        <ul class="cv-list">
            ${data.formacao_academica.map(f => `
                <li><strong>${f.periodo}</strong> - ${f.nivel}: ${f.curso} (${f.inst})</li>
            `).join('')}
        </ul>

        <h2 class="section-title">🌍 Idiomas & Certificações</h2>
        <ul class="cv-list">
            ${data.certificacoes_idioma.map(i => `
                <li>${i.cert} - <strong>${i.resultado}</strong> (${i.ano})</li>
            `).join('')}
        </ul>

        <h2 class="section-title">🆕 Cursos Recentes (2026)</h2>
        <ul class="cv-list">
            ${data.cursos_recentes_2026.map(c => `
                <li>${c.nome} - ${c.inst} (Carga: ${c.carga})</li>
            `).join('')}
        </ul>
    `;
}

loadCV();