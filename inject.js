(async function() {
	const re = /.*reddit.com\/(r\/.+\/)?search\/?\?q=(.*)/
	const matches = window.location.href.match(re)
	if (matches && matches.length > 0) {
		const subreddit = matches[1] == null ? null : matches[1].split("/")[1]
		const queryParameters = matches[2].split("&")[0]

		console.log(subreddit)
		console.log(queryParameters.split("%20"))


		while (document.getElementsByClassName("SQnoC3ObvgnGjWt90zD9Z _2INHSNB8V5eaWp4P0rY_mE").length == 0) {
			// hack to wait for page to be fully loaded in order to access search results
			// note that changeInfo.status == "complete" does not work because of dynamic loading
			await new Promise(r => setTimeout(r, 50))
		}

		const loading_div = document.createElement('label');
		const div_id = "cs410-extension"
		loading_div.id = div_id;
		loading_div.appendChild(document.createTextNode('Loading keyword recommendations...'))

		if (!document.getElementById(div_id)) {
			document.getElementsByClassName("_1iqnOY2Y57wmetu8MAjiId")[0].append(loading_div)
		} else {
			document.getElementsByClassName("_1iqnOY2Y57wmetu8MAjiId")[0].replaceChild(loading_div, document.getElementById(div_id))
		}

		const anchor_elements = Array.from(document.getElementsByClassName("SQnoC3ObvgnGjWt90zD9Z _2INHSNB8V5eaWp4P0rY_mE"))
		const urls = []
		if (anchor_elements.length > 0) {
			const search_results = anchor_elements.forEach(element => {
				const url = element.href
				urls.push(url)
			})

			fetch('http://localhost:8080', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				// use top 3 posts
				body: JSON.stringify({'urls': urls.splice(0,3)})
			})
			.then((response) => {
				if (response.ok) {
				  return response.json();
				}
				throw new Error('Something went wrong');
			})
			.then(results => {
			    var div = document.createElement('label')
				div.id = div_id
				div.appendChild(document.createTextNode('You might also want to search for: '))

				var subreddit_query_string = subreddit ? '/r/'+subreddit : ""

				results.forEach((suggestion, idx) => {
					var anchorNode = document.createElement('a')
					anchorNode.appendChild(document.createTextNode(suggestion))
					anchorNode.href = 'https://www.reddit.com' + subreddit_query_string + '/search?q=' + suggestion
					div.appendChild(anchorNode)

					if (idx < (results.length - 1)) {
						div.appendChild(document.createTextNode(', '))
					}
				})
				document.getElementsByClassName("_1iqnOY2Y57wmetu8MAjiId")[0].replaceChild(div, document.getElementById(div_id))
			})
			.catch((error) => {
			  console.log(error)
			});

		}
	}
})()