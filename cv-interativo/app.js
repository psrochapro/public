let cvData = {};

async function init() {
    try {
        const response = await fetch('dados.json');
        cvData = await response.json();
        renderApp();
        switchTab('pilares', document.querySelector('.tab-btn'));
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
    }
}

function renderApp() {
    const app = document.getElementById('cv-app');
    app.innerHTML = `
        <div class="container">
            <header class="header-container">
                <img src="${cvData.perfil.foto}" class="profile-img" alt="Foto">
                <div class="header-text">
                    <h1>${cvData.perfil.nome}</h1>
                    <div class="subtitle">🚀 ${cvData.perfil.titulo}</div>
                    <ul class="resumo-list">
                        ${cvData.perfil.resumo.map(r => `<li>🔹 ${r}</li>`).join('')}
                    </ul>
                    <div class="contatos">
                        📧 ${cvData.perfil.contatos.email} | 📱 ${cvData.perfil.contatos.whatsapp} | 
                        🔗 <a href="${cvData.perfil.contatos.portfolio}" target="_blank">Portfólio</a> |
                        💼 <a href="${cvData.perfil.contatos.linkedin}" target="_blank">LinkedIn</a> |
                        🎓 <a href="${cvData.perfil.contatos.lattes}" target="_blank">Lattes</a>
                    </div>
                </div>
            </header>

            <nav class="nav-tabs">
                <button class="tab-btn active" onclick="switchTab('pilares', this)">💎 Pilares</button>
                <button class="tab-btn" onclick="switchTab('habilidades', this)">🛠️ Habilidades</button>
                <button class="tab-btn" onclick="switchTab('bi', this)">📊 Qualificação BI</button>
                <button class="tab-btn" onclick="switchTab('gestao', this)">⚙️ Qualificação Gestão</button>
                <button class="tab-btn" onclick="switchTab('formacao', this)">🎓 Acadêmico</button>
                <button class="tab-btn" style="color: var(--accent); border-color: var(--accent)" onclick="openModal()">💡 Metodologias</button>
            </nav>

            <div id="tab-content"></div>

            <footer style="text-align: center; margin-top: 40px; font-size: 0.8rem; color: #64748b;">
                Currículo Interativo - Paulo Sergio Rocha | 2026
            </footer>
        </div>

        <!-- Estrutura do Modal -->
        <div id="modalMetodologia" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <strong>📊 Metodologias e Processos</strong>
                    <button class="close-btn" onclick="closeModal()">✕ Voltar ao Currículo</button>
                </div>
                <div class="iframe-container">
                    <iframe src="${cvData.perfil.metodologia_url}" allowfullscreen></iframe>
                </div>
            </div>
        </div>
    `;
}

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
            html = `<h3>📊 Especialização BI</h3><ul class="cv-list">${cvData.especializacoes_bi.map(e => `<li>📍 <strong>${e.ano}</strong> - ${e.curso} (${e.inst})</li>`).join('')}</ul>`;
            break;
        case 'gestao':
            html = `<h3>⚙️ Qualificação Gestão</h3><ul class="cv-list">${cvData.especializacoes_gestao.map(g => `<li>⚡ <strong>${g.ano}</strong> - ${g.curso} (${g.inst})</li>`).join('')}</ul>`;
            break;
        case 'formacao':
            html = `<h3>🎓 Acadêmico</h3><ul class="cv-list">${cvData.formacao_academica.map(f => `<li>🎓 <strong>${f.periodo}</strong> - ${f.curso}</li>`).join('')}</ul>
                    <h3 style="margin-top:20px">🌎 Inglês</h3><ul class="cv-list">${cvData.fluencia_ingles.map(i => `<li>🌎 ${i.cert} (${i.nivel})</li>`).join('')}</ul>`;
            break;
    }
    content.innerHTML = html;
}

function openModal() {
    document.getElementById('modalMetodologia').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('modalMetodologia').style.display = 'none';
    document.body.style.overflow = 'auto';
}

init();