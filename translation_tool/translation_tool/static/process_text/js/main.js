$(document).ready(function () {

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

    $(".sentence").on('click', function() {
        console.log('clicked');
        
        let index = parseInt($(this).attr('data-index'));
        let color = $(this).css('border-bottom');
        if ($("span[data-index=" + index + "]").hasClass('selected')) {
            $(".sentence").removeClass("selected").css('background-color', 'inherit');
        }
        else {
            $(".sentence").removeClass("selected").css('background-color', 'inherit');
            $("span[data-index=" + index + "]").addClass('selected').css('background-color', color.match(/rgb(.*)/)[0]);
        }
        $("#simScore").text(index);
    });

});
