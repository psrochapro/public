const template = {
    getTemplateContent() {
        return `#nome 
#objetivo 
#macroprocesso 
#area 
#dono 

#etapas
1: Nome da Etapa

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
        const content = `#nome Processo de Compras e Contratação de Serviços Corporativos
#objetivo Adquirir bens e contratar serviços de forma transparente e ágil.
#macroprocesso Gestão de Suprimentos
#area Departamento de Compras
#dono Diretoria de Operações

#etapas
1: Preparação da Demanda
2: Cotação de Mercado
3: Análise e Seleção

#atividade 1
Etapa: 1
Fornecedor: Solicitante
Insumos: Requisição de Compra
Ator: Gestor da Área
Atividades: Avalia a real necessidade da aquisição.
Regra: Se exceder o orçamento, a requisição é devolvida.
Saídas: Requisição Pré-Aprovada
Cliente: Compras

#atividade 2
Etapa: 2
Fornecedor: Compras
Insumos: Requisição Saneada
Ator: Compras
Atividades: Dispara a solicitação de cotação para o mercado.
Saídas: Solicitação Enviada
Cliente: Mercado

#observacoes
- Ponto crítico identificado na Etapa 1.
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