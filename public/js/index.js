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
	$.ajax('http://localhost:3000/', {
        type: 'POST',
        data: JSON.stringify(input),
        contentType: 'text/json',
        success: function() { if ( callback ) callback(true); },
        error  : function() { if ( callback ) callback(false); }
    });
}

