
$(window).on('load', function () {
    console.log("MEOW");
    $('#rating').barrating({theme:'fontawesome-stars'});
    // $("#review").barrating({theme:'fontawesome-stars'});
    $('.review').each(function() {
        $(this).barrating({theme:'fontawesome-stars', readonly:true});
        var score = $(this).attr("score");
        $(this).barrating('set', score);
    });
});

function addToCart() {
    var user_isbn = $("#isbn").text().split(" ")[1];
    var user_name = $("#user").text();
    var user_copies = $("#copies").val();
    var user_title = $('#title').text();

    console.log(user_copies);

    if(isNaN(user_copies)) {
        console.log("is not number"); 
        $("#enter_number").show(); 
        $("#added").hide(); 
        $("#not_enough_copies").hide();
    } else {
        console.log("is number");
        if(parseInt(user_copies,10)>parseInt($("#avail_copies").text().split(" ")[2],10)) {
            console.log("too little copies :(")
            $("#not_enough_copies").show();
            $("#added").hide(); 
            $("#enter_number").hide();
        }
        else {
            var input = {isbn: user_isbn, copies:user_copies, title: user_title}
            console.log(input)
            $.ajax('http://localhost:3000/addToCart', {
                type: 'POST',
                data: JSON.stringify(input),
                contentType: 'text/json',
                success: function() { 
                    $("#added").show();
                    $("#enter_number").hide(); 
                    $("#not_enough_copies").hide();
                    $("#recommendations").show();
                },
                error  : function() {  }
            });
        }
    }
};

function showEntries() {
    numberToShow = parseInt($("#feedback_filter").val(),10);
    numberOfFeedback = parseInt($("#numberOfFeedback").text(),10);
    console.log(numberToShow + ", " + numberOfFeedback);
    if (numberToShow < numberOfFeedback) {
        for(i=0; i<numberToShow; i++) {
            $("#feedback"+i).show();
        }
        for(i = numberToShow; i<numberOfFeedback; i++) {
            $("#feedback"+i).hide();
        }
    } else {
        for(i=0; i<numberOfFeedback; i++) {
            $("#feedback"+i).show();
        }
    }
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
        },
        error  : function() { 
            document.getElementById("submitReviewFailure").innerHTML = "You can only submit one review per book!";
        }
    });
}

function plusOne(user) {
    var isbn = $("#isbn").text().split(" ")[1];
    var user_feedback_retrieve = user; 
    var user_rate_retrieve = $("#user").text(); 
    if(user_rate_retrieve!=user_feedback_retrieve) {
        var input = {ISBN: isbn, user_feedback: user_feedback_retrieve, user_rate: user_rate_retrieve, rate: '1'};
        console.log("plus one function")
        console.log(input);
        $.ajax('http://localhost:3000/rating', {
            type: 'POST',
            data: JSON.stringify(input),
            contentType: 'text/json',
            success: function() {
                window.location.reload();
            },
            error  : function() { 
                alert("You can only rate each feedback once!");
            }
        });    
    } else {
        alert("You can't rate your own feedback!");
    }

}

function minusOne(user) {
    var isbn = $("#isbn").text().split(" ")[1];
    var user_feedback_retrieve = user; 
    var user_rate_retrieve = $("#user").text(); 
    if(user_rate_retrieve!=user_feedback_retrieve) {
        var input = {ISBN: isbn, user_feedback: user_feedback_retrieve, user_rate: user_rate_retrieve, rate: '-1'};
        console.log(input);
        $.ajax('http://localhost:3000/rating', {
            type: 'POST',
            data: JSON.stringify(input),
            contentType: 'text/json',
            success: function() {
                window.location.reload();
            },
            error  : function() {
                alert("You can only rate each feedback once!");
            }
        });
    } else {
        alert("You can't rate your own feedback!");
    }
}