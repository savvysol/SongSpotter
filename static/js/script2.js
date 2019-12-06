  
  const margin = { top: 20, right: 20, bottom: 200, left: 40 };
  
  const W1 = 800;
  const H1 = 600;
  //const W1 = document.getElementById('chart').clientWidth
  //const H1 = W1/1.6;

  const width = W1 - margin.left - margin.right;
  const height = H1 - margin.top - margin.bottom;
  
  const xScale = d3.scaleBand().
  range([0, width]).
  round(true).
  paddingInner(0.2).
  paddingOuter(0.1); // space between bars (it's a ratio)
  
  const yScale = d3.scaleLinear().
  range([height, 0]);
  
  const xAxis = d3.axisBottom().
  scale(xScale);
  
  const yAxis = d3.axisLeft().
  scale(yScale).
  ticks(10);
  
  const svg = d3.select('#chart').
  append('svg').
  attr("height", "100%").
  attr("width", "100%").
  attr("viewBox", `0 0 ${W1} ${H1}`).
  attr("preserveAspectRatio", "xMidYMid meet").
  // attr('width', width + margin.left + margin.right).
  // attr('height', height + margin.top + margin.bottom).
  append('g').
  attr('transform', `translate(${margin.left}, ${margin.right})`);
  
  const tooltip = d3.select('body').append('div').
  attr('class', 'tooltip').
  style('opacity', 0);
  
  var url = "/getdata";
  d3.json(url , function(error, json) {
 
    if (error) return console.warn(error);
  
  data = json;

  // data.map(function(d) {
  //   d.track.pop = d.track.pop;
  //   });
  
  // console.log (data.map(data, d => d.track.pop));
  console.log (data[0]);

  xScale.
  domain(data.map(d => d.track.name));
  yScale.
  domain([0, 100]);
  
  svg.append('g').
  attr('class', 'x axis').
  attr('transform', `translate(0, ${height})`).
  call(xAxis)
  .selectAll("text")	
  .style("text-anchor", "end")
  .attr("dx", "-.8em")
  .attr("dy", ".15em")
  .attr("transform", "rotate(-65)")
  ;
  
  svg.append('g').
  attr('class', 'y axis').
  call(yAxis).
  append('text').
  attr('transform', 'rotate(-90)').
  attr('y', 6).
  attr('dy', '.71em').
  style('text-anchor', 'end').
  text('popularity');
  
  svg.selectAll('.bar').data(data).
  enter().
  append('rect').
  attr('class', 'bar').
  attr('x', d => xScale(d.track.name)).
  attr('width', xScale.bandwidth()).
  attr('y', d => yScale(d.track.pop)).
  attr('height', d => height - yScale(d.track.pop)).
  on('mouseover', d => {
    tooltip.transition()
    .duration(200)
    .style('opacity', 0.9);
    tooltip.html(`Track: ${d.track.name}<br>Artist: ${d.artist.name}<br>Popularity: ${d.track.pop}`).
    style('left', `${d3.event.layerX}px`).
    style('top', `${d3.event.layerY + 200}px`);
  }).
  on('mouseout', () => tooltip.transition().duration(500).style('opacity', 0));



  var totalpop = 0;
  var popvals = [];
  data.forEach(function(d) {
    popvals.push(d.track.pop);
    totalpop = totalpop + d.track.pop
  });
  var avgpop = totalpop/popvals.length;
  console.log(popvals);
  console.log(avgpop);

  // popdata={"avgpop":avgpop};
  // console.log(popdata[0].avgpop);


  caption = d3.selectAll("svg")
        .append("text");

  var textLabel = caption.attr("x", 500)
        .attr("y", 30)
        .text( "You are  " + avgpop+ "% basic")
        .attr("font-family", "Comfortaa")
        .attr("font-size", "20px")
        .attr("fill", "white");
  
});