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
        // console.log(geojson.features)
        // draw_geoJSON(geojson, "y2022")
        draw_barChart(geojson, "y2022")
    })
})

year_indexes = {
    "y2018": 0,
    "y2019": 1,
    "y2020": 2,
    "y2021": 3,
    "y2022": 4
}

function draw_geoJSON(geojson, year){
        var height = 1000
        var width = 1000
    
        var svg = d3.select("#world_map_SVG")
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .style("display", "block")
                    .style("margin", "auto")              
    
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

        var values = geojson.features.map(function(d) {
            return d.properties.value[year_index];
        });
        
        var colorScale = d3.scaleQuantile()
            .domain(values)
            .range([120, 125, 130, 135, 140, 145, 150, 155, 160, 165, 170, 175, 180, 185, 190, 195, 200, 205, 210, 215, 220, 225, 230, 235, 240, 245, 250]);
        
        svg.selectAll("path")
                .data(geojson.features)
                .enter()
                .append("path")
                .attr("d", path)
                .style("stroke-width", "0.5")
                .style("stroke", "black")
                .attr("cursor", "pointer")
                .attr("fill", function(d){
                    if(d.properties.value[year_index] == null || d.properties.value[year_index] == 0 || isNaN(d.properties.value[year_index])){
                        return "rgb(128, 128, 128)"
                    }
                    else{
                        return "rgb(128, " + colorScale(d.properties.value[year_index]) + ", 0)"
                    }
                })
                .append("svg:title")
                .text(function(d) { 
                    if(d.properties.value[year_index] == null || d.properties.value[year_index] == 0 || isNaN(d.properties.value[year_index])){
                        return "No data"
                    }
                    else{
                        const value = "Country: " + String(d.properties.name) + "\n"
                        + "Consumption in " + year.slice(1) + ": " + String(d.properties.value[year_index]) +"\n" 
                        return value;                    
                    }
                })


        d3.select("#year-select").on("change", function (event, d) {
            let criterion = event.target.value;
            d3.select("svg").remove()
            draw_geoJSON(geojson, criterion)  
        }
        )
    }

function draw_barChart(data, year){
    var height = 800
    var width = 800
    var padding = 100


    var svg = d3.select("body")
                .append("svg")
                .attr("width", width + padding)
                .attr("height", height + padding)
    
    const year_index = year_indexes[year]

    var valid_data = []
    for (let i = 0; i < data.features.length; i++) {
        const feature = data.features[i]
        if(feature.properties.value[year_index] != null && !isNaN(feature.properties.value[year_index])){
            valid_data.push(feature)
        }
      }

    var max_x = d3.max(data.features, function(d){
        return d.properties.value[year_index]
    })

    var max_y = valid_data.length

    console.log("Max x: " + max_x)
    console.log("Max y: " + max_y)  

    var xScale = d3.scaleLinear().domain([0, max_x]).range([0, width-padding])
    var yScale = d3.scaleBand()
                .domain(d3.range(max_y))
                .range([height - padding, 0])
                .paddingInner(0.01)

    var xAxis = d3.axisBottom()
                .scale(xScale)
    var yAxis = d3.axisLeft()
                .scale(yScale)


    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + padding + ", " + (height - padding) + ")")
        .call(xAxis)

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxis)

    svg.selectAll("rect")
        .data(valid_data)
        .enter()
        .append("rect")
        .attr("width", function(d){
            return xScale(d.properties.value[year_index])
        })
        .attr("height", yScale.bandwidth())
        .attr("x", padding)
        .attr("y", function(d, i){
            return yScale(i)
        })
        // .attr("fill", function(d){
        //     return "rgb(128, 0, " + Math.round(255-d.GRDPVND) + ")"
        // })
    svg.selectAll("g.text")
        .data(valid_data)
        .enter()
        .append("text")
        .attr("x", function(d){
            return xScale(d.properties.value[year_index]) + padding  + 5
        })
        .attr("y", function(d, i){
            return yScale(i) + height/(max_y*2)
        })
        .text(function(d){
            return d.properties.name
        })

}