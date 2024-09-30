import json
import requests
import logging
from youtube_transcript_api import YouTubeTranscriptApi


logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Monkey-patch the requests.Session.request method
def patched_request(self, *args, **kwargs):
    kwargs['verify'] = 'zyte-ca.crt'  # Path to your custom CA certificate
    return original_request(self, *args, **kwargs)

original_request = requests.Session.request
requests.Session.request = patched_request

def lambda_handler(event, context):
    
    # Get the length and width parameters from the event object. The 
    # runtime converts the event object to a Python dictionary
    vid = event['queryStringParameters']['video_id']
    # vid = event['video_id']

    tr = get_transcript(vid)
    print(f"The transcript is {tr}")
        
    logger.info(f"CloudWatch logs group: {context.log_group_name}")
    
    # return the calculated area as a JSON string
    data = {"transcript": tr}
    return json.dumps(data)
    
def get_transcript(video_id):
    # proxy = 'http://coydbahd:p01esrad3gzh@173.0.9.209:5792'
    # proxy = 'http://vqmpgykm:nl7enetumge3@204.44.69.89:6342'
    # proxy = 'http://coydbahd:p01esrad3gzh@204.44.69.89:6342'
    # proxy = 'http://coydbahd:p01esrad3gzh@64.64.118.149:6732'
    proxies = [
        'http://44b60d31540c4fa79dd3f13918342d01:@api.zyte.com:8011/'
        # 'http://rcelkpui:he7echtlinf9@104.239.105.125:6655',
        # 'http://coydbahd:p01esrad3gzh@173.0.9.209:5792',
        # 'http://vqmpgykm:nl7enetumge3@204.44.69.89:6342',
        # 'http://coydbahd:p01esrad3gzh@204.44.69.89:6342',
        # 'http://coydbahd:p01esrad3gzh@206.41.172.74:6634',
    ]
    
    result = ''
    for proxy in proxies:
        try:
            result = YouTubeTranscriptApi.get_transcript(video_id, proxies={
                'http' : proxy,
                'https': proxy
            })
            
            return result
        except Exception as e:
            logger.error(f"Failed with proxy {proxy}: {str(e)}")
            result = str(e)

    return result
