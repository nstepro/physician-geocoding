var cfg = {
    specialties: []
    , sizeBubbles: true
    , colorMap: {}
    , bubbleSizes: [{r:4,n:"XS"},{r:8,n:"S"},{r:12, n:"M"},{r:16, n:"L"}, {r:20, n:"XL"}, {r:24, n:"XXL"}]
    , categories: []
    , maxFreqPct: .9
    , minFreqOptions: [{f:100,n:"100"}, {f:1000,n:"1K"}, {f:10000,n:"10K"}]
    , strokeWidth: .5
    , z: 1
    , combine: true
    , tooltipMaxShow: 10
    , pcpSpecialist: "All"
    , showColor: true
    , orgSelectOptions: ["BIDCO","Other","All"]
    , organization: "BIDCO"
}
cfg.maxBubbleRadius = cfg.bubbleSizes[2].r;
cfg.minFreq = cfg.minFreqOptions[0].f;

function draw(sessionId) {
    
    var organization = cfg.organization
        , selector = '#dashboard-holder';
    
    var w = $(selector).width()
        , h = w*.8;
    
    var svg = d3.select(selector).html("").append("svg")
        .style("width", w+"px")
        .style("height", h+"px");
    
    var wS = 3.407231221834032;
    
    var projection = d3.geoAlbersUsa().scale(16193).translate([-4600, 2000]).precision(0);
    var path = d3.geoPath().projection(projection);
    
    d3.json("/static/js/ma.topojson", function(error, ma){
        var holderG = svg.append("g").attr("id","geocode-holder")
//            .attr("transform", "translate(-7791.07507849761,1301.7143045704502) scale(3.407231221834032)")
        ;
        // BUILD MAP
        holderG.append("g").append("path").attr("class","census-blocks")
            .datum(topojson.mesh(ma))
            .attr("d",path)
            .style("stroke-width", cfg.strokeWidth+"px");
        
        // ZOOM LISTENERS
        var zoom = d3.zoom()
            .on('zoom', function(){holderG.attr("transform", d3.event.transform)})
            .on('end', function(){
                cfg.z = d3.event.transform.k;
                cfg.x = d3.event.transform.x;
                cfg.y = d3.event.transform.y;
                d3.selectAll(".census-blocks").style("stroke-width", (cfg.strokeWidth*.5/cfg.z)+"px");
                d3.selectAll("circle.provider")
                    .attr("r", function(){
                        return d3.select(this).attr("absR")/cfg.z
                    })
                    .style("stroke-width", (cfg.strokeWidth/cfg.z)+"px");
            });
        
        svg.call(zoom);
        
        
//        GET PROVIDERS
        var url = "/getProviders/" + organization + '/' + cfg.minFreq + '/';
        d3.json(url, function(error, rawData) {
            
            buildSpecialtyFilter(rawData);
            buildFilters(rawData, projection);
//            var data = ;
            buildBubbles(prepData(rawData), projection);
            
            d3.selectAll("#specialty-filter div").on("click", function(){
                var enabled, spec = d3.select(this);
                cfg.specialties.forEach(function(dd){if(dd.name==spec.attr("data-val")){
                    dd.enabled=!dd.enabled;
                    spec.style("background-color", dd.enabled?dd.color:null);
                    buildBubbles(prepData(rawData), projection);
                }})
            });

        });  
        
        
    });
    
}

