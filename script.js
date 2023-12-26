d3.json("gistfile1.js").then(function(geojson){
        console.log(geojson)
        draw_chart(geojson)
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
                        
        svg.selectAll("path")
                .data(geojson.features)
                .enter()
                .append("path")
                .attr("d", path)
            .style("stroke-width", "0.5")
            .style("stroke", "black")
                .style("fill","blue")
                .attr("cursor", "pointer")
    }