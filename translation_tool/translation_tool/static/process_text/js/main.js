var NUMSINGLE = 0;
var NUMMULTI = 0;

$(document).ready(function () {
    /**
     * Sidebar collapse functionality
     */
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
    });

    $('.account-dropdown').on({
        "click":function(e){
          e.stopPropagation();
        }
    });

    /**
     * Mouseover, mouseout, and click events for sentences
     * on metric view page
     */
    // $(".sentence").on('mouseover', function () {
    //     let index = parseInt($(this).attr('data-index'));
    //     let color = $(this).css('border-bottom');
    //     if (!$(this).hasClass('clicked')) {
    //         $("span[data-index=" + index + "]").css('background-color', color.match(/rgb(.*)/)[0]);
    //     }
    // });

    // $(".sentence").on('mouseout', function () {
    //     console.log('clicked');
    //     let index = parseInt($(this).attr('data-index'));
    //     if (!$(this).hasClass('clicked')) {
    //         $("span[data-index=" + index + "]").removeClass("hovered").css('background-color', 'inherit');
    //     }
    // });

    $(".sentence").on('click', async function () {
        let index = parseInt($(this).attr('data-index'));
        let color = $(this).css('border-bottom');
        let idx = $(this).attr('data-index');
        let simScore = $(this).attr('data-sim');
        let compScore = $(this).attr('data-comp');
        let readScore = $(this).attr('data-read');
        let semdomScore = $(this).attr('data-semdom');
        if ($(this).hasClass('clicked')) {
            $(".sentence").removeClass("clicked").css('background-color', 'inherit').css('color', 'black');
            $("#simScore").text('');
            $("#compScore").text('');
            $("#readScore").text('');
            $("#semdomScore").text('');
        }
        else {
            $(".sentence").removeClass("clicked").css('background-color', 'inherit').css('color', 'black');
            $("span[data-index=" + index + "]").addClass('clicked').css('background-color', color.match(/rgb(.*)/)[0]).css('color', 'white');
        }
        $("#simScore").text(simScore);
        $("#compScore").text(compScore);
        $("#readScore").text(readScore);
        $("#semdomScore").text(semdomScore);

        let compResponse = await fetch('/index/api/compData/' + idx);
        let compData = await compResponse.json();
        compData = compData.data;
        if (compData) {
            console.log(compData);
            $("#compQ").text(compData.question);
            $("#compA").text(compData.answer.answer);
        }
    });

    /**
     * Toggle metric buttons on/off
     * depending on which ones are selected
     */
    $(".icon-btn").on('click', async function () {
        let metric = $(this).attr('id');
        let inc = 0;

        if ($(this).hasClass('btn-dark')) {
            $(this).removeClass('btn-dark');
            $(this).addClass('btn-outline-dark');
            inc = -1;
        }
        else {
            $(this).removeClass('btn-outline-dark');
            $(this).addClass('btn-dark');
            inc = 1;
        }

        switch (metric) {
            case 'simBtn':
                NUMMULTI += inc;
                $("#simScoreDiv").toggleClass('active');
                $("#viewChartSim").toggleClass('active');
                var simResponse = await fetch('/index/api/simData');
                var simData = await simResponse.json();
                simData = simData.data;
                var svg = d3.select('#viewChartSimSvg');
                var margin = {
                    left: 15, right: 5,
                    top: 5, bottom: 5
                };
                var width = 200;
                var height = 175;
                svg = svg.append('g')
                        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
                var x = d3.scaleLinear()
                    .domain([0,5])
                    .range([0,width]);
                svg.append('g')
                    .attr('transform','translate(0,' + height + ')')
                    .call(d3.axisBottom(x).ticks(5));
                var hist = d3.histogram()
                    .value(d => { return d; })
                    .domain(x.domain())
                    .thresholds(x.ticks(10));
                var bins = hist(simData);
                var y = d3.scaleLinear()
                    .range([height, 0]);
                y.domain([0, d3.max(bins, d => { return d.length })]);
                svg.append('g')
                    .call(d3.axisLeft(y));
                svg.selectAll('rect')
                    .data(bins)
                    .enter()
                    .append('rect')
                        .attr('x', 1)
                        .attr('transform', d => { return "translate(" + (x(d.x0) + 2) + "," + (y(d.length) - 1) + ")"; })
                        .attr("width", d => { return x(d.x1) - x(d.x0) - 4 ; })
                        .attr("height", d => { return height - y(d.length); })
                        .attr('data-lo', d => { return d.x0 })
                        .attr('data-hi', d => { return d.x1 })
                        .attr('class', 'sim-rect')
                        // .style("fill", "#b3edff")
                        .on('click', function() {
                            var x0 = parseFloat($(this).attr('data-lo'));
                            var x1 = parseFloat($(this).attr('data-hi'));
                            if (d3.select(this).classed('selected')) {
                                console.log('remove')
                                d3.select(this).classed('selected', false);
                                $('.sentence').each(function(idx) {
                                    var sim_ = parseFloat($(this).attr('data-sim'));
                                    if (sim_ < x1 && sim_ >= x0) {
                                        $(this).css('border-bottom', 'none');
                                    }
                                });
                            }
                            else {
                                // d3.select('rect.sim-rect').classed('selected', null);
                                d3.select(this).classed('selected', true);
                                $('.sentence').each(function(idx) {
                                    var sim_ = parseFloat($(this).attr('data-sim'));
                                    if (sim_ < x1 && sim_ >= x0) {
                                        $(this).css('border-bottom', '3px solid #005CB9');
                                    }
                                });
                            }
                        })
                break;
            case 'compBtn':
                NUMMULTI += inc;
                $("#compScoreDiv").toggleClass('active');
                $("#viewChartComp").toggleClass('active');
                var compResponse = await fetch('/index/api/compData/all');
                var compDataLarge = await compResponse.json();
                var compData = compDataLarge.data;
                var compDataIdx = compDataLarge.idx;
                console.log(compDataIdx)

                // var compsvg = d3.select('#viewChartCompSvg');
                // var margin = {
                //     left: 15, right: 5,
                //     top: 5, bottom: 5
                // };
                var margin = 5; 
                var width = 200;
                var height = 175;
                const radius = Math.min(width, height) / 2 - margin;
                // compsvg = compsvg.append('g')
                //     .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
                var svg = d3.select("#viewChartCompSvg")
                    .append("g")
                    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
                
                // Create dummy data
                const data = {a: 9, b: 20, c:30, d:8, e:12}

                // set the color scale
                const color = d3.scaleOrdinal()
                .range(['#005CB9', '#00a7e1'])

                // Compute the position of each group on the pie:
                const pie = d3.pie()
                .value(function(d) {return d[1]})
                const data_ready = pie(Object.entries(compData))

                const arcGenerator = d3.arc()
                    .innerRadius(0)
                    .outerRadius(radius)
                // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
                svg
                .selectAll('whatever')
                .data(data_ready)
                .join('path')
                .attr('d', arcGenerator)
                .attr('class', 'comp-path')
                // .attr('class', 'test')
                .attr('class', function(d) { return 'comp-path ' + d.data[0] })
                .attr('fill', function(d){ return(color(d.data[1])) })
                .attr("stroke", "black")
                .attr('data-label', function(d) { return d.data[0] })
                .style("stroke-width", "1px")
                .style("opacity", 0.7)
                .on('click', function() {
                    if (d3.select(this).classed('selected')) {
                        d3.select(this).classed('selected', false);
                        var label = $(this).attr('data-label');
                        for (let i = 0; i < compDataIdx.length; i++) {
                            if (label == "Correct") {
                                if (compDataIdx[i].res == 'c') {
                                    $('[data-index="' + compDataIdx[i].idx + '"]').css('border-bottom', 'none');
                                }
                            }
                            else if (label == "Incorrect") {
                                if (compDataIdx[i].res == 'i') {
                                    $('[data-index="' + compDataIdx[i].idx + '"]').css('border-bottom', 'none');
                                }
                            }
                        }
                    }
                    else {
                        // d3.select('rect.sim-rect').classed('selected', null);
                        d3.select(this).classed('selected', true);
                        var label = $(this).attr('data-label');
                        for (let i = 0; i < compDataIdx.length; i++) {
                            if (label == "Correct") {
                                if (compDataIdx[i].res == 'c') {
                                    $('[data-index="' + compDataIdx[i].idx + '"]').css('border-bottom', '3px solid #005CB9');
                                }
                            }
                            else if (label == "Incorrect") {
                                if (compDataIdx[i].res == 'i') {
                                    $('[data-index="' + compDataIdx[i].idx + '"]').css('border-bottom', '3px solid #005CB9');
                                }
                            }
                        }
                        // $('.sentence').each(function(idx) {
                        //     var sim_ = parseFloat($(this).attr('data-sim'));
                        //     if (sim_ < x1 && sim_ >= x0) {
                        //         $(this).css('border-bottom', '3px solid #005CB9');
                        //     }
                        // });
                    }
                })
                svg
                    .selectAll('mySlices')
                    .data(data_ready)
                    .join('text')
                    .text(function(d){ return d.data[0]})
                    .attr("transform", function(d) { return `translate(${arcGenerator.centroid(d)})`})
                    .style("text-anchor", "middle")
                    .style("font-size", 10)
                break;

            case 'readBtn':
                NUMSINGLE += inc;
                $("#readScoreDiv").toggleClass('active');
                $("#viewChartRead").toggleClass('active');
                var readResponse = await fetch('/index/api/readData');
                var readData = await readResponse.json();
                readData = readData.data;
                var svg = d3.select('#viewChartReadSvg');
                var margin = {
                    left: 15, right: 5,
                    top: 5, bottom: 5
                };
                var width = 200;
                var height = 175;
                svg = svg.append('g')
                        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
                var x = d3.scaleLinear()
                    .domain([Math.floor(Math.min(...readData)),Math.ceil(Math.max(...readData))])
                    .range([0,width]);
                svg.append('g')
                    .attr('transform','translate(0,' + height + ')')
                    .call(d3.axisBottom(x).ticks(5));
                var hist = d3.histogram()
                    .value(d => { return d; })
                    .domain(x.domain())
                    .thresholds(x.ticks(10));
                var bins = hist(readData);
                var y = d3.scaleLinear()
                    .range([height, 0]);
                y.domain([0, d3.max(bins, d => { return d.length })]);
                svg.append('g')
                    .call(d3.axisLeft(y));
                svg.selectAll('rect')
                    .data(bins)
                    .enter()
                    .append('rect')
                        .attr('x', 1)
                        .attr('transform', d => { return "translate(" + (x(d.x0) + 2) + "," + (y(d.length) - 1) + ")"; })
                        .attr("width", d => { return x(d.x1) - x(d.x0) - 4 ; })
                        .attr("height", d => { return height - y(d.length); })
                        .attr('data-lo', d => { return d.x0 })
                        .attr('data-hi', d => { return d.x1 })
                        .attr('class', 'sim-rect')
                        .on('click', function() {
                            var x0 = parseFloat($(this).attr('data-lo'));
                            var x1 = parseFloat($(this).attr('data-hi'));
                            if (d3.select(this).classed('selected')) {
                                d3.select(this).classed('selected', false);
                                $('.sentence').each(function(idx) {
                                    var read_ = parseFloat($(this).attr('data-read'));
                                    if (read_ < x1 && read_ >= x0) {
                                        $(this).css('border-bottom', 'none');
                                    }
                                });
                            }
                            else {
                                // d3.select('rect.sim-rect').classed('selected', null);
                                d3.select(this).classed('selected', true);
                                $('.sentence').each(function(idx) {
                                    var read_ = parseFloat($(this).attr('data-read'));
                                    if (read_ < x1 && read_ >= x0) {
                                        $(this).css('border-bottom', '3px solid #005CB9');
                                    }
                                });
                            }
                        })
                break;
            case 'semdomBtn':
                NUMSINGLE += inc;
                $("#semdomScoreDiv").toggleClass('active');
                $("#viewChartSemdom").toggleClass('active');
                var semdomResponse = await fetch('/index/api/semdomData');
                var semdomData = await semdomResponse.json();
                semdomData = semdomData.data;
                var svg = d3.select('#viewChartSemdomSvg');
                var margin = {
                    left: 15, right: 5,
                    top: 5, bottom: 5
                };
                var width = 200;
                var height = 175;
                svg = svg.append('g')
                        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
                var x = d3.scaleLinear()
                    .domain([0,5])
                    .range([0,width]);
                svg.append('g')
                    .attr('transform','translate(0,' + height + ')')
                    .call(d3.axisBottom(x));
                var hist = d3.histogram()
                    .value(d => { return d; })
                    .domain(x.domain())
                    .thresholds(x.ticks(5));
                var bins = hist(semdomData);
                var y = d3.scaleLinear()
                    .range([height, 0]);
                y.domain([0, d3.max(bins, d => { return d.length })]);
                svg.append('g')
                    .call(d3.axisLeft(y));
                svg.selectAll('rect')
                    .data(bins)
                    .enter()
                    .append('rect')
                        .attr('x', 1)
                        .attr('transform', d => { return "translate(" + x(d.x0) + "," + (y(d.length) - 1) + ")"; })
                        .attr("width", d => { return x(d.x1) - x(d.x0) ; })
                        .attr("height", d => { return height - y(d.length); })
                        .style("fill", "#b3edff");
                break;
            default:
                console.log("Unrecognized button id.")
        }

        $(".in").removeClass('active');
        if (NUMMULTI > 0) {
            $("#multi").addClass('active');
        }
        else if (NUMSINGLE > 0) {
            $("#single").addClass('active');
        }

    });

    $('#toMetricView').on('click', function() {
        console.log('clicked');
        $("#results-results").toggleClass('active');
        $("#results-metrics").toggleClass('active');
    });

    $('#metricData').on('click', function() {
        console.log('clicked');
        $("#results-metrics").toggleClass('active');
        $("#results-processing").toggleClass('active');
    });

    $('#overviewData').on('click', async function() {
        console.log('clicked')
        let simResponse = await fetch('/index/api/simData');
        let simData = await simResponse.json();
        simData = simData.data;
        var compResponse = await fetch('/index/api/compData/all');
        var compDataLarge = await compResponse.json();
        var compData = compDataLarge.data;
        var compDataIdx = compDataLarge.idx;
        let readResponse = await fetch('/index/api/readData');
        let readData = await readResponse.json();
        readData = readData.data;
        let semdomResponse = await fetch('/index/api/semdomData');
        let semdomData = await semdomResponse.json();
        semdomData = semdomData.data;
        console.log(simData)
        $("#results-results").toggleClass('active');
        $("#results-processing").toggleClass('active');
        let margin = {
            left: 15, right: 15,
            top: 15, bottom: 15
        };
        let width = 450;
        let height = 150;

        /**
         * Similarity Histogram
         */
        var simSvg = d3.select('#resultsBodySim');
        var marginSim = {
            left: 15, right: 5,
            top: 5, bottom: 5
        };
        var widthSim = 450;
        var heightSim = 180;
        simSvg = simSvg.append('g')
                .attr('transform', 'translate(' + marginSim.left + ',' + marginSim.top + ')');
        var xSim = d3.scaleLinear()
            .domain([0,5])
            .range([0,widthSim]);
        simSvg.append('g')
            .attr('transform','translate(0,' + heightSim + ')')
            .call(d3.axisBottom(xSim).ticks(5));
        var histSim = d3.histogram()
            .value(d => { return d; })
            .domain(xSim.domain())
            .thresholds(xSim.ticks(10));
        var binsSim = histSim(simData);
        var ySim = d3.scaleLinear()
            .range([heightSim, 0]);
        ySim.domain([0, d3.max(binsSim, d => { return d.length })]);
        simSvg.append('g')
            .call(d3.axisLeft(ySim));
        simSvg.selectAll('rect')
            .data(binsSim)
            .enter()
            .append('rect')
                .attr('x', 1)
                .attr('transform', d => { return "translate(" + (xSim(d.x0) + 2) + "," + (ySim(d.length) - 1) + ")"; })
                .attr("width", d => { return xSim(d.x1) - xSim(d.x0) - 4 ; })
                .attr("height", d => { return heightSim - ySim(d.length); })
                .attr('data-lo', d => { return d.x0 })
                .attr('data-hi', d => { return d.x1 })
                .attr('class', 'sim-rect')

        /**
         * Comprehensibility Histogram
         */
        var marginComp = 5; 
        var widthComp = 450;
        var heightComp = 180;
        const radius = Math.min(widthComp, heightComp) / 2 - marginComp;
        // compsvg = compsvg.append('g')
        //     .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
        var svgComp = d3.select("#resultsBodyComp")
            .append("g")
            .attr("transform", "translate(" + widthComp / 2 + "," + heightComp / 2 + ")");

        // set the color scale
        const colorComp = d3.scaleOrdinal()
        .range(['#005CB9', '#00a7e1'])

        // Compute the position of each group on the pie:
        const pieComp = d3.pie()
            .value(function(d) {return d[1]})
        const dataReadyComp = pieComp(Object.entries(compData))

        const arcGenerator = d3.arc()
            .innerRadius(0)
            .outerRadius(radius)
        // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
        svgComp
            .selectAll('whatever')
            .data(dataReadyComp)
            .join('path')
            .attr('d', arcGenerator)
            .attr('class', 'comp-path')
            // .attr('class', 'test')
            .attr('class', function(d) { return 'comp-path ' + d.data[0] })
            .attr('fill', function(d){ return(colorComp(d.data[1])) })
            .attr("stroke", "black")
            .attr('data-label', function(d) { return d.data[0] })
            .style("stroke-width", "1px")
            .style("opacity", 0.7)
        svgComp
            .selectAll('mySlices')
            .data(dataReadyComp)
            .join('text')
            .text(function(d){ return d.data[0]})
            .attr("transform", function(d) { return `translate(${arcGenerator.centroid(d)})`})
            .style("text-anchor", "middle")
            .style("font-size", 10)
        
        /**
         * Readability Chart
         */
        var svgRead = d3.select('#resultsBodyRead');
        var marginRead = {
            left: 15, right: 5,
            top: 5, bottom: 5
        };
        var widthRead = 450;
        var heightRead = 180;
        svgRead = svgRead.append('g')
                .attr('transform', 'translate(' + marginRead.left + ',' + marginRead.top + ')');
        var xRead = d3.scaleLinear()
            .domain([Math.floor(Math.min(...readData)),Math.ceil(Math.max(...readData))])
            .range([0,widthRead]);
        svgRead.append('g')
            .attr('transform','translate(0,' + heightRead + ')')
            .call(d3.axisBottom(xRead).ticks(5));
        var histRead = d3.histogram()
            .value(d => { return d; })
            .domain(xRead.domain())
            .thresholds(xRead.ticks(10));
        var binsRead = histRead(readData);
        var yRead = d3.scaleLinear()
            .range([heightRead, 0]);
        yRead.domain([0, d3.max(binsRead, d => { return d.length })]);
        svgRead.append('g')
            .call(d3.axisLeft(yRead));
        svgRead.selectAll('rect')
            .data(binsRead)
            .enter()
            .append('rect')
                .attr('x', 1)
                .attr('transform', d => { return "translate(" + (xRead(d.x0) + 2) + "," + (yRead(d.length) - 1) + ")"; })
                .attr("width", d => { return xRead(d.x1) - xRead(d.x0) - 4 ; })
                .attr("height", d => { return heightRead - yRead(d.length); })
                .attr('data-lo', d => { return d.x0 })
                .attr('data-hi', d => { return d.x1 })
                .attr('class', 'sim-rect')
                
    })

});

