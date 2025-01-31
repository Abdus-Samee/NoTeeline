import requests
from flask import Flask, Blueprint, jsonify
from youtube_transcript_api import YouTubeTranscriptApi

app = Flask(__name__)

@app.route('/')
def home():
    return 'Hello, World!'

@app.route('/about')
def about():
    return 'About'

@app.route('/joke')
def joke():
    url = "https://official-joke-api.appspot.com/jokes/random"
    response = requests.get(url)
    if response.status_code == 200:
        joke = response.json()
        return jsonify({
            "setup": joke.get("setup"),
            "punchline": joke.get("punchline")
        })
    else:
        return jsonify({"error": "Unable to fetch a joke at the moment."}), 500

@app.route('/transcript/<video_id>')
def transcript(video_id):
    proxies = [
        'http://rcelkpui:he7echtlinf9@104.239.105.125:6655',
        'http://rcelkpui:he7echtlinf9@198.23.239.134:6540',
        'http://rcelkpui:he7echtlinf9@207.244.217.165:6712',
        'http://rcelkpui:he7echtlinf9@107.172.163.27:6543',
        'http://rcelkpui:he7echtlinf9@64.137.42.112:5157',
    ]
    tr = ''
    for proxy in proxies:
        try:
            tr = YouTubeTranscriptApi.get_transcript(video_id, proxies={
                'http' : proxy,
                'https': proxy
            })
            
            return tr
        except Exception as e:
            tr = str(e)

    return tr
