function draw(sessionId) {
    
    var organization = 'BIDCO'
        , selector = '#dashboard-holder';
    
    var w = $(selector).width()
        , h = w*.8;
    
    var svg = d3.select(selector).html("").append("svg")
        .style("width", w+"px")
        .style("height", h+"px");
    
    var wS = 3.407231221834032
        , strokeWidth = .5
        , radius = 8;
    
    var c = d3.scaleOrdinal(d3.schemeCategory20);
    

    
    var projection = d3.geoAlbersUsa()
                    .scale(16193).translate([-4600, 2000]).precision(0);
    
    var path = d3.geoPath()
        .projection(projection);
    
    d3.json("/static/js/ma.topojson", function(error, ma){
        console.log(ma);
        var holderG = svg.append("g")
//            .attr("transform", "translate(-7791.07507849761,1301.7143045704502) scale(3.407231221834032)")
        ;
        holderG.append("g").append("path").attr("class","census-blocks")
            .datum(topojson.mesh(ma))
            .attr("d",path)
            .style("stroke-width", strokeWidth+"px");
        
        var zoom = d3.zoom()
            .on('zoom', function(){holderG.attr("transform", d3.event.transform)});
        zoom
            .on('end', function(){
                var z = d3.event.transform.k;
                d3.selectAll(".census-blocks").style("stroke-width", (strokeWidth/z)+"px");
                d3.selectAll(".provider-plots circle").attr("r", (radius/z)).style("stroke-width", (strokeWidth/z)+"px");
            });
        svg.call(zoom);
        
        
//        GET PROVIDERS
        var url = "/getProviders/" + organization + '/'
        d3.json(url, function(error, data) {
            

            data.forEach(function(d){
                d.latitude = +d.latitude + Math.random()*.001*(Math.random()>.5?-1:1); 
                d.longitude = +d.longitude + Math.random()*.001*(Math.random()>.5?-1:1);
            });
            console.log(data);
            
            var g = holderG.append("g").attr("class","provider-plots");
            g.selectAll("circle")
                .data(data).enter()
                .append("circle")
                .attr("cx", function(d){return projection([d.longitude, d.latitude])[0]})
                .attr("cy", function(d){return projection([d.longitude, d.latitude])[1]})
                .attr("r",radius)
                .style("fill", function(d){return c(d.specialty)})
                .style("stroke-width", strokeWidth)
                .on("click", function(d){console.log(d)});

        });  
        
        
    });
    
    

    
}
