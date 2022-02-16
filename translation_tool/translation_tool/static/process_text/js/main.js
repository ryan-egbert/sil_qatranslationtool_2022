var NUMSINGLE = 0;
var NUMMULTI = 0;

$(document).ready(function () {

    /**
     * Sidebar collapse functionality
     */
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
        console.log('document ready')
        if ($("#toggleSidebar").hasClass("fa-arrow-left")) {
            $("#toggleSidebar").removeClass("fa-arrow-left");
            $("#toggleSidebar").addClass("fa-arrow-right");
        }
        else {
            $("#toggleSidebar").removeClass("fa-arrow-right");
            $("#toggleSidebar").addClass("fa-arrow-left");
        }
    });

    /**
     * Mouseover, mouseout, and click events for sentences
     * on metric view page
     */
    $(".sentence").on('mouseover', function() {
        let index = parseInt($(this).attr('data-index'));
        let color = $(this).css('border-bottom');
        if (!$(this).hasClass('clicked')) {
            $("span[data-index=" + index + "]").css('background-color', color.match(/rgb(.*)/)[0]);
        }
    });

    $(".sentence").on('mouseout', function() {
        console.log('clicked');
        let index = parseInt($(this).attr('data-index'));
        if (!$(this).hasClass('clicked')) {
            $("span[data-index=" + index + "]").removeClass("hovered").css('background-color', 'inherit');
        }
    });

    $(".sentence").on('click', function() {
        let index = parseInt($(this).attr('data-index'));
        let color = $(this).css('border-bottom');
        let score = $(this).attr('data-sim');
        if ($(this).hasClass('clicked')) {
            $(".sentence").removeClass("clicked").css('background-color', 'inherit');
        }
        else {
            $(".sentence").removeClass("clicked").css('background-color', 'inherit');
            $("span[data-index=" + index + "]").addClass('clicked').css('background-color', color.match(/rgb(.*)/)[0]);
        }
        $("#simScore").text(score);
    });

    /**
     * Toggle metric buttons on/off
     * depending on which ones are selected
     */
    $(".icon-btn").on('click', function() {
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
                break;
            case 'compBtn':
                NUMMULTI += inc;
                break;
            case 'readBtn':
                NUMSINGLE += inc;
                break;
            case 'semdomBtn':
                NUMSINGLE += inc;
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

});
