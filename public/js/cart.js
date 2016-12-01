function deleteRow(btndel, isbn) {
    if (typeof(btndel) == "object") {
        $(btndel).closest("tr").remove();
    } else {
        return false;
    }
    var input = {
				book_isbn: isbn
				};
	console.log(input)
	$.ajax('http://localhost:3000/cart', {
        type: 'POST',
        data: JSON.stringify(input),
        contentType: 'text/json',
        success: function() { if ( callback ) callback(true); },
        error  : function() { if ( callback ) callback(false); }
    });


}

function submitOrder() {
    console.log("submit order");
}