
$(window).on('load', function () {
    console.log("MEOW");
    $('#rating').barrating({theme:'fontawesome-stars'});
});

function addToCart() {
    var isbn = $("#isbn").text().split(" ")[1];
    var user = $("#user").text();
    var copies = $("#copies").val();
    console.log("isbn is " + isbn + ", user is " + user + ", copies is " + copies);
};

function submitReview() {
    var review = $("#review_text").val();
    var score = $("#rating").val();
    var date = new Date();
    console.log("review is " + review + ", score is " + score + ", and date is " + date);
}