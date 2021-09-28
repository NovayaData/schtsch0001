const container = d3.select('#container')

const mainUrl = "https://dev.novayagazeta.ru/api/v1/dashboard/get/region/stats?regionId=";

// var parseTime = d3.timeParse("%Y-%m-%d");

function addChart(subContainer, regId, curData) {

    var svg = subContainer.append("svg")
            .attr("width", "100%")
            .attr("height", "100%");

    var subWidth = svg.node().getBoundingClientRect().width - 24,
        subHeight = svg.node().getBoundingClientRect().height - 24,
        subHeight2 = subHeight + 12;

    d3.json(mainUrl + regId).then( function(rdata){

        data = rdata.data;

        // console.log(data);

        function addXText(path, cl, t, xi, yi, anc) {
            path
                .append("text")
                .attr("class", cl)
                .attr("fill", "#494a4d")
                .attr("x", x(xi)+14)
                .attr("y", y(yi)+24)
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
                )
                .attr("transform", "translate(14,12)");
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
            .domain([0, yMax]);

        // console.log([w2i, w3i, w4i]);

        [[w2i, "#ffed26"], [w3i, "#ee9100"], [w4i, "#bf381d"]].forEach(
            function(d) {
                let w = d[0],
                    c = d[1];
                svg.call(addLine, data.slice(w-10, w+91), 6, "#ffffff");
                svg.call(addLine, data.slice(w-10, w+91), 1.25, c);

                // svg.call(addXText, x, "дней", 0, subHeight2+12, "start");
                svg.call(addXText, "textSmaller", "0", 11, 0, "middle");
                svg.call(addXText, "textSmaller", "90", 101, 0, "middle");
                svg.call(addXText, "textSmall", curData.name, 1, yMax, "start");
                
        });

        var xx = svg
            .append("g")
            .attr("class", "axis")
            .attr("opacity", 1)
            .attr("transform", "translate(14," + subHeight2 + ")")
            .call(d3.axisBottom(x).tickSize(0));

        xx.selectAll("text").remove();

        var yx = svg
            .append("g")
            .attr("class", "axis")
            .attr("opacity", 1)
            .attr("transform", "translate(14,12)")
            .call(d3.axisLeft(y).tickSize(0));

        svg.selectAll(".axis").selectAll("text").attr("class", "textSmaller");
        // svg.selectAll(".axis").selectAll("path").attr("opacity", 0);
        
    });
};

d3.csv("../data/LineChart0010/waves.csv").then( function(data){
    // Object.keys(data).forEach(

    data.forEach(

        // Add subconteiners
        d => {

            regId = d.regId
            // var curData = data[regId];

            var subContainer = container.append("div")
                .attr("id", `reg${regId}`)
                .attr("class", "subContainer")
                .attr("width", "100%")
                .attr("height", "20vh");

            addChart(subContainer, regId, d);
        }
    )
});