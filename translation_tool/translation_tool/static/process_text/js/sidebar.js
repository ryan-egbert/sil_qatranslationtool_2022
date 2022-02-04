$(document).ready(function () {

    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
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
        $(".sentence").removeClass("selected").css('background-color', 'inherit');
    
        let index = parseInt($(this).attr('data-index'));
        let color = $(this).css('border-bottom');
        console.log(color);
        $("span[data-index=" + index + "]").addClass('selected').css('background-color', color.match(/rgb(.*)/)[0]);
        $("#simScore").text(index);
    });

});
