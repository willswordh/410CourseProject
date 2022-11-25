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
		const anchor_elements = Array.from(document.getElementsByClassName("SQnoC3ObvgnGjWt90zD9Z _2INHSNB8V5eaWp4P0rY_mE"))
		const urls = []
		if (anchor_elements.length > 0) {
			const search_results = anchor_elements.forEach(element => {
				const url = element.href
				// const json_url = element.href.substring(0, url.length-2) + ".json"

				// fetch(json_url).then(response => response.json()).then(data => {
				//    post_content = data[0]["data"]["children"][0]["data"]["selftext"]
				//	posts.push(post_content)
				// })
				urls.push(url)
			})

			console.log(JSON.stringify({'urls': urls.splice(0,1)}))

			fetch('http://localhost:8080', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({'urls': urls.splice(0,1)})
			})
			.then((response) => {
				if (response.ok) {
				  return response.json();
				}
				throw new Error('Something went wrong');
			})
			.then(text => {
			    console.log('hello')
			    console.log(text)})
			.catch((error) => {
  console.log(error)
});


			var div = document.createElement('label')
			var div_id = "cs410-extension"
			div.id = div_id
			if (!document.getElementById(div_id)) {
				div.appendChild(document.createTextNode('You might also want to search for: '))
				var results = ['hello', 'world']

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
				if (document.getElementsByClassName("_1iqnOY2Y57wmetu8MAjiId")) {
					document.getElementsByClassName("_1iqnOY2Y57wmetu8MAjiId")[0].append(div)
				}
			}
		}
	}
})()