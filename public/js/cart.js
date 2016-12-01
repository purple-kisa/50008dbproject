function deleteRow(btndel, isbn) {
    if (typeof(btndel) == "object") {
        $(btndel).closest("tr").remove();
    } else {
        return false;
    }
    console.log(isbn);
    var input = {
				book_isbn: isbn
				};
	$.ajax('http://localhost:3000/cart', {
        type: 'POST',
        data: JSON.stringify(input),
        contentType: 'text/json',
        success: function() {  },
        error  : function() { }
    });


}

function submitOrder() {
    console.log("submit order");

	$.ajax('http://localhost:3000/submitOrder', {
        type: 'POST',
        data: "",
        contentType: 'text/json',
        success: function() {
            window.location.reload();
        },
        error  : function() {  }
    });

}