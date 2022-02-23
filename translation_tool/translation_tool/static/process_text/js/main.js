var NUMSINGLE = 0;
var NUMMULTI = 0;
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
        if ($("#toggleSidebar").hasClass("fa-arrow-left")) {
            $("#toggleSidebar").removeClass("fa-arrow-left");
            $("#toggleSidebar").addClass("fa-arrow-right");
        }
        else {
            $("#toggleSidebar").removeClass("fa-arrow-right");
            $("#toggleSidebar").addClass("fa-arrow-left");
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
    $(".icon-btn").on('click', function () {
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
                break;
            case 'compBtn':
                NUMMULTI += inc;
                $("#compScoreDiv").toggleClass('active');
                break;
            case 'readBtn':
                NUMSINGLE += inc;
                $("#readScoreDiv").toggleClass('active');
                break;
            case 'semdomBtn':
                NUMSINGLE += inc;
                $("#semdomScoreDiv").toggleClass('active');
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
