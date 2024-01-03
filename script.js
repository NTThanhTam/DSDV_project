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
                geojson.features[i].properties.value = [null]
                if (dataCountry == jsonCountryName) {
                    var arrValue = [data[j].y2018, data[j].y2019, data[j].y2020, data[j].y2021, data[j].y2022]
                    geojson.features[i].properties.value = arrValue
                    break;
                }
            }
        }
        console.log(geojson.features)
        draw_chart(geojson, "y2022")
    })
})

year_indexes = {
    "y2018": 0,
    "y2019": 1,
    "y2020": 2,
    "y2021": 3,
    "y2022": 4
}

function draw_chart(geojson, year){
        var height = 800
        var width = 800
    
        var svg = d3.select("#world_map_SVG")
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("display", "block")
                    .attr("margin", "auto")
    
        var year_index = year_indexes[year]
                    
        var projection = d3.geoMercator().fitSize([width, height], geojson)
    
        var path = d3.geoPath()
                        .projection(projection);

        var min_color = d3.min(geojson.features, function(d){
            return d.properties.value[year_index]
        })
        
        var max_color = d3.max(geojson.features, function(d){
            return d.properties.value[year_index]
        })
        var colorScale = d3.scaleLinear().domain([min_color, max_color]).range([200, 250])
        console.log("Min color: " + min_color)
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
                    if(d.properties.value[year_index] == null){
                        return "rgb(128, 128, 128)"
                    }
                    else{
                        return "rgb(128, 0, " + colorScale(d.properties.value[year_index]) + ")"
                    }
                })
                .on("mouseover", function(d){
                    console.log(d.name)
                    // svg
                    //     .append("text").attr("class", "title-text")
                    //     .style("fill", color(i))
                    //     .text(d.name + "efzeiufzihefizeifiu")
                    //     .attr("text-anchor", "middle")
                    //     .attr("x", 200)
                    //     .attr("y", 30);
                })

        d3.select("#year-select").on("change", function (event, d) {
            let criterion = event.target.value;
            d3.select("svg").remove()
            draw_chart(geojson, criterion)  
        }
        )
    }