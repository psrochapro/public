let cvData = {};

async function init() {
    try {
        const response = await fetch('dados.json');
        if (!response.ok) throw new Error("Não foi possível carregar o dados.json");
        cvData = await response.json();
        renderApp();
        switchTab('pilares', document.querySelector('.tab-btn'));
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
        document.getElementById('cv-app').innerHTML = `<p style="padding:20px; color:red">Erro ao carregar dados: ${error.message}</p>`;
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

            <nav class="nav-tabs-container">
                <div class="nav-tabs">
                    <button class="tab-btn active" onclick="switchTab('pilares', this)">💎 Pilares</button>
                    <button class="tab-btn" onclick="switchTab('habilidades', this)">🛠️ Habilidades</button>
                    <button class="tab-btn" onclick="switchTab('bi', this)">📊 Qualificação BI</button>
                    <button class="tab-btn" onclick="switchTab('gestao', this)">⚙️ Qualificação Gestão</button>
                    <button class="tab-btn" onclick="switchTab('formacao', this)">🎓 Acadêmico</button>
                    <button class="tab-btn btn-metodologia" onclick="openModal()">💡 Metodologias</button>
                </div>
            </nav>

            <div id="tab-content"></div>

            <footer style="text-align: center; margin-top: 40px; font-size: 0.8rem; color: #64748b;">
                Currículo Interativo - Paulo Sergio Rocha | 2026
            </footer>
        </div>

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
    if(btn) btn.classList.add('active');

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
            html = `<h3 class="tab-title">📊 Especialização em BI</h3>
                <table class="cv-table">
                    <thead><tr><th>Categoria</th><th>Descrição</th><th>Instituição</th><th>Ano/Período</th></tr></thead>
                    <tbody>${cvData.especializacoes_bi.map(e => `
                        <tr><td data-label="Categoria">${e.categoria}</td><td data-label="Descrição">${e.curso}</td><td data-label="Instituição">${e.inst}</td><td data-label="Ano">${e.ano}</td></tr>`).join('')}
                    </tbody>
                </table>`;
            break;
        case 'gestao':
            html = `<h3 class="tab-title">⚙️ Especialização em Gestão e Qualidade</h3>
                <table class="cv-table">
                    <thead><tr><th>Categoria</th><th>Curso / Certificação</th><th>Instituição</th><th>Ano</th></tr></thead>
                    <tbody>${cvData.especializacoes_gestao.map(g => `
                        <tr><td data-label="Categoria">${g.categoria}</td><td data-label="Curso">${g.curso} ${g.ch ? `(${g.ch})` : ''}</td><td data-label="Instituição">${g.inst}</td><td data-label="Ano">${g.ano}</td></tr>`).join('')}
                    </tbody>
                </table>`;
            break;
        case 'formacao':
            html = `<h3 class="tab-title">🎓 Formação Acadêmica</h3>
                <table class="cv-table">
                    <thead><tr><th>Categoria</th><th>Descrição</th><th>Instituição</th><th>Ano/Período</th></tr></thead>
                    <tbody>${cvData.formacao_academica.map(f => `
                        <tr><td data-label="Categoria">${f.categoria}</td><td data-label="Descrição">${f.curso}</td><td data-label="Instituição">${f.inst}</td><td data-label="Período">${f.periodo}</td></tr>`).join('')}
                    </tbody>
                </table>
                <h3 class="tab-title" style="margin-top:30px">🌎 Fluência na Língua Inglesa</h3>
                <table class="cv-table">
                    <thead><tr><th>Certificação</th><th>Nível / Resultado</th><th>Instituição</th><th>Ano</th></tr></thead>
                    <tbody>${cvData.fluencia_ingles.map(i => `
                        <tr><td data-label="Certificação">${i.cert}</td><td data-label="Nível">${i.nivel}</td><td data-label="Instituição">${i.inst}</td><td data-label="Ano">${i.ano}</td></tr>`).join('')}
                    </tbody>
                </table>`;
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