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
        const content = `#nome Criação de Editais para Fomento de Pesquisa Aplicada
#objetivo Transformar recursos financeiros em editais e obter inscritos.
#macroprocesso Gestão de Editais
#area Departamento de Pesquisa
#dono Mariana e Equipe

#atores Financeiro, Aquisição, Compras, Jurídico, TI
#entradas Formulário eletrônico, Documentos, Parecer técnico, Memória de cálculo
#saidas Alvarás emitidos, Aprovações do cliente, Relatórios finais, Certidões
#interessados Cliente, Presidente, Conselho Fiscal, Órgãos de Controle
#normas Lei 13.105/2015, Lei 8.069/1990, Norma Interna 04/2026, LGPD
#lgpd Nome, RG, CPF, Dados bancários, Endereço, E-mail, Telefone, IP
#recursos ERP, CRM, E-mail, Servidor de Arquivos, Assinatura Digital
#documentos Alvarás, Documentos de identificação, Contratos, Termos de Adesão
#sgpe Assunto: 2456 Gestão, Classe: Interno, Sigilo: Público
#indicadores Tempo de tramitação, Taxa de erros, Volume de inscritos, ROI
#gatilho Formulário eletrônico, Recebimento de verba, Solicitação Judicial

#atividade 1
Etapa: 1
Fornecedor: Cliente
Insumos: Solicitação inicial
Ator: Analista
Atividades: Revisa os dados e valida a elegibilidade do pedido.
Regra: Se os dados estiverem incompletos, retornar para o Cliente solicitando ajustes.
Saídas: Checklist preenchido
Cliente: Gerente

#atividade 2
Etapa: 1
Fornecedor: Analista
Insumos: Checklist preenchido
Ator: Analista
Atividades: Prepara o rascunho do edital técnico.
Saídas: Minuta do Edital
Cliente: Gerente

#atividade 3
Etapa: 2
Fornecedor: Analista
Insumos: Minuta do Edital
Ator: Gerente
Atividades: Aprova a abertura do edital no sistema.
Regra: Se houver pendência orçamentária, o sistema impede a publicação automática.
Saídas: Edital publicado
Cliente: Público Geral

#atividade 4
Etapa: 3
Fornecedor: Gerente
Insumos: Edital publicado
Ator: Analista
Atividades: Monitora o período de inscrições e esclarece dúvidas.
Saídas: Lista de inscritos
Cliente: Comissão de Avaliação

#atividade 5
Etapa: 3
Fornecedor: Analista
Insumos: Lista de inscritos
Ator: Comissão de Avaliação
Atividades: Analisa o mérito das propostas recebidas.
Saídas: Parecer final
Cliente: Gerente

#atividade 6
Etapa: 4
Fornecedor: Comissão de Avaliação
Insumos: Parecer final
Ator: Gerente
Atividades: Homologa o resultado final do certame.
Saídas: Termo de Homologação
Cliente: Jurídico

#atividade 7
Etapa: 5
Fornecedor: Gerente
Insumos: Termo de Homologação
Ator: Jurídico
Atividades: Redige e formaliza os contratos com os vencedores.
Saídas: Contratos assinados
Cliente: Vencedores

#atividade 8
Etapa: 6
Fornecedor: Jurídico
Insumos: Contratos assinados
Ator: Financeiro
Atividades: Autoriza o desembolso dos recursos financeiros.
Saídas: Comprovante de pagamento
Cliente: Vencedores

#atividade 9
Etapa: 6
Fornecedor: Analista
Insumos: Checklist preenchido
Ator: Analista
Atividades: Prepara o rascunho do edital técnico.
Saídas: Minuta do Edital
Cliente: Gerente

#atividade 10
Etapa: 6
Fornecedor: Analista
Insumos: Minuta do Edital
Ator: Gerente
Atividades: Aprova a abertura do edital no sistema.
Saídas: Edital publicado
Cliente: Público Geral

#atividade 11
Etapa: 6
Fornecedor: Gerente
Insumos: Edital publicado
Ator: Analista
Atividades: Monitora o período de inscrições e esclarece dúvidas.
Saídas: Lista de inscritos
Cliente: Comissão de Avaliação

#atividade 12
Etapa: 7
Fornecedor: Analista
Insumos: Lista de inscritos
Ator: Comissão de Avaliação
Atividades: Analisa o mérito das propostas recebidas.
Saídas: Parecer final
Cliente: Gerente

#atividade 13
Etapa: 7
Fornecedor: Comissão de Avaliação
Insumos: Parecer final
Ator: Gerente
Atividades: Homologa o resultado final do certame.
Saídas: Termo de Homologação
Cliente: Jurídico

#atividade 14
Etapa: 7
Fornecedor: Gerente
Insumos: Termo de Homologação
Ator: Jurídico
Atividades: Redige e formaliza os contratos com os vencedores.
Saídas: Contratos assinados
Cliente: Vencedores

#atividade 15
Etapa: 7
Fornecedor: Jurídico
Insumos: Contratos assinados
Ator: Financeiro
Atividades: Autoriza o desembolso dos recursos financeiros.
Saídas: Comprovante de pagamento
Cliente: Vencedores

#atividade 16
Etapa: 7
Fornecedor: Cliente
Insumos: Solicitação inicial
Ator: Analista
Atividades: Revisa os dados e valida a elegibilidade do pedido.
Saídas: Checklist preenchido
Cliente: Gerente

#atividade 17
Etapa: 7
Fornecedor: Analista
Insumos: Checklist preenchido
Ator: Analista
Atividades: Prepara o rascunho do edital técnico.
Saídas: Minuta do Edital
Cliente: Gerente

#atividade 18
Etapa: 8
Fornecedor: Analista
Insumos: Minuta do Edital
Ator: Gerente
Atividades: Aprova a abertura do edital no sistema.
Saídas: Edital publicado
Cliente: Público Geral

#atividade 19
Etapa: 8
Fornecedor: Gerente
Insumos: Edital publicado
Ator: Analista
Atividades: Monitora o período de inscrições e esclarece dúvidas.
Saídas: Lista de inscritos
Cliente: Comissão de Avaliação

#atividade 20
Etapa: 8
Fornecedor: Analista
Insumos: Lista de inscritos
Ator: Comissão de Avaliação
Atividades: Analisa o mérito das propostas recebidas.
Saídas: Parecer final
Cliente: Gerente

#atividade 21
Etapa: 8
Fornecedor: Comissão de Avaliação
Insumos: Parecer final
Ator: Gerente
Atividades: Homologa o resultado final do certame.
Saídas: Termo de Homologação
Cliente: Jurídico

#atividade 22
Etapa: 8
Fornecedor: Gerente
Insumos: Termo de Homologação
Ator: Jurídico
Atividades: Redige e formaliza os contratos com os vencedores.
Saídas: Contratos assinados
Cliente: Vencedores

#atividade 23
Etapa: 9
Fornecedor: Jurídico
Insumos: Contratos assinados
Ator: Financeiro
Atividades: Autoriza o desembolso dos recursos financeiros.
Saídas: Comprovante de pagamento
Cliente: Vencedores

#atividade 24
Etapa: 9
Fornecedor: Analista
Insumos: Checklist preenchido
Ator: Analista
Atividades: Prepara o rascunho do edital técnico.
Saídas: Minuta do Edital
Cliente: Gerente

#atividade 25
Etapa: 9
Fornecedor: Analista
Insumos: Minuta do Edital
Ator: Gerente
Atividades: Aprova a abertura do edital no sistema.
Saídas: Edital publicado
Cliente: Público Geral

#atividade 26
Etapa: 9
Fornecedor: Gerente
Insumos: Edital publicado
Ator: Analista
Atividades: Monitora o período de inscrições e esclarece dúvidas.
Saídas: Lista de inscritos
Cliente: Comissão de Avaliação

#atividade 27
Etapa: 10
Fornecedor: Analista
Insumos: Lista de inscritos
Ator: Comissão de Avaliação
Atividades: Analisa o mérito das propostas recebidas.
Saídas: Parecer final
Cliente: Gerente

#atividade 28
Etapa: 10
Fornecedor: Comissão de Avaliação
Insumos: Parecer final
Ator: Gerente
Atividades: Homologa o resultado final do certame.
Saídas: Termo de Homologação
Cliente: Jurídico

#atividade 29
Etapa: 10
Fornecedor: Gerente
Insumos: Termo de Homologação
Ator: Jurídico
Atividades: Redige e formaliza os contratos com os vencedores.
Saídas: Contratos assinados
Cliente: Vencedores

#atividade 30
Etapa: 10
Fornecedor: Jurídico
Insumos: Contratos assinados
Ator: Financeiro
Atividades: Autoriza o desembolso dos recursos financeiros.
Saídas: Comprovante de pagamento
Cliente: Vencedores

#atividade 31
Etapa: 10
Fornecedor: Presidente
Insumos: Todo o processo
Ator: Expedição
Atividades: Enviou para expedição.
Saídas: Comprovante de pagamento
Cliente: Cliente externo

#observacoes
- Ponto crítico identificado na Etapa 2 devido ao sistema de orçamentos.
- Necessário verificar a conformidade com a nova norma de 2026.
`;
        this.saveFile(content, "exemplo-estresse-31-atividades.txt");
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