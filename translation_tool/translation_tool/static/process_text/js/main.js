var NUMSINGLE = 0;
var NUMMULTI = 0;
// const mongo = require('mongodb');
// const MongoClient = mongo.MongoClient;
// const url = 'mongodb://localhost:27017';

// class FileUpload {

//     constructor(input) {
//         this.input = input
//         this.max_length = 1024 * 1024 * 10;
//     }
//     create_progress_bar() {
//         var progress = `<div class="file-icon">
//                         <i class="fa fa-file-o" aria-hidden="true"></i>
//                     </div>
//                     <div class="file-details">
//                         <p class="filename"></p>
//                         <small class="textbox"></small>
//                         <div class="progress" style="margin-top: 5px;">
//                             <div class="progress-bar bg-success" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%">
//                             </div>
//                         </div>
//                     </div>`
//         document.getElementById('uploaded_files').innerHTML = progress
//     }

//     upload() {
//         this.create_progress_bar();
//         this.initFileUpload();
//     }

//     initFileUpload() {
//         this.file = this.input.files[0];
//         this.upload_file(0, null);
//     }

//     upload_file(start, model_id) {
//         var end;
//         var self = this;
//         var existingPath = model_id;
//         var formData = new FormData();
//         var nextChunk = start + this.max_length + 1;
//         var currentChunk = this.file.slice(start, nextChunk);
//         var uploadedChunk = start + currentChunk.size
//         if (uploadedChunk >= this.file.size) {
//             end = 1;
//         } else {
//             end = 0;
//         }
//         formData.append('file', currentChunk)
//         formData.append('filename', this.file.name)
//         $('.filename').text(this.file.name)
//         $('.textbox').text("Uploading file")
//         formData.append('end', end)
//         formData.append('existingPath', existingPath);
//         formData.append('nextSlice', nextChunk);
//         $.ajaxSetup({
//             headers: {
//                 "X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]').value,
//             }
//         });
//         $.ajax({
//             xhr: function () {
//                 var xhr = new XMLHttpRequest();
//                 xhr.upload.addEventListener('progress', function (e) {
//                     if (e.lengthComputable) {
//                         if (self.file.size < self.max_length) {
//                             var percent = Math.round((e.loaded / e.total) * 100);
//                         } else {
//                             var percent = Math.round((uploadedChunk / self.file.size) * 100);
//                         }
//                         $('.progress-bar').css('width', percent + '%')
//                         $('.progress-bar').text(percent + '%')
//                     }
//                 });
//                 return xhr;
//             },

//             url: '/fileUploader/',
//             type: 'POST',
//             dataType: 'json',
//             cache: false,
//             processData: false,
//             contentType: false,
//             data: formData,
//             error: function (xhr) {
//                 alert(xhr.statusText);
//             },
//             success: function (res) {
//                 if (nextChunk < self.file.size) {
//                     // upload file in chunks
//                     existingPath = res.existingPath
//                     self.upload_file(nextChunk, existingPath);
//                 } else {
//                     // upload complete
//                     $('.textbox').text(res.data);
//                     alert(res.data)
//                 }
//             }
//         });
//     };

// }


