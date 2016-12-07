// Get the modal
var modal = document.getElementById('NewBookModal');

// Get the button that opens the modal
var btn = document.getElementById("AddBookBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal 
btn.onclick = function() {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// set listeners for ordered/delivered buttons
var OrderButtons = document.getElementsByClassName("order");

for (var i = 0;i < OrderButtons.length;i++){
	var orderBtn = OrderButtons[i];
	orderBtn.onclick=function(){
		var orderBtn = this;
		var orderBtnId = this.id;
		var invoiceNumber = orderBtnId.split(" ")[0];
		
		var input = {
			number: invoiceNumber,
			status: 'delivered'
			};

		$.ajax('http://localhost:3000/updateInvoice', {
	        type: 'PUT',
	        data: JSON.stringify(input),
	        contentType: 'text/json',
	        success: function(data) { 
	        	console.log(data)
	        	orderBtn.innerHTML = "Delivered";
				orderBtn.className = "delivered";},
	        error  : function(error) { 
	        	console.log(error)
	        	window.alert(error.responseText) }
	    });
	};
}

function ShowPopularCount(){
    Count = $("#topPopularCount").val();
    if (isNaN(Count) ){
    	alert("You must enter valid number.");
    } else if (Count % 1 !== 0){
    	alert("You must enter a whole number.");
    } else {
    	// similar behavior as an HTTP redirect
    	window.location.replace("http://localhost:3000/admin/" + Count);
    }
};

// When the user clicks on the Add book button, Add book into database 
function addBook() {
	var input = {
				ISBN: $("input#ISBN").val(), 
				title:$("input#Title").val(), 
				authors: $("input#authors").val(), 
				publisher:$("input#publisher").val(), 
				year_pub: $("input#year_pub").val(), 
				copies:$("input#copies").val(), 
				price: $("input#price").val(), 
				tag:$("input#tag").val(), 
				format: $("input#format").val(), 
				subject:$("input#subject").val(), 
				image: $("input#image").val() 
				};

	$.ajax('http://localhost:3000/addBook', {
        type: 'POST',
        data: JSON.stringify(input),
        contentType: 'text/json',
        success: function() { 
        	window.location.reload();
        	window.alert("Book is added.") },
        error  : function(error) { 
        	console.log(error)
        	window.alert(error.responseText) }
    });
};

// When the user clicks on the Update Book Copies button
function updateBookCount() {
	var input = {
				ISBN: $("input#ISBNUpdateCount").val(), 
				copies:$("input#copiesToAdd").val()
				};

	if (input.ISBN === "" || input.copies === ""){
		alert("Please fill in all fields.")
	} else {

		$.ajax('http://localhost:3000/updateBookCount', {
			type: 'PUT',
			data: JSON.stringify(input),
			contentType: 'text/json',
			success: function(data) {
				console.log(data); 
				window.alert(data);
				window.location.reload(); },
			error  : function(error) { 
				console.log(error);
				window.alert(error.responseText); }
		});
	}
};