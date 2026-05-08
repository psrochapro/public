// Usamos "./" para buscar os arquivos na mesma pasta do servidor/GitHub Pages
const BASE_URL = "./";

const svg = d3.select("#svg-mapa");
const g = svg.append("g");

// Função auxiliar para limpar nomes de colunas do CSV (remove espaços e caracteres BOM)
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
    
    console.log("Arquivos carregados com sucesso!");

    // 1. Limpar e preparar dados do CSV
    const csvData = limparChaves(csvRaw);
    const select = d3.select("#select-mun");
    select.html('<option value="">Selecione um município...</option>');

    // Filtrar apenas linhas válidas e ordenar por nome
    const listaValida = csvData.filter(d => d.nm_municipio && d.cd_ibge);
    listaValida.sort((a, b) => a.nm_municipio.localeCompare(b.nm_municipio));

    listaValida.forEach(d => {
        select.append("option")
            .attr("value", d.cd_ibge.trim())
            .text(d.nm_municipio);
    });

    // 2. Configurar o Mapa (TopoJSON usa o objeto 'sc')
    if (!topoData.objects.sc) {
        console.error("Erro: Objeto 'sc' não encontrado no JSON. Verifique a estrutura.");
        return;
    }

    const municipios = topojson.feature(topoData, topoData.objects.sc);
    const projection = d3.geoMercator().fitSize([700, 450], municipios);
    const path = d3.geoPath().projection(projection);

    // 3. Desenhar os municípios
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

    // Evento de mudança no Seletor
    select.on("change", function() {
        const id = this.value;
        const nome = this.options[this.selectedIndex].text;
        atualizar(id, nome);
    });

    function atualizar(id, nome) {
        if (!id) return;

        // Resetar cores e selecionar o novo
        d3.selectAll(".municipio").classed("selecionado", false);
        const selecaoNoMapa = d3.select("#mun-" + id);
        
        if (!selecaoNoMapa.empty()) {
            selecaoNoMapa.classed("selecionado", true);
        }

        // Atualizar textos
        d3.select("#nome-exibicao").text(nome);
        d3.select("#codigo-exibicao").text("Código IBGE: " + id);
        
        // Atualizar Bandeira (caminho: images/scflags/ID.png)
        const caminhoBandeira = "images/scflags/" + id + ".png";
        d3.select("#bandeira")
            .attr("src", caminhoBandeira)
            .style("display", "block")
            .on("error", function() {
                // Se a bandeira não existir, esconde o elemento
                d3.select(this).style("display", "none");
            });
    }

}).catch(e => {
    console.error("Erro crítico ao carregar dados:", e);
    d3.select("#select-mun").html('<option>Erro ao carregar dados (veja F12)</option>');
});