
$(window).on('load', function () {
    console.log("MEOW");
    $('#rating').barrating({theme:'fontawesome-stars'});
});

function addToCart() {
    var user_isbn = $("#isbn").text().split(" ")[1];
    var user_name = $("#user").text();
    var user_copies = $("#copies").val();
    var user_title = $('#title').text();
    var input = {isbn: user_isbn, copies:user_copies, title: user_title}
    console.log(input)
    $.ajax('http://localhost:3000/addToCart', {
        type: 'POST',
        data: JSON.stringify(input),
        contentType: 'text/json',
        success: function() { if ( callback ) callback(true); },
        error  : function() { if ( callback ) callback(false); }
    });
};

function submitReview() {
    var user_isbn = $("#isbn").text().split(" ")[1];
    var user_name = $("#user").text();
    var review = $("#review_text").val();
    var user_score = $("#rating").val();
    var review_date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    var input = {ISBN: user_isbn, user: user_name, comment: review, date: review_date, score: user_score};
    console.log(input);
    $.ajax('http://localhost:3000/submitReview', {
        type: 'POST',
        data: JSON.stringify(input),
        contentType: 'text/json',
        success: function() {
            window.location.reload();
            if ( callback ) callback(true); 
        },
        error  : function() { if ( callback ) callback(false); }
    });
}