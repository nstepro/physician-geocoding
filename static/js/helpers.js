/**
 * Created by Nick on 8/23/14.
 */


// DATE/NUMBER FORMATS
var dateFormat = "%m/%d/%Y %H:%M";
var dateFormatShortYear = "%m/%d/%y %H:%M";
var dateFormatSimple = "%m/%d/%Y";
var timeFormat = "%I:%M %p";
var inputDateFormat = "%m/%d/%Y";
var dateFormatSQL = "%Y-%m-%d";
var timeSimpleFormat = "%H:%M";
var tenCharFormat = "%Y%m%d";
var dateTimeFormatSQL = "%Y-%m-%d %H:%M:%S.%L";

var dateFormats = [tenCharFormat,dateFormat,dateFormatShortYear,dateFormatSimple,timeFormat,inputDateFormat,dateFormatSQL,timeSimpleFormat,dateTimeFormatSQL];

Date.prototype.addHours= function(h){
    this.setHours(this.getHours()+h);
    return this;
};


function parseDate(date, format){
    if (Object.prototype.toString.call(date) === "[object Date]")
    {
        return date;
    }
    else {
        return d3.timeParse(format)(date);
    }
}


function parseDateAll(data, dateField) {
    var curDateFormat;
    dateFormats.forEach(function(d){
        if (parseDate(data[0][dateField], d)!=null) {
            curDateFormat = d;
        }
    });
    if (typeof curDateFormat != 'undefined') {
        data.forEach(function(d){
            d[dateField] = parseDateFast(d[dateField], curDateFormat);
        });
    }
    return data;
}

var dateMap = {};
function parseDateFast(date,format){
    if (Object.prototype.toString.call(date) === "[object Date]")
    {
        return date;
    }
    else {
        if (typeof dateMap[date] == 'undefined') {
            dateMap[date] = d3.timeParse(format)(date);
        }
        return dateMap[date];
    }
    //    return d3.timeFormat(format).parse(date);
}

function parseDateSimple(date){
    if (Object.prototype.toString.call(date) === "[object Date]")
    {
        return date;
    }
    else {
        return d3.timeFormat(dateFormatSimple).parse(date);
    }
}

var formatDate = d3.timeFormat(dateFormat);
var formatDateSimple = d3.timeFormat(dateFormatSimple);
var formatTime = d3.timeFormat(timeFormat);
var formatCurrency = d3.format("$,.0f");
var formatInt = d3.format(",.0f");
var formatDecimal = d3.format(".1f");
var formatPct = d3.format(".0%");
function formatNum(n) {return n<10?formatDecimal(n):formatInt(n)}

function ordinalSuffix(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}


function getSundays(year) {
    var date = new Date(year, 0, 1);
    while (date.getDay() != 0) {
        date.setDate(date.getDate() + 1);
    }
    var days = [];
    while (date.getFullYear() == year) {
        var m = date.getMonth() + 1;
        var d = date.getDate();
        days.push(
                year + '-' +
                (m < 10 ? '0' + m : m) + '-' +
                (d < 10 ? '0' + d : d)
        );
        date.setDate(date.getDate() + 7);
    }
    return days;
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function dateOnly(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

var daysOfWeek = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];




// SIMPLE TOOLTIPS
var origColor;
var tooltipDiffX = 20;
var tooltipDiffY = -24;


function onHover(text, selector, tooltip, coords){

    tooltip.style("opacity",0);
    tooltip.style("visibility", "visible");
    if(typeof text !== 'undefined' && text !== null) { tooltip.html(text.toString()); }

    var x,y;
    if (typeof coords == 'undefined' || coords == null) {
        x = $(selector).offset().left + 40;
        y = $(selector).offset().top;
    } else {
        x = coords[0];
        y = coords[1];
    }

//    console.log([[x,y],[$(document).width(), $(document).height()]]);
    var orientPad = 400;    
    var bottomOrient = y>$(document).height()-orientPad
        , rightOrient = x>$(document).width()-orientPad;

    tooltip
        .style("top", bottomOrient?(($(document).height()-orientPad)+"px"):(y+"px"))
//        .style("bottom", bottomOrient?(20+"px"):null)
        .style("left", rightOrient?null:(x+"px"))
        .style("right", rightOrient?(20+"px"):null);
    
    tooltip.classed("right",rightOrient);

    tooltip.transition().duration(1000).style("opacity",1);
}

function offHover(object, tooltip){
    tooltip.style("visibility", "hidden");
    tooltip.style("opacity",0);
    if (object !== null) {
        object.style("fill", origColor);
    }
}

function showDetailBox(text, object, tooltip, top){
    tooltip.style("opacity", 0);
    tooltip.style("visibility", "visible");
    tooltip.transition().style("opacity", 1);
    tooltip.style("top",top+"px");
    tooltip.html(text.toString());
}


d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};





