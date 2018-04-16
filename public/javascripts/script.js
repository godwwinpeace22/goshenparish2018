$(document).ready(function(){
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
});

$('#youth,#sod,#risa,#children,#biblec,#men').hover(function(e){
    id = e.currentTarget.id; // get the element currently hovered and call the hover function on it
    //hoverFunction(id);
    //$(this).css({transform:'scale(2)'});
});

// Hover transition effect
var hoverFunction = function(elem){
    var movementStrength = 5;
    var height = (movementStrength  - 8)/ $('.hover').height();
    var width = (movementStrength -80) / $('.hover').width();
    $("#" + elem).mousemove(function(e){
        var pageX = e.pageX - ($('#' + elem).width() / 2);
        var pageY = e.pageY - ($('#' + elem).height() / 2);
        var newvalueX = width * pageX * -1 -80;
        var newvalueY = height * pageY * -1 - 10;
        $('#' + elem).css("background-position", newvalueX+"px     "+newvalueY+"px");
    });
}

// switch active tab to the one suggested by the hash in the url (if any)
window.onload = function(){
    var hash = window.location.hash;
    if(hash){
        $('.nav li, .tab-pane').removeClass('in active');
        $('.nav-stacked li a[href="'+hash+'"]').parent().addClass('active');
        $(hash).addClass('in active');
        //$('.nav-tabs a[href="'+hash+'"]').tab('show');
        window.scrollTo(0, 0);
    }
}

// make dropdown link also clickable
$('.dropdown-toggle').click(
    function(){
      if ($(this).next().is(':visible')) {
        location.href = $(this).attr('href');;
      }
});
  

// Filter Events
$('#get-all').click(function(){
    var loc = window.location.href.split('?');
    window.location.href = loc[0];
})
$('.filter select').on('change', function(e){
    var ab = window.location.href.split('?');
    var loc = ab[0]
    console.log($('.checkbox').prop('checked'))
    if($('.checkbox').prop('checked') == true){
        console.log($(this).val())
        console.log($(this).attr('name'));
        $('#filter-all').click(function(){
            var key1 = 'day';
            var key2 = 'month';
            var key3 = 'year';
            var value1 = $('#byday').val();
            var value2 = $('#bymonth').val();
            var value3 = $('#byyear').val();
            window.location.href = loc + '?all=true&' + key1 + '=' + value1 + '&' + key2 + '=' + value2 + '&' + key3 + '=' + value3
        })
    }
    else{
        console.log(loc);
        var value = $(this).val();
        var key = $(this).attr('name');
        console.log(loc + '?all=false&' + key+'=' + value)
        window.location.href = loc + '?all=false&' + key+'=' + value
    }
    
    
    
})

$(window).on('resize load orientationchange', function(){
    var width = $(window).outerWidth()
    width <= 767 ? $('.nav-pills').removeClass('nav-stacked').siblings('hr').show() : 
    $('.nav-pills').addClass('nav-stacked').siblings('hr').hide()

    if(width <= 953){
        $('.service-inner').removeClass('col-sm-10').removeClass('col-sm-offset-1').addClass('.col-sm-12')
    }
    else{
        $('.service-inner').addClass('col-sm-10').addClass('col-sm-offset-1').removeClass('.col-sm-12')
    }
})



/// slider
jssor_1_slider_init = function() {
    var jssor_1_SlideshowTransitions = [
      {$Duration:1000,x:-0.2,$Delay:20,$Cols:16,$SlideOut:true,$Formation:$JssorSlideshowFormations$.$FormationStraight,$Assembly:260,$Easing:{$Left:$Jease$.$InOutExpo,$Opacity:$Jease$.$InOutQuad},$Opacity:2,$Outside:true,$Round:{$Top:0.5}},
      {$Duration:1000,x:1,$Opacity:2,$Easing:$Jease$.$InBounce},
      {$Duration:1200,x:2,y:1,$Cols:2,$Zoom:11,$Rotate:1,$Assembly:2049,$ChessMode:{$Column:15},$Easing:{$Left:$Jease$.$InCubic,$Top:$Jease$.$InCubic,$Zoom:$Jease$.$InCubic,$Opacity:$Jease$.$OutQuad,$Rotate:$Jease$.$InCubic},$Opacity:2,$Round:{$Rotate:0.7}},
      {$Duration:1000,x:1,$Rows:2,$ChessMode:{$Row:3},$Easing:{$Left:$Jease$.$InOutQuart,$Opacity:$Jease$.$Linear},$Opacity:2,$Brother:{$Duration:1000,x:-1,$Rows:2,$ChessMode:{$Row:3},$Easing:{$Left:$Jease$.$InOutQuart,$Opacity:$Jease$.$Linear},$Opacity:2}}
    ];

    var jssor_1_options = {
      $AutoPlay: 1,
      $LazyLoading: 1,
      $SlideshowOptions: {
        $Class: $JssorSlideshowRunner$,
        $Transitions: jssor_1_SlideshowTransitions,
        $TransitionsOrder: 1
      },
      $ArrowNavigatorOptions: {
        $Class: $JssorArrowNavigator$
      },
      $BulletNavigatorOptions: {
        $Class: $JssorBulletNavigator$
      }
    };

    var jssor_1_slider = new $JssorSlider$("jssor_1", jssor_1_options);

    /*#region responsive code begin*/

    var MAX_WIDTH = 1800;

    function ScaleSlider() {
        var containerElement = jssor_1_slider.$Elmt.parentNode;
        var containerWidth = containerElement.clientWidth;

        if (containerWidth) {

            var expectedWidth = Math.min(MAX_WIDTH || containerWidth, containerWidth);

            jssor_1_slider.$ScaleWidth(expectedWidth);
        }
        else {
            window.setTimeout(ScaleSlider, 30);
        }
    }

    ScaleSlider();

    $Jssor$.$AddEvent(window, "load", ScaleSlider);
    $Jssor$.$AddEvent(window, "resize", ScaleSlider);
    $Jssor$.$AddEvent(window, "orientationchange", ScaleSlider);
    /*#endregion responsive code end*/
}

