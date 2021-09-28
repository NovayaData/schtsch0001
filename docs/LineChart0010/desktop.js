const container = d3.select('#container');
const containerH = container.node().getBoundingClientRect().height * 0.25;

// console.log(container.node().getBoundingClientRect().height, containerH);

const mainUrl = "https://dev.novayagazeta.ru/api/v1/dashboard/get/region/stats?regionId=";

function addChart(path, regId, curData) {

    var svg = path.append("svg")
            .attr("width", "100%")
            .attr("height", containerH);

    var content = svg.append("g")
        .attr("transform", "translate(14,21)");

    var subWidth = svg.node().getBoundingClientRect().width - 24,
        subHeight = containerH-42;
        // subHeight2 = subHeight + 12;

    d3.json(mainUrl + regId).then( function(rdata){

        data = rdata.data;

        function addXText(path, cl, t, xi, yi, ytr, anc) {
            path
                .append("text")
                .attr("class", cl)
                .attr("fill", "#cfcfcf")
                .attr("x", x(xi))
                .attr("y", y(yi)+ytr)
                .attr("text-anchor", anc)
                .text( t );
        }

        function addLine(path, data, sw, col) {

            path
                .append("path")
                .datum(data)
                .attr("stroke-width", sw)
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke", col)
                .attr("fill", "none")
                .attr(
                    "d", 
                    d3.line()
                        .curve(d3.curveCatmullRom)
                        .x(function(_, i) { 
                            return x(i); 
                        })
                        .y(d => y(d.normMean))
                );
        };

        data = data.reverse();

        var w2i, w3i, w4i;

        data.forEach(
            function(d, i) {
                d.norm = d.casesNew * 100000 / curData.population;

                // console.log(curData);

                // console.log(d.norm);

                if (d.date == curData.wave2) {
                    w2i = i;
                } else if (d.date == curData.wave3) {
                    w3i = i;
                } else if (d.date == curData.wave4) {
                    w4i = i;
                }
            }
        );

        data.slice(0, -7).forEach(
            function(d, i) {
                i+=7;
                let curSlice = data.slice(i-7, i);
                data[i].normMean = d3.mean(curSlice, d => d.norm);
        });

        // var data2 = data.slice(w2i-10, w2i+91),
        //     data3 = data.slice(w3i-10, w3i+91),
        //     data4 = data.slice(w4i-10, w4i+91);

        var yMax = d3.max(data, function(d) { return d.normMean; });

        var x = d3.scaleLinear()
            .range([0, subWidth])
            .domain([0, 101]);
        
        var y = d3.scaleLinear()
            .range([subHeight, 0])
            .domain([0, 35]);

        // console.log([w2i, w3i, w4i]);

        [[w2i, "#b0b0b0"], [w3i, "#787878"], [w4i, "#00ACE5"]].forEach(
            function(d) {
                let w = d[0],
                    c = d[1];
                content.call(addLine, data.slice(w-10, w+91), 6, "#ffffff");
                content.call(addLine, data.slice(w-10, w+91), 1.25, c);

                content.call(addXText, "textSmaller", "дней", 0, 0, 10, "start");
                content.call(addXText, "textSmaller", "0", 11, 0, 10, "middle");
                content.call(addXText, "textSmaller", "90", 101, 0, 10, "middle");

                d3.select(`#reg${regId}`).html(curData.name)
        });

        var xx = content
            .append("g")
            .attr("class", "axis")
            .attr("opacity", 1)
            .attr("transform", "translate(0," + subHeight + ")")
            .call(d3.axisBottom(x).tickSize(0));

        xx.selectAll("text").remove();

        var ticksnum;
        
        if (yMax > 35) { 
            ticksnum = yMax / 10; } 
        else { 
            ticksnum = yMax / 5; } 

        content
            .append("g")
            .attr("class", "axis")
            .attr("opacity", 1)
            .attr("transform", "translate(0,0)")
            .call(d3.axisLeft(y).tickSize(0).ticks(35 / 5));

        content.selectAll(".axis").selectAll("text").attr("class", "textSmaller");
        content.selectAll(".axis").selectAll("path").attr("stroke", "#cfcfcf")
        // .attr("opacity", 0);
        
    });
};

d3.csv("../data/LineChart0010/waves.csv").then( function(data){
    // Object.keys(data).forEach(

    data.forEach(

        // Add subconteiners
        d => {

            regId = d.regId

            var subContainer = container.append("div")
                .attr("class", "subContainer")
                .attr("width", "100%")
                .attr("height", containerH);

            subContainer.append("div")
                .attr("id", `reg${regId}`)
                .attr("class", "regTitle textSmall");

            subContainer.call(addChart, regId, d);
        }
    )
});