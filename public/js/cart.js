function deleteRow(btndel, isbn) {
    if (typeof(btndel) == "object") {
        $(btndel).closest("tr").remove();
    } else {
        return false;
    }
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