function openRegisterPopup() {
    var popup = document.getElementById('register_popup');
    popup.classList.toggle('show');
}

function openSignInPopup() {
    var popup = document.getElementById('sign_in_popup'); 
    popup.classList.toggle('show');
}

function submitDetails() {
	console.log("button pressed")
	var input = {
				name: $("input#reg_name").val(), 
				user: $("input#user_name").val(), 
				password:$("input#pass_word").val() , 
				card_no:$("input#card_no").val(), 
				address:$("input#add").val(), 
				phone_no:$("input#phone_number").val()
				};
	console.log(input)
	$.ajax('http://localhost:3000/register', {
        type: 'POST',
        data: JSON.stringify(input),
        contentType: 'text/json',
        success: function() { 
			window.location.reload();
		},
        error  : function() { 
			document.getElementById("signupFailure").innerHTML = "Invalid Registration"
		}
    });
}

function signIn() {
	var input = {
				user: $("input#username").val(), 
				password:$("input#password").val() 
				};
	$.ajax('http://localhost:3000/signIn', {
        type: 'POST',
        data: JSON.stringify(input),
        contentType: 'text/json',
        success: function() { 
			window.location.reload();
		},
        error  : function() { 
			document.getElementById("signinFailure").innerHTML = "Wrong Login Details"
		}
    });
}

function search() {
	var input = {
				title: $("input#search_title").val(), 
				authors:$("input#search_author").val(), 
				publisher: $("input#search_publisher").val(), 
				subject:$("input#search_subject").val(),
				sort: $("select#sort").val()
				};
	$.ajax('http://localhost:3000/search', {
        type: 'POST',
        data: JSON.stringify(input),
        contentType: 'text/json',
        success: function() {
			window.location.reload();
			 },
        error  : function() {  }
    });
}
