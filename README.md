# cs410-extension

1. Visit chrome://extensions/
2. Turn on developer mode (top right corner)
3. Click on "Load Unpacked" and select the whole repo
4. Visit https://www.google.com/ and perform a search
5. Observe suggestions below the search bar


## Backend Setup
```
pip3 install transformers nltk tensorflow
```

To run the backend server: `python3 handler.py` (Note that the first time running will take a while)

Use curl to trigger localhost:
```
curl --url     http://localhost:8080 \
     --header  'Content-Type: application/json' \
     --data    "{\"urls\":[\"https://www.reddit.com\"]}" \
     --verbose
```