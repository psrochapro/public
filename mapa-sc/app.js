// URL Base do seu GitHub
const BASE_URL = "https://raw.githubusercontent.com/zapppsr/zapppsr.github.io/main/";

const svg = d3.select("#svg-mapa");
const g = svg.append("g");

// Função para exibir erro na tela caso algo falhe
function exibirErro(mensagem) {
    console.error(mensagem);
    d3.select("#select-mun").html(`<option>${mensagem}</option>`);
}

Promise.all([
    d3.json(BASE_URL + "sc.json"),
    d3.csv(BASE_URL + "dim_municipio_ibge.csv")
]).then(([topoData, csvData]) => {
    
    // 1. Limpeza dos dados do CSV (Remove espaços e caracteres invisíveis do cabeçalho)
    const cleanedCsvData = csvData.map(d => {
        const novoObjeto = {};
        for (let key in d) {
            // Remove o caractere BOM (\ufeff) e espaços
            const novaChave = key.trim().replace(/^\ufeff/, "");
            novoObjeto[novaChave] = d[key];
        }
        return novoObjeto;
    });

    const select = d3.select("#select-mun");
    select.html('<option value="">Selecione um município...</option>');

    // 2. Filtrar e ordenar a lista
    const listaValida = cleanedCsvData.filter(d => d.nm_municipio && d.cd_ibge);
    
    if (listaValida.length === 0) {
        exibirErro("Erro: CSV vazio ou colunas inválidas.");
        return;
    }

    listaValida.sort((a, b) => a.nm_municipio.localeCompare(b.nm_municipio));

    listaValida.forEach(d => {
        select.append("option")
            .attr("value", d.cd_ibge.trim())
            .text(d.nm_municipio);
    });

    // 3. Converter TopoJSON (O seu arquivo usa 'sc')
    if (!topoData.objects || !topoData.objects.sc) {
        exibirErro("Erro: Objeto 'sc' não encontrado no JSON.");
        return;
    }

    const municipios = topojson.feature(topoData, topoData.objects.sc);
    const projection = d3.geoMercator().fitSize([700, 450], municipios);
    const path = d3.geoPath().projection(projection);

    // 4. Desenhar o mapa
    g.selectAll("path")
        .data(municipios.features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "municipio")
        .attr("id", d => "mun-" + String(d.properties.id).trim())
        .on("click", (ev, d) => {
            const id = String(d.properties.id).trim();
            select.property("value", id);
            atualizar(id, d.properties.name);
        });

    select.on("change", function() {
        const id = this.value;
        const nome = this.options[this.selectedIndex].text;
        atualizar(id, nome);
    });

    function atualizar(id, nome) {
        if (!id) return;
        
        d3.selectAll(".municipio").classed("selecionado", false);
        
        const elemento = d3.select("#mun-" + id);
        if (!elemento.empty()) {
            elemento.classed("selecionado", true);
        }

        d3.select("#nome-exibicao").text(nome);
        d3.select("#codigo-exibicao").text("Código IBGE: " + id);
        
        // Caminho da bandeira
        const urlBandeira = BASE_URL + "images/scflags/" + id + ".png";
        d3.select("#bandeira")
            .attr("src", urlBandeira)
            .style("display", "block")
            .on("error", function() {
                // Se a bandeira não existir, esconde o campo de imagem
                d3.select(this).style("display", "none");
            });
    }

}).catch(e => {
    exibirErro("Erro ao carregar arquivos. Verifique o console.");
    console.error(e);
});