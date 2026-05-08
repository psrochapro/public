// Configuração de caminhos do GitHub (Raw)
const GITHUB_RAW = "https://raw.githubusercontent.com/zapppsr/zapppsr.github.io/main/";
const URL_JSON = GITHUB_RAW + "sc.json";
const URL_CSV = GITHUB_RAW + "dim_municipio_ibge.csv";
const URL_FLAGS = GITHUB_RAW + "images/scflags/";

const svg = d3.select("#svg-mapa");
const g = svg.append("g");

// Carregamento assíncrono dos dados
Promise.all([
    d3.json(URL_JSON),
    d3.csv(URL_CSV)
]).then(([topoData, csvData]) => {
    
    const select = d3.select("#select-mun");
    select.html('<option value="">Selecione um município...</option>');

    // 1. Popular e ordenar a lista
    csvData.sort((a, b) => a.nm_municipio.localeCompare(b.nm_municipio));
    csvData.forEach(d => {
        if(d.cd_ibge) {
            select.append("option")
                .attr("value", d.cd_ibge.trim())
                .text(d.nm_municipio);
        }
    });

    // 2. Processar Geometria (O objeto no seu JSON chama-se 'municipios')
    const municipios = topojson.feature(topoData, topoData.objects.municipios);
    const projection = d3.geoMercator().fitSize([700, 450], municipios);
    const path = d3.geoPath().projection(projection);

    // 3. Desenhar Mapa
    g.selectAll("path")
        .data(municipios.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "municipio")
        .attr("id", d => "mun-" + d.properties.id.trim())
        .on("click", (event, d) => {
            const id = d.properties.id.trim();
            select.property("value", id);
            atualizarInterface(id, d.properties.name);
        });

    // 4. Evento do Dropdown
    select.on("change", function() {
        const id = this.value;
        const nome = this.options[this.selectedIndex].text;
        atualizarInterface(id, nome);
    });

    function atualizarInterface(id, nome) {
        if (!id) return;

        // Resetar e aplicar destaque no mapa
        d3.selectAll(".municipio").classed("selecionado", false);
        d3.select("#mun-" + id).classed("selecionado", true);

        // Atualizar textos
        d3.select("#nome-exibicao").text(nome);
        d3.select("#codigo-exibicao").text("Código IBGE: " + id);
        
        // Carregar Bandeira
        d3.select("#bandeira")
            .attr("src", URL_FLAGS + id + ".png")
            .style("display", "block")
            .on("error", function() { 
                d3.select(this).style("display", "none"); 
            });
    }

}).catch(err => {
    console.error("Erro ao carregar dados do GitHub:", err);
});