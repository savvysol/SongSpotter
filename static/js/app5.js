console.log('hello?')


var url = "/getdata";
d3.json(url , function(error, json) {
 
    if (error) return console.warn(error);

var data = json;

cover = data[13].artist.images[1].url
console.log(cover)

var artists = [];
data.forEach(function(r) {
    artists.push(r.artist.name);
});

var multiplier = 200/artists.length + 10;


var a = [], b = [], f = [], e = [], prev = "0";
artists.sort();
for ( var i = 0; i < artists.length; i++ ) {
    if ( artists[i] !== prev ) {
        a.push(artists[i]);
        b.push(1);
        f.push(1);
        e.push("image"+i)
    } else {
        b[b.length-1]++;
    }
    prev = artists[i];
}

console.log(a);
console.log(b);
  
var c = [];
  // the code you're looking for
  for (var j=0; j < a.length; j++){
    // iterate over each element in the array
    for (var i = 0; i < data.length; i++){
        // look for the entry with a matching `code` value
        if (data[i].artist.name == a[j]){
        // we found it
            // c.push(data[i].album.cover.url);
            cover = data[i].album.cover.url
            console.log(cover)
            c.push(cover)
            // c.push(data[i].artist.images[0].url)
            break;
        // obj[i].name is the matched result
        }
    }
}
console.log(c);
console.log(f);
console.log(e);

var newobj = [];

for(var i = 0; i < a.length; i++){
    var newitem = {};
    newitem["name"] = a[i];
    newitem["freq"] = b[i];
    newitem["artistimage"] = c[i];
    newitem["type"] = f[i];
    newitem["imagetag"] = e[i];
    newobj.push(newitem);

}

console.log(newobj);



var width = 800,
height = 600,
// separation between same-color nodes
padding = 1.5, 
// separation between different-color nodes
clusterPadding = 6, 
maxRadius = 12;

var color = d3.scale.ordinal()
  .range(["#7A99AC", "#E4002B"]);


newobj.forEach(function(d) {
d.freq = +d.freq;

});


//unique cluster/type id's
var cs = [];
newobj.forEach(function(d){
    if(!cs.includes(d.type)) {
        cs.push(d.type);
    }   
});

var n = newobj.length, // total number of nodes
m = cs.length; // number of distinct clusters
console.log(n)
console.log(m)
//create clusters and nodes
var clusters = new Array(m);
var nodes = [];
for (var i = 0; i<n; i++){
nodes.push(create_nodes(newobj,i));
}

var force = d3.layout.force()
.nodes(nodes)
.size([width, height])
.gravity(.02)
.charge(0)
.on("tick", tick)
.start();

var svg = d3.select("#plot2")
.append("svg")
.attr("height", "100%")
.attr("width", "100%")
.attr("viewBox", `0 0 ${width} ${height}`)
.attr("preserveAspectRatio", "xMidYMid meet");




var node = svg.selectAll("circle")
.data(nodes)
.enter().append("g").call(force.drag);

//BECKYS NEW IMAGES CODE1
var pat = d3.selectAll("g").append("defs")
// .attr("id", "mdef");

// var pat = d3.selectAll("defs").append("pattern")
// .attr("x", "-25%")
// .attr("y", "-50%")
// .attr("patternUnits", "userSpaceOnUse")
// .attr("id", "image1")
// .attr("width", "100%")
// .attr("height", "100%");

// var image1 = pat.append("image")
//     .attr("x", 0)
//     .attr("y", 0)
//     .attr("width", 500)
//     .attr("height", 500)
//     .attr("xlink:href", function(d){return d.imglink})
//     ;   
// END OF IMAGE CODE    



//BECKYS NEW IMAGES CODE 2
node.append("defs")
.attr("id", "mdef");

pat = node.append("pattern")
.attr("id", function(d){return d.circlefill})
.attr("x", function(d){return -1*d.radius})
.attr("y", function(d){return -1*d.radius})
.attr("patternUnits", "userSpaceOnUse")
.attr("width", "100%")
.attr("height", "100%");

pat.append("image")
.attr("x", 0)
.attr("y", 0)

    .attr("width", function(d){return 2*d.radius})
    .attr("height", function(d){return 2*d.radius})
    .attr("xlink:href", function(d){return d.imglink})
    ;   
// END OF IMAGE CODE  

node.append("circle")
    // .style("fill", function (d) {
    //  return color(d.cluster);
    //  })
     .attr("fill", function(d){return d.attributeforcirclefill})
     .attr("r", function(d){return d.radius});


node.append("text")
      .attr("dy", ".3em")
      .style("text-anchor", "middle")
      .style("font-size", function(d) {return d.radius/8 +8})
      .text(function(d) { return d.text.substring(0, d.radius / 3); });




function create_nodes(newobj,node_counter) {
var i = cs.indexOf(newobj[node_counter].type),
  r = Math.sqrt((i + 1) / m * -Math.log(Math.random())) * maxRadius,
  d = {
    cluster: i,
    radius: newobj[node_counter].freq*multiplier,
    text: newobj[node_counter].name,
    imglink: newobj[node_counter].artistimage,
    attributeforcirclefill: "url(#" + newobj[node_counter].imagetag +")",
    circlefill: newobj[node_counter].imagetag,
    x: Math.cos(i / m * 2 * Math.PI) * 200 + width / 2 + Math.random(),
    y: Math.sin(i / m * 2 * Math.PI) * 200 + height / 2 + Math.random()
  };
if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
return d;
};



function tick(e) {
node.each(cluster(10 * e.alpha * e.alpha))
    .each(collide(.5))
.attr("transform", function (d) {
    var k = "translate(" + d.x + "," + d.y + ")";
    return k;
})

}

// Move d to be adjacent to the cluster node.
function cluster(alpha) {
return function (d) {
    var cluster = clusters[d.cluster];
    if (cluster === d) return;
    var x = d.x - cluster.x,
        y = d.y - cluster.y,
        l = Math.sqrt(x * x + y * y),
        r = d.radius + cluster.radius;
    if (l != r) {
        l = (l - r) / l * alpha;
        d.x -= x *= l;
        d.y -= y *= l;
        cluster.x += x;
        cluster.y += y;
    }
};
}

// Resolves collisions between d and all other circles.
function collide(alpha) {
var quadtree = d3.geom.quadtree(nodes);
return function (d) {
    var r = d.radius + maxRadius + Math.max(padding, clusterPadding),
        nx1 = d.x - r,
        nx2 = d.x + r,
        ny1 = d.y - r,
        ny2 = d.y + r;
    quadtree.visit(function (quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== d)) {
            var x = d.x - quad.point.x,
                y = d.y - quad.point.y,
                l = Math.sqrt(x * x + y * y),
                r = d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
            if (l < r) {
                l = (l - r) / l * alpha;
                d.x -= x *= l;
                d.y -= y *= l;
                quad.point.x += x;
                quad.point.y += y;
            }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    });
};
};

Array.prototype.contains = function(v) {
for(var i = 0; i < this.length; i++) {
    if(this[i] === v) return true;
}
return false;
};

console.log(nodes)
});