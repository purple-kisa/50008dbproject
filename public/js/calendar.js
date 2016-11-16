$('document').ready(function(){
	var width = document.getElementById("gridder-div").offsetWidth; 
	console.log(width);
	$("img.calendarContent1").attr("width", width);
	
	$(".calendarButton").click(function(){
		if($(this).attr("class")=="calendarButton") {
			$(".calendarButtonClicked").attr("class", "calendarButton");
			$(this).attr("class", "calendarButtonClicked"); 
		} else {
			$(this).attr("class", "calendarButton");
		}
	}); 
});