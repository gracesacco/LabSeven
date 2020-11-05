Promise.all([ 
	d3.json('airports.json'),
	d3.json('world-110m.json')
]).then(data=>{ 
	let airports = data[0];
    let worldmap = data[1]; 
d3.selectAll("input[type=radio]").on("change", event=>{
    visType = event.target.value; 
    console.log(visType)
    drag(simulation).filter(event => visType === "force")
    switchLayout();
    });

const margin = ({top: 5, right: 5, bottom: 5, left: 0})
const width = 600 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;
var circleRadius = 10;
function sizeCircle(passengers){ return (Math.sqrt(passengers)/ 800); }


var svg = d3.select('#chart').append('svg')
    .attr("viewBox", [0,0,width+200,height - 50]) 
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .append('g')
    const features = topojson.feature(worldmap, worldmap.objects.countries).features;
    console.log("features", features);

    const projection = d3.geoMercator()
        .scale(100)
        .center([100, 0])

    const path = d3.geoPath()
        .projection(projection)
    svg.selectAll("path")
        .data(features)
        .join("path")
        .attr("fill", "#000000")
        .attr("d", path)

    svg.append("path")
        .datum(topojson.mesh(worldmap, worldmap.objects.countries))
        .attr("d", path)
        .attr('fill', 'none')
          .attr('stroke', 'white')
        .attr("class", "subunit-boundary");
    svg.selectAll("path").style("opacity", 0)

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d,i) { return i; }).distance(50))
    .force("charge", d3.forceManyBody().strength(-100))
    .force("center", d3.forceCenter(width/ 2, height/ 2));

var links = svg.append('g')
    .attr('class','links')
     .selectAll("line")
    .data(airports.links)
    .enter()
    .append("line");

var node = svg.append('g')
    .attr('class','nodes')
    .selectAll('circle')
    .data(airports.nodes)
    .enter()
    .append("circle")
    .attr("r", function(d) { return sizeCircle(d.passengers) })
    .attr('fill', "orange")
    .call(drag(simulation))
    .on("click", function(d){
        nodes_text.style("display", "flex")
    })

var nodes_text = svg.selectAll(".nodetext")
    .data(airports.nodes)
    .enter()
    .append("text")
    .attr("class", "nodetext slds-text-heading--label")
    .attr("text-anchor", "middle")
    .attr("font-size", 10)
    .attr("dx", -20)
    .attr("dy", 20)
    .style("display", "none")
    .text(function(d) {
        return  d.name;
    });
    simulation
            .nodes(airports.nodes)
            .on("tick", ticked);
    simulation
            .force("link")
            .links(airports.links);

    function ticked() {
        links
                .attr("x1", function (d) {
                    var xPos = d.source.x;
                    if (xPos < 0) return 0;
                    if (xPos > (width -  sizeCircle(d.passengers))) return (width - sizeCircle(d.passengers));
                    return xPos;
                })
                .attr("y1", function (d) {
                    var yPos = d.source.y;
                    if (yPos < 0) return 0;
                    if (yPos > (height - sizeCircle(d.passengers))) return (height - sizeCircle(d.passengers));
                    return yPos;
                })
                .attr("x2", function (d) {
                    var xPos = d.target.x;
                    if (xPos < 0) return 0;
                    if (xPos > (width - sizeCircle(d.passengers))) return (width - sizeCircle(d.passengers));
                    return xPos;
                })
                .attr("y2", function (d) {
                    var yPos = d.target.y;
                    if (yPos < 0) return 0;
                    if (yPos > (height - sizeCircle(d.passengers))) return (height - sizeCircle(d.passengers));
                    return yPos;
                });

        node
                .attr("cx", function (d) {
                    var xPos = d.x;
                    if (xPos < 0) return 0;
                    if (xPos > (width - circleRadius)) return (width - circleRadius);
                    return xPos;
                })
                .attr("cy", function (d) {
                    var yPos = d.y;
                    if (yPos < 0) return 0;
                    if (yPos > (height - sizeCircle(d.passengers))) return (height - sizeCircle(d.passengers));
                    return yPos;
                });
        nodes_text
                .attr("x", function(d) {
                    var xPos = d.x;
                    if (xPos < 0) return 0;
                    if (xPos > (width - sizeCircle(d.passengers))) return (width - sizeCircle(d.passengers));
                    return xPos;
                })
                .attr("y", function(d) {
                    var yPos = d.y;
                    if (yPos < 0) return 0;
                    if (yPos > (height - sizeCircle(d.passengers))) return (height - sizeCircle(d.passengers));
                    return yPos;
                })
        node.on("click", function(d){
            nodes_text.style("display", "flex")
        });
    }
    function drag(simulation){
    
    function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      
      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      
      return d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended);
    }
function switchLayout() {
    if (visType === "map") {
        simulation.stop();
        simulation.nodes(airports.nodes).on("tick", null)
        svg.select("nodes")
            .transition()
            .duration(1300)
        svg.select("links")
            .transition()
            .duration(1300)
        nodes_text.style("display", "none")
        node.transition().duration(1000)
                .attr("cx", function (d) {
                    var xPos = projection([d.longitude, d.latitude])[0];
                    if (xPos < 0) return 0;
                    if (xPos > (width - circleRadius)) return (width - circleRadius);
                    return xPos;
                })
                .attr("cy", function (d) {
                    var yPos = projection([d.longitude, d.latitude])[1];
                    if (yPos < 0) return 0;
                    if (yPos > (height - sizeCircle(d.passengers))) return (height - sizeCircle(d.passengers));
                    return yPos;
                });             
        links.transition().duration(1000)
                .attr("x1", function (d) {
                    var xPos = projection([d.source.longitude, d.source.latitude])[0];
                    if (xPos < 0) return 0;
                    if (xPos > (width -  sizeCircle(d.passengers))) return (width - sizeCircle(d.passengers));
                    return xPos;
                })
                .attr("y1", function (d) {
                    var yPos = projection([d.source.longitude, d.source.latitude])[1];
                    if (yPos < 0) return 0;
                    if (yPos > (height - sizeCircle(d.passengers))) return (height - sizeCircle(d.passengers));
                    return yPos;
                })
                .attr("x2", function (d) {
                    var xPos = projection([d.target.longitude, d.target.latitude])[0];
                    if (xPos < 0) return 0;
                    if (xPos > (width - sizeCircle(d.passengers))) return (width - sizeCircle(d.passengers));
                    return xPos;
                })
                .attr("y2", function (d) {
                    var yPos = projection([d.target.longitude, d.target.latitude])[1];
                    if (yPos < 0) return 0;
                    if (yPos > (height - sizeCircle(d.passengers))) return (height - sizeCircle(d.passengers));
                    return yPos;
                });
        nodes_text.transition().duration(1000)
                .attr("x", function(d) {
                    var xPos = projection([d.longitude, d.latitude])[0];
                    if (xPos < 0) return 0;
                    if (xPos > (width - sizeCircle(d.passengers))) return (width - sizeCircle(d.passengers));
                    return xPos;
                })
                .attr("y", function(d) {
                    var yPos = projection([d.longitude, d.latitude])[1];
                    if (yPos < 0) return 0;
                    if (yPos > (height - sizeCircle(d.passengers))) return (height - sizeCircle(d.passengers));
                    return yPos;
                });
        svg.selectAll("path").style("opacity", 1)
    } 

    else {
        simulation
            .nodes(airports.nodes)
            .on("tick", ticked);
        simulation
            .force("link")
            .links(airports.links);
            simulation.restart();
            svg.selectAll("path").style("opacity", 0)
    }
}

}) 