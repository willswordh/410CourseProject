from http.server import BaseHTTPRequestHandler, HTTPServer
import json

import urllib.request, urllib.parse, urllib.error
from urllib.request import Request, urlopen
from bs4 import BeautifulSoup

from transformers import pipeline

import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

from collections import Counter

import time

import re

# For POS tagging and lexical analysis
nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')
# For filtering out stop words
nltk.download('stopwords')

# Server hosting
HOST_NAME = 'localhost'
PORT = 8080

# URL fetching error handling
REDDIT_ERROR_MESSAGE = 'reddit can\'t be reached'
RETRY_TIMES = 3

# LM construction
MAX_NUM_OF_LIKELIHOODS_CONSIDERED = 3
NUM_OF_RECOMMENDATIONS = 5

# STOP_WORDS
STOP_WORDS = set(stopwords.words('english'))


class Processor:
	def __init__(self):
		self.model = pipeline('fill-mask', model='bert-base-uncased')

	# Process incoming HTTP POST requests
	# Input: A list of URLs
	# Output: Top n words for recommendation for further search. n is defined by NUM_OF_RECOMMENDATIONS constant.
	def process(self, urls):
		aggregated_input = self.read_urls(urls)
		doc_LM = self.construct_doc_LM(aggregated_input)
		print(doc_LM.items())
		collection_LM = self.construct_collection_LM(aggregated_input)
		print(collection_LM.items())

		differences = {k: v - collection_LM.get(k, 0) for k, v in doc_LM.items()}
		sorted_doc_LM_by_scores = sorted(differences.items(), key=lambda x:-x[1])
		print(sorted_doc_LM_by_scores[:NUM_OF_RECOMMENDATIONS])
		recommendation_list = list(word for word, prob in sorted_doc_LM_by_scores[:NUM_OF_RECOMMENDATIONS])
		self.validate_result(recommendation_list, aggregated_input)
		return recommendation_list

	# Construct the collection language model by leveraging BERT fill mask functionality to approximate
	# Input: A string including all documents
	# Output: A dictionary of nouns with their corresponding probabilities as the collection language model
	def construct_collection_LM(self, aggregated_input):
		sentences = aggregated_input.split('. ')
		collection_LM = {}
		total_count = 0
		for sentence in sentences:
			# Tokenization
			words = word_tokenize(sentence)

			# POS tagging for lexical analysis
			pos_tagged_text = nltk.pos_tag(words)
		
			# Masking every single noun of the sentence at a time for keyword probability analysis
			for text, tag in pos_tagged_text:
				if tag == 'NNS': # check if tag is NNS (i.e. noun)
					# Apple masking exactly once
					input = sentence.replace(text, '[MASK]', 1)
					mask_likelihoods = self.model(input)
					# print(mask_likelihoods)
					for i in range(min(len(mask_likelihoods), MAX_NUM_OF_LIKELIHOODS_CONSIDERED)):
						likelihood = mask_likelihoods[i]

						# check if the predicted token contains special characters or is a stop word
						token_str = likelihood.get('token_str')
						if re.match('^[a-zA-Z0-9]*$', token_str) and token_str not in STOP_WORDS:
							token_str = token_str.lower()
							collection_LM[token_str] = likelihood.get('score') + collection_LM.get(token_str, 0)
							total_count = total_count + 1
		return {k: v / total_count for k, v in collection_LM.items()}

	# Construct Document Language Model using maximum likelihood estimater 
	# Input: A string including all documents
	# Output: A dictionary of nouns with their corresponding probabilities as the document language model
	def construct_doc_LM(self, aggregated_input):
		# Tokenization
		words = word_tokenize(aggregated_input)

		# POS tagging for lexical analysis
		# pos_tagged_text is a list of word-tag tuples. e.g. [('He', 'NNS')] 
		pos_tagged_text = nltk.pos_tag(words)

		# filter out non-noun words or stop words
		filtered = filter(lambda tuple: tuple[1] == 'NNS' and tuple[1] not in STOP_WORDS, pos_tagged_text)
		all_nouns = [tuple[0].lower() for tuple in list(filtered)]
		word_dist = Counter(all_nouns)
		
		return {k: v / len(all_nouns) for k, v in word_dist.items()}

	# Retrieve all information from a list of links
	# Input: A list of url links
	# Output: A string containing all paragraph info from the list of urls
	def read_urls(self, urls):
		input_list = []
		# TODO: see if there are ways to batch read urls
		for url in urls:
			req = Request(url)
			for retry_count in range(RETRY_TIMES):
				try:
					response = urlopen(req)
				except HTTPError as e:
					print('The server couldn\'t fulfill the request.')
					print('Error code: ', e.code)
				except URLError as e:
					print('We failed to reach a server.')
					print('Reason: ', e.reason)
				else:
					html = response.read()
					soup = BeautifulSoup(html, 'html.parser')
					contents = soup('title') + soup('p')

					# check if retry is needed
					if not any(REDDIT_ERROR_MESSAGE in data.getText() for data in contents):
						input_list = input_list + [data.getText() for data in contents]
						break
					print('Reddit server side error. Retrying count:', retry_count)
					# Exponential backoff
					time.sleep(0.25 * (2 ** retry_count))

		aggregated_input = ' '.join(input_list)
		return aggregated_input

	# Validate the correctness of the recommendated keywords 
	# via topic mining using the candidate terms as the topics
	# Input: A list of string; the recommended words
	# Output: score
	def validate_result(self, result_list, aggregated_input):
		lower_cased_input = aggregated_input.lower()
		scores = [(word, self.scoring_function(word, lower_cased_input)) for word in result_list]
		for word, score in scores:
			print('Score for recommended keyword', word, 'is', score)

	# Given that the stop words have been filtered out, there's no need to consider 
	# too frequent words or IDF weighting. We will just use TF as the metric for scoring.
	def scoring_function(self, word, corpus):
		return corpus.count(word)


