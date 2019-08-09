$(document).ready(function(){
    LoadData('.paginate');
    return GetResult();
});

function GetResult(){
    $.ajax({
        url: 'http://content.guardianapis.com/football?page-size=10&order-by=newest&show-fields=all&api-key=48c4e0a9-e4ee-421a-9a76-b12870952434',
        type: 'get',
        dataType: 'json',
        success: function(data){
            var results = '';

            $.each(data.response.results, function(i){
                results += '<form class="paginate">'
                results += '<div class="col-md-12 news-post">';
                results += '<div class="row">';
                results += '<a href="' + data.response.results[i].webUrl + '" target="_blank" style="color: #4aa1f3; text-decoration:none;">';
                results += '<div class="col-md-2">';
                results += '<img src="' + data.response.results[i].fields.thumbnail + '"  class="img-responsive">';
                results += '</div>';

                results += '<div class="col-md-10">';
                results += '<h4 class="news-date">' + new Date(Date.parse(data.response.results[i].webPublicationDate)).toDateString() + '</h4>';
                results += '<h3>' + data.response.results[i].fields.headline + '</h3>';
                results += '<p class="news-text">' + data.response.results[i].webTitle+ '</p>';
                results += '</div>';

                results += '</a>'
                results += '</div>';
                results += '</div>';
                results += '</form>';
            });
            
            $("#newsResults").html(results);
            $('.paginate').slice(0,2).show();
        }
    });
}

function LoadData(divClass){
    $("#loadMore").on('click', function(e){
        e.preventDefault();

        $(divClass + ":hidden").slice(0,3).slideDown();

        $('html', 'body').animate({
            scrollTop: $(this).offset().top
        }, 2000);
    });

    $("#linkTop").click(function(){
        $('html', 'body').animate({
            scrollTop: 0
        }, 500);
    });
}