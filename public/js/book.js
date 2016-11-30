
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
    var review = $("#review_text").val();
    var score = $("#rating").val();
    var date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').split(" ")[0];
    console.log("review is " + review + ", score is " + score + ", and date is " + date);
}