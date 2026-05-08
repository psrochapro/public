// URL Base para arquivos e imagens no GitHub (Versão RAW para acesso direto)
const GITHUB_RAW_URL = "https://raw.githubusercontent.com/zapppsr/zapppsr.github.io/main/";

const svg = d3.select("#svg-mapa");
const g = svg.append("g");

// Função para limpar o cabeçalho do CSV (remove espaços e o caractere invisível BOM)
const limparColunas = (data) => {
    return data.map(d => {
        const objetoLimpo = {};
        for (let key in d) {
            const chaveLimpa = key.trim().replace(/^\ufeff/, "");
            objetoLimpo[chaveLimpa] = d[key];
        }
        return objetoLimpo;
    });
};

Promise.all([
    d3.json(GITHUB_RAW_URL + "sc.json"),
    d3.csv(GITHUB_RAW_URL + "dim_municipio_ibge.csv")
]).then(([topoData, csvRaw]) => {
    
    // Limpeza dos dados
    const csvData = limparColunas(csvRaw);

    const select = d3.select("#select-mun");
    select.html('<option value="">Selecione um município...</option>');

    // Filtrar e ordenar a lista
    const listaValida = csvData.filter(d => d.nm_municipio && d.cd_ibge);
    listaValida.sort((a, b) => a.nm_municipio.localeCompare(b.nm_municipio));

    listaValida.forEach(d => {
        select.append("option")
            .attr("value", d.cd_ibge.trim())
            .text(d.nm_municipio);
    });

    // Converter TopoJSON (o objeto no seu JSON é 'sc')
    if (!topoData.objects.sc) {
        console.error("Erro: Objeto 'sc' não encontrado no JSON.");
        return;
    }

    const municipios = topojson.feature(topoData, topoData.objects.sc);
    const projection = d3.geoMercator().fitSize([700, 450], municipios);
    const path = d3.geoPath().projection(projection);

    // Desenhar o mapa
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

        // Destaque no mapa
        d3.selectAll(".municipio").classed("selecionado", false);
        const alvo = d3.select("#mun-" + id);
        if (!alvo.empty()) alvo.classed("selecionado", true);

        // Textos informativos
        d3.select("#nome-exibicao").text(nome);
        d3.select("#codigo-exibicao").text("Código IBGE: " + id);
        
        // LÓGICA DA BANDEIRA: Link direto para o arquivo RAW baseado no ID IBGE
        const urlBandeira = `${GITHUB_RAW_URL}images/scflags/${id}.png`;
        
        d3.select("#bandeira")
            .attr("src", urlBandeira)
            .style("display", "block")
            .on("error", function() {
                d3.select(this).style("display", "none");
                console.warn("Bandeira não encontrada para o código: " + id);
            });
    }

}).catch(e => {
    console.error("Erro ao carregar dados do GitHub:", e);
    d3.select("#select-mun").html('<option>Erro: Verifique o Console (F12)</option>');
});