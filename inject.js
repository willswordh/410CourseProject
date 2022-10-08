(function() {
	var div = document.createElement('label')
	var div_id = "cs410-extension"
	div.id = div_id
	if (!document.getElementById(div_id)) {
		div.appendChild(document.createTextNode('You might also want to search for: '))
		var results = ['fried chicken', 'fries']
		results.forEach((suggestion, idx) => {
			var anchorNode = document.createElement('a')
			anchorNode.appendChild(document.createTextNode(suggestion))
			anchorNode.href = 'https://www.google.com/search?q='+suggestion
			div.appendChild(anchorNode)

			if (idx < (results.length - 1)) {
				div.appendChild(document.createTextNode(', '))
			}

		}) 

		var temp = document.getElementById('hdtb')
		temp.prepend(div)
	}
})()