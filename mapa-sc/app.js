// URL Base do seu GitHub (Certifique-se que o link termina com /)
const BASE_URL = "https://raw.githubusercontent.com/zapppsr/zapppsr.github.io/main/";

const svg = d3.select("#svg-mapa");
const g = svg.append("g");

Promise.all([
    d3.json(BASE_URL + "sc.json"),
    d3.csv(BASE_URL + "dim_municipio_ibge.csv")
]).then(([topoData, csvData]) => {
    
    const select = d3.select("#select-mun");
    select.html('<option value="">Selecione um município...</option>');

    // Filtrar e ordenar apenas linhas que possuem nome de município
    const listaValida = csvData.filter(d => d.nm_municipio && d.cd_ibge);
    
    listaValida.sort((a, b) => a.nm_municipio.localeCompare(b.nm_municipio));

    listaValida.forEach(d => {
        select.append("option")
            .attr("value", d.cd_ibge.trim())
            .text(d.nm_municipio);
    });

    // Converter TopoJSON (o seu ficheiro usa 'municipios')
    const municipios = topojson.feature(topoData, topoData.objects.municipios);
    const projection = d3.geoMercator().fitSize([700, 450], municipios);
    const path = d3.geoPath().projection(projection);

    g.selectAll("path")
        .data(municipios.features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "municipio")
        .attr("id", d => "mun-" + d.properties.id.trim())
        .on("click", (ev, d) => {
            const id = d.properties.id.trim();
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
        d3.select("#mun-" + id).classed("selecionado", true);
        d3.select("#nome-exibicao").text(nome);
        d3.select("#codigo-exibicao").text("Código IBGE: " + id);
        d3.select("#bandeira")
            .attr("src", BASE_URL + "images/scflags/" + id + ".png")
            .style("display", "block");
    }
}).catch(e => {
    console.error("Erro ao carregar dados:", e);
    // Isso ajuda a identificar se é o CSV ou o JSON que falhou
});