var NUMSINGLE = 0;
var NUMMULTI = 0;
var ACTIVESENT = false;

$(document).ready(function () {
    /**
     * Sidebar collapse functionality
     */
    // $('#sidebarCollapse').on('click', function () {
    //     $('#sidebar').toggleClass('active');
    // });

    // $('.account-dropdown').on({
    //     "click":function(e){
    //       e.stopPropagation();
    //     }
    // });

    /**
     * Upload file change name
     */
    $('#inputGroupFile01').change(function () {
        var file = $('#inputGroupFile01')[0].files[0].name;
        $('#inputFileName').text(file);
    });

    /**
     * SENTENCE SELECTION
     * Mouseover, mouseout and click events for sentence selection
     * when selecting different metrics
     */
    
    // Grey background when hover over sentence
    $(".sentence").on('mouseover', function () {
        let index = parseInt($(this).attr('data-index'));
        if (!$(this).hasClass('clicked')) {
            $("span[data-index=" + index + "]").css('background-color', 'rgba(0,0,0,0.05)');
        }
    });

    $(".sentence").on('mouseout', function () {
        let index = parseInt($(this).attr('data-index'));
        if (!$(this).hasClass('clicked')) {
            $("span[data-index=" + index + "]").removeClass("hovered").css('background-color', 'inherit');
        }
    });

    $(".sentence").on('click', async function () {
        // Get attributes
        let index = parseInt($(this).attr('data-index'));
        let color = $(this).css('border-bottom');
        let idx = $(this).attr('data-index');
        let simScore = $(this).attr('data-sim');
        let readScore = $(this).attr('data-read');
        let semdomScore = $(this).attr('data-semdom');
        // If deselecting current sentence
        if ($(this).hasClass('clicked')) {
            ACTIVESENT = false;
            $('.add-question').toggleClass('active');
            $(".sentence").removeClass("clicked").css('background-color', 'inherit').css('color', 'black');
            $("#simScore").text('');
            $("#comp-questions").empty();
            $("#readScore").text('');
            $("#semdomScore").text('');
        }
        // If selecting new sentence
        else {
            if (!ACTIVESENT) {
                $('.add-question').toggleClass('active');
            }
            ACTIVESENT = true;
            // Change background color to selected color
            $(".sentence").removeClass("clicked").css('background-color', 'inherit').css('color', 'black');
            $("span[data-index=" + index + "]").addClass('clicked').css('background-color', color.match(/rgb(.*)/)[0]).css('color', 'white');
            $("#comp-questions").empty();
            // Get comprehensibility data
            var id = $("#headerTranslationId").attr('data-id');
            let compResponse = await fetch('/api/compData/' + id + '/' + idx);
            let compData = await compResponse.json();
            compData = compData.data;
            // Display questions and answers
            if (compData) {
                for (let i = 0; i < compData.length; i++) {
                    var data = compData[i];
                    var q = '<b style="border-bottom: 1px solid black;">Q: </b><span>' + data.question + '</span><br>'
                    var a = '<b style="border-bottom: 1px solid black;">A: </b><span>' + data.answer.answer  + '</span><br>'
                    var e = '<b style="border-bottom: 1px solid black;">Expected: </b><span>' + data.expected  + '</span><br><hr>'
                    $("#comp-questions").append(q + a + e);
                }
            }
            // Display numerical scores
            $("#simScore").text(simScore);
            $("#readScore").text(readScore);
            $("#semdomScore").text(semdomScore);
        }
    });

    /**
     * ADD NEW QUESTIONS
     */
    // Update modal text
    $("#add-question-btn").on('click', function () {
        $("#add-question-context").text($(".sentence.clicked.translated").text());
    });

    // Ajax function to add question to database
    function add_question() {
        var idx = $(".sentence.clicked.translated").attr('data-index');
        var id_ = $("#headerTranslationId").attr('data-id');
        $.ajax({
            url: '/api/postQuestion/' + id_ + '/' + idx + '/',
            type: 'POST',
            data: {
                context: $("#add-question-context").text(),
                question: $("#add-question-question").val(),
                answer: $("#add-question-answer").val(),
            },

            success: function(json) {
                // On success, place question/answer in comprehensibility space
                var data = json.data;
                var q = '<b style="border-bottom: 1px solid black;">Q: </b><span>' + data.question + '</span><br>'
                var a = '<b style="border-bottom: 1px solid black;">A: </b><span>' + data.answer.answer + '</span><br>'
                var e = '<b style="border-bottom: 1px solid black;">Expected: </b><span>' + data.expected + '</span><br><hr>'
                $("#comp-questions").append(q + a + e);
                $("#add-question-question").val('');
                $("#add-question-answer").val('');
                $('.save-changes').toggleClass('active_');
            },

            failure: function(xhr, msg, err) {
                $('.save-changes').toggleClass('active_');
                console.log(msg);
            }
        })
    }
    // Submit question button
    $("#add-question-submit").on('click', function () {
        $('.save-changes').toggleClass('active_');
        add_question();
    });

    /**
     * TOGGLE METRICS
     */
    $(".icon-btn").on('click', async function () {
        let metric = $(this).attr('id');
        let inc = 0;
        let id_ = $("#headerTranslationId").attr("data-id");
        // Change display of outline button
        if ($(this).attr('id') != 'resetBtn') {
            if ($(this).hasClass('btn-primary')) {
                $(this).removeClass('btn-primary');
                $(this).addClass('btn-outline-primary');
                inc = -1;
            }
            else {
                $(this).removeClass('btn-outline-primary');
                $(this).addClass('btn-primary');
                inc = 1;
            }
        }
        // Add chart based on metric
        switch (metric) {
            // Similarity Chart
            case 'simBtn':
                NUMMULTI += inc;
                $("#simScoreDiv").toggleClass('active');
                $("#viewChartSim").toggleClass('active');
                $("#viewChartSimSvg").empty();
                var simResponse = await fetch('/api/simData/' + id_);
                var simData = await simResponse.json();
                simData = simData.data;
                var svg = d3.select('#viewChartSimSvg');
                var margin = {
                    left: 15, right: 5,
                    top: 5, bottom: 5
                };
                var width = 200;
                var height = 150;
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
                        .on('click', function() {
                            var x0 = parseFloat($(this).attr('data-lo'));
                            var x1 = parseFloat($(this).attr('data-hi'));
                            if (d3.select(this).classed('selected')) {
                                d3.select(this).classed('selected', false);
                                $('.sentence').each(function(idx) {
                                    var sim_ = parseFloat($(this).attr('data-sim'));
                                    if (sim_ < x1 && sim_ >= x0) {
                                        $(this).css('border-bottom', 'none');
                                    }
                                });
                            }
                            else {
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
            // Comprehensibility Chart
            case 'compBtn':
                NUMMULTI += inc;
                $("#compScoreDiv").toggleClass('active');
                $("#viewChartComp").toggleClass('active');
                $("#viewChartCompSvg").empty();
                var compResponse = await fetch('/api/compData/' + id_ + '/all/');
                var compDataLarge = await compResponse.json();
                var compData = compDataLarge.data;
                var compDataIdx = compDataLarge.idx;

                var margin = 5; 
                var width = 200;
                var height = 175;
                const radius = Math.min(width, height) / 2 - margin;
                
                var svg = d3.select("#viewChartCompSvg")
                    .append("g")
                    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

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
                    }
                })
                svg.selectAll('mySlices')
                    .data(data_ready)
                    .join('text')
                    .text(function(d){ return d.data[0]})
                    .attr("transform", function(d) { return `translate(${arcGenerator.centroid(d)})`})
                    .style("text-anchor", "middle")
                    .style("font-size", 10)
                break;
            // Readability Chart
            case 'readBtn':
                NUMSINGLE += inc;
                $("#readScoreDiv").toggleClass('active');
                $("#viewChartRead").toggleClass('active');
                $("#viewChartReadSvg").empty();
                var readResponse = await fetch('/api/readData/' + id_);
                var readData = await readResponse.json();
                readData = readData.data;
                var svg = d3.select('#viewChartReadSvg');
                var margin = {
                    left: 15, right: 5,
                    top: 5, bottom: 5
                };
                var width = 200;
                var height = 150;
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
            // Semantic Domain Chart (TODO)
            case 'semdomBtn':
                NUMSINGLE += inc;
                break;
            case 'resetBtn':
                $('.clicked').removeClass('clicked');
                $('.selected').removeClass('selected');
                $('.sentence').css('border-bottom', 'none');
                break;
            default:
                console.log("Unrecognized button id.")
        }
        // Toggle between source&translated or just translated
        $(".in").removeClass('active');
        if (NUMMULTI > 0) {
            $("#multi").addClass('active');
        }
        else if (NUMSINGLE > 0) {
            $("#single").addClass('active');
        }

    });

    /** 
     * Processed page buttons
     */
    $('#toMetricView').on('click', function() {
        $("#results-results").toggleClass('active');
        $("#results-metrics").toggleClass('active');
    });

    $('#metricData').on('click', function() {
        $("#results-metrics").toggleClass('active');
        $("#results-processing").toggleClass('active');
    });

    /**
     * Broad overview page.
     * All the charts displayed in one view
     */
    $('#overviewData').on('click', async function() {
        // Get all data
        var id_ = $("#headerTranslationId").attr("data-id");
        let simResponse = await fetch('/api/simData/' + id_);
        let simData = await simResponse.json();
        simData = simData.data;
        var compResponse = await fetch('/api/compData/' + id_ + '/all');
        var compDataLarge = await compResponse.json();
        var compData = compDataLarge.data;
        var compDataIdx = compDataLarge.idx;
        let readResponse = await fetch('/api/readData/' + id_);
        let readData = await readResponse.json();
        readData = readData.data;
        let semdomResponse = await fetch('/api/semdomData');
        let semdomData = await semdomResponse.json();
        semdomData = semdomData.data;
        $("#results-results").toggleClass('active');
        $("#results-processing").toggleClass('active');

        /**
         * Similarity Histogram
         */
        var simSvg = d3.select('#resultsBodySim');
        var marginSim = {
            left: 15, right: 5,
            top: 5, bottom: 5
        };
        var widthSim = 450;
        var heightSim = 150;
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
        var heightComp = 150;
        const radius = Math.min(widthComp, heightComp) / 2 - marginComp;
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
                .attr('class', function(d) { return 'comp-path ' + d.data[0] })
                .attr('fill', function(d){ return(colorComp(d.data[1])) })
                .attr("stroke", "black")
                .attr('data-label', function(d) { return d.data[0] })
                .style("stroke-width", "1px")
                .style("opacity", 0.7)
        svgComp.selectAll('mySlices')
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
        var heightRead = 150;
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
                
    });

    /**
     * Code was taken from https://github.com/realpython/django-form-fun/blob/master/part1/main.js
     * Adds csrf_token in JavaScript
     */
    // This function gets cookie with a given name
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    var csrftoken = getCookie('csrftoken');

    /*
    The functions below will create a header with csrftoken
    */

    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }
    function sameOrigin(url) {
        // test that a given url is a same-origin URL
        // url could be relative or scheme relative or absolute
        var host = document.location.host; // host + port
        var protocol = document.location.protocol;
        var sr_origin = '//' + host;
        var origin = protocol + sr_origin;
        // Allow absolute or scheme relative URLs to same origin
        return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
            (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
            // or any other URL that isn't scheme relative or absolute i.e relative.
            !(/^(\/\/|http:|https:).*/.test(url));
    }

    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && sameOrigin(settings.url)) {
                // Send the token to same-origin, relative URLs only.
                // Send the token only if the method warrants CSRF protection
                // Using the CSRFToken value acquired earlier
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });

});

