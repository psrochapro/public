// ... (mantenha o início do init() e renderApp() até chegar no print-only-content)

            <div id="print-only-content" class="print-only">
                <section>
                    <h3 class="print-section-title">💎 Pilares Estratégicos</h3>
                    <div class="grid-print">
                        ${cvData.pilares_estrategicos.map(p => `
                            <div class="print-item">
                                <strong>${p.tema} (${p.tempo}):</strong> ${p.experiencia}
                            </div>
                        `).join('')}
                    </div>
                </section>

                <section>
                    <h3 class="print-section-title">🛠️ Competências e Habilidades</h3>
                    <div class="grid-print">
                        ${cvData.habilidades_detalhadas.map(h => `
                            <div class="print-item">
                                <strong>${h.tema}:</strong> ${h.desc}
                            </div>
                        `).join('')}
                    </div>
                </section>

                <section>
                    <h3 class="print-section-title">📊 Qualificação em Business Intelligence</h3>
                    <table class="cv-table">
                        <thead>
                            <tr>
                                <th>Categoria</th>
                                <th>Curso / Especialização</th>
                                <th>Instituição</th>
                                <th>Ano</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${cvData.especializacoes_bi.map(e => `
                                <tr>
                                    <td>${e.categoria}</td>
                                    <td>${e.curso}</td>
                                    <td>${e.inst}</td>
                                    <td>${e.ano}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </section>

                <section>
                    <h3 class="print-section-title">⚙️ Qualificação em Gestão e Processos</h3>
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
                                    <td>${g.categoria}</td>
                                    <td>${g.curso} ${g.ch ? `(${g.ch})` : ''}</td>
                                    <td>${g.inst}</td>
                                    <td>${g.ano}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </section>

                <section>
                    <h3 class="print-section-title">🎓 Formação Acadêmica e Idiomas</h3>
                    <table class="cv-table">
                        <tbody>
                            ${cvData.formacao_academica.map(f => `
                                <tr>
                                    <td><strong>${f.categoria}</strong></td>
                                    <td>${f.curso}</td>
                                    <td>${f.inst}</td>
                                    <td>${f.periodo}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <table class="cv-table" style="margin-top: 10px;">
                        <thead>
                            <tr>
                                <th>Inglês (Certificação Internacional)</th>
                                <th>Nível</th>
                                <th>Instituição</th>
                                <th>Ano</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${cvData.fluencia_ingles.map(i => `
                                <tr>
                                    <td>${i.cert}</td>
                                    <td>${i.nivel}</td>
                                    <td>${i.inst}</td>
                                    <td>${i.ano}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </section>

                <div class="print-footer-note">
                    💡 <strong>Metodologias e Processos Detalhados:</strong> Acesse a apresentação completa em: ${cvData.perfil.metodologia_url}
                </div>
            </div>
// ... (mantenha o restante do arquivo igual)