const Langchainsummarization = require('./summarization.js');
const express = require('express')
const axios = require('axios')
const bodyParser = require('body-parser')
const cors = require('cors')
const youtubeTranscript = require('youtube-transcript')
const { spawn } = require('child_process');

const app = express()

app.use(bodyParser.json())
app.use(cors())

app.get('/', (req, res) => {
    res.send(`Server is running on port ${process.env.PORT || 4000}`)
})

app.get('/test/:videoId', async (req, res) => {
    const videoId = req.params.videoId;

    try{
        const response = await axios.get(`https://hppnkk4o5araiwaxeg5ppegzbe0fzkzf.lambda-url.us-east-2.on.aws/?video_id=${videoId}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: `Problem with request: ${error.message}` });
    }
})

function getYouTubeVideoID(url) {
  const parsedUrl = new URL(url);
  
  // Handle the standard YouTube URL (e.g., https://www.youtube.com/watch?v=18c3MTX0PK0)
  if (parsedUrl.hostname === 'www.youtube.com' || parsedUrl.hostname === 'youtube.com') {
    return parsedUrl.searchParams.get('v');
  }
  
  // Handle the shortened YouTube URL (e.g., https://youtu.be/StGF3CdkSVM)
  if (parsedUrl.hostname === 'youtu.be') {
    return parsedUrl.pathname.substring(1); // Video ID is in the pathname
  }

  return null; // Return null if it's not a valid YouTube URL
}

app.post('/youtube-transcript', async (req, res) => {
    const requestData = req.body;

    if (!requestData || typeof requestData !== 'object') {
        res.status(400).json({ error: 'Bad Request: Please provide a JSON object in the request body.' })
    } else {
        const ytLink = requestData.ytLink
        if (ytLink) {
            const videoId = getYouTubeVideoID(ytLink); 
            try{
                const response = await axios.get(`https://noteeline-apis.vercel.app/transcript/${videoId}`);
                res.json(response.data);
            } catch (error) {
                res.status(500).json({ error: `Problem with request: ${error.message}` });
            }
        } else {
            res.status(400).json({ error: 'Bad Request: Missing "ytLink" field in the JSON object.' })
        }
    }
})

app.get('/test', (req, res) => {
    youtubeTranscript.YoutubeTranscript.fetchTranscript('https://youtube.com/watch?v=w0QbnxKRD0w', {lang:'en'}).then(data => {
        res.json({ response: data })
    }).catch((err) => {
        res.status(400).json({ error: err })
    })
})

/*
Unusable due to deprecation of the npm package

app.post('/youtube-transcript', (req, res) => {
    const requestData = req.body;

    if (!requestData || typeof requestData !== 'object') {
        res.status(400).json({ error: 'Bad Request: Please provide a JSON object in the request body.' })
    } else {
        const ytLink = requestData.ytLink
        if (ytLink) {
            // youtubeTranscript.YoutubeTranscript.fetchTranscript('https://youtu.be/DxNYOP-2rXs?si=jn2T8RBbAtHxXd1D').then(console.log)
            // {lang: 'en'}
            youtubeTranscript.YoutubeTranscript.fetchTranscript(ytLink, {lang: 'en', country: 'US', }).then((data) => {
                res.json({ response: data })
            }).catch((err) => {
                res.status(400).json({ error: err })
            })
        } else {
            res.status(400).json({ error: 'Bad Request: Missing "ytLink" field in the JSON object.' })
        }
    }
})
*/

app.post('/fetch-summary', (req, res) => {
     const requestData = req.body

     if (!requestData || typeof requestData !== 'object') {
       res.status(400).json({ error: 'Bad Request: Please provide a JSON object in the request body.' })
    }else{
       const transcript = requestData.transcript
      
       Langchainsummarization(transcript).then((result) => {
         console.log('Received summary at index.js');
         res.json({ response: result })
       }).catch((error) => {
         console.log(error)
         res.status(400).json({ error: error })
       })
    }
})

app.post('/summary-note-transcript', (req, res) => {
    const requestData = req.body

    if (!requestData || typeof requestData !== 'object') {
        res.status(400).json({ error: 'Bad Request: Please provide a JSON object in the request body.' })
     }else{
        const points = requestData.points
        
        //extend code here...
     }
})

app.listen(process.env.PORT || 4000, () => {
    console.log(`Server listening at http://localhost:${process.env.PORT || 4000}`)
})
