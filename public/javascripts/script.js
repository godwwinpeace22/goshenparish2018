$(document).ready(function(){
    //slider 
    // Here we're going to move the active class between the slides. You can do this however you want, but for brevity I'm using JQuery.

    // Get all the slides
    var slides = $('.slide');

    // Move the last slide before the first so the user is able to immediately go backwards
    slides.first().before(slides.last());

    function clicker() {
    // Get all the slides again
    slides = $('.slide');
    // Register button
    var button = $(this);
    // Register active slide
    var activeSlide = $('.active');
    
    // Next function
        // Move first slide to the end so the user can keep going forward
        slides.last().after(slides.first());
        // Move active class to the right
        activeSlide.removeClass('active').next('.slide').addClass('active');
    
    // Previous function
    if (button.attr('id') == 'previous') {
        // Move the last slide before the first so the user can keep going backwards
        slides.first().before(slides.last());
        // Move active class to the left
        activeSlide.removeClass('active').prev('.slide').addClass('active');
    }
    };
    setInterval(clicker,5000)

    //modal
    $(".myBtn").click(function(e){
        e.preventDefault();
        $("#myModal").modal();
        $('#loader').hide();
    });
    $('#contact-form').submit(function(e){
        $('#loader').show();
    });

    function truncateText(maxLength) { //no longer usefull as this is easily done in the views page
        let elemsLent = $('.sermon-text').length;
        let element = $('.sermon-text');
        let elem = element.text();
        console.log(elem);
        console.log(elem.length);
        if (elem.length > maxLength) {
            elem = elem.substr(0,maxLength-3) +  "... "  + '<a href="/sermons/"> Read More</a>';
            element.html(elem)

        }
    }
    //truncateText(231)

    //Paginator
    $('.next').click(function(e){
        e.preventDefault();
        let count = $('.pager').attr('count');
        let loc = window.location.href
        let pageNumber = loc.split('').pop();
        if(pageNumber * 4 >= count){
            $('.next').prop('disabled', true); //disable the 'next' button if its the last page
        }
        else{
            pageNumber++;
            window.location.href = loc.slice(0,loc.length-1) + pageNumber;
        }
        
    });
    $('.previous').click(function(e){
        e.preventDefault();
        let count = $('.pager').attr('count');
        let loc = window.location.href;
        let pageNumber = loc.split('').pop();
        if(pageNumber == 1){ //disable the 'Previous' button if its the first page
            $('.previous').prop('disabled', true);
        }
        else{
            pageNumber--;
            window.location.href = loc.slice(0,loc.length-1) + pageNumber;
        }
    });

    let countCheckr = function(){
        let count = $('.pager').attr('count');
        let loc = window.location.href;
        let pageNumber = loc.split('').pop();
        if(count <= 4){
            $('.pager').hide();
        }
        if(Number.isInteger(pageNumber * 1)){ //make sure the pageNumber is a number before executing anything. thsi prevents errors in views where there is no need for pageNumber or where pageNumber does not exist
            $('.page' + pageNumber).prop('class', 'active');
        }
        else{}
        
    }
    countCheckr();
    
    //load ckeditor
    CKEDITOR.replace( 'textarea1' );
})