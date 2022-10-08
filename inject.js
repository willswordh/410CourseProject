(function() {

	console.log(document);
	// just place a div at top right
	var div = document.createElement('div');
	div.textContent = 'You might also want to search for: fried chicken';
	var temp = document.getElementById('hdtb');
	temp.prepend(div);

})();