function buildFilters(rawData, projection) {
    buildPCPSpecialistFilter();
    buildShowIndivProvidersFilter();
    buildBubbleSizeFilter();
    buildShowColorFilter();
    buildMinFreqFilter();
    buildOrgSelectFilter();
    buildScaleBubblesFilter();
    
    // PCP SPECIALIST
    function buildPCPSpecialistFilter() {
        var div = d3.select("#pcp-specialist-filter .filter-content").html("");
        div.append("a").attr("class","arc-btn").attr("href","#!").text("PCP").attr("data-val", "PCP");
        div.append("a").attr("class","arc-btn").attr("href","#!").text("Specialist").attr("data-val", "Specialist");
        div.append("a").attr("class","arc-btn").attr("href","#!").text("All").attr("data-val", "All");
        div.selectAll("a")
            .each(function(){
                d3.select(this)
                    .classed("selected", d3.select(this).attr("data-val")==cfg.pcpSpecialist)
            })
            .on("click", function(){
                div.selectAll("a").classed("selected", false);
                d3.select(this).classed("selected", true);
                cfg.pcpSpecialist = d3.select(this).attr("data-val");
                buildBubbles(prepData(rawData), projection);
            });
    }

    // SHOW INDIV PROVIDERS
    function buildShowIndivProvidersFilter() {
        var div = d3.select("#show-providers-filter .filter-content").html("");
        div.append("a").attr("class","arc-btn")
            .attr("href","#!").text("Providers").attr("data-val", "Providers")
            .classed("selected", !cfg.combine);
        div.append("a").attr("class","arc-btn").attr("href","#!").text("Locations").attr("data-val", "Locations")
            .classed("selected", cfg.combine);
        div.selectAll("a").on("click", function(){
                div.selectAll("a").classed("selected", false);
                d3.select(this).classed("selected", true);
                cfg.combine = d3.select(this).attr("data-val") == "Locations";
                buildBubbles(prepData(rawData), projection);
        });
    }
    
    function buildBubbleSizeFilter() {
        var div = d3.select("#bubble-size-filter .filter-content").html("");
        cfg.bubbleSizes.forEach(function(d){
            div.append("a").attr("class","arc-btn").attr("href","#!")
                .text(d.n).attr("data-val", d.r)
                .classed("selected", d.r==cfg.maxBubbleRadius)
                .on("click", function(){
                    div.selectAll("a").classed("selected", false);
                    d3.select(this).classed("selected", true);
                    cfg.maxBubbleRadius = d3.select(this).attr("data-val");
                    buildBubbles(prepData(rawData), projection);
                })
        })
    }
    
    function buildShowColorFilter() {
        var div = d3.select("#show-hide-colors-filter .filter-content").html("");
        div.append("a").attr("class","arc-btn").attr("href","#!").text("Color").attr("data-val", "Color");
        div.append("a").attr("class","arc-btn").attr("href","#!").text("White").attr("data-val", "White");
        div.selectAll("a")
            .each(function(){
                d3.select(this)
                    .classed("selected", d3.select(this).attr("data-val")==(cfg.showColor?"Color":"White"))
            })
            .on("click", function(){
                div.selectAll("a").classed("selected", false);
                d3.select(this).classed("selected", true);
                cfg.showColor = d3.select(this).attr("data-val")=="Color";
                buildBubbles(prepData(rawData), projection);
            });
    }
    
    function buildScaleBubblesFilter() {
        
        var div = d3.select("#scale-bubbles-filter .filter-content").html("");
        div.append("a").attr("class","arc-btn").attr("href","#!").text("Yes").attr("data-val", "Yes");
        div.append("a").attr("class","arc-btn").attr("href","#!").text("No").attr("data-val", "No");
        div.selectAll("a")
            .each(function(){
                d3.select(this)
                    .classed("selected", d3.select(this).attr("data-val")==(cfg.sizeBubbles?"Yes":"No"))
            })
            .on("click", function(){
                div.selectAll("a").classed("selected", false);
                d3.select(this).classed("selected", true);
                cfg.sizeBubbles = d3.select(this).attr("data-val")=="Yes";
                buildBubbles(prepData(rawData), projection);
            });
    }
    
    function buildMinFreqFilter() {
        var div = d3.select("#min-freq-filter .filter-content").html("");
        cfg.minFreqOptions.forEach(function(d){
            div.append("a").attr("class","arc-btn").attr("href","#!")
                .text(d.n).attr("data-val", d.f)
                .classed("selected", d.f==cfg.minFreq)
                .on("click", function(){
                    div.selectAll("a").classed("selected", false);
                    d3.select(this).classed("selected", true);
                    cfg.minFreq = d3.select(this).attr("data-val");
                    buildBubbles(prepData(rawData), projection);
                })
        });   
    }
    
    function buildOrgSelectFilter() {
        var div = d3.select("#org-select-filter .filter-content").html("");
        cfg.orgSelectOptions.forEach(function(d){
            div.append("a").attr("class","arc-btn").attr("href","#!")
                .text(d).attr("data-val", d)
                .classed("selected", d==cfg.organization)
                .on("click", function(){
                    div.selectAll("a").classed("selected", false);
                    d3.select(this).classed("selected", true);
                    cfg.organization = d3.select(this).attr("data-val");
                    draw();
                })
        });   
    }

        
}

