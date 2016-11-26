function openRegisterPopup() {
    var popup = document.getElementById('register_popup');
    popup.classList.toggle('show');
}

function openSignInPopup() {
    var popup = document.getElementById('sign_in_popup'); 
    popup.classList.toggle('show');
}

function submitDetails() {
	var input = {
				name: $("input#reg_name").val(), 
				user: $("input#user_name").val(), 
				password:$("input#pass_word").val() , 
				card_no:$("input#card_no").val(), 
				address:$("input#add").val(), 
				phone_no:$("input#phone_number").val()
				}
}