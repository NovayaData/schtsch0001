const container = d3.select('#container')

const colors = {
    "единая россия": "#00ace5",
    "лдпр": "#ffed26",
    "кпрф": "#bf381d",
    "справедливая россия": "#ee9100",
    "яблоко": "#25d818",
    "Без или др": "#e3e4e5"
};

const stars = {
    "1.5": "*",
    "2.5": "**",
    "3.5": "***",
    "4.5": "****",
    "5.5": "*****",
};

var W = container.node().getBoundingClientRect().width,
    H = container.node().getBoundingClientRect().height;

var width = W,
    height = H,
    pw = 100 / W,
    ph = 100 / H;

const svg = container
    .append('svg')
        .attr("viewBox", "0 0 " + width + " " + height )
        .attr('width', width)
        .attr('height', height)
        .attr("preserveAspectRatio", "xMidYMid meet");

var points = ["5", "4", "3", "2", "1"]

// function centroid(nodes) {
//     let x = 0;
//     let y = 0;
//     let z = 0;
//     for (const d of nodes) {
//         let k = (d.times * 0.9 + 4) ** 2;
//         x += d.x * k;
//         y += d.y * k;
//         z += k;
//     }
//     return {x: x / z, y: y / z};
// };

// function forceCluster() {
//     const strength = 0.2;
//     let nodes;

//     console.log( centroid );

//     function force(alpha) {

//         const centroids = d3.rollup(nodes, centroid, d => {
//             return d.party_name_clean;
//         });
//         const l = alpha * strength;

//         for (const d of nodes) {
//             // console.log(centroids.get(d.party_name_clean));
//             const {x: cx, y: cy} = centroids.get(d.party_name_clean);
//             d.vx -= (d.x - cx) * l;
//             d.vy -= (d.y - cy) * l;
//         }
//     }

//     force.initialize = _ => nodes = _;

//     return force;
// };

var centerScale = d3.scalePoint().domain( points ).range([0, height-H*0.1]).padding(3),
    forceStrength = 0.5;

var simulation = d3.forceSimulation()
    .force("collide", d3.forceCollide(d => { return d.times * 0.9 + 4; }))
    .force("y", d3.forceY().y( d => { return centerScale(d.allIn_rank); } ).strength(0.1))
    .force("x", d3.forceX().x( width / 2 ).strength(0.4))
    // .force('center', d3.forceY().y( d => { return centerScale(d.allIn_rank); } ))
    .force("charge", d3.forceManyBody() );
    // .force("cluster", forceCluster());

function addLeg(pos, text) {
    svg.append("text")
        .attr("y", d => {
            return centerScale(pos);
        })
        .attr("x", width / 2)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .text(text)
};

// addLeg("1", "*");
// addLeg("2", "**");
// addLeg("3", "***");
// addLeg("4", "****");
// addLeg("5", "*****");

d3.csv("data.csv").then( function(data){

    data = data.filter(
        d => { 
            if (d.season == "7") { 
                return d; 
            } 
        });

    data.forEach(function(d){
        d.x = width / 2;
        d.y = height / 2;
    });

    var circles = svg.selectAll("circle")
        .data(data);
          
    var circlesEnter = circles.enter()
        .append("circle")
            .attr("r", function(d, i){ return d.times * 0.9 + 3; })

            .attr("id", d => { return `c${d.deputy_id}`; })
            .attr("class", d => { return d.allIn_rank; })

            .attr("display", "none")

            // .attr("cx", width / 2)
            // .attr("cy", height / 2)

            // .attr("cx", d => { return parseFloat(d.start_x) * pw + width / 2; })
            // .attr("cy", d => { return parseFloat(d.start_y) * ph + centerScale(d.allIn_rank); })

            .style("fill", d => { return colors[d.party_name_clean]; })
            .style("stroke", "#ffffff")
            .style("stroke-width", 1);
    
    circles = circles.merge(circlesEnter);

    function ticked() {

        circles
            .attr("cx", function(d) { 
                var radius = d.times * 0.9 + 3;
                return d.x = Math.max(radius, Math.min(width - radius, d.x)); 
            })
            .attr("cy", function(d) { 
                var radius = d.times * 0.9 + 3;
                return d.y = Math.max(radius, Math.min(height - radius, d.y)); 
            });

            // .attr("cx", function(d){ return d.x; })
            // .attr("cy", function(d){ return d.y; });
    }

    simulation
        .nodes(data)
        .on("tick", ticked);

    function splitBubbles(byVar, a) {
        
        simulation.force('y', d3.forceY().strength(forceStrength).y(d => { 
            return centerScale( d[byVar] );
        }));

        // simulation.force('center', d3.forceY().strength(forceStrength).center( d => {
        //      return centerScale( d[byVar] );
        // }));

        simulation.alpha(a).restart()
        // simulation.force("charge", d3.forceManyBody(1));
    }

    function setupButtons() {
        d3.selectAll('.button')
            .on('click', function () {
                d3.selectAll('.button').classed('active', false);
                var button = d3.select(this);

                button.classed('active', true);
                var buttonId = button.attr('id');

                splitBubbles(buttonId, 0.5);
        });

        d3.selectAll('#sb')
            .on('click', function () {

                document.getElementById("lol").style.display = 'inline';
                document.getElementById("sb").style.display = 'none';

                setTimeout(
                    _ => {
                        d3.selectAll("circle").attr("display", "");
                        document.getElementById("lol").style.display = 'none';
                        document.getElementById("toolbar").style.display = 'inline';
                    }, 2500
                )
        });
    };
    
    setupButtons();
    
    setTimeout(
        _ => {
            splitBubbles("allIn_rank", 2);
        }, 500
    );

    // function get_start_pos() {
    //     var start_pos = [];

    //     allc = d3.selectAll("circle");

    //     allc.nodes().forEach(
    //         d => {

    //             var bbd = d.getBBox();

    //             var x = bbd.x,
    //                 y = bbd.y,
    //                 cid = d.id,
    //                 cclass = d.getAttribute("class");
                
    //             var gh = (y - centerScale(cclass)) / (100 / width),
    //                 gw = (x - width / 2) / (100 / height);
                
    //             starts = {
    //                 "deputy_id" : cid.replace("c", ""),
    //                 "start_y" : gh,
    //                 "start_x" : gw
    //             };

    //             start_pos.push(starts);
    //         }
    //     );

    //     console.log(JSON.stringify(start_pos));
    // };

});