// Para o JSON e CSV, usamos o caminho local que já estava funcionando
const BASE_URL = "./"; 

// Para as bandeiras, usamos o link RAW do seu GitHub
const IMAGE_URL = "https://raw.githubusercontent.com/zapppsr/zapppsr.github.io/main/images/scflags/";

const svg = d3.select("#svg-mapa");
const g = svg.append("g");

// Função para limpar colunas (essencial para o CSV carregar a lista corretamente)
const limparChaves = (data) => {
    return data.map(d => {
        const novoObj = {};
        for (let key in d) {
            const chaveLimpa = key.trim().replace(/^\ufeff/, "");
            novoObj[chaveLimpa] = d[key];
        }
        return novoObj;
    });
};

Promise.all([
    d3.json(BASE_URL + "sc.json"),
    d3.csv(BASE_URL + "dim_municipio_ibge.csv")
]).then(([topoData, csvRaw]) => {
    
    const csvData = limparChaves(csvRaw);
    const select = d3.select("#select-mun");
    select.html('<option value="">Selecione um município...</option>');

    const listaValida = csvData.filter(d => d.nm_municipio && d.cd_ibge);
    listaValida.sort((a, b) => a.nm_municipio.localeCompare(b.nm_municipio));

    listaValida.forEach(d => {
        select.append("option")
            .attr("value", d.cd_ibge.trim())
            .text(d.nm_municipio);
    });

    // TopoJSON usa o objeto 'sc'
    const municipios = topojson.feature(topoData, topoData.objects.sc);
    const projection = d3.geoMercator().fitSize([700, 450], municipios);
    const path = d3.geoPath().projection(projection);

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
        const selecao = d3.select("#mun-" + id);
        if (!selecao.empty()) selecao.classed("selecionado", true);

        d3.select("#nome-exibicao").text(nome);
        d3.select("#codigo-exibicao").text("Código IBGE: " + id);
        
        // AQUI ESTÁ O AJUSTE DA BANDEIRA:
        // Monta o link RAW: URL + CODIGO_IBGE + .png
        d3.select("#bandeira")
            .attr("src", IMAGE_URL + id + ".png")
            .style("display", "block")
            .on("error", function() {
                d3.select(this).style("display", "none");
            });
    }

}).catch(e => {
    console.error("Erro ao carregar dados:", e);
});