function prepData(rawData) {
    
    var filteredSpecialties = [];
    cfg.colorMap = {};
    cfg.specialties.filter(function(d){return d.enabled==true}).forEach(function(d){filteredSpecialties.push(d.name)});
    cfg.specialties.forEach(function(d){cfg.colorMap[d.name] = d.color});
    
    var filteredData = rawData.filter(function(d){
        return filteredSpecialties.indexOf(d.specialty)>=0
            && d.freq >= cfg.minFreq
            ;
    });
    
    console.log(filteredData);
    
    if (cfg.pcpSpecialist!="All") {
        filteredData = filteredData.filter(function(d){
            return d.categoryName == cfg.pcpSpecialist;
        })
    }
    
//    One Row Per Location (when Combine flag set)
    var data = [];
    
    if (cfg.combine) {
        var locData = d3.nest().key(function(d){
            return d.latitude + ", " + d.longitude
        }).key(function(d){return d.reportName})
        .key(function(d){return d.specialty}).entries(filteredData);

        locData.forEach(function(loc, i){
            var addresses = [];
            loc.latitude = loc.values[0].values[0].values[0].latitude;
            loc.longitude = loc.values[0].values[0].values[0].longitude;
            loc.values.forEach(function(prov){
                prov.specialties = [];
                prov.values.forEach(function(spec){
                    prov.specialties.push(spec.key);
                    spec.values.forEach(function(v){addresses.push(v.streetAddress + ", " + v.city + ", " + v.state)});
                });
                prov.freq = prov.values[0].values[0].freq;
                prov.npi = prov.values[0].values[0].npi;
                prov.name = prov.key;
            });
            var addressNest = d3.nest().key(function(d){return d}).entries(addresses);
            addressNest.sort(function(a,b){return d3.descending(a.values.length, b.values.length)});
            loc.name = addressNest[0].key;
            loc.freq = loc.values.length;
            
            data.push({
                id: i
                , freq: loc.freq
                , location: loc.name
                , geo: {realLatitude: loc.latitude, realLongitude: loc.longitude}
                , values: loc.values
            });
            
        });
        
    } else {
        var provLocData = d3.nest()
            .key(function(d){return d.reportName + ", " + d.latitude + ", " + d.longitude})
            .key(function(d){return d.specialty})
            .entries(filteredData);
        provLocData.forEach(function(prov, i){
            var addresses = [], specialties = [];
            prov.freq = prov.values[0].values[0].freq;
            prov.npi = prov.values[0].values[0].npi;
            prov.name = prov.values[0].values[0].reportName;
            prov.geo = {realLatitude: prov.values[0].values[0].latitude, realLongitude: prov.values[0].values[0].longitude}
            prov.values.forEach(function(spec){
                specialties.push(spec.key);
                spec.values.forEach(function(v){
                    addresses.push(v.reportName + " \n(" + v.streetAddress + ", " + v.city + ", " + v.state + ")");
                });
            });
            
            var addressNest = d3.nest().key(function(d){return d}).entries(addresses);
            addressNest.sort(function(a,b){return d3.descending(a.values.length, b.values.length)});
            prov.location = addressNest[0].key;
            
            data.push({
                id: i
                , freq: prov.freq
                , location: prov.location
                , geo: prov.geo
                , values: [{
                    name: prov.name
                    , npi: prov.npi
                    , freq: prov.freq
                    , specialties: specialties
                }]
            })
        })
    }
    
    function setGeoAttributes(data) {
        // RANDOMIZE LOCATION
        data.forEach(function(d){
            if (cfg.combine) {
                d.geo.latitude = +d.geo.realLatitude;
                d.geo.longitude = +d.geo.realLongitude;
            } else {
                var angle = Math.random()*Math.PI*2;
                d.geo.latitude = +d.geo.realLatitude + Math.random()*.001*(Math.random()>.5?-1:1)*Math.cos(angle); 
                d.geo.longitude = +d.geo.realLongitude + Math.random()*.001*(Math.random()>.5?-1:1)*Math.sin(angle);    
            }
            
        });
        // FIND NEARBY
        data.forEach(function(d){
            d.nearbySet = data.filter(function(dd){
                return Math.pow(d.geo.realLatitude - dd.geo.realLatitude, 2) + Math.pow(d.geo.realLongitude - dd.geo.realLongitude, 2) <= Math.pow(.001, 2) && d.id != dd.id; 
            });
        });
        return data;
    }
    
    function setColor(data) {
        data.forEach(function(d){
            var specialties = [];
            d.values.forEach(function(prov){
                prov.specialties.forEach(function(spec){
                    specialties.push({"specialty": spec, "freq": prov.freq});
                });
            });
            var specNest = d3.nest().key(function(d){return d.specialty}).entries(specialties);
            specNest.forEach(function(d){d.freq = d3.sum(d.values, function(dd){return dd.freq})});
            var totalFreq = d3.sum(specNest, function(d){return d.freq});
            var colors = [];
            specNest.forEach(function(d){
                colors.push(chroma(cfg.colorMap[d.key]).alpha(d.freq/totalFreq));
            });
            d.color = cfg.showColor?chroma(chroma.average(colors)).alpha(1):"#FFFFFF";
        })
        return data;
    }
    
    
    data = setGeoAttributes(data);
    data = setColor(data);
    cfg.maxFreq = getPercentile(data, "freq", cfg.maxFreqPct)
    
    return data;
    
}

