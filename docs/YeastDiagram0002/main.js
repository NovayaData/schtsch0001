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
    "1": "*",
    "2": "**",
    "3": "***",
    "4": "****",
    "5": "*****",
};

var W = container.node().getBoundingClientRect().width,
    H = container.node().getBoundingClientRect().height;

var width = W,
    height = H;

const svg = container
    .append('svg')
        .attr('width', width)
        .attr('height', height);

var centerScale = d3.scalePoint().domain(d3.range(5)).range([0, height]).padding(2),
    forceStrength = 0.5;

// var axis = d3.axisRight(centerScale).ticks(d3.range(5));

// var gAxis = svg.append("g")
//     .attr("transform", "translate(" + width / 2 + ",0)")
//     .attr("class", "axis axis--y")
//     .call(axis);

// var ticks = d3.selectAll('.tick').selectAll('line')
//     .style("stroke", "#ffffff");

// console.log(centerScale.domain())



var simulation = d3.forceSimulation()
    .force("collide", d3.forceCollide( d => {
            return d.r }).iterations(4) 
    )
    .force("charge", d3.forceManyBody())
    .force("y", d3.forceY().y( height / 2 ))
    // .force("y", d3.forceY().y( d => { return centerScale(d.allIn_rank); } ))
    .force("x", d3.forceX().x(width / 2));

d3.csv("data.csv").then( function(data){

    data = data.filter(
        d => { 
            if (d.season == "7") { 
                return d; 
            } 
        });

    data.forEach(function(d){
        d.times;
        d.x = width / 2;
        d.y = height / 2;
    })

    // console.log(data);

    var circles = svg.selectAll("circle")
        .data(data, d => { return d.ID; });
          
    var circlesEnter = circles.enter()
        .append("circle")
            .attr("r", function(d, i){ return d.times * 0.9 + 3; })

            .attr("cx", 0)
            // .attr("cx", function(d, i) { return 175 + 25 * i + 2 * i ** 2; })
            .attr("cy", height / 2)

            // .attr("cy", d => { return centerScale(d.allIn_rank); })

            .style("fill", d => { return colors[d.party_name_clean] })
            .style("stroke", "#ffffff")
            .style("stroke-width", 1)
            .style("pointer-events", "all");

    // console.log( d3.selectAll("circle").nodes().length )
    
    circles = circles.merge(circlesEnter);

    function ticked() {
        circles
            .attr("cx", function(d){ return d.x; })
            .attr("cy", function(d){ return d.y; });
    }

    simulation
        .nodes(data)
        .on("tick", ticked);

    function groupBubbles() {
        hideTitles();

        simulation.force('y', d3.forceY().strength(forceStrength).y(height / 2));
        // simulation.force('y', d3.forceY().strength(forceStrength).y(height / 2));
        simulation.alpha(2).restart();
    }

    function splitBubbles(byVar, a) {
        
        centerScale.domain(data.map(function(d){ return d[byVar]; }).sort(d3.ascending).reverse());
        
        showTitles(centerScale);
        
        simulation.force('y', d3.forceY().strength(forceStrength).y(d => { 
        	return centerScale( d[byVar] );
        }));

        simulation.alpha(a).restart();

        // circles.nodes().forEach(
        //     function(d) {
        //         console.log(d.getBBox().x, d.getBBox().y)
        //     }
        // )

        // centerScale.domain().forEach(
        //     function(d) {
        //         console.log(centerScale(d))
        //     }
        // )
    }

    function hideTitles() {
        svg.selectAll('.title').remove();
    }

    function showTitles(scale) {
        var titles = svg.selectAll('.title')
            .data(scale.domain());
        
        titles.enter().append('text')
            .attr('class', 'title')
            .merge(titles)
            .attr('x', 20)
            .attr('y', function (d) { return scale(d); })
            .attr('text-anchor', 'middle')
            .text(d => { return stars[d]; });
        
        titles.exit().remove() 
    };


    function setupButtons() {
        d3.selectAll('.button')
            .on('click', function () {
                d3.selectAll('.button').classed('active', false);
                var button = d3.select(this);

                button.classed('active', true);

                var buttonId = button.attr('id');

                splitBubbles(buttonId, 0.5);
        });
    }
    
    setupButtons();
    // groupBubbles();
    splitBubbles("allIn_rank", 2);

})

// d3.json("./data.json").then(data => {})