class RecommendationRequestHandler(BaseHTTPRequestHandler):
	protocol_version = 'HTTP/1.1'

	def __init__(self, request, client_address, server):
		print("Initializing RecommendationRequestHandler.")
		self.processor = Processor()
		super().__init__(request, client_address, server)
		

	def do_POST(self):
		content_len = int(self.headers.get('Content-Length'))
		post_body = self.rfile.read(content_len)
		print(post_body)
		json_data = json.loads(post_body)
		if 'urls' not in json_data:
			self.wfile.write(bytes("Urls are not presented in the POST body.", "utf-8"))
		print(json_data['urls'])
		recommendation_words = self.processor.process(json_data['urls'])
		content = bytes(json.dumps(recommendation_words), "utf-8")

		self.send_response(200)
		self.send_header("Access-Control-Allow-Origin","*")
		self.send_header("Access-Control-Allow-Methods","*")
		self.send_header("Access-Control-Allow-Headers","*")
		self.send_header('Content-Type', 'application/json')
		self.send_header("Content-Length", str(len(content)))
		self.end_headers()
		self.wfile.write(content)


	def do_GET(self):
		self.send_response(200)
		self.send_header('Content-Type', 'text/html')
		self.end_headers()
		self.wfile.write(bytes("<html><head><title>CS410 Project - Team Wang</title></head>", "utf-8"))
		self.wfile.write(bytes("<p>Request path: %s</p>" % self.path, "utf-8"))
		self.wfile.write(bytes("<body>", "utf-8"))
		self.wfile.write(bytes("<p>GET operation is just a test. Please use POST </p>", "utf-8"))
		self.wfile.write(bytes("</body></html>", "utf-8"))

	def do_OPTIONS(self):
		# for CORS
		# self.send_response(200, "ok")
		# self.send_header('Access-Control-Allow-Origin', '*')
		# self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
		# self.send_header('Access-Control-Allow-Headers', 'Content-Type, Origin')
		# self.end_headers()

		self.send_response(200, "ok")
		self.send_header("Access-Control-Allow-Origin","*")
		self.send_header("Access-Control-Allow-Methods","*")
		self.send_header("Access-Control-Allow-Headers","*")
		self.end_headers()

if __name__ == "__main__": 
	webServer = HTTPServer((HOST_NAME, PORT), RecommendationRequestHandler)
	print("Server started http://%s:%s" % (HOST_NAME, PORT))

	try:
		webServer.serve_forever()
	except KeyboardInterrupt:
		pass
	webServer.server_close()
	print("Server stopped.")