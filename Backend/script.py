# script.py
import sys
import json
from youtube_transcript_api import YouTubeTranscriptApi

def process_data(input_data):
    # Process the input data
    # Here you can use the Python module that you need
    result = {"output": f"Processed data: {input_data['input']}"}
    return result

def get_transcript(video_id):
    proxy = 'https://coydbahd:p01esrad3gzh@173.0.9.209:5792'
    # proxy = 'socks5h://183.234.215.11:8443'
    try:
        result = YouTubeTranscriptApi.get_transcript(video_id, proxies={
            'http' : proxy,
            'https': proxy
        })
    except Exception as e:
        result = str(e)

    return result

if __name__ == "__main__":
    # Read data from Node.js (passed through stdin)
    input_data = json.loads(sys.stdin.read())
    # result = process_data(input_data)
    result = get_transcript(input_data)
    # Print the result as JSON to be passed back to Node.js
    print(json.dumps(result))