function buildBubbles(data, projection, zoom){
    
    var rScale = d3.scalePow(cfg.combine?.8:.3).range([2, cfg.maxBubbleRadius]).domain([0, cfg.maxFreq]);
    
    var rptData = {};

    d3.selectAll(".provider-plots").remove();
    var g = d3.select("#geocode-holder").append("g").attr("class","provider-plots");
    g.selectAll("circle")
        .data(data).enter()
        .append("circle").attr("class",function(d){return "provider prov-"+d.id})
        .attr("cx", function(d){return projection([d.geo.longitude, d.geo.latitude])[0]})
        .attr("cy", function(d){return projection([d.geo.longitude, d.geo.latitude])[1]})
        .style("stroke-width", cfg.strokeWidth/cfg.z)
        .attr("absR", function(d){
            if (cfg.sizeBubbles) {
                return rScale(d.freq>cfg.maxFreq?cfg.maxFreq:d.freq)
            } else {return cfg.maxBubbleRadius}
        })
        .attr("r", function(){return d3.select(this).attr("absR")/cfg.z})
        .style("fill", function(d){return d.color})
        .on("click", function(d){
            console.log(d);
            locationSummary(d, ".prov-"+d.id)
//            var xDiff = $("#dashboard-holder").width()/2-$(".prov-"+d.id).offset().left;
//            zoom.translateBy(d3.select("#geocode-holder"), xDiff,0);
        
        });
}

function buildSpecialtyFilter(data) {
    var colorGroup = ["#1abc9c", "#2ecc71", "#3498db", "#9b59b6", "#34495e"
                    , "#f1c40f", "#e67e22", "#e74c3c", "#ecf0f1", "#95a5a6"
                     , "#795548", "#9E9E9E", "#3F51B5", "#00BCD4", "#E91E63"]
    
    var specialtyNest = d3.nest().key(function(d){return d.specialty})
        .key(function(d){return d.npi})
        .entries(data).filter(function(d){return d.values.length>50});
    specialtyNest.sort(function(a,b){return d3.descending(a.values.length, b.values.length)});
    
    var div = d3.select("#specialty-filter .filter-content").html("");
    
    specialtyNest.forEach(function(d, i){
        var c = colorGroup[i%colorGroup.length];
        cfg.specialties.push({
            name: d.key
            , enabled: i<5
            , color: c
        });
        div.append("div").text(function(){
            return d.key + ' ('+d.values.length+')';
        }).attr("data-val", d.key).style("background-color", i<5?c:null);
    });
}

function locationSummary(data, selector) {
    
        var tt = d3.select("#info-pane .content").html("");
        var header = tt.append("div").attr("class","row info-header").append("div")
            .attr("class","col s12 center-align")
            .append("h5").attr("class","info-header").text(data.location);
        var links = tt.append("div").attr("class","row").append("div").attr("class","col s12 center-align");
        var b = tt.append("div").attr("class","row").append("div").attr("class","col s12 left-align");
        var provList = b.append("div");
        function drawProviders(providers, maxShow) {
            provList.html("");    
            providers.sort(function(a,b){return d3.descending(a.freq, b.freq)});
            providers.forEach(function(d, i){
                if (i<maxShow) {
                    var b1 = provList.append("div").attr("class","info-list-item")
                    b1.append("p").attr("class","info-list-main")
                        .append("a").attr("href", "https://www.google.com/search?q=NPI+"+d.npi)
                        .attr("target", "_blank")
                        .text(d.name + " (" + d.npi + ")");
                    var specTags = b1.append("p").attr("class","info-spec-tags");
                    d.specialties.forEach(function(spec, i){
                        specTags.append("span")
                            .style("border-left-color", cfg.colorMap[spec])
                            .text(spec + (i<d.specialties.length-1?", ":""));
                    });
                }
            });
            if (providers.length>maxShow) {
                provList.append("p").append("a").attr("href","#!")
                    .text("+ " + (providers.length-maxShow) + " more")
                    .on("click", function(){drawProviders(providers, providers.length)});
            }   
        }
        
       drawProviders(data.values, cfg.tooltipMaxShow)
                   

        b.append("div").attr("class","separator-small");
        
        links.append("a").attr("class","clickable").text("Close")
            .on("click", function(){
                d3.select("#info-pane").classed("hidden", true);
                d3.select("#dashboard-holder").classed("small",false);
                d3.selectAll("circle.provider").classed("selected", false);
            });

        d3.select("#info-pane").classed("hidden", false);
        d3.select("#dashboard-holder").classed("small",true);
        d3.selectAll("circle.provider").classed("selected", function(){return d3.select(this).classed(selector.replace(".",""))});
    
    
}