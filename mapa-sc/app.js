// Links diretos para os arquivos no seu repositório
const urlJson = "https://raw.githubusercontent.com/zapppsr/zapppsr.github.io/main/mapa-sc/sc.json";
const urlCsv = "https://raw.githubusercontent.com/zapppsr/zapppsr.github.io/main/mapa-sc/dim_municipio_ibge.csv";
const urlBandeiras = "https://raw.githubusercontent.com/zapppsr/zapppsr.github.io/main/images/scflags/";

const svg = d3.select("#svg-mapa");
const width = +svg.attr("width");
const height = +svg.attr("height");

Promise.all([
    d3.json(urlJson),
    d3.csv(urlCsv)
]).then(([topoData, csvData]) => {
    
    const select = d3.select("#select-mun");
    
    // Ordenar e popular o select
    csvData.sort((a, b) => a.nm_municipio.localeCompare(b.nm_municipio));
    csvData.forEach(d => {
        select.append("option").attr("value", d.cd_ibge).text(d.nm_municipio);
    });

    const municipios = topojson.feature(topoData, topoData.objects.sc);
    const projection = d3.geoMercator().fitSize([width, height], municipios);
    const path = d3.geoPath().projection(projection);

    svg.append("g")
        .selectAll("path")
        .data(municipios.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "municipio")
        .attr("id", d => "mun-" + d.properties.id)
        .on("click", function(event, d) {
            select.property("value", d.properties.id);
            atualizar(d.properties.id, d.properties.name);
        });

    select.on("change", function() {
        atualizar(this.value, this.options[this.selectedIndex].text);
    });

    function atualizar(id, nome) {
        if (!id) return;
        d3.selectAll(".municipio").classed("selecionado", false);
        d3.select("#mun-" + id).classed("selecionado", true);
        d3.select("#nome-exibicao").text(nome);
        d3.select("#codigo-exibicao").text("IBGE: " + id);
        d3.select("#bandeira").attr("src", urlBandeiras + id + ".png").style("display", "block");
    }
});