// SHOW/HIDE TRANSITIONS
function slowHide(object) {
    object.transition().style("opacity", 0).each("end", function() {
        object.classed("hidden", true);
    });
}
function slowShow(object) {
    object.classed("hidden", false);
    object.transition().style("opacity", 1);
}


// STRING HELPERS
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function camelToSpace(str) {
    return str
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, function(str){ return str.toUpperCase(); })
}

function replaceAll(find, replace, str) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function abbreviate(str, i) {
    var len = str.length;
    if (len > i) {
        str = str.substring(0, i) + "..."
    }
    return str;
}




// PERCENTILE
function getPercentile(data,field,pct){
    pct = pct<1?pct:pct/100;
    data.sort(function(a,b){return d3.ascending(a[field], b[field])});
    return data[Math.floor(data.length*pct)][field];
}

function getPercentRank(data,field, n) {
    var L = 0;
    var S = 0;
    var N = data.length

    for (var i = 0; i < data.length; i++) {
        if (data[i][field] < n) {
            L += 1
        } else if (data[i][field] === n) {
            S += 1
        } else {

        }
    }

    var pct = (L + (0.5 * S)) / N

    return pct
}

// CSV EXPORT
function csvExport(exportSet) {
    var keys = Object.keys(exportSet[0]);
    var csvContent = "data:text/csv;charset=utf-8,";
    var headerData = [];
    keys.forEach(function(d){
        headerData.push(d);
    });
    var dataString = headerData.join(",");
    csvContent += dataString+ "\n";
    exportSet.forEach(function(d, i){
        var rowData = [];
        keys.forEach(function(e){
            rowData.push(d[e])
        });
        dataString = rowData.join(",");
        csvContent += i < exportSet.length ? dataString+ "\n" : dataString;
    });
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "export.csv");

    link.click();
}

function jsonExport(exportSet) {
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportSet));
        var link = document.createElement("a");
        link.setAttribute("href", dataStr);
        link.setAttribute("download", "export.json");
        link.click();
        link.remove();
}





// GET SCREEN INFO
function getScreenInfo() {
    return {
        width: $(window).width(),
        height: $(window).height(),
        mediumScreen: $(window).width()<=768,
        smallScreen: $(window).width()<450,
        vOrient: $(window).height()>$(window).width()
    }
}



// GRADIENT BUILDER
function buildLinearGradient(svg,colors,angle) {
    angle = Math.min(angle,90);
    var id = "grad-"+getGuid();
    var lg = svg.append("defs").append("linearGradient").attr("id",id);
    lg.attr("x1","0%").attr("y1","0%").attr("x2",(100*(1-angle/90))+"%").attr("y2",(100*angle/90)+"%");
    colors.forEach(function(d,i){
        var c="rgb(0,0,0)",o=1;
        if (typeof d === 'object') {
            if (d.hasOwnProperty("o")) {o=d.o}
            if (d.hasOwnProperty("c")) {c=d.c}
        } else {
            c=d;
        }
        lg.append("stop").attr("offset",(i*100/(colors.length-1))+"%").style("stop-color", c).style("stop-opacity",o);
    });

    return id;

}

function getGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = crypto.getRandomValues(new Uint8Array(1))[0]%16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

function convertHex(hex,opacity){
    hex = hex.replace('#','');
    r = parseInt(hex.substring(0,2), 16);
    g = parseInt(hex.substring(2,4), 16);
    b = parseInt(hex.substring(4,6), 16);

    result = 'rgba('+r+','+g+','+b+','+opacity+')';
    return result;
}


