$(function(){

    $('.button').on('click', function(){
        window.print();
        //alert()
    })

    // sort members
    $('.filter select').change(function(e){
        //console.log($(this).val() +' '+ $(this).prop('name'))
        var baseurl = location.href.split('?')[0]
        location.href = baseurl + '?' + 'sortby=' + $(this).prop('name') +'&sortval=' + $(this).val()
    });

    //filter the areas based on the zone selected
    $('#zone').change(function(e){
        $('#area option').show()
        var foo = $(this).val()
        $( `#area option:not(.${foo})` ).hide()
    })

    // filter the parishes based on the area selected
    $('#area').change(function(e){
        $('#parish option').show()
        var bar = $(this).val()
        $( `#parish option:not(.${bar})` ).hide()
    })
    //$('#messages').fadeOut(5000);
    //var markup = document.documentElement.innerHTML; get the whole html of the page
    //console.log(markup);
})
