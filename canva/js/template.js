const template = {
    download() {
        const content = `#nome Nome do Processo Aqui
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

#etapa 1
Fornecedor: Cliente
Insumos: Solicitação inicial
Ator: Analista
Atividades: Revisa os dados e valida a elegibilidade do pedido.
Saídas: Checklist preenchido
Cliente: Gerente

#etapa 2
Fornecedor: Analista
Insumos: Checklist preenchido
Ator: Gerente
Atividades: Aprova a abertura do edital no sistema.
Saídas: Edital publicado
Cliente: Público Geral
`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "modelo-levantamento.txt";
        a.click();
    }
};