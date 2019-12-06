const WIDTH = 1200;
const HEIGHT = 560;
const FORCE_STRENGTH = 0.03;
const VELOCITY_DECAY = 0.2;
const RADIUS = 4;
let margin = {
    top: 0,
    left: 15,
    right: 15,
    bottom: 0
}

let svg = d3.select("#canvas")
            .append("svg")
            .attr("height", "100%")
            .attr("width", "100%")
            .attr("viewBox", `0 0 ${WIDTH} ${HEIGHT}`)
            .attr("preserveAspectRatio", "xMidYMid meet");

let g = svg.append("g")
           .attr("transform", `translate(${margin.left}, ${margin.top})`);

let nodes = [];


let circles = g.selectAll(".bubble");
let labels = g.selectAll(".label");
let label_pos = {};
let curr_key = null;
let show_labels = true;

let simulation = d3.forceSimulation()
            .velocityDecay(VELOCITY_DECAY)
            .force('charge', d3.forceManyBody().strength(charge))
            .on("tick", ticked);

let tip = d3.tip()
            .attr("class", "d3-tip")
            .html(function(d) { return `${d.name} - ${d.artist}`});

g.call(tip); 


initChart("artist", "treemap");
// initChart("data/songs2018.csv", "artist", "treemap");

document.getElementById("artist").addEventListener("click", () => {
    groupBy("treemap", "artist");
});

document.getElementById("album").addEventListener("click", () => {
    groupBy("treemap", "album");
});

document.getElementById("danceability").addEventListener("click", () => {
    displayBeeswarm("danceability", 0, 1);
});

document.getElementById("energy").addEventListener("click", () => {
    displayBeeswarm("energy", 0, 1);
});

document.getElementById("valence").addEventListener("click", () => {
    displayBeeswarm("valence", 0, 1);
});

document.getElementById("speechiness").addEventListener("click", () => {
    displayBeeswarm("speechiness", 0, 1);
});

document.getElementById("acousticness").addEventListener("click", () => {
    displayBeeswarm("acousticness", 0, 1);
});

let buttons = document.querySelectorAll("button");
buttons.forEach((elem) => {
  elem.addEventListener("click", (e) => {
    let curr = document.querySelector("button.active");
    curr.classList.remove("active");

    e.target.classList.add("active");
  });
});

function initChart(key, centerMethod) {
    curr_key = key;
    var url = "/getdata";
    
    d3.json(url , function(error, json) {
        if (error) return console.warn(error);
    
        data = json;
        
        data.map(function(d) {
            d.track.features.danceability = +d.track.features.danceability;
            d.track.features.energy = +d.track.features.energy;
            d.track.features.valence = +d.track.features.valence;
            d.track.features.speechiness = +d.track.features.speechiness;
            d.track.features.acousticness = +d.track.features.acousticness;
            });

    
        var newobj = [];

        for(var i = 0; i < data.length; i++){
            var newitem = {};
            newitem["radius"] = 4;
            newitem["index"] = i;
            newitem["name"] = data[i].track.name;
            newitem["artist"] = data[i].artist.name;
            newitem["album"] = data[i].album.name;
            newitem["acousticness"] = data[i].track.features.acousticness;
            newitem["danceability"] = data[i].track.features.danceability;
            newitem["energy"] = data[i].track.features.energy;
            newitem["speechiness"] = data[i].track.features.speechiness;
            newitem["valence"] = data[i].track.features.valence;
            newobj.push(newitem);
            console.log(newitem);
        };
        
        for (var i = 0; i<data.length; i++){
            nodes.push(create_nodes(newobj,i));
            }

        let centers = getCenters(centerMethod, key);

        simulation.force('charge', d3.forceManyBody().strength(charge))
                  .force('x', d3.forceX().strength(FORCE_STRENGTH).x((d) => nodePos(d, centers, key).x))
                  .force('y', d3.forceY().strength(FORCE_STRENGTH).y((d) => nodePos(d, centers, key).y));    

        circles = g.selectAll('.bubble')
                    .data(nodes)
                    .enter()
                    .append("circle")
                    .attr("r", (d) => d.radius)
                    .attr("class", "bubble")
                    .on("mouseover", tip.show)
                    .on("mouseout", tip.hide);
        
        
        simulation.nodes(nodes);
    });
}

function create_nodes(newobj,node_counter) {
    var d = {
        radius: 4,
        index: node_counter,
        name: data[node_counter].track.name,
        artist: data[node_counter].artist.name,
        album: data[node_counter].album.name,
        acousticness: data[node_counter].track.features.acousticness,
        danceability: data[node_counter].track.features.danceability,
        energy: data[node_counter].track.features.energy,
        speechiness: data[node_counter].track.features.speechiness,
        valence: data[node_counter].track.features.valence
      };
    return d;
    };

function groupBy(centerMethod, key) {
    curr_key = key; 
    show_labels = true;

    // delete all labels
    d3.selectAll(".label").remove();
    d3.selectAll(".axis").remove();

    let centers = getCenters(centerMethod, key);

    simulation.force('charge', d3.forceManyBody().strength(charge))
              .force('x', d3.forceX().strength(FORCE_STRENGTH).x((d) => nodePos(d, centers, key).x))
              .force('y', d3.forceY().strength(FORCE_STRENGTH).y((d) => nodePos(d, centers, key).y));

    simulation.alpha(1).restart();
}

