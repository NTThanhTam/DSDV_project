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
        // draw_geoJSON(geojson, "y2022")
        const year_index = year_indexes["y2022"]

        var valid_data = []
        for (let i = 0; i < geojson.features.length; i++) {
            const feature = geojson.features[i]
            if(feature.properties.value[year_index] != null && !isNaN(feature.properties.value[year_index])){
                valid_data.push(feature)
            }
          }
        
        valid_data = valid_data.sort(function(a, b){
            return - a.properties.value[year_index] + b.properties.value[year_index]
        })
        var used_data = valid_data.slice(0, 5)

        draw_barChart(used_data, valid_data, "y2022")
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

        var values = geojson.features.map(function(d) {
            return d.properties.value[year_index];
        });
        
        var colorScale = d3.scaleQuantile()
            .domain(values)
            .range([120, 125, 130, 135, 140, 145, 150, 155, 160, 165, 170, 175, 180, 185, 190, 195, 200, 205, 210, 215, 220, 225, 230, 235, 240, 245, 250]);

        colorScale.range(colorScale.range().reverse());
        
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

function draw_barChart(used_data, full_data, year){
    var height = 800
    var width = 800
    var padding = 100

    var svg = d3.select("#bar_chart-svg")
                .append("svg")
                .attr("width", width + padding)
                .attr("height", height + padding)
    
    const year_index = year_indexes[year]

    used_data = used_data.sort(function(a, b){
        return - a.properties.value[year_index] + b.properties.value[year_index]
    })

    var max_x = d3.max(used_data, function(d){
        return d.properties.value[year_index]
    })

    var max_y = used_data.length

    var xScale = d3.scaleLinear().domain([0, max_x]).range([0, width-padding])
    var yScale = d3.scaleBand()
                .domain(d3.range(max_y))
                .range([height - padding, 0])
                .paddingInner(0.01)

    var xAxis = d3.axisBottom()
                .scale(xScale)
    var yAxis = d3.axisLeft()
                .scale(yScale)

    var values = used_data.map(function(d) {
        return d.properties.value[year_index];
    });
    var colorScale = d3.scaleQuantile()
                        .domain(values)
                        .range([120, 125, 130, 135, 140, 145, 150, 155, 160, 165, 170, 175, 180, 185, 190, 195, 200, 205, 210, 215, 220, 225, 230, 235, 240, 245, 250]);

    colorScale.range(colorScale.range().reverse());

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + padding + ", " + (height - padding) + ")")
        .call(xAxis)

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxis)

    svg.selectAll("rect")
        .data(used_data)
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
        .attr("fill", function(d){
            return "rgb(128, " + colorScale(d.properties.value[year_index]) + ", 0)"
        })
        
    svg.selectAll("g.text")
        .data(used_data)
        .enter()
        .append("text")
        .attr("x", function(d){
            return xScale(d.properties.value[year_index]) + padding + 20
        })
        .attr("y", function(d, i){
            return yScale(i) + height/(max_y*2)
        })
        .text(function(d){
            return d.properties.name
        })


    var countries = full_data.map(function(d) {
        return d.properties.name;
    });

    var existingCountries = used_data.map(function(d) {
        return d.properties.name;
    });

    var select_add = d3.select("#countrySelect-add");
    select_add
        .selectAll("option")
        .data(countries)
        .enter()
        .append("option")
        .text(function(d) { return d; });

    d3.select("#addButton")
        .on("click", function() {
            var selectedValue = select_add.property("value");
            var alreadyExisted = false

            for (let i = 0; i < used_data.length; i++){
                const feature = full_data[i]
                if (feature.properties.name == selectedValue){
                    alreadyExisted = true
                    break
                }
            }

            if(!alreadyExisted){
                for (let i = 0; i < full_data.length; i++) {
                    const feature = full_data[i]
                    if(feature.properties.name == selectedValue){
                        used_data.push(feature)
                        console.log(feature.properties.name + "  " + feature.properties.value[year_index])
                        break
                    }
                    }
                console.log(used_data)
                d3.select("svg").remove()
                draw_barChart(used_data, full_data, year)  
            }
        });

        console.log(existingCountries)
    var select_delete = d3.select("#countrySelect-delete");
    select_delete
        .selectAll("option")
        .data(existingCountries)
        .enter()
        .append("option")
        .text(function(d) { return d; });

    d3.select("#deleteButton")
        .on("click", function() {
            var selectedValue = select_delete.property("value");

            used_data = used_data.filter(function(d){
                return d.properties.name != selectedValue
            })

            d3.select("svg").remove()
            draw_barChart(used_data, full_data, year)  
        
        }); 
}