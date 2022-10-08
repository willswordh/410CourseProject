(function() {
	var div = document.createElement('label');
	div.appendChild(document.createTextNode('You might also want to search for: '));
	var results = ['fried chicken', 'fries'];
	results.forEach(suggestion => {
		var anchorNode = document.createElement('a')
		anchorNode.appendChild(document.createTextNode(suggestion))
		anchorNode.href = 'https://www.google.com/search?q='+suggestion
		div.appendChild(anchorNode);
		div.appendChild(document.createElement('br'))

	}) 

	var temp = document.getElementById('hdtb');
	temp.prepend(div);

})();