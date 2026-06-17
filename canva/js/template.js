const template = {
    // Template Vazio para produtividade
    downloadTemplate() {
        const content = `#nome 
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
Etapa: 
Fornecedor: 
Insumos: 
Ator: 
Atividades: 
Saídas: 
Cliente: 
`;
        this.saveFile(content, "template-vazio.txt");
    },

    // Template com Exemplo para guiar o usuário
    downloadExample() {
        const content = `#nome Nome do Processo Exemplo
#objetivo Transformar recursos financeiros em editais e obter inscritos.
#macroprocesso Gestão de Editais
#area Departamento de Pesquisa
#dono Mariana e Equipe

#atores Financeiro, Aquisição, Compras
#entradas Formulário eletrônico, Documentos
#saidas Alvarás emitidos, Aprovações do cliente
#interessados Cliente, Presidente
#normas Lei 13.105/2015, Lei 8.069/1990
#lgpd Nome, RG, CPF, Dados bancários
#recursos ERP, CRM, E-mail
#documentos Alvarás, Documentos de identificação
#sgpe Assunto: 2456 Gestão, Classe: Interno, Sigilo: Público
#indicadores Tempo de tramitação, Taxa de erros
#gatilho Formulário eletrônico

#atividade 1
Etapa: 1
Fornecedor: Cliente
Insumos: Solicitação inicial
Ator: Analista
Atividades: Revisa os dados e valida a elegibilidade do pedido.
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
Saídas: Edital publicado
Cliente: Público Geral
`;
        this.saveFile(content, "exemplo-preenchido.txt");
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