/* eslint-disable */

import React, { useState, useEffect, useRef, } from 'react'
import { Grid, GridItem, Tag, TagRightIcon, TagLabel, Button, InputGroup, Input, InputRightElement, useToast, theme, keyframes } from '@chakra-ui/react'
import { SunIcon, ChevronRightIcon, ChevronLeftIcon, TimeIcon, DragHandleIcon, CalendarIcon, ArrowBackIcon, ArrowForwardIcon, DownloadIcon } from '@chakra-ui/icons'
import YouTube from 'react-youtube'
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"

import { NotePoint, TranscriptLine, useNoteStore, Note_t } from '../state/noteStore'
import { openai, expandPoint, getFormattedPromptString, callGPT, generateQuiz, generateTheme } from '../utils/helper'
import BulletPoint from './BulletPoint'
import Quiz, { Quiz_t } from './Quiz'

type NoteProps = {
    name: string;
    note: Note_t;
}

type bulletObject = {
    point: string;
    created_at: number;
    utc_time: number;
    editable: boolean;
    id: string;
    expand: number;
    compress: number;
    history: string[];
    edit: {e_point: string, e_time: number, }[][];
}

// let chunks : any[] = []
// let audioURL : string

const CornellNote: React.FC<NoteProps> = ({name, note }) => {
    const { updateNote, addYouTubeId, startRecording, addTranscription, computeButtonClick, fetchButtonStats } = useNoteStore((state) => ({
        updateNote: state.updateNote,
        addYouTubeId: state.addYouTubeId,
        startRecording: state.startRecording,
        addTranscription: state.addTranscription,
        computeButtonClick: state.computeButtonClick,
        fetchButtonStats: state.fetchButtonStats,
    }))
    const [bulletPoints, setBulletPoints] = useState<bulletObject[]>([])
    const [newPoint, setNewPoint] = useState<string>('')
    const [newTitle, setNewTitle] = useState<string>('')
    // const [editTitle, setEditTitle] = useState<boolean>(false)
    // const [recording, setRecording] = useState<any>(null)
    const [ytLink, setYtLink] = useState<string>('')
    const [embedId, setEmbedId] = useState<string>('')
    const [isLink, setIsLink] = useState<boolean>(false)
    const [transcription, setTranscription] = useState<TranscriptLine[]>([]) //yt transcription
    const [playerTime, setPlayerTime] = useState<number>(0) //time of the yt player at any instant
    // const [expandedNotes, setExpandedNotes] = useState<ExpandedNote[]>([]) //expanded notes [{point, expansion}]
    // const [expanding, setExpanding] = useState<number>(-1) //-1: not expanding, 0: expanding, 1: expanded
    const [, setPause] = useState<boolean>(false)
    const [expandSection, setExpandSection] = useState<boolean>(true) //show only note section by default
    const [expandQuizSection, setExpandQuizSection] = useState<boolean>(false)
    const [dragging, setDragging] = useState(false)
    const [draggingIndex, setDraggingIndex] = useState<number>(-1)
    const [initialY, setInitialY] = useState(0)
    const [expandButtonToggle, setExpandButtonToggle] = useState<boolean>(false)
    const [showQuiz, setShowQuiz] = useState<number>(0) // 0->no quiz, 1->called openai, 2->quiz visible
    const [showSummary, setShowSummary] = useState<boolean>(false)
    const [themeOrTime, setThemeOrTime] = useState<string>('theme')
    const [quizzes, setQuizzes] = useState<Quiz_t[]>([])
    const [quizInfo, setQuizInfo] = useState<any>(null)
    const [themes, setThemes] = useState<any>([])
    // const [pointStreams, setPointStreams] = useState<string[]>([])

    const ref = useRef(null)
    const toast = useToast()
    let timeoutHandle : any
    const opts = {
        height: '270',
        width: '62%',
        frameborder: '0',
        playerVars: {
            autoplay: 0,
        },
    }

    useEffect(() => {
        setNewTitle(name)
        setExpandButtonToggle(false)

        if (note?.ytId !== '') {
            setEmbedId(note.ytId)
            setIsLink(true)
        }else{
            setEmbedId('')
            setIsLink(false)
        }

        if(note?.transcription){
            setTranscription(note.transcription)
        }

        startRecording(name, Date.now())

        const points = note.content?.map((cont: NotePoint, idx: number) => ({
            ...cont,
            editable: false,
            id: `bullet-${idx}`,
            expand: 0,
            compress: 0,
            history: [cont.point],
            edit: [[{e_point: cont.point, e_time: cont.utc_time, }]],
        }))

        let pointStreams: string[] = []
        points.map(() => pointStreams.push(''))
        localStorage.setItem('pointStreams', JSON.stringify(pointStreams))

        setBulletPoints(points)

        const handler = (e: Event) => e.preventDefault()
        document.addEventListener('gesturestart', handler)
        document.addEventListener('gesturechange', handler)
        document.addEventListener('gestureend', handler)

        return () => {
            document.removeEventListener('gesturestart', handler)
            document.removeEventListener('gesturechange', handler)
            document.removeEventListener('gestureend', handler)
        }
    }, [name])

    //when a new point is typed and 'enter' is pressed
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault()

            const time_now = Date.now()

            const updatedPoints = bulletPoints.map((point: bulletObject) => {
                return {
                    point: point.point,
                    created_at: point.created_at,
                    utc_time: point.utc_time,
                }
            })

            const np = {
                point: newPoint,
                created_at: playerTime, //time of the yt player at the moment of pressing enter
                utc_time: time_now,
            }

            const maxId = Math.max(...bulletPoints.map((point: bulletObject) => parseInt(point.id.split('-')[1])))

            updatedPoints.push(np)
            
            updateNote(newTitle, updatedPoints)
            setBulletPoints([
              ...bulletPoints,
              {
                ...np,
                editable: false,
                id: `bullet-${maxId}`,
                expand: 0,
                compress: 0,
                history: [newPoint],
                edit: [[{e_point: newPoint, e_time: playerTime, }]],
              },
            ])
            let pointStreams = JSON.parse(localStorage.getItem('pointStreams') ?? '""') //adding a stream tracker for a new point
            pointStreams.push('')
            localStorage.setItem('pointStreams', JSON.stringify(pointStreams))
            setNewPoint('')
        }
    }

    //marks a bullet point as 'editable: true'
    const editPoint = (id: number) => {
        const newPoints = [...bulletPoints]
        newPoints[id].editable = true
        setBulletPoints(newPoints)
    }

    //instantly changes an editable bullet point's state when typed on input
    const changeEditPoint = (index : number, val : string) => {
        // const newPoints = [...bulletPoints]
        // newPoints[index].point = val
        const newPoints = bulletPoints.map((bulletPoint, idx) => {
            if(idx === index){
                let history = [...bulletPoint.history]
                history[bulletPoint.expand] = val

                return {
                    ...bulletPoint,
                    history: history,
                }
            }else{
                return bulletPoint
            }
        })

        setBulletPoints(newPoints)
    }

    //makes an editable bullet point to uneditable
    const updateEditPoint = (index : number, event : React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            const newPoints = [...bulletPoints]
            newPoints[index].editable = false
            const latestEdit = newPoints[index].history[newPoints[index].expand]
            newPoints[index].edit[newPoints[index].expand].push({e_point: latestEdit, e_time: Date.now()})
            setBulletPoints(newPoints)
            updateNote(newTitle, bulletPoints.map((point: bulletObject) => ({point: point.point, created_at: point.created_at, utc_time: point.utc_time})))
        }
    }

    const getYoutubeTranscription = () => {
        let ytId = ''
        if(ytLink.includes('watch')){
            ytId = ytLink.split('v=')[1]
            setEmbedId(ytId)
            setIsLink(true)
        }else if(ytLink.includes('youtu.be')){
            ytId = ytLink.split('/')[3].split('?')[0]
            setEmbedId(ytId)
            setIsLink(true)
        }else{
            alert('Invalid YouTube link!')
            // return
        }

        addYouTubeId(name, ytId)

        //http://localhost:3000/youtube-transcript
        fetch('https://noteeline-backend.onrender.com/youtube-transcript', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ytLink: ytLink,
            }),
        }).then(res => res.json()).then(data => {
            // console.log(data)
            setTranscription(data.response) //each transctiption => {offset, duration, text}
            if(!data.response){
                toast({
                    title: 'Warning',
                    description: 'The provided YouTube video does not have a transcription or has it disabled!',
                    status: 'warning',
                    duration: 5000,
                    isClosable: true,
                })
            }else{
                addTranscription(name, data.response)
                toast({
                    title: 'Transcription complete!',
                    description: 'Your transcription is ready!',
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                })
            }
            // console.log(data.response)
        }).catch(err => {
            console.log(err)
            toast({
                title: 'Error',
                description: 'Error in transcribing your YouTube video!',
                status: 'error',
                duration: 5000,
                isClosable: true,
            })
        })
    }

    const handleVideoStateChange = (e: any) => {
        const time = e.target.getCurrentTime() // time: number
        const playerState = e.target.getPlayerState() //playerState: number

        if(playerState === 1){
            setPlayerTime(time)
            // console.log(time)
        }else if(playerState === 2){
            // console.log('paused')
        }
        timeoutHandle = window.setTimeout(() => handleVideoStateChange(e), 1000)
    }

    const loop = (e: any) => {
        timeoutHandle = window.setTimeout(() => handleVideoStateChange(e), 1000)
    }

    const stopVideo = () => {
        window.clearTimeout(timeoutHandle)
    }

    //expand all points at a time
    const expandNote = async () => {
        if(!expandButtonToggle){
            toast({
                title: 'Expanding all the points...',
                description: 'Please wait while we expand the bullet points',
                status: 'info',
                duration: 5000,
                position: 'top-right',
                isClosable: true,
            })
        }else{
            toast({
                title: 'Reducing all the points...',
                description: 'Please wait while we reduce the bullet points',
                status: 'info',
                duration: 2000,
                position: 'top-right',
                isClosable: true,
            })
        }

        // setExpanding(0)

        const newPoints = [...bulletPoints]
        
        if(!expandButtonToggle) newPoints.map((point: bulletObject) => point.expand = point.expand + 1)
        else newPoints.map((point: bulletObject) => point.expand = point.expand - 1)
        
        const points = bulletPoints.map((point: bulletObject) => ({
            point: point.point,
            history: point.history,
            expand: point.expand,
            created_at: point.created_at,
            utc_time: point.utc_time,
        }))

        setBulletPoints(newPoints)

        if(!expandButtonToggle){
            callGPT(points, transcription).then(res => {
                if(res){
                    toast({
                        title: 'Done',
                        status: 'info',
                        duration: 2000,
                        position: 'top-right',
                        isClosable: true,
                    })
    
                    const ret = newPoints.map((newPoint, idx) => {
                        if(res[idx].old){
                            return newPoint
                        }else{
                            let edit = [...newPoint.edit]
                            edit.push([])
                            edit[newPoint.expand].push(res[idx].expansion)
                            return {
                                ...newPoint,
                                history: [...newPoint.history, res[idx].expansion],
                                edit: edit,
                            }
                        }
                    })
                    
                    setExpandButtonToggle(!expandButtonToggle)
                    setBulletPoints(ret)
                    computeButtonClick(newTitle, 'expand')
                    // console.log(res)
                }else{
                    toast({
                        title: 'Error...',
                        description: 'Error in expanding the bullet point',
                        status: 'error',
                        duration: 5000,
                        position: 'top-right',
                        isClosable: true,
                    })
                }
            }).catch(() => {
                toast({
                    title: 'Error...',
                    description: 'Problem calling GPT-4...',
                    status: 'error',
                    duration: 2000,
                    position: 'top-right',
                    isClosable: true,
                })
            })
        }else{
            setExpandButtonToggle(!expandButtonToggle)
            computeButtonClick(newTitle, 'expand')
        }

        // console.log(res)
        // setExpandedNotes(res)
        // setExpanding(1)
    }

    //calling openai api when expanding a single point from another function
    // const expandSinglePoint = async (point: string, created_at: number) => {
    //     const obj = {
    //         point: point,
    //         created_at: created_at,
    //     }

    //     // const res = await callGPTForSinglePoint(obj, transcription)
    //     // return res
    // }

    const toggleExpandSection = () => {
        setExpandSection(!expandSection)
    }

    const toggleExpandQuizSection = () => {
        setExpandQuizSection(!expandQuizSection)
    }

    const reorder = (list: bulletObject[], startIndex: number, endIndex: number) => {
        const result = Array.from(list)
        const [removed] = result.splice(startIndex, 1)
        result.splice(endIndex, 0, removed)
      
        return result
    }

    const onDragEnd = (result: any) => {
        console.log('Result ', result)

        // dropped outside the list
        if (!result.destination) {
          return
        }
    
        const items = reorder(
          bulletPoints,
          result.source.index,
          result.destination.index
        )
    
        setBulletPoints(items)
    }

    const getBulletPointStyle = (isDragging: any, draggableStyle: any) => ({
        // some basic styles to make the items look a bit nicer
        userSelect: "none",
        padding: '1vw',
        margin: `0 0 1vh 0`,
        border: '1px solid #000',
        borderRadius: '10px',
        // change background colour if dragging
        background: isDragging ? "lightgreen" : "#F5F7F8",
      
        // styles we need to apply on draggables
        ...draggableStyle
    })

    const handleContextMenu = (e: any) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleMouseDown = (e: any, index: number) => {
        if (e.button === 2) {
            // Detect right mouse button (2)
            setDragging(true)
            setDraggingIndex(index)
            setInitialY(e.clientY)
        }
    }

    //call openai api for a single point expansion
    // const openAIHelper = async (newPoints: bulletObject[]) => {
    //     const pointToBeUpdated = newPoints[0]

    //     const obj = {
    //         point: pointToBeUpdated.history[pointToBeUpdated.expand],
    //         created_at: pointToBeUpdated.created_at,
    //     }

    //     await callGPTForSinglePoint(obj, transcription, 0)
    // }

    const callGPTForSinglePointFromComponent = async (point: NotePoint, transcription: TranscriptLine[], index: number) => {
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
            addToPointStream(index, chunk.choices[0]?.delta?.content || "")
        }

        return index
    }

    const addToPointStream = (index: number, chunk: any) => {
        // console.log(pointStreams)
        const pointStreams = JSON.parse(localStorage.getItem('pointStreams') ?? '""')
        const pointStream = pointStreams[index]
        if(pointStream === ''){
            // console.log('empty stream for ' + index)
            setDraggingIndex(-1)
            setInitialY(0)
        }

        pointStreams[index] += chunk
        localStorage.setItem('pointStreams', JSON.stringify(pointStreams))
        console.log(pointStreams)
        
        // const newPoints = bulletPoints.map((bp, idx) => {
        //     if(idx === index){
        //         let hst = [...bp.history]
        //         if(pointStream === ''){
        //             hst = [...hst, pointStreams[idx]]
        //         }else{
        //             hst[index] = pointStreams[idx]
        //         }

        //         return {
        //             ...bp,
        //             history: hst,
        //         }
        //     }else{
        //         return bp
        //     }
        
        // })
        // setBulletPoints(() => newPoints)
        
        setBulletPoints(prevPoints => {
            let newPoints = [...prevPoints]
            let hst = [...newPoints[index].history]
            if(pointStream === ''){
                hst = [...hst, pointStreams[index]]
            }else{
                hst[index] = pointStreams[index]
            }
            newPoints[index].history = hst

            return newPoints
        })
    }

    const newOpenAIHelper = async (newPoints: bulletObject[]) => {
        const pointToBeUpdated = newPoints[draggingIndex]

        const obj = {
            point: pointToBeUpdated.history[pointToBeUpdated.expand],
            created_at: pointToBeUpdated.created_at,
            utc_time: pointToBeUpdated.utc_time,
        }

        await callGPTForSinglePointFromComponent(obj, transcription, draggingIndex)

        // const updatedPoints = bulletPoints.map((bp, idx) => {
        //     if(idx === index){
        //         let edit = [...bp.edit]
        //         edit.push([])
        //         edit[bp.expand].push(newPointStreams[idx])
        //         return {
        //             ...bp,
        //             history: [...bp.history, newPointStreams[idx]],
        //             edit: edit,
        //         }
        //     }else{
        //         return bp
        //     }
        
        // })
        // setBulletPoints(() => updatedPoints)
    }

    const handleMouseUp = (e: any) => {
        if (dragging) {
            setDragging(false)
            const finalY = e.clientY

            //too short displacement
            if(Math.abs(finalY - initialY) < 30) return

            const isUpwards: boolean = finalY < initialY
            
            const newPoints = [...bulletPoints]
            if(isUpwards) newPoints[draggingIndex].expand = newPoints[draggingIndex].expand + 1
            else newPoints[draggingIndex].expand = Math.max(0, newPoints[draggingIndex].expand -1)

            if(!isUpwards){
                toast({
                    title: 'Compressing...',
                    description: 'Please wait while we compress the bullet point',
                    status: 'info',
                    duration: 2000,
                    position: 'top-right',
                    isClosable: true,
                })

                setDraggingIndex(-1)
                setInitialY(0)
                setBulletPoints(newPoints)
            }else{
                toast({
                    title: 'Expanding...',
                    description: 'Please wait while we expand the bullet point',
                    status: 'info',
                    duration: 2000,
                    position: 'top-right',
                    isClosable: true,
                })

                if(newPoints[draggingIndex].history.length > newPoints[draggingIndex].expand){
                    setDraggingIndex(-1)
                    setInitialY(0)
                    setBulletPoints(newPoints)
                }else{
                    // openAIHelper(newPoints)
                    newOpenAIHelper(newPoints)
                }
            }
        }
    }

    const extractThemes = (text: string) => {
        const themeRegex = /<Topic>(.*?)<\/Topic>[\s\S]*?<p>(.*?)<\/p>/g
        const matches = Array.from(text.matchAll(themeRegex))

        const themes: any = {}
        matches.forEach(match => {
            const [, topic, points] = match
            if (!themes[topic]) {
                themes[topic] = []
            }
            themes[topic].push(points.trim())
        });

        return themes
    }

    //theme sorting
    const handleTheme = () => {
        toast({
            title: 'Generating themes. Please wait patiently...',
            status: 'info',
            duration: 2000,
            position: 'top-right',
            isClosable: true
        })

        const newPoints: string[] = bulletPoints.map(bulletPoint => {
            return bulletPoint.history[bulletPoint.expand]
        })

        generateTheme(newPoints).then(res => {
            // console.log(res)
            const t = extractThemes(res)
            setThemes(t)
            setThemeOrTime('time')
        }).catch(e => {
            console.log(`Quiz error: ${e}`)
            toast({
                title: 'Error generating theme. Please try again...',
                status: 'info',
                duration: 2000,
                position: 'top-right',
                isClosable: true
            })
        })
    }

    //time sorting
    const handleSort = () => {
        setThemeOrTime('theme')
        const sortedBulletPoints = [...bulletPoints].sort((a, b) => a.created_at - b.created_at)
        setBulletPoints(sortedBulletPoints)
        computeButtonClick(newTitle, 'time')
    }

    const extractQuizzesInformation = (quizzesText: any) => {
        const quizRegex = /<Question>(.*?)<\/Question>\s*<Choice>(.*?)<\/Choice>\s*<Choice>(.*?)<\/Choice>\s*<Choice>(.*?)<\/Choice>\s*<Choice>(.*?)<\/Choice>\s*<Answer>(.*?)<\/Answer>/gs
      
        const matches = Array.from(quizzesText.matchAll(quizRegex))
      
        const quizzes = matches.map((match: any) => {
          const [, question, option1, option2, option3, option4, answer] = match as any
          const options = [option1, option2, option3, option4]
          return { question, answer, options }
        })
      
        return quizzes
    }

    const handleQuiz = () => {
        toast({
            title: 'Starting quiz. Please wait patiently...',
            status: 'info',
            duration: 2000,
            position: 'top-right',
            isClosable: true
        })

        setShowQuiz(1)

        const newPoints: string[] = bulletPoints.map(bulletPoint => {
            return bulletPoint.point
        })

        generateQuiz(newPoints).then(res => {
            // console.log(res)
            const qs = extractQuizzesInformation(res)
            // console.log(qs)
            setQuizzes(qs)
            setShowQuiz(2)
        }).catch(e => {
            console.log(`Quiz error: ${e}`)
            toast({
                title: 'Error generating quiz. Please try again...',
                status: 'info',
                duration: 2000,
                position: 'top-right',
                isClosable: true
            })
        })
    }

    const handleSummary = () => {
        setShowSummary(!showSummary)

        let tr = ''
        for(let i = 0; i < transcription.length; i++){
          tr += transcription[i].text
        }

        //http://localhost:3000/fetch-summary
        fetch('https://noteeline-backend.onrender.com/fetch-summary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transcript: tr
          }),
        }).then(res => res.json()).then(data => {
            console.log('Summary:')
            console.log(data)
            toast({
              title: 'Summarization completed',
              status: 'info',
              duration: 2000,
              position: 'top-right',
              isClosable: true
            })
        }).catch(e => console.log(e))
    }

    //download button-click stats
    const handleDownload = () => {
        const newPoints = bulletPoints.map((bulletPoint, idx) => {
            let note_taking_time = -1

            if(idx === 0){
                note_taking_time = bulletPoint.created_at*1000.0
            }else{
                note_taking_time = bulletPoint.utc_time - bulletPoints[idx-1].utc_time
            }

            return {
                point: bulletPoint.point,
                // created_at: bulletPoint.created_at,
                utc_time: bulletPoint.utc_time,
                note_taking_time: note_taking_time,
                edit: bulletPoint.edit
            }
        })

        const obj = fetchButtonStats(newTitle)
        let userLog: any = { buttonStats: obj }
        userLog.editHistory = newPoints

        const jsonString = JSON.stringify(userLog, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);

        link.download = 'bulletPointsData.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    //store state of quiz while changing panels
    const changeQuizInfo = (info: any) => {
        setQuizInfo(info)
        // if(info.qp === 100) setShowQuiz(!showQuiz)
        // console.log(info)
    }
    
    return (
        <Grid
            h='137%'
            w='100%'
            templateRows='repeat(11, 1fr)'
            templateColumns='repeat(4, 1fr)'
            sx={{ overflowX: 'hidden', }}
        >
            {/* YouTube video player */}
            <GridItem rowSpan={3} colSpan={4} sx={{ borderBottom: '1px solid #000', }}>
                {
                    !isLink ?
                        <InputGroup
                            style={{ marginBottom: '5vh', width: '50%', marginLeft: '25%', marginTop: '1%', }}    
                        >
                            <Input
                                placeholder='Enter a YouTube link...'
                                style={{ background: 'white', }}
                                onChange={(e) => setYtLink(e.target.value)}
                            />
                            <InputRightElement width='4.5rem' style={{ padding: '0.5vw', }}>
                                <Button h='1.75rem' size='sm' color='white' colorScheme='red' onClick={getYoutubeTranscription}>
                                    Submit
                                </Button>
                            </InputRightElement>
                        </InputGroup>
                        :
                        <YouTube 
                            ref={ref}
                            opts={opts}
                            videoId={embedId}
                            onReady={loop}
                            onPlay={() => setPause(false)}
                            onPause={() => setPause(true)}
                            onEnd={stopVideo}
                            style={{ marginTop: '0.5%',  marginLeft: '25%', }}
                        />
                }
            </GridItem>
            {
                expandQuizSection ?
                <GridItem rowSpan={4} colSpan={4} sx={{ padding: '1px', overflowY: 'auto', borderRight: '1px solid #000', }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', }}>
                        {showQuiz !== 0 ?
                            <div></div> :
                            <Tag size='lg' variant='solid' colorScheme='teal' sx={{ cursor: 'pointer', }} onClick={handleQuiz}>
                                <TagLabel>Start quiz</TagLabel>
                                <TagRightIcon as={SunIcon} />
                            </Tag>
                        }
                        <ChevronLeftIcon w={8} h={8} color="tomato" sx={{ cursor: 'pointer', }} onClick={toggleExpandQuizSection} />
                    </div>
                    <br/>
                    {
                        showQuiz === 2 ?
                        quizzes && quizzes.length > 0 ?
                            <Quiz quizzes={quizzes} quizInfo={quizInfo} changeQuizInfo={changeQuizInfo} />
                            :
                            <p>No quizzes to show !</p>
                        :
                        showQuiz === 1 ?
                        <p>Loading quizzes...</p>
                        :
                        <p>No quizzes to show !</p>
                    }
                </GridItem>
                :
                expandSection ?
                <GridItem rowSpan={4} colSpan={4} sx={{ padding: '3px', paddingTop: '0', overflowY: 'auto', }}>
                    <div style={{ paddingTop: '1px', position: 'sticky', top: 0, zIndex: 1, background: '#fff', }}>
                        <ChevronRightIcon w={8} h={8} color="tomato" sx={{ cursor: 'pointer', }} onClick={toggleExpandSection} />
                        <Tag size='lg' variant='solid' colorScheme='yellow' sx={{ marginLeft: '1px', cursor: 'pointer', }} onClick={expandNote}>
                            <TagLabel>{expandButtonToggle ? 'Reduce' : 'Expand'}</TagLabel>
                            <TagRightIcon w={3} as={ArrowBackIcon} />
                            <TagRightIcon w={3} as={ArrowForwardIcon} />
                        </Tag>
                        {
                            themeOrTime === 'theme' ?
                            <Tag size='lg' variant='solid' colorScheme='red' sx={{ marginLeft: '1px', cursor: 'pointer', }} onClick={handleTheme}>
                                <TagLabel>Order by Theme</TagLabel>
                                <TagRightIcon as={DragHandleIcon} />
                            </Tag>
                            :
                            <Tag size='lg' variant='solid' colorScheme='green' sx={{ marginLeft: '1px', marginBottom: '1vh', cursor: 'pointer', }} onClick={handleSort}>
                                <TagLabel>Order by Time</TagLabel>
                                <TagRightIcon as={TimeIcon} />
                            </Tag>
                        }
                        <Tag size='lg' variant='solid' colorScheme='blue' sx={{ marginLeft: '1px', marginBottom: '1vh', cursor: 'pointer', }} onClick={handleDownload}>
                            <TagLabel>Download Stats</TagLabel>
                            <TagRightIcon as={DownloadIcon} />
                        </Tag>
                    </div>
                    {themeOrTime !== 'time' ?
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="droppable">
                        {(provided: any) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                // style={getListStyle(snapshot.isDraggingOver)}
                            >
                            {bulletPoints.map((bulletPoint, index) => (
                                <Draggable key={bulletPoint.id} draggableId={bulletPoint.id} index={index}>
                                {(provided: any, snapshot: any) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={getBulletPointStyle(
                                            snapshot.isDragging,
                                            provided.draggableProps.style
                                        )}
                                        onContextMenu={handleContextMenu}
                                        onMouseDown={(e) => handleMouseDown(e, index)}
                                        onMouseUp={handleMouseUp}
                                    >
                                        {
                                            !bulletPoint.editable ?
                                            <BulletPoint
                                                key={index}
                                                index={index}
                                                expand={bulletPoint.expand}
                                                history={bulletPoint.history}
                                                editPoint={editPoint}
                                            />
                                            :
                                            <textarea
                                                // type='text'
                                                defaultValue={bulletPoint.point}
                                                className='note-input'
                                                onChange={(e) => changeEditPoint(index, e.target.value)}
                                                onKeyDown={event => updateEditPoint(index, event)}
                                                rows={Math.max(Math.ceil(bulletPoint.point.length / 200), 1)}
                                            />
                                        }
                                    </div>
                                )}
                                </Draggable>
                            ))}                            
                            {provided.placeholder}
                            </div>
                        )}
                        </Droppable>
                    </DragDropContext>
                    :
                    <>
                    {Object.entries(themes).map(([topic, points]: [any, any]) => (
                        <div key={topic}>
                            <h2 style={{ fontWeight: 'bold', }}>{topic}</h2>
                            <div>
                                {points.map((point: any, index: number) => (
                                    <div key={index} className='quiz-option'>
                                        {point}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    </>
                    }
                    <input
                        type='text'
                        placeholder='Write a point...'
                        className='note-input'
                        value={newPoint}
                        onChange={(e) => setNewPoint(e.target.value)}
                        onKeyDown={event => handleKeyDown(event)}
                    />
                </GridItem>
                :
                <>
                    <GridItem rowSpan={4} colSpan={2} sx={{ padding: '2px', overflowY: 'auto', borderRight: '1px solid #000', }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', }}>
                            {showQuiz !== 0 ?
                                <div></div> :
                                <Tag size='lg' variant='solid' colorScheme='teal' sx={{ cursor: 'pointer', }} onClick={handleQuiz}>
                                    <TagLabel>Start quiz</TagLabel>
                                    <TagRightIcon as={SunIcon} />
                                </Tag>
                            }
                            <ChevronLeftIcon w={8} h={8} color="tomato" sx={{ cursor: 'pointer', }} onClick={toggleExpandSection} />
                        </div>
                        <br/>
                        {
                            showQuiz === 2 ?
                            quizzes && quizzes.length > 0 ?
                                <Quiz quizzes={quizzes} quizInfo={quizInfo} changeQuizInfo={changeQuizInfo} />
                                :
                                <p>No quizzes to show !</p>
                            :
                            showQuiz === 1 ?
                            <p>Loading quizzes...</p>
                            :
                            <p>No quizzes to show !</p>
                        }
                    </GridItem>
                    <GridItem rowSpan={4} colSpan={2} sx={{ padding: '2px', paddingTop: '0', overflowY: 'auto', }}>
                        <div style={{ paddingTop: '1px', position: 'sticky', top: 0, zIndex: 1, background: '#fff', }}>
                            <ChevronRightIcon w={8} h={8} color="tomato" sx={{ cursor: 'pointer', }} onClick={toggleExpandQuizSection} />
                            <Tag size='lg' variant='solid' colorScheme='yellow' sx={{ marginLeft: '1px', cursor: 'pointer', }} onClick={expandNote}>
                                <TagLabel>{expandButtonToggle ? 'Reduce' : 'Expand'}</TagLabel>
                                <TagRightIcon w={3} as={ArrowBackIcon} />
                                <TagRightIcon w={3} as={ArrowForwardIcon} />
                            </Tag>
                            {
                                themeOrTime === 'theme'?
                                <Tag size='lg' variant='solid' colorScheme='red' sx={{ marginLeft: '1px', cursor: 'pointer', }} onClick={handleTheme}>
                                    <TagLabel>Order by Theme</TagLabel>
                                    <TagRightIcon as={DragHandleIcon} />
                                </Tag>
                                :
                                <Tag size='lg' variant='solid' colorScheme='green' sx={{ marginLeft: '1px', marginBottom: '1vh', cursor: 'pointer', }} onClick={handleSort}>
                                    <TagLabel>Order by Time</TagLabel>
                                    <TagRightIcon as={TimeIcon} />
                                </Tag>
                            }
                            <Tag size='lg' variant='solid' colorScheme='blue' sx={{ marginLeft: '1px', marginBottom: '1vh', cursor: 'pointer', }} onClick={handleDownload}>
                                <TagLabel>Download Stats</TagLabel>
                                <TagRightIcon as={DownloadIcon} />
                            </Tag>
                        </div>
                        {themeOrTime !== 'time' ?
                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="droppable">
                            {(provided: any) => (
                                <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                // style={getListStyle(snapshot.isDraggingOver)}
                                >
                                {bulletPoints.map((bulletPoint, index) => (
                                    <Draggable key={bulletPoint.id} draggableId={bulletPoint.id} index={index}>
                                    {(provided: any, snapshot: any) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={getBulletPointStyle(
                                                snapshot.isDragging,
                                                provided.draggableProps.style
                                            )}
                                            onContextMenu={handleContextMenu}
                                            onMouseDown={(e) => handleMouseDown(e, index)}
                                            onMouseUp={handleMouseUp}
                                        >
                                            {
                                                !bulletPoint.editable ?
                                                <BulletPoint
                                                    key={index}
                                                    index={index}
                                                    expand={bulletPoint.expand}
                                                    history={bulletPoint.history}
                                                    editPoint={editPoint}
                                                />
                                                :
                                                <textarea
                                                    // type='text'
                                                    defaultValue={bulletPoint.history[bulletPoint.expand]}
                                                    className='note-input'
                                                    onChange={(e) => changeEditPoint(index, e.target.value)}
                                                    onKeyDown={event => updateEditPoint(index, event)}
                                                    rows={Math.max(Math.ceil(bulletPoint.point.length / 100), 1)}
                                                />
                                            }
                                        </div>
                                    )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                                </div>
                            )}
                            </Droppable>
                        </DragDropContext>
                        :
                        <>
                        {Object.entries(themes).map(([topic, points]: [any, any]) => (
                            <div key={topic}>
                                <h2 style={{ fontWeight: 'bold', }}>{topic}</h2>
                                <div>
                                    {points.map((point: any, index: number) => (
                                        <div key={index} className='quiz-option'>
                                            {point}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        </>
                        }
                        <input
                            type='text'
                            placeholder='Write a point...'
                            className='note-input'
                            value={newPoint}
                            onChange={(e) => setNewPoint(e.target.value)}
                            onKeyDown={event => handleKeyDown(event)}
                        />
                    </GridItem>
                </>
            }
            {/* Summarization */}
            <GridItem rowSpan={4} colSpan={4}  sx={{ padding: '2px', borderTop: '1px solid #000', overflowY: 'auto', }}>
                <Tag size='lg' variant='solid' colorScheme='cyan' sx={{ marginLeft: '1px', cursor: 'pointer', }} onClick={handleSummary}>
                    <TagLabel>Summary</TagLabel>
                    <TagRightIcon as={CalendarIcon} />
                </Tag>
                {
                    showSummary ?
                    <p>HARDCODE SUMMARY</p>
                    :
                    <p>No summary...</p>
                }
            </GridItem>
        </Grid>
    )
}

export default CornellNote
