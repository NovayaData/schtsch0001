const container = d3.select('#container')

const colors = {
    "единая россия": "#00ace5",
    "лдпр": "#ffed26",
    "кпрф": "#bf381d",
    "справедливая россия": "#ee9100",
    "яблоко": "#25d818",
    "Без или др": "#e3e4e5"
};

const expl = {
    "allIn_rank": "Каждая ● — один депутат<br>Размер ⬤ ● — количество созывов в Госдуме",
    "vist_rank": "Число выступлений на заседаниях, их длительность в минутах, а также артистизм — восклицания, реакции публики",
    "golos_rank": "Присутствие на решающих голосованиях",
    "zakon_rank": "Число внесенных законопроектов и доля принятых"
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

var centerScale = d3.scalePoint()
    .domain( points )
    .range([H*0.1, height-H*0.15])
    .padding(3),
    forceStrength = 0.5;

var simulation = d3.forceSimulation()
    .force("collide", d3.forceCollide(d => { return d.times * 0.9 + 4; }))
    .force("y", d3.forceY().y( d => { return centerScale(d.allIn_rank); } ).strength(0.1))
    .force("x", d3.forceX().x( width / 2 ).strength(0.4))
    .force("charge", d3.forceManyBody() );

d3.csv("../data/YeastDiagram0002/data.csv").then( function(data){

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
            .attr("class", d => { return `r${d.allIn_rank}`; })

            .attr("display", "none")
            .attr("text", d => {
                var name = d.deputy_name.replace(" ", "&#160;");
                return `${name}<br><b>Созывов:</b> ${d.times}<br><b>Дней в Думе:</b> ${d.days}`
            })

            .style("fill", d => { return colors[d.party_name_clean]; })
            .style("stroke", "#ffffff")
            .style("stroke-width", 1)
            
            .on("mouseover", function(d) {
                d3.select(this).style("stroke", "#212226")
                tooltip
                    .html(
                        this.getAttribute("text") + `<br><b>Балл: </b>${this.getAttribute("class").replace("r", "")}`
                        )
                    .style("opacity", 1)
                    .style("top", this.getBBox().y - 12 + "px");
                if (this.getBBox().x <= width*0.5) {
                    tooltip
                        .style("left", this.getBBox().x + 40 + "px");
                } else {
                        strLen  = document.getElementById("tt").clientWidth;

                    tooltip
                        .style("left", this.getBBox().x - strLen + "px");
                }
            })
            .on("mouseleave", function(d) {
                d3.select(this).style("stroke", "#ffffff")
                tooltip
                    .html("")
                    .style("opacity", 0);
            });
    
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
    };

    simulation
        .nodes(data)
        .on("tick", ticked);

    function splitBubbles(byVar, a) {

        simulation.force('y', d3.forceY().strength(forceStrength).y(d => { 
            d3.select( `#c${d.deputy_id}` ).attr("class", `r${d[byVar]}`);
            return centerScale( d[byVar] );
        }));

        simulation.alpha(a).restart();
    }

    function setupButtons() {
        d3.selectAll('.button')
            .on('click', function () {
                d3.selectAll('.button').classed('active', false);
                var button = d3.select(this);

                button.classed('active', true);
                var buttonId = button.attr('id');

                document.getElementById("expl").innerHTML = expl[buttonId];

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
                        document.getElementById("legend").style.display = 'inline';
                        document.getElementById("expl").style.display = 'inline';
                    }, 2500
                )
        });
    };

    const tooltip = d3.select("#tooltip")
                        .append("span")
                        .attr("id", "tt")
                        .style("opacity", 0)
                        .attr("class", "textSmall");
    
    setupButtons();
    
    setTimeout(
        _ => {
            splitBubbles("allIn_rank", 2);
        }, 500
    );
});