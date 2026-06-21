const template = {
    // Retorna a string pura do template para o editor
    getTemplateContent() {
        return `#nome 
#objetivo 
#macroprocesso 
#area 
#dono 

#atores 
#entradas 
#saidas 
#interessados 
#normas 
#lgpd 
#recursos 
#documentos 
#sgpe 
#indicadores 
#gatilho 

#etapas
1: Nome da Etapa

#atividade 1
Etapa: 1
Fornecedor: 
Insumos: 
Ator: 
Atividades: 
Regra: 
Saídas: 
Cliente: 

#observacoes
- 
`;
    },

    downloadTemplate() {
        const content = this.getTemplateContent();
        this.saveFile(content, "template-vazio.txt");
    },

    downloadExample() {
        const content = `#nome Processo de Compras e Contratação de Serviços Corporativos
#objetivo Adquirir bens e contratar serviços de forma transparente, ágil e em conformidade com o orçamento e as normas vigentes.
#macroprocesso Gestão de Suprimentos e Logística
#area Departamento de Compras e Contratos
#dono Diretoria de Operações

#atores Solicitante, Gestor da Área, Compras, Jurídico, Financeiro, Compliance, Almoxarifado
#entradas Requisição de Compra, Especificação Técnica, Orçamentos de Mercado, Parecer de Compliance, Certidões do Fornecedor
#saidas Ordem de Compra Emitida, Contrato Assinado, Termo de Recebimento, Comprovante de Pagamento, Relatório de Conformidade
#interessados Conselho de Administração, Auditoria Interna, Diretoria Executiva, Fornecedores Cadastrados
#normas Política Interna de Compras 02/2026, Código de Conduta do Fornecedor, LGPD
#lgpd Nome, CPF, RG, E-mail, Telefone, Dados Bancários, Contrato Social
#recursos ERP Corporativo, Módulo de Compras, Sistema de Assinatura Eletrônica, GED, Canal de Denúncias
#documentos Requisição de Compra, Cotação de Preços, Minuta de Contrato, Nota Fiscal, Ordem de Pagamento
#sgpe Assunto: 1042 Suprimentos, Classe: Interno, Sigilo: Público
#indicadores Lead Time de Atendimento, Saving de Negociação, Índice de Erros em Notas, SLA de Aprovação
#gatilho Envio da Requisição de Compra pelo Solicitante, Indisponibilidade de Estoque

#etapas
1: Preparação da Demanda
2: Cotação e Prospecção de Mercado
3: Análise e Seleção Técnica
4: Negociação Comercial e Compliance
5: Formalização Jurídica e Contratual
6: Aprovação e Assinatura Eletrônica
7: Ativação no ERP e Ordem de Compra
8: Execução, Entrega e Recebimento
9: Processamento Fiscal e Financeiro
10: Encerramento e Auditoria de Qualidade

#atividade 1
Etapa: 1
Fornecedor: Solicitante
Insumos: Requisição de Compra e Especificação Técnica
Ator: Gestor da Área
Atividades: Avalia a real necessidade da aquisição e verifica a disponibilidade de orçamento setorial.
Regra: Se o valor exceder o orçamento mensal da área, a requisição é devolvida automaticamente ao Solicitante.
Saídas: Requisição Pré-Aprovada
Cliente: Compras

#atividade 2
Etapa: 1
Fornecedor: Gestor da Área
Insumos: Requisição Pré-Aprovada
Ator: Compras
Atividades: Realiza o saneamento da requisição, padronizando a descrição dos itens ou escopo do serviço no ERP.
Saídas: Requisição Saneada
Cliente: Compras

#atividade 3
Etapa: 2
Fornecedor: Compras
Insumos: Requisição Saneada
Ator: Compras
Atividades: Identifica no banco de dados os fornecedores homologados aptos a atender ao escopo solicitado.
Saídas: Lista de Fornecedores Elegíveis
Cliente: Compras

#atividade 4
Etapa: 2
Fornecedor: Compras
Insumos: Lista de Fornecedores Elegíveis
Ator: Compras
Atividades: Dispara a solicitação de cotação para o mercado através do portal de compras.
Saídas: Solicitação de Cotação Enviada
Cliente: Mercado

#atividade 5
Etapa: 2
Fornecedor: Mercado
Insumos: Solicitação de Cotação Enviada
Ator: Compras
Atividades: Centraliza e formaliza o recebimento das propostas e das planilhas de preços preenchidas.
Saídas: Orçamentos de Mercado Recebidos
Cliente: Compras

#atividade 6
Etapa: 3
Fornecedor: Compras
Insumos: Orçamentos de Mercado Recebidos
Ator: Compras
Atividades: Consolida as propostas comerciais recebidas em um mapa comparativo de preços e condições.
Saídas: Mapa Comparativo de Preços
Cliente: Solicitante

#atividade 7
Etapa: 3
Fornecedor: Solicitante
Insumos: Mapa Comparativo de Preços
Ator: Solicitante
Atividades: Avalia as propostas sob o ponto de vista estritamente técnico e emite o parecer de validação.
Regra: Caso nenhuma proposta atenda aos requisitos da Especificação Técnica, o processo deve ser reiniciado.
Saídas: Parecer de Validação Técnica
Cliente: Compras

#atividade 8
Etapa: 4
Fornecedor: Compras
Insumos: Parecer de Validação Técnica
Ator: Compras
Atividades: Conduz a rodada de negociação comercial com o fornecedor melhor classificado tecnicamente.
Saídas: Proposta Comercial Final Negociada
Cliente: Compliance

#atividade 9
Etapa: 4
Fornecedor: Compras
Insumos: Proposta Comercial Final Negociada
Ator: Compliance
Atividades: Realiza a análise de Background Check do fornecedor selecionado para mitigar riscos de fraude.
Regra: Fornecedores com apontamentos graves de idoneidade fiscal ou trabalhista são bloqueados no sistema.
Saídas: Parecer de Compliance Emitido
Cliente: Compras

#atividade 10
Etapa: 5
Fornecedor: Compliance
Insumos: Parecer de Compliance Emitido
Ator: Compras
Atividades: Solicita ao fornecedor a documentação habilitatória e as certidões de regularidade.
Saídas: Certidões do Fornecedor Coletadas
Cliente: Jurídico

#atividade 11
Etapa: 5
Fornecedor: Compras
Insumos: Certidões do Fornecedor Coletadas
Ator: Jurídico
Atividades: Elabora a minuta inicial do contrato de prestação de serviços com base no padrão da companhia.
Saídas: Minuta de Contrato Inicial
Cliente: Fornecedor

#atividade 12
Etapa: 5
Fornecedor: Fornecedor
Insumos: Minuta de Contrato Inicial
Ator: Jurídico
Atividades: Avalia e negocia eventuais ressalvas jurídicas enviadas pelo parceiro comercial.
Saídas: Minuta de Contrato Consensual
Cliente: Diretoria Executiva

#atividade 13
Etapa: 6
Fornecedor: Jurídico
Insumos: Minuta de Contrato Consensual
Ator: Diretoria Executiva
Atividades: Delibera e autoriza formalmente a contratação em ata de diretoria.
Regra: Contratações acima de R$ 500.000,00 exigem a assinatura conjunta do Diretor Presidente.
Saídas: Ata de Autorização de Contratação
Cliente: Jurídico

#atividade 14
Etapa: 6
Fornecedor: Diretoria Executiva
Insumos: Ata de Autorização de Contratação
Ator: Jurídico
Atividades: Disponibiliza o instrumento contratual na plataforma de assinatura eletrônica institucional.
Saídas: Contrato em Assinatura
Cliente: Fornecedor

#atividade 15
Etapa: 6
Fornecedor: Fornecedor
Insumos: Contrato em Assinatura
Ator: Fornecedor
Atividades: Coleta as assinaturas digitais dos representantes legais e testemunhas da contratada.
Saídas: Contrato Assinado Parcialmente
Cliente: Diretoria Executiva

#atividade 16
Etapa: 6
Fornecedor: Fornecedor
Insumos: Contrato Assinado Parcialmente
Ator: Diretoria Executiva
Atividades: Realiza a assinatura digital por parte dos diretores e representantes da empresa tomadora.
Saídas: Contrato Assinado Integralmente
Cliente: Compras

#atividade 17
Etapa: 7
Fornecedor: Diretoria Executiva
Insumos: Contrato Assinado Integralmente
Ator: Compras
Atividades: Efetua o registro e cadastro das cláusulas e vigências contratuais no módulo de contratos do ERP.
Saídas: Contrato Ativo no Sistema
Cliente: Compras

#atividade 18
Etapa: 7
Fornecedor: Compras
Insumos: Contrato Ativo no Sistema
Ator: Compras
Atividades: Gera e emite a Ordem de Compra/Serviço oficial vinculada ao contrato estabelecido.
Saídas: Ordem de Compra Emitida
Cliente: Fornecedor

#atividade 19
Etapa: 7
Fornecedor: Fornecedor
Insumos: Ordem de Compra Emitida
Ator: Fornecedor
Atividades: Planeja e executa a entrega física dos materiais ou inicia a mobilização para a prestação do serviço.
Saídas: Cronograma de Entrega Confirmado
Cliente: Solicitante

#atividade 20
Etapa: 8
Fornecedor: Fornecedor
Insumos: Cronograma de Entrega Confirmado
Ator: Almoxarifado
Atividades: Recebe o material fisicamente nas dependências da empresa e confere com a nota fiscal.
Saídas: Nota Fiscal Recebida no Portal
Cliente: Solicitante

#atividade 21
Etapa: 8
Fornecedor: Almoxarifado
Insumos: Nota Fiscal Recebida no Portal
Ator: Solicitante
Atividades: Realiza a conferência técnica da qualidade do material entregue ou do serviço prestado no período.
Saídas: Laudo de Inspeção Técnica
Cliente: Gestor da Área

#atividade 22
Etapa: 8
Fornecedor: Solicitante
Insumos: Laudo de Inspeção Técnica
Ator: Gestor da Área
Atividades: Valida e formaliza o aceite definitivo dos entregáveis no sistema para liberação financeira.
Regra: O aceite não pode ser emitido se houver inconformidades em aberto registradas no laudo.
Saídas: Termo de Recebimento Emitido
Cliente: Fornecedor

#atividade 23
Etapa: 9
Fornecedor: Gestor da Área
Insumos: Termo de Recebimento Emitido
Ator: Fornecedor
Atividades: Emite a Nota Fiscal de fatura de serviços referenciando o Termo de Recebimento aprovado.
Saídas: Fatura Comercial Emitida
Cliente: Financeiro

#atividade 24
Etapa: 9
Fornecedor: Fornecedor
Insumos: Fatura Comercial Emitida
Ator: Financeiro
Atividades: Realiza a triagem fiscal da fatura, verificando retenções de impostos e alíquotas aplicadas.
Saídas: Nota Fiscal Escriturada e Validada
Cliente: Financeiro

#atividade 25
Etapa: 9
Fornecedor: Financeiro
Insumos: Nota Fiscal Escriturada e Validada
Ator: Financeiro
Atividades: Lança a obrigação financeira no módulo de contas a pagar respeitando o prazo contratual.
Saídas: Programação de Pagamento Efetuada
Cliente: Gestor da Área

#atividade 26
Etapa: 9
Fornecedor: Financeiro
Insumos: Programação de Pagamento Efetuada
Ator: Gestor da Área
Atividades: Efetua a liberação da alçada de pagamento eletrônico no internet banking corporativo.
Saídas: Lote de Pagamento Autorizado
Cliente: Financeiro

#atividade 27
Etapa: 10
Fornecedor: Gestor da Área
Insumos: Lote de Pagamento Autorizado
Ator: Financeiro
Atividades: Executa a liquidação bancária da fatura e concilia o débito na conta corrente da empresa.
Saídas: Comprovante de Pagamento Vinculado
Cliente: Fornecedor

#atividade 28
Etapa: 10
Fornecedor: Financeiro
Insumos: Comprovante de Pagamento Vinculado
Ator: Compras
Atividades: Consolida todas as interações, notas, contratos e comprovantes na pasta digital do processo (GED).
Saídas: Pasta Digital de Compra Encerrada
Cliente: Compliance

#atividade 29
Etapa: 10
Fornecedor: Compras
Insumos: Pasta Digital de Compra Encerrada
Ator: Compliance
Atividades: Avalia a conformidade de ponta a ponta do processo para fins de auditoria socioambiental e de governança.
Saídas: Relatório de Conformidade de Processo
Cliente: Controle de Qualidade

#atividade 30
Etapa: 10
Fornecedor: Compliance
Insumos: Relatório de Conformidade de Processo
Ator: Controle de Qualidade
Atividades: Atualiza a matriz de desempenho e o índice de avaliação de fornecedores do mês (IDF).
Saídas: Painel de Indicadores de Suprimentos Atualizado
Cliente: Diretoria Executiva

#observacoes
Ponto crítico identificado na Etapa 4: O Compliance deve ser envolvido antes da negociação final se o fornecedor for internacional.
`;
        this.saveFile(content, "exemplo.txt");
    },

    saveFile(content, filename) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
    }
};