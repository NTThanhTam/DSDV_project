var rowConverter = function(d) {
        return {
        y2018: parseInt(d["2018"]),
        y2019: parseInt(d["2019"]),
        y2020: parseInt(d["2020"]),
        y2021: parseInt(d["2021"]),
        y2022: parseInt(d["2022"]),
        population_2022: parseInt(d["2022 Population"]),
        CCA3: d.CCA3,
        capital: d.Capital,
        country: d["Country/Region"],
        rank: parseInt(d.Rank)
        };
    }


d3.csv("noodles.csv", rowConverter).then(function(data){
d3.json("gistfile1.js").then(function(geojson){
        // console.log(data)

        for (var i = 0; i < geojson.features.length; i++) {
            var jsonCountryName = geojson.features[i].properties.name;

            for (var j = 0; j < data.length; j++) {
                var dataCountry = data[j].country;
                var dataValue = data[j].y2022;
                geojson.features[i].properties.value = -1;
                if (dataCountry == jsonCountryName) {
                    geojson.features[i].properties.value = dataValue;
                    break;
                }
            }
        }
        draw_chart(geojson)
    })
})

function draw_chart(geojson){
        var height = 800
        var width = 800
    
        var svg = d3.select("#world_map_SVG")
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("display", "block")
                    .attr("margin", "auto")
    
                    
        var projection = d3.geoMercator().fitSize([width, height], geojson)
    
        var path = d3.geoPath()
                        .projection(projection);
        
        console.log(geojson.features)
        var max_color = d3.max(geojson.features, function(d){
            return d.properties.value
        })
        var colorScale = d3.scaleLinear().domain([0, max_color]).range([200, 250])
        console.log("Max color: " + max_color)
        
        svg.selectAll("path")
                .data(geojson.features)
                .enter()
                .append("path")
                .attr("d", path)
                .style("stroke-width", "0.5")
                .style("stroke", "black")
                .attr("cursor", "pointer")
                .attr("fill", function(d){
                    if(d.properties.value == -1){
                        console.log("Grey selected")
                        return "rgb(128, 128, 128)"
                    }
                    else{
                        return "rgb(128, 0, " + colorScale(d.properties.value) + ")"
                    }
                })
    }