// LINE/AREA BISECTOR
function addXBisector(svg,data,xScale,yScale,xName,yName,fn) {
    var bisectX = d3.bisector(function(d) { return d[xName]; }).left;

    var focus = svg.append("g")
        .attr("class", "focus")
        .style("display", "none");

    focus.append("circle")
        .attr("class","background")
        .attr("cx",2).attr("cy",2)
        .attr("r", 6);
    focus.append("circle")
        .attr("class","foreground")
        .attr("r", 6);
    focus.append("line")
        .attr("x1",0).attr("x2",0)
        .attr("y1",0).attr("y2",svg.style("height"));

    svg.append("rect")
        .attr("class", "overlay")
        .attr("width", svg.style("width"))
        .attr("height", svg.style("height"))
        .on("mousemove", mousemove)
        .on("mouseover",function(){focus.style("display", null); })
        .on("mouseout",function(){
            offHover(d3.select(this),d3.select("#tooltip"));
            focus.style("display", "none");
        });

    function mousemove() {
        var x0 = xScale.invert(d3.mouse(this)[0]),
            i = bisectX(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i],
            d = x0 - d0[xName] > d1[xName] - x0 ? d1 : d0;
        focus.attr("transform", "translate(" + xScale(d[xName]) + "," + yScale(d[yName]) + ")");
        if (typeof fn != 'undefined') {
            fn(d,this);
        } else {
            console.log(d);
        }

    }
}


jQuery.fn.d3Click = function () {
    console.log(this);
    this.each(function (i, e) {
        var evt = new MouseEvent("click");
        e.dispatchEvent(evt);
    });
};


// FILTERS
function buildDimMap(data, field, toggleAll) {
    toggleAll = typeof toggleAll == 'undefined' ? true : toggleAll;
    var output = {};
    var sorted = data.sort(function(a,b){return d3.ascending(a[field],b[field])});
    var nested = d3.nest().key(function(d){return d[field];}).entries(sorted);
    nested.forEach(function(d, i){
        if (typeof output[d.key] == 'undefined') {
            if (toggleAll) {output[d.key] = true;}
            else {output[d.key] = i == nested.length-1}
        }
    });
    return output;
}

function buildFilters(data, filterList, filterDiv, changeFunction) {

    var filterData = {};
    //
    //    filterList.forEach(function(d){
    //        filterData[d.name] = buildDimMap(data, d.name);
    //    });

    var filterCols = d3.max([Math.floor(12/filterList.length), 3]);

    filterList.forEach(function(d){
        var isDate = false;
        if (typeof d.date != 'undefined') {isDate = d.date}
        filterData[d.name] = buildDimMap(data, d.name,!isDate);

        var thisFilterDiv = filterDiv.append("div").attr("class","input-field col s12 m"+filterCols);
        var thisFilterSelect = thisFilterDiv.append("select").attr("class", d.name+"-select");
        thisFilterDiv.append("label").text(d.name);
        thisFilterSelect.append("option").attr("value","ALL").attr("selected",!isDate).text("ALL");

        var theseOptions = Object.keys(filterData[d.name]).sort(function(a,b){return d3.ascending(a,b)});
        if (isDate) {theseOptions = theseOptions.sort(function(a,b){return d3.ascending(new Date(a), new Date(b))})}
        theseOptions.forEach(function(e, j){
            var thisOption = thisFilterSelect.append("option").attr("value", e).text(isDate?formatDateSimple(new Date(e)):e);
            if (isDate){thisOption.attr("selected",j==0)}
        });
    });
    $('select').material_select();

    filterList.forEach(function(d){
        $("select."+d.name+"-select").change(function(){
            var selectedVal = $(this).val();
            Object.keys(filterData[d.name]).forEach(function(e){
                filterData[d.name][e] = e==selectedVal;
                if (selectedVal=="ALL") {filterData[d.name][e]=true}
            });
            changeFunction();
        });
    });

    return filterData;

}

