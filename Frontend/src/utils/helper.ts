import OpenAI from 'openai'
import { NotePoint, TranscriptLine } from "../state/noteStore"

// const SEED = 1
const WINDOW_SIZE = 20000 //20000ms
// const OPEN_AI_KEY = import.meta.env.VITE_OPEN_AI_KEY
const OPEN_AI_KEY = "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"
export const openai = new OpenAI({ apiKey: OPEN_AI_KEY, dangerouslyAllowBrowser: true })
// const template = "You are a note taking assistant. Users will give you their summary and the meeting transcript."+
//                  "You have to expand it to 2-3 full sentences in simple english.\nHere is one example:\n"+
//                  "Transcript: .. Yeah. So, for background, we both did these scans for this research project that we have at Meta called"+
//                  "Kodak Avatars. And the idea is that instead of our avatars being cartoony and instead of actually transmitting a video, "+
//                  "what it does is we’ve scanned ourselves and a lot of different expressions, and we’ve built a computer model of each of "+
//                  "our faces and bodies and the different expressions that we make and collapsed that into a Kodak that then when you have the "+
//                  "headset on your head, it sees your face, it sees your expression, and it can basically send an encoded version of what you’re "+
//                  "supposed to look like over the wire. So, in addition to being photorealistic, it’s also actually much more bandwidth efficient than "+
//                  "transmitting a full video or especially a 3D immersive video of a whole scene like this...\n"+
//                  "Summary: kodak, encode face, efficient\n"+
//                  "Note: Kodak is a compressed format of the facial expression. So, besides being photorealistic, it is highly efficient for transmission as well.\n\n"

export type GPTRequest = {
    point: string;
    transcript: string[];
}

export const expandPoint = (point: NotePoint, transcript: TranscriptLine[]) => {
    let expandedPoint = { point: point.point, transcript: [] as string[] }
    for(var i = 0; i < transcript.length; i++) {
        let tr_offset = transcript[i].offset
        let tr_end = transcript[i].offset + transcript[i].duration
        let right = point.created_at*1000.0 //converting to ms to match transcript time
        let left = right - WINDOW_SIZE

        //there is partial or full overlapping between point and transcript
        if(!(right < tr_offset) && !(left > tr_end)) {
            expandedPoint.transcript.push(transcript[i].text)
        }
    }

    return expandedPoint
}

// export const callGPT = (req: GPTRequest) => {
//     let transcript = req.transcript.join(".")

//     const PROMPT = "You are a note taking assistant. Users will give you their summary and the meeting transcript."+
//                "You have to expand it to 2-3 full sentences in simple english.\nHere is one example:\n"+
//                "Transcript: .. Yeah. So, for background, we both did these scans for this research project that we have at Meta called"+
//                "Kodak Avatars. And the idea is that instead of our avatars being cartoony and instead of actually transmitting a video, "+
//                "what it does is we’ve scanned ourselves and a lot of different expressions, and we’ve built a computer model of each of "+
//                "our faces and bodies and the different expressions that we make and collapsed that into a Kodak that then when you have the "+
//                "headset on your head, it sees your face, it sees your expression, and it can basically send an encoded version of what you’re "+
//                "supposed to look like over the wire. So, in addition to being photorealistic, it’s also actually much more bandwidth efficient than "+
//                "transmitting a full video or especially a 3D immersive video of a whole scene like this...\n"+
//                "Summary: kodak, encode face, efficient\n"+
//                "Note: Kodak is a compressed format of the facial expression. So, besides being photorealistic, it is highly efficient for transmission as well.\n\n"+
//                "Transcript: ..."+transcript+"...\n"+
//                "Summary: "+req.point+"\n"+
//                "Note:"

//     openai.chat.completions.create({
//         messages: [{ role: "system", content: PROMPT }],
//         model: "gpt-4",
//     }).then((res) => {
//         console.log('GPT response for: ' + req.point + ' => ', res.choices[0].message.content)
//     }).catch((err) => {
//         console.log(err)
//     })
// }

export const getFormattedPromptString = () => {
    const noteStore = localStorage.getItem('note-store')
    const onboardings = noteStore ? JSON.parse(noteStore).state.onboardings : []

    let promptString = "You are a note taking assistant. Users will give you their summary and the meeting transcript."+
                         "You have to expand it to 2-3 full sentences in simple english.\nHere are three examples:\n"
    for(let i = 0; i < onboardings.length; i++){
        promptString += "Transcript: ..."+onboardings[i].transcript+"...\n"+
                        "Summary: "+onboardings[i].keypoints.join(", ")+"\n"+
                        "Note: "+onboardings[i].note+"\n\n"
    }

    return promptString
}

export const callGPT = async (points: {point: string, history: string[], expand: number, created_at: number, utc_time: number, }[], transcription: TranscriptLine[]) => {
    const promptString = getFormattedPromptString()
    
    let expansion = [] as any[]
    for(let i = 0; i < points.length; i++){
        const point = points[i]

        if(point.history.length > point.expand){
            expansion.push({point: point.point, expansion: point.history[point.expand], old: true})
        }else{
            const pointToBeExpanded = point.history[point.expand]
            const expandedPoint = expandPoint({point: pointToBeExpanded, created_at: point.created_at, utc_time: point.utc_time, }, transcription)
            const transcript = expandedPoint.transcript.join(".")
            const PROMPT = promptString +
                "Transcript: ..."+transcript+"...\n"+
                "Summary: "+expandedPoint.point+"\n"+
                "Note:"

            const res = await openai.chat.completions.create({
                messages: [{ role: "system", content: PROMPT }],
                model: "gpt-4",
            })

            if(res?.choices[0]?.message?.content !== null) expansion.push({point: point.point, expansion: res.choices[0].message.content, old: false})
        }
    }

    return expansion
}

export const callGPTForSinglePoint = async (point: NotePoint, transcription: TranscriptLine[], index: number) => {
    const expandedPoint = expandPoint(point, transcription)
    const transcript = expandedPoint.transcript.join(".")
    
    const promptString = getFormattedPromptString()

    const PROMPT = promptString +
            "Transcript: ..."+transcript+"...\n"+
            "Summary: "+expandedPoint.point+"\n"+
            "Note:"

    const res = await openai.chat.completions.create({
        messages: [{ role: "system", content: PROMPT }],
        model: "gpt-3.5-turbo",
        stream: true,
        // seed: SEED,
        temperature: 0.2,
    })

    for await (const chunk of res) {
        console.log(`Point ${index}: ${chunk.choices[0]?.delta?.content}` || "")
    }
}

export const generateQuiz = async (points: string[]) => {
    const prompt = "Given a topic description, Your task is to generate five multichoice question with answer. " +
                   "Please mark the question within <Question></Question> tags,  individual choices within <Choice></Choice> tags " +
                   "and answer within <Answer></Answer> tags.\n" +
                   "Topic: " + points
    const res = await openai.chat.completions.create({
        messages: [{ role: "system", content: prompt }],
        model: "gpt-3.5-turbo",
        // seed: SEED,
        temperature: 0.2,
    })

    return res.choices[0].message.content || ""
}