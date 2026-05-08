const BASE_URL = "https://raw.githubusercontent.com/zapppsr/zapppsr.github.io/main/";

const svg = d3.select("#svg-mapa");
const g = svg.append("g");

Promise.all([
    d3.json(BASE_URL + "sc.json"),
    d3.csv(BASE_URL + "dim_municipio_ibge.csv")
]).then(([topoData, csvData]) => {
    
    console.log("Dados carregados com sucesso!");

    const select = d3.select("#select-mun");
    select.html('<option value="">Selecione um município...</option>');

    // 1. Filtrar e ordenar a lista do dropdown
    const listaValida = csvData.filter(d => d.nm_municipio && d.cd_ibge);
    listaValida.sort((a, b) => a.nm_municipio.localeCompare(b.nm_municipio));

    listaValida.forEach(d => {
        select.append("option")
            .attr("value", d.cd_ibge.trim())
            .text(d.nm_municipio);
    });

    // 2. CORREÇÃO AQUI: O objeto no seu JSON chama-se 'sc'
    if (!topoData.objects.sc) {
        console.error("Erro: Objeto 'sc' não encontrado no TopoJSON. Verifique o nome no arquivo JSON.");
        return;
    }

    const municipios = topojson.feature(topoData, topoData.objects.sc);
    const projection = d3.geoMercator().fitSize([700, 450], municipios);
    const path = d3.geoPath().projection(projection);

    // 3. Desenhar o mapa
    g.selectAll("path")
        .data(municipios.features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "municipio")
        .attr("id", d => "mun-" + d.properties.id.toString().trim()) // Garante que o ID é string
        .on("click", (ev, d) => {
            const id = d.properties.id.toString().trim();
            select.property("value", id);
            atualizar(id, d.properties.name);
        });

    // Evento do Select
    select.on("change", function() {
        const id = this.value;
        const nome = this.options[this.selectedIndex].text;
        atualizar(id, nome);
    });

    function atualizar(id, nome) {
        if (!id) return;
        
        // Remove destaque anterior
        d3.selectAll(".municipio").classed("selecionado", false);
        
        // Adiciona destaque no novo
        const selecao = d3.select("#mun-" + id);
        if (!selecao.empty()) {
            selecao.classed("selecionado", true);
            // Opcional: Centralizar mapa no município clicado
        }

        d3.select("#nome-exibicao").text(nome);
        d3.select("#codigo-exibicao").text("Código IBGE: " + id);
        
        // Atualiza a bandeira
        const urlBandeira = BASE_URL + "images/scflags/" + id + ".png";
        d3.select("#bandeira")
            .attr("src", urlBandeira)
            .style("display", "block")
            .on("error", function() {
                d3.select(this).style("display", "none"); // Esconde se a imagem não existir
                console.warn("Bandeira não encontrada para o código: " + id);
            });
    }

}).catch(e => {
    console.error("Erro ao carregar arquivos:", e);
    alert("Erro ao carregar dados. Verifique o console (F12).");
});