function angleBetween(x1,y1,x2,y2) {
    // angle in degrees
    var angleRad = Math.atan2(y2 - y1, x2 - x1);
    var angleDeg = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    var distance = Math.pow(Math.pow(y2-y1,2)+Math.pow(x2-x1,2),.5);
    return {angleRad: angleRad, angleDeg: angleDeg, distance: distance};
}
function pointAtAngle(angle,length,x1,y1) {
    x1 = (typeof x1=="undefined"||x1==null)?0:x1;
    y1 = (typeof y1=="undefined"||y1==null)?0:y1;
    
    var x2 = Math.cos(angle*Math.PI/180)*length+x1;
    var y2 = Math.sin(angle*Math.PI/180)*length+y1;
    
    return {x1: x1, y1: y1, x2: x2, y2: y2};
    
}




// CORRELATION
function pearsonCorrelation(prefs, p1, p2) {
  var si = [];

  for (var key in prefs[p1]) {
    if (prefs[p2][key]) si.push(key);
  }

  var n = si.length;

  if (n == 0) return 0;

  var sum1 = 0;
  for (var i = 0; i < si.length; i++) sum1 += prefs[p1][si[i]];

  var sum2 = 0;
  for (var i = 0; i < si.length; i++) sum2 += prefs[p2][si[i]];

  var sum1Sq = 0;
  for (var i = 0; i < si.length; i++) {
    sum1Sq += Math.pow(prefs[p1][si[i]], 2);
  }

  var sum2Sq = 0;
  for (var i = 0; i < si.length; i++) {
    sum2Sq += Math.pow(prefs[p2][si[i]], 2);
  }

  var pSum = 0;
  for (var i = 0; i < si.length; i++) {
    pSum += prefs[p1][si[i]] * prefs[p2][si[i]];
  }

  var num = pSum - (sum1 * sum2 / n);
  var den = Math.sqrt((sum1Sq - Math.pow(sum1, 2) / n) *
      (sum2Sq - Math.pow(sum2, 2) / n));

  if (den == 0) return 0;

  return num / den;
}


function buildTooltipD3(d3Obj, data, cfg) {
        
        var coords = [d3.select(d3Obj).node().getBoundingClientRect().left, d3.select(d3Obj).node().getBoundingClientRect().top]
    
        var tableLayout = data.constructor === Array;
        var ttHolder = d3.select("#tooltip").html("");
        var w = tableLayout?550:320, h=120;
        var tt = ttHolder.append("div").style("width",w+"px");
    
        var header = tt.append("div").attr("class","row tt-header").append("div").attr("class","col s12 center-align")
            .append("h5").text(cfg.header);
    
        var b = tt.append("div").attr("class","row margin-bottom-0").append("div").attr("class","col s12 left-align");

    // TABULAR DATA
    if (tableLayout) {
        var table = b.append("table").attr("id", "tt-table");
        var tHead = table.append("thead");
        var tBody = table.append("tbody");
        for (prop in data[0]) {
            if (data[0][prop] instanceof Date) {data.forEach(function(d){d[prop]=formatDateSimple(d[prop])})}
            if (typeof cfg.ignore != 'undefined' && cfg.ignore.indexOf(prop)>-1) {
                data.forEach(function(d){delete d[prop]});
            } else { tHead.append("th").text(prop); }
        }
    
        $('#tt-table').dynatable({ 
            table: { headRowSelector:'thead' } 
            ,   features: {
                paginate: true,
                sort: true,
                pushState: true,
                search: false,
                recordCount: false,
                perPageSelect: false
              }
            , dataset: { records: data } });
    } else { // SPECIFIC DATA
        for (prop in data) {
            if (data[prop] instanceof Date) {data[prop]=formatDateSimple(data[prop])}
            console.log([cfg.format, prop, data[prop], cfg.format[prop]]);
            if (typeof cfg.format != 'undefined' && typeof cfg.format[prop] != 'undefined') {data[prop] = cfg.format[prop](data[prop])}
            if (typeof cfg.ignore != 'undefined' && cfg.ignore.indexOf(prop)<1) { 
                var b1 = b.append("p");
                b1.append("strong").text(prop + ": ");
                b1.append("span").text(data[prop]);
            }
        }
    }
    
   
        


        var links = tt.append("div").attr("class","row").append("div").attr("class","col s12 right-align");
        links.append("a").attr("class","clickable").text("Close")
            .on("click", function(){offHover(null,ttHolder)});

        onHover(null,null,ttHolder, coords);
}