$(document).ready(function () {

    /**
     * Sidebar collapse functionality
     */
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
        console.log('document ready')
        // if ($("#toggleSidebar").hasClass("fa-arrow-left")) {
        //     $("#toggleSidebar").removeClass("fa-arrow-left");
        //     $("#toggleSidebar").addClass("fa-arrow-right");
        // }
        // else {
        //     $("#toggleSidebar").removeClass("fa-arrow-right");
        //     $("#toggleSidebar").addClass("fa-arrow-left");
        // }
    });

    $('.account-dropdown').on({
        "click":function(e){
          e.stopPropagation();
        }
    });

    // $('#submit').on('click', (event) => {
    //     event.preventDefault();
    //     var uploader = new FileUpload(document.querySelector('#fileupload'))
    //     console.log(document.querySelector('#fileupload'));
    //     uploader.upload();
    // });

    /**
     * Mouseover, mouseout, and click events for sentences
     * on metric view page
     */
    $(".sentence").on('mouseover', function () {
        let index = parseInt($(this).attr('data-index'));
        let color = $(this).css('border-bottom');
        if (!$(this).hasClass('clicked')) {
            $("span[data-index=" + index + "]").css('background-color', color.match(/rgb(.*)/)[0]);
        }
    });

    $(".sentence").on('mouseout', function () {
        console.log('clicked');
        let index = parseInt($(this).attr('data-index'));
        if (!$(this).hasClass('clicked')) {
            $("span[data-index=" + index + "]").removeClass("hovered").css('background-color', 'inherit');
        }
    });

    $(".sentence").on('click', function () {
        let index = parseInt($(this).attr('data-index'));
        let color = $(this).css('border-bottom');
        let simScore = $(this).attr('data-sim');
        let compScore = $(this).attr('data-comp');
        let readScore = $(this).attr('data-read');
        let semdomScore = $(this).attr('data-semdom');
        if ($(this).hasClass('clicked')) {
            $(".sentence").removeClass("clicked").css('background-color', 'inherit');
            $("#simScore").text('');
            $("#compScore").text('');
            $("#readScore").text('');
            $("#semdomScore").text('');
        }
        else {
            $(".sentence").removeClass("clicked").css('background-color', 'inherit');
            $("span[data-index=" + index + "]").addClass('clicked').css('background-color', color.match(/rgb(.*)/)[0]);
        }
        $("#simScore").text(simScore);
        $("#compScore").text(compScore);
        $("#readScore").text(readScore);
        $("#semdomScore").text(semdomScore);
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
                    .call(d3.axisBottom(x));
                var hist = d3.histogram()
                    .value(d => { return d.score; })
                    .domain(x.domain())
                    .thresholds(x.ticks(5));
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
                        .attr('transform', d => { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
                        .attr("width", d => { return x(d.x1) - x(d.x0) ; })
                        .attr("height", d => { return height - y(d.length); })
                        .style("fill", "#b3edff");
                break;
            case 'compBtn':
                NUMMULTI += inc;
                $("#compScoreDiv").toggleClass('active');
                $("#viewChartComp").toggleClass('active');
                var compResponse = await fetch('/index/api/simData');
                var compData = await compResponse.json();
                compData = compData.data;
                var compsvg = d3.select('#viewChartCompSvg');
                var margin = {
                    left: 15, right: 5,
                    top: 5, bottom: 5
                };
                var width = 200;
                var height = 175;
                compsvg = compsvg.append('g')
                        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
                var x = d3.scaleLinear()
                    .domain([0,5])
                    .range([0,width]);
                compsvg.append('g')
                    .attr('transform','translate(0,' + height + ')')
                    .call(d3.axisBottom(x));
                var hist = d3.histogram()
                    .value(d => { return d.score; })
                    .domain(x.domain())
                    .thresholds(x.ticks(5));
                var bins = hist(compData);
                var y = d3.scaleLinear()
                    .range([height, 0]);
                y.domain([0, d3.max(bins, d => { return d.length })]);
                compsvg.append('g')
                    .call(d3.axisLeft(y));
                compsvg.selectAll('rect')
                    .data(bins)
                    .enter()
                    .append('rect')
                        .attr('x', 1)
                        .attr('transform', d => { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
                        .attr("width", d => { return x(d.x1) - x(d.x0) ; })
                        .attr("height", d => { return height - y(d.length); })
                        .style("fill", "#b3edff");
                break;
            case 'readBtn':
                NUMSINGLE += inc;
                $("#readScoreDiv").toggleClass('active');
                $("#viewChartRead").toggleClass('active');
                var simResponse = await fetch('/index/api/simData');
                var simData = await simResponse.json();
                simData = simData.data;
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
                    .domain([0,5])
                    .range([0,width]);
                svg.append('g')
                    .attr('transform','translate(0,' + height + ')')
                    .call(d3.axisBottom(x));
                var hist = d3.histogram()
                    .value(d => { return d.score; })
                    .domain(x.domain())
                    .thresholds(x.ticks(5));
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
                        .attr('transform', d => { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
                        .attr("width", d => { return x(d.x1) - x(d.x0) ; })
                        .attr("height", d => { return height - y(d.length); })
                        .style("fill", "#b3edff");
                break;
            case 'semdomBtn':
                NUMSINGLE += inc;
                $("#semdomScoreDiv").toggleClass('active');
                $("#viewChartSemdom").toggleClass('active');
                var simResponse = await fetch('/index/api/simData');
                var simData = await simResponse.json();
                simData = simData.data;
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
                    .value(d => { return d.score; })
                    .domain(x.domain())
                    .thresholds(x.ticks(5));
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
                        .attr('transform', d => { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
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

    $('#overviewData').on('click', async function() {
        console.log('clicked')
        let simResponse = await fetch('/index/api/simData');
        let simData = await simResponse.json();
        simData = simData.data;
        let compResponse = await fetch('/index/api/compData');
        let compData = await compResponse.json();
        compData = compData.data;
        console.log(simData)
        $("#results-results").toggleClass('active');
        $("#results-processing").toggleClass('active');
        let margin = {
            left: 10, right: 10,
            top: 10, bottom: 10
        };
        let width = 475;
        let height = 200;

        /**
         * Similarity Histogram
         */
        let svg = d3.select('#resultsBodySim')

        svg = svg.append('g')
                .attr('translform', 'translate(' + margin.left + ',' + margin.top + ')');

        let x = d3.scaleLinear()
            .domain([0,5])
            .range([0,width]);
        svg.append('g')
            .attr('transform','translate(0,' + height + ')')
            .call(d3.axisBottom(x));

        let hist = d3.histogram()
            .value(d => { return d.score; })
            .domain(x.domain())
            .thresholds(x.ticks(5));

        let bins = hist(simData);

        let y = d3.scaleLinear()
            .range([height, 0]);
        y.domain([0, d3.max(bins, d => { return d.length })]);

        svg.append('g')
            .call(d3.axisLeft(y));
        
        svg.selectAll('rect')
            .data(bins)
            .enter()
            .append('rect')
                .attr('x', 1)
                .attr('transform', d => { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
                .attr("width", d => { return x(d.x1) - x(d.x0) ; })
                .attr("height", d => { return height - y(d.length); })
                .style("fill", "#69b3a2");

        /**
         * Comprehensibility Histogram
         */
        svg = d3.select('#resultsBodyComp')

        svg = svg.append('g')
                .attr('translform', 'translate(' + margin.left + ',' + margin.top + ')');

        // let x = d3.scaleLinear()
        //     .domain([0,5])
        //     .range([0,width]);
        svg.append('g')
            .attr('transform','translate(0,' + height + ')')
            .call(d3.axisBottom(x));

        hist = d3.histogram()
            .value(d => { return d.score; })
            .domain(x.domain())
            .thresholds(x.ticks(5));

        bins = hist(compData);

        y = d3.scaleLinear()
            .range([height, 0]);
        y.domain([0, d3.max(bins, d => { return d.length })]);

        svg.append('g')
            .call(d3.axisLeft(y));
        
        svg.selectAll('rect')
            .data(bins)
            .enter()
            .append('rect')
                .attr('x', 1)
                .attr('transform', d => { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
                .attr("width", d => { return x(d.x1) - x(d.x0) ; })
                .attr("height", d => { return height - y(d.length); })
                .style("fill", "#69b3a2");
    })

});
