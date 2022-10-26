(function() {
	const re = /.*reddit.com\/(r\/.+\/)?search\/\?q=(.*)/
	const matches = window.location.href.match(re)
	if (matches.length > 0) {
		const subreddit = matches[1] == null ? null : matches[1].split("/")[1]
		const queryParameters = matches[2].split("&")[0]

		// const temp = document.querySelectorAll("[data-click-id='body']")
		// console.log(temp)

		const anchor_elements = Array.from(document.getElementsByClassName("SQnoC3ObvgnGjWt90zD9Z _2INHSNB8V5eaWp4P0rY_mE"))
		if (anchor_elements.length > 0) {
			const search_result_urls = anchor_elements.map(element => element.href)
			console.log(search_result_urls)
		}
	}
	//if (window.location.href.contains("https://www.reddit.com/r/Gymnastics/search/?q=testt&restrict_sr=1&sr_nsfw="))
	//console.log(window.location.href)
	// var div = document.createElement('label')
	// var div_id = "cs410-extension"
	// div.id = div_id
	// if (!document.getElementById(div_id)) {
	// 	div.appendChild(document.createTextNode('You might also want to search for: '))
	// 	var results = ['fried chicken', 'fries']
	// 	results.forEach((suggestion, idx) => {
	// 		var anchorNode = document.createElement('a')
	// 		anchorNode.appendChild(document.createTextNode(suggestion))
	// 		anchorNode.href = 'https://www.google.com/search?q='+suggestion
	// 		div.appendChild(anchorNode)

	// 		if (idx < (results.length - 1)) {
	// 			div.appendChild(document.createTextNode(', '))
	// 		}

	// 	}) 

	// 	var temp = document.getElementById('hdtb')
	// 	temp.prepend(div)
	// }
})()