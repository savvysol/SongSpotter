var margin = {top: 20, right: 30, bottom: 30, left: 40},
width = 960 - margin.left - margin.right,
height = 500 - margin.top - margin.bottom;
 
var x = d3.scale.ordinal()
.rangeRoundBands([0, width], .1);
 
var y = d3.scale.linear()
.range([height, 0]);
 
var xAxis = d3.svg.axis()
.scale(x)
.orient("bottom");
 
var yAxis = d3.svg.axis()
.scale(y)
.orient("left");
 
var chart = d3.select(".chart")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
 
var url = "/getdata";
d3.json(url , function(error, json) {
 
if (error) return console.warn(error);
 
var data = json;

data.forEach(function(d) {
    d.track.pop = +d.track.pop;
    });

x.domain(data.map(function(d) { return d.track.name; }));
 
y.domain([0, d3.max(data, function(d) { return d.track.pop; })]);

console.log(data[1].track.name)

chart.append("g")
.attr("class", "x axis")
.attr("transform", "translate(0," + height + ")")
.call(xAxis);
 
chart.append("g")
.attr("class", "y axis")
.call(yAxis);
 
chart.selectAll(".bar")
.data(data)
.enter()
.append("rect")
.attr("class", "bar")
.attr("id", function(d) { return 'bar' + d.track.name;})
.attr("x", function(d) { return x(d.track.name); })
.attr("y", function(d) { return y(d.track.pop); })
.attr("height", function(d) { return height - y(d.track.pop); })
.attr("width", x.rangeBand())
.attr("fill", function(d) { return "rgb(" + Math.round(d.track.pop * 1000) + ",10, 100)"; })
 
.on("click", function(d){
window.open(d.fb, '_blank', 'location=yes,height=600,width=960,scrollbars=yes,status=yes');
})
 
.on("mouseover", function(d) {
d3.select(this)
.transition()
.duration(50)
.attr("fill", "#CC0000");
 
//Get this bar's x/y values, then augment for the tooltip
var xPosition = parseFloat(d3.select(this).attr("x")) + x.rangeBand() / 2;
var yPosition = parseFloat(d3.select(this).attr("y")) / 2 + height / 2;
 
//Update the tooltip position and value
d3.select("#tooltip")
.style("left", xPosition + "px")
.style("top", yPosition + "px")
.select("#value")
.text(d.track.pop);
 
d3.select("#alfabet")
.text(d.track.name);
 
d3.select("#pic")
.data(data)
.attr("src",d.cover);
 
//Show the tooltip
d3.select("#tooltip").classed("hidden", false);
})
 
.on("mouseout", function() {
d3.select(this)
.transition()
.delay(100)
.duration(250)
.attr("fill", function(d) { return "rgb(" + Math.round(d.track.pop * 1000) + ",10, 100)"; })
 
//Hide the tooltip
d3.select("#tooltip").classed("hidden", true);
 
})
.append("title")
.text(function(d) {  return d.track.name + " popularity is " + d.track.pop;});
;
 
});
 
// function generate bar
function random_bar(data){
 
d3.selectAll(".bar")
.data(data)
.transition()
//.delay(500)
.duration(1000)
.ease("linear")
.attr("fill", function(d) { return "rgb(" + Math.round(d.track.pop * 1000) + ",10, 100)"; })
.attr("x", function(d) { return x(d.track.name); })
.attr("y", function(d) { return y(d.track.pop); })
.attr("height", function(d) { return height - y(d.track.pop); })
;
}
 


 