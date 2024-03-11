const Langchainsummarization = require('./summarization.js');
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const youtubeTranscript = require('youtube-transcript')

const app = express()

app.use(bodyParser.json())
app.use(cors())

app.get('/', (req, res) => {
    res.send(`Server is running on port ${process.env.PORT || 3000}`)
})

app.post('/youtube-transcript', (req, res) => {
    const requestData = req.body;

    if (!requestData || typeof requestData !== 'object') {
        res.status(400).json({ error: 'Bad Request: Please provide a JSON object in the request body.' })
    } else {
        const ytLink = requestData.ytLink
        if (ytLink) {
            // youtubeTranscript.YoutubeTranscript.fetchTranscript('https://youtu.be/DxNYOP-2rXs?si=jn2T8RBbAtHxXd1D').then(console.log)
            youtubeTranscript.YoutubeTranscript.fetchTranscript(ytLink).then((data) => {
                res.json({ response: data })
            }).catch((err) => {
                res.status(400).json({ error: err })
            })
        } else {
            res.status(400).json({ error: 'Bad Request: Missing "ytLink" field in the JSON object.' })
        }
    }
})

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

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server listening at http://localhost:${process.env.PORT || 3000}`)
})
