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

var OrderButtons = document.getElementsByClassName("order");

for (var i = 0;i < OrderButtons.length;i++){
	var orderBtn = OrderButtons[i];
	orderBtn.onclick=function(){
		this.innerHTML = "Delivered"
		this.className = "delivered";
	};
}