// includes overlap of particles
function displayByScale(key, min, max) {
    curr_key = key
    show_labels = false;

    // clear labels
    d3.selectAll(".label").remove();
    d3.selectAll(".axis").remove();

    if (min === undefined) { min = d3.min(nodes, (d) => d[key]); }
    if (max === undefined) { max = d3.max(nodes, (d) => d[key]); }

    let scale = d3.scaleLinear()
                  .domain([min, max])
                  .range([0, WIDTH]);

    simulation.force('charge', null)
              .force('x', d3.forceX().strength(FORCE_STRENGTH).x((d) => scale(d[key])))
              .force('y', d3.forceY().strength(FORCE_STRENGTH).y( HEIGHT / 2 ));
    
    simulation.alpha(1).restart();

    g.append("g")
     .attr("transform", `translate(0, ${HEIGHT/2})`)
     .call(d3.axisBottom(scale))
     .attr("class", "axis");
}

// beeswarm plot, add collision to avoid overlap
function displayBeeswarm(key, min, max) {
    curr_key = key
    show_labels = false;

    // clear labels
    d3.selectAll(".label").remove();
    d3.selectAll(".axis").remove();

    if (min === undefined) { min = d3.min(nodes, (d) => d[key]); }
    if (max === undefined) { max = d3.max(nodes, (d) => d[key]); }

    let scale = d3.scaleLinear()
                  .domain([min, max])
                  .range([0, WIDTH]);

    simulation.force("charge", null)
              .force('x', d3.forceX().strength(FORCE_STRENGTH).x((d) => scale(d[key])))
              .force('y', d3.forceY().strength(FORCE_STRENGTH).y( HEIGHT / 2 ))
              .force("collide", d3.forceCollide(4));

    simulation.alpha(1).restart();

    // todo: maybe back the transform y more robust instead of just offsetting by 50?
    g.append("g")
     .attr("transform", `translate(0, ${HEIGHT/2 + 50})`)
     .call(d3.axisBottom(scale))
     .attr("class", "axis");
}

function ticked() {
    circles.attr("cx", (d) => d.x)
           .attr("cy", (d) => d.y);

    // show labels once movement has stabilized
    let max_velocity = d3.max(nodes, (d) => Math.max(d.vx, d.vy));
    if (show_labels && d3.selectAll(".label").empty() && max_velocity < 0.3) {
        showLabels(curr_key);
    }
}

function charge(d) {
    return -Math.pow(d.radius, 2.0) * FORCE_STRENGTH; 
}

function getCenters(centerMethod, key) {
    if (centerMethod === "radial") {
        let children = getRadialChildren(nodes, key);

        let centers = {}
        children.forEach((elem) => {
            centers[elem.id] = {
                x: elem.x,
                y: elem.y
            }
        });

        return centers;
    } else if (centerMethod === "treemap") {
        let children = getTreemapChildren(nodes, key);

        let centers = {}
        children.forEach((elem) => {
            centers[elem.id] = {
                x: (elem.x0 + elem.x1) / 2,
                y: (elem.y0 + elem.y1) / 2
            }
        });
    
        return centers;
    }
}

function getRadialChildren(data, key) {
    let counts = d3.nest()
                   .key((d) => d[key])
                   .rollup((v) => v.length)
                   .entries(data);

    counts = counts.map((entry) => {
        return { 
            name: entry.key,
            size: entry.value
        }
    });

    counts.push({name: "root"});

    let stratify = d3.stratify()
                     .parentId((d) => {
                         if (d.name === "root") {
                             return null;
                         }
                         return "root";
                     })
                     .id((d) => d.name);
    
    let root = stratify(counts)
                .sum((d) => Math.sqrt(d.size))
                .sort((a, b) => {
                    return b.size - a.size;
                });
    
    let pack = d3.pack().size([WIDTH, HEIGHT])
                 .padding(20);

    let children = pack(root).descendants();

    return children;
}

function getTreemapChildren(data, key) {
    let counts = d3.nest()
                   .key((d) => d[key])
                   .rollup((v) => v.length)
                   .entries(data);

    counts = counts.map((entry) => {
        return { 
            name: entry.key,
            size: entry.value
        }
    });

    counts.push({name: "root"});

    let stratify = d3.stratify()
                     .parentId(function(d) {
                         if (d.name === "root") {
                             return null;
                         }
                         return "root";
                     })
                     .id(function(d) { 
                         return d.name;
                     });
    
    let root = stratify(counts)
                .sum((d) => Math.sqrt(d.size))
                .sort((a, b) => {
                    return b.size - a.size;
                });

    let treemap = d3.treemap()
                    .size([WIDTH, HEIGHT])
                    .tile(d3.treemapSquarify.ratio(1))
                    .paddingOuter(50);
    treemap(root);
    
    return root.children;
}

function nodePos(d, centers, key) {
    return centers[d[key]];
}

function updateLabelPos(key) {
    label_pos = {};

    let agg = d3.nest()
                .key((d) => d[key])
                .rollup((v) => {
                    return {
                        x: d3.mean(v, (d) => d.x),
                        y: d3.max(v, (d) => d.y) + 15
                    }
                })
                .entries(nodes);

    agg.forEach((elem) => {
        label_pos[elem.key] = {
            x: elem.value.x,
            y: elem.value.y
        }
    });
}

function showLabels(key) {
    updateLabelPos(key);
    labels = g.selectAll(".label")
              .data(Object.keys(label_pos))
              .enter()
              .append("text")
              .style("font-size","12px")
              .attr("class", "label")
              .attr("x", (d) => label_pos[d].x)
              .attr("y", (d) => label_pos[d].y)
              .text((d) => d)
              .call(wrap, 75);
}

// Mike Bostock's text wrapping function lol
function wrap(text, width) {
    text.each(function () {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            x = text.attr("x"),
            y = text.attr("y"),
            dy = 0, //parseFloat(text.attr("dy")),
            tspan = text.text(null)
                        .append("tspan")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan")
                            .attr("x", x)
                            .attr("y", y)
                            .attr("dy", ++lineNumber * lineHeight + dy + "em")
                            .text(word);
            }
        }
    });
}