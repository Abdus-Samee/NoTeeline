import OpenAI from 'openai'
import { NotePoint, TranscriptLine, OnboardingSection } from "../state/noteStore"

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

    let takeOnboardingIntoPrompt = true

    if(onboardings.length === 0) takeOnboardingIntoPrompt = false

    const newOnboardings = onboardings.filter((onboarding: OnboardingSection) => 
                    onboarding.note !== "" && onboarding.keypoints.every(keypoint => keypoint !== ""))

    if(newOnboardings.length === 0) takeOnboardingIntoPrompt = false

    let promptString = "You are a note taking assistant. Users will give you their keypoint and the meeting transcript. "+
                        "You have to expand the keypoint into a note, by taking additional context from the transcript. The note should be a full sentence in simple english." +
                        "Try to resolve any typos or grammatical mistakes that arise in the keypoint. Do not make the note too long." + 
                        "Remember that the keypoint can be very abstract and as short as an abbreviation. Use the transcript to get additional information to ensure a good quality note expansion."
    
    if(takeOnboardingIntoPrompt) promptString += "\nMake sure that the note aligns with the user's writing style. Use the same writing style as shown below.\n" + 
                                                 "Here are three examples:\n"

    if(takeOnboardingIntoPrompt){
        for(let i = 0; i < newOnboardings.length; i++){
            promptString += "Transcript: ..."+newOnboardings[i].transcript+"...\n"+
                            "Keypoint: "+newOnboardings[i].keypoints.join(", ")+"\n"+
                            "Note: "+newOnboardings[i].note+"\n\n"
        }

        promptString += "The keypoint refers to the high-level point provided by the user and your task is to write the 'Note'. Make sure that your expanded note matches the writing style in the provided examples."
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
            const PROMPT = "Expand the provided keypoint into a one sentence note.\n" +
                "Transcript: ..." + transcript + "...\n"+
                "Keypoint: "+expandedPoint.point+"\n"+
                "Note:"

            const res = await openai.chat.completions.create({
                messages: [{ role: "system", content: promptString }, { role: "user", content: PROMPT }],
                model: "gpt-4-1106-preview",
            })

            if(res?.choices[0]?.message?.content !== null) expansion.push({point: point.point, expansion: res.choices[0].message.content, old: false})
        }
    }

    return expansion
}

// export const callGPTForSinglePoint = async (point: NotePoint, transcription: TranscriptLine[], index: number) => {
//     const expandedPoint = expandPoint(point, transcription)
//     const transcript = expandedPoint.transcript.join(".")
    
//     const promptString = getFormattedPromptString()

//     const PROMPT = promptString +
//             "Transcript: ..."+transcript+"...\n"+
//             "Summary: "+expandedPoint.point+"\n"+
//             "Note:"

//     const res = await openai.chat.completions.create({
//         messages: [{ role: "system", content: PROMPT }],
//         model: "gpt-3.5-turbo",
//         stream: true,
//         // seed: SEED,
//         temperature: 0.2,
//     })

//     for await (const chunk of res) {
//         console.log(`Point ${index}: ${chunk.choices[0]?.delta?.content}` || "")
//     }
// }

export const callGPTForSinglePoint = async (point: NotePoint, transcription: TranscriptLine[]) => {
    const expandedPoint = expandPoint(point, transcription)
    const transcript = expandedPoint.transcript.join(".")
    
    const promptString = getFormattedPromptString()

    const PROMPT = promptString +
            "Transcript: ..."+transcript+"...\n"+
            "Summary: "+expandedPoint.point+"\n"+
            "Note:"

    const res = await openai.chat.completions.create({
        messages: [{ role: "system", content: PROMPT }],
        model: "gpt-4-1106-preview",
        // seed: SEED,
        temperature: 0.2,
    })

    if(res?.choices[0]?.message?.content !== null) return res.choices[0].message.content
    else return null

    // const res = await simulateAPICall()
    // return res
}

export const generateQuiz = async (points: string[]) => {

    // const prompt = "Given a topic description, Your task is to generate five multichoice question with answer. " +
    //                "Please mark the question within <Question></Question> tags,  individual choices within <Choice></Choice> tags " +
    //                "and answer within <Answer></Answer> tags.\n" +
    //                "Topic: " + points

    const system_prompt = 'Given a topic description, Your task is to generate five multichoice question with answer.  ' + 
                          'Please mark the question within <Question></Question> tags,  ' + 
                          'individual choices within <Choice></Choice> tags and answer ' + 
                          'within <Answer></Answer> tags. Make sure not to always put the right choice in the same choice option, ' + 
                          'randomly assign it within A, B, C or D.\n' +
                          'Here is an example: \n' +
                            'Topic: Resilience refers to how well you can deal with and bounce back from the difficulties of life. It can mean the difference between handling pressure and losing your cool. Resilient people tend to maintain a more positive outlook and cope with stress more effectively. Research has shown that while some people seem to come by resilience naturally, these behaviors can also be learned. Whether you\'re going through a tough time now or you want to be prepared for future challenges, you can build resilience by: Finding purpose, Believing in yourself, Developing a social network, Embracing change, Being optimistic, Nurturing yourself, Developing problem-solving skills, Establishing goals, Taking action, Committing to building skills over time.' + 
                            '<Question>What does resilience refer to?</Question>\n' +
                            '<Choice>A. Dealing with difficulties by losing your cool</Choice>\n' +
                            '<Choice>B. Bouncing back from the challenges of life</Choice>\n' +
                            '<Choice>C. Avoiding stressful situations altogether</Choice>\n' +
                            '<Choice>D. Ignoring problems and hoping they go away</Choice>\n' +
                            '<Answer>B. Bouncing back from the challenges of life</Answer>\n' +
                            '<Question>Which of the following is NOT a way to build resilience?</Question>\n' +
                            '<Choice>A. Finding purpose</Choice>\n' +
                            '<Choice>B. Believing in yourself</Choice>\n' +
                            '<Choice>C. Avoiding change at all costs</Choice>\n' +
                            '<Choice>D. Nurturing yourself</Choice>\n' +
                            '<Answer>C. Avoiding change at all costs</Answer>'
    
    const user_prompt =  'Topic: ' + points
    const res = await openai.chat.completions.create({
        messages: [{ role: "system", content: system_prompt },
                    { role: "user", content: user_prompt }],
        model: "gpt-4-0125-preview",
        // seed: SEED,
        temperature: 0.5,
    })

    return res.choices[0].message.content || ""
}

export const generateTheme = async (expandedPoints: string[]) => {
    const prompt = "Given a list of points, Your task is to perform topic modeling over them. Arrange the points into topics and " + 
                   "provide a name to each individual topic.  Please mark the topic within <Topic></Topics> tags. the points are marked " +
                   "with <p> tag as well.\n" + 
                   "Input points: " + expandedPoints
    
    const res = await openai.chat.completions.create({
        messages: [{ role: "system", content: prompt }],
        model: "gpt-4-0125-preview",
        // seed: SEED,
        temperature: 0.5,
    })

    return res.choices[0].message.content || ""
}