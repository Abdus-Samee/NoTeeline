import React, { useState, useEffect, useRef } from 'react'
import { Grid, GridItem, Box, Tag, TagRightIcon, TagLabel, Button, InputGroup, Input, InputRightElement, useToast, Spinner } from '@chakra-ui/react'
import { SunIcon, ChevronRightIcon, ChevronLeftIcon, TimeIcon, DragHandleIcon, CalendarIcon, ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons'
import axios from 'axios'
import OpenAI from 'openai'
import YouTube from 'react-youtube'
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"

import { NotePoint, ExpandedNote, TranscriptLine, useNoteStore, Note_t } from '../state/noteStore'
import { expandPoint, callGPT, callGPTForSinglePoint } from '../utils/helper'
import BulletPoint from './BulletPoint'

type NoteProps = {
    name: string;
    note: Note_t;
}

type bulletObject = {
    point: string;
    created_at: number;
    editable: boolean;
    id: string;
    expand: number;
    compress: number;
    history: string[];
}

let mediaRecorder : any
let chunks : any[] = []
let audioURL : string

const CornellNote: React.FC<NoteProps> = ({name, note }) => {
    const { updateNote, addYouTubeId, fetchNote, updateNoteName, startRecording, addTranscription } = useNoteStore((state) => ({
        updateNote: state.updateNote,
        addYouTubeId: state.addYouTubeId,
        fetchNote: state.fetchNote,
        updateNoteName: state.updateNoteName,
        startRecording: state.startRecording,
        addTranscription: state.addTranscription,
    }))
    const [bulletPoints, setBulletPoints] = useState<bulletObject[]>([])
    const [newPoint, setNewPoint] = useState<string>('')
    const [newTitle, setNewTitle] = useState<string>('')
    const [editTitle, setEditTitle] = useState<boolean>(false)
    const [recording, setRecording] = useState<any>(null)
    const [ytLink, setYtLink] = useState<string>('')
    const [embedId, setEmbedId] = useState<string>('')
    const [isLink, setIsLink] = useState<boolean>(false)
    const [transcription, setTranscription] = useState<TranscriptLine[]>([]) //yt transcription
    const [playerTime, setPlayerTime] = useState<number>(0) //time of the yt player at any instant
    const [expandedNotes, setExpandedNotes] = useState<ExpandedNote[]>([]) //expanded notes [{point, expansion}]
    const [expanding, setExpanding] = useState<number>(-1) //-1: not expanding, 0: expanding, 1: expanded
    const [pause, setPause] = useState<boolean>(false)
    const [expandSection, setExpandSection] = useState<boolean>(false)
    const [expandQuizSection, setExpandQuizSection] = useState<boolean>(false)
    const [dragging, setDragging] = useState(false)
    const [draggingIndex, setDraggingIndex] = useState<number>(-1)
    const [initialY, setInitialY] = useState(0)

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
        }))

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

        // mediaRecorder setup for audio
        // if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
        //     console.log('mediaDevices supported..')

        //     navigator.mediaDevices.getUserMedia({
        //         audio: true
        //     }).then(stream => {
        //         mediaRecorder = new MediaRecorder(stream)

        //         mediaRecorder.ondataavailable = (e: any) => {
        //             chunks.push(e.data)
        //         }

        //         mediaRecorder.onstop = () => {
        //             const blob = new Blob(chunks, {'type': 'audio/mp3; codecs=opus'})
        //             chunks = []
        //             audioURL = window.URL.createObjectURL(blob)
        //             setRecording(audioURL)
        //             //convert blob to mp3 file
        //             const openai = new OpenAI({ apiKey: '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', dangerouslyAllowBrowser: true} )
        //             openai.audio.transcriptions.create({
        //                 file: new File([blob], 'recording.mp3'),
        //                 model: 'whisper-1',
        //                 response_format: 'srt',
        //             }).then((res: any) => {
        //                 console.log(res)
        //             }).catch((err: any) => {
        //                 console.log(err)
        //             })
        //         }

        //         mediaRecorder.start()
        //     }).catch(error => {
        //         console.log('Following error has occured : ',error)
        //     })
        // }else{
        //     alert('Your browser does not support media devices')
        // }
    }, [name])

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault()

            const updatedPoints = bulletPoints.map((point: bulletObject) => {
                return {
                    point: point.point,
                    created_at: point.created_at,
                }
            })

            const np = {
                point: newPoint,
                created_at: playerTime, //time of the yt player at the moment of pressing enter
            }

            const maxId = Math.max(...bulletPoints.map((point: bulletObject) => parseInt(point.id.split('-')[1])))

            updatedPoints.push(np)
            
            updateNote(newTitle, updatedPoints)
            setBulletPoints([...bulletPoints, { ...np, editable: false, id:`bullet-${maxId}`, expand: 0, compress: 0, history: [] }])
            setNewPoint('')
        }
    }

    const editPoint = (id: number) => {
        const newPoints = [...bulletPoints]
        newPoints[id].editable = true
        setBulletPoints(newPoints)
    }

    const changeEditPoint = (index : number, val : string) => {
        // const newPoints = [...bulletPoints]
        // newPoints[index].point = val
        const newPoints = bulletPoints.map((bulletPoint, idx) => {
            if(idx === index){
                const history = [...bulletPoint.history]
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

    const updateEditPoint = (index : number, event : React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            const newPoints = [...bulletPoints]
            newPoints[index].editable = false
            setBulletPoints(newPoints)
            updateNote(newTitle, bulletPoints.map((point: bulletObject) => ({point: point.point, created_at: point.created_at})))
        }
    }

    const updateTitle = (event : React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            setEditTitle(false)
            updateNoteName(name, newTitle)
        }
    }

    const stopRecording = () => {
        mediaRecorder.stop()
        console.log(recording)
        // transcribe()
    }

    const transcribe = (recording: any) => {
        const OPENAI_KEY = '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'
        const model = "whisper-1"

        const formData = new FormData()
        formData.append("model", model)
        formData.append("file", recording)

        axios
        .post("https://api.openai.com/v1/audio/transcriptions", formData, {
            headers: {
            "Authorization": `Bearer ${OPENAI_KEY}`,
            "Content-Type": "multipart/form-data"
            },
        })
        .then((res) => {
            console.log(res.data)
            alert('Transcription complete!')
        })
        .catch((err) => {
            console.error(err)
            alert("Error transcribing the provided audio file.")
        })
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

        fetch('http://localhost:3000/youtube-transcript', {
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

    const expandNote = async () => {
        toast({
            title: 'Expanding all the points...',
            description: 'Please wait while we expand the bullet points',
            status: 'info',
            duration: 5000,
            position: 'top-right',
            isClosable: true,
        })

        // setExpanding(0)

        const newPoints = [...bulletPoints]
        newPoints.map((point: bulletObject) => point.expand = point.expand + 1)
        
        const points = bulletPoints.map((point: bulletObject) => ({
            point: point.point,
            history: point.history,
            expand: point.expand,
            created_at: point.created_at,
        }))

        setBulletPoints(newPoints)

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
                        return {
                            ...newPoint,
                            history: [...newPoint.history, res[idx].expansion],
                        }
                    }
                })
                
                setBulletPoints(ret)
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
        }).catch(e => {
            toast({
                title: 'Error...',
                description: 'Problem calling GPT-4...',
                status: 'error',
                duration: 2000,
                position: 'top-right',
                isClosable: true,
            })
        })

        // console.log(res)
        // setExpandedNotes(res)
        // setExpanding(1)
    }

    const expandSinglePoint = async (point: string, created_at: number) => {
        const obj = {
            point: point,
            created_at: created_at,
        }

        const res = await callGPTForSinglePoint(obj, transcription)
        return res
    }

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

    const openAIHelper = (newPoints: bulletObject[]) => {
        const pointToBeUpdated = newPoints[draggingIndex]

        expandSinglePoint(pointToBeUpdated.history[pointToBeUpdated.expand], pointToBeUpdated.created_at).then(res => {
            if(res){
                toast({
                    title: 'Done',
                    status: 'info',
                    duration: 2000,
                    position: 'top-right',
                    isClosable: true,
                })
                newPoints = bulletPoints.map((bp, idx) => {
                    if(idx === draggingIndex){
                        return {
                            ...bp,
                            history: [...bp.history, res],
                        }
                    }else{
                        return bp
                    }
                
                })
                setDraggingIndex(-1)
                setInitialY(0)
                setBulletPoints(() => newPoints)
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
        }).catch(e => alert('Error calling GPT-4...'))
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
                    openAIHelper(newPoints)
                }
            }
        }
    }

    const handleSort = () => {
        const sortedBulletPoints = [...bulletPoints].sort((a, b) => a.created_at - b.created_at)
        setBulletPoints(sortedBulletPoints)
    }
    
    return (
        <Grid
            h='137%'
            w='100%'
            templateRows='repeat(11, 1fr)'
            templateColumns='repeat(4, 1fr)'
            sx={{ overflowX: 'hidden', }}
        >
            <GridItem rowSpan={3} colSpan={4} sx={{ borderBottom: '1px solid #000', }}>
                {
                    !isLink ?
                        <InputGroup
                            style={{ marginBottom: '5vh', width: '50%', }}    
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
                <GridItem rowSpan={4} colSpan={4} sx={{ padding: '2px', overflowY: 'auto', borderRight: '1px solid #000', }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', }}>
                        <Tag size='lg' variant='solid' colorScheme='teal'>
                            <TagLabel>Quiz</TagLabel>
                            <TagRightIcon as={SunIcon} />
                        </Tag>
                        <ChevronLeftIcon w={8} h={8} color="tomato" sx={{ cursor: 'pointer', }} onClick={toggleExpandQuizSection} />
                    </div>
                    <br/>
                    No quizzes to show !
                </GridItem>
                :
                expandSection ?
                <GridItem rowSpan={4} colSpan={4} sx={{ padding: '3px', overflowY: 'auto', }}>
                    <ChevronRightIcon w={8} h={8} color="tomato" sx={{ cursor: 'pointer', }} onClick={toggleExpandSection} />
                    <Tag size='lg' variant='solid' colorScheme='yellow' sx={{ marginLeft: '1px', cursor: 'pointer', }} onClick={expandNote}>
                        <TagLabel>Expand</TagLabel>
                        <TagRightIcon w={3} as={ArrowBackIcon} />
                        <TagRightIcon w={3} as={ArrowForwardIcon} />
                    </Tag>
                    <Tag size='lg' variant='solid' colorScheme='red' sx={{ marginLeft: '1px', }}>
                        <TagLabel>Order by Theme</TagLabel>
                        <TagRightIcon as={DragHandleIcon} />
                    </Tag>
                    <Tag size='lg' variant='solid' colorScheme='green' sx={{ marginLeft: '1px',marginBottom: '1vh', cursor: 'pointer', }} onClick={handleSort}>
                        <TagLabel>Order by Time</TagLabel>
                        <TagRightIcon as={TimeIcon} />
                    </Tag>
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="droppable">
                        {(provided: any, snapshot: any) => (
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
                                                expandSinglePoint={expandSinglePoint}
                                                editPoint={editPoint}
                                            />
                                            :
                                            <input
                                                type='text'
                                                value={bulletPoint.point}
                                                className='note-input'
                                                onChange={(e) => changeEditPoint(index, e.target.value)}
                                                onKeyDown={event => updateEditPoint(index, event)}
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
                            <Tag size='lg' variant='solid' colorScheme='teal'>
                                <TagLabel>Quiz</TagLabel>
                                <TagRightIcon as={SunIcon} />
                            </Tag>
                            <ChevronLeftIcon w={8} h={8} color="tomato" sx={{ cursor: 'pointer', }} onClick={toggleExpandSection} />
                        </div>
                        <br/>
                        No quizzes to show !
                    </GridItem>
                    <GridItem rowSpan={4} colSpan={2} sx={{ padding: '2px', overflowY: 'auto', }}>
                        <ChevronRightIcon w={8} h={8} color="tomato" sx={{ cursor: 'pointer', }} onClick={toggleExpandQuizSection} />
                        <Tag size='lg' variant='solid' colorScheme='yellow' sx={{ marginLeft: '1px', cursor: 'pointer', }} onClick={expandNote}>
                            <TagLabel>Expand</TagLabel>
                            <TagRightIcon w={3} as={ArrowBackIcon} />
                            <TagRightIcon w={3} as={ArrowForwardIcon} />
                        </Tag>
                        <Tag size='lg' variant='solid' colorScheme='red' sx={{ marginLeft: '1px', }}>
                            <TagLabel>Order by Theme</TagLabel>
                            <TagRightIcon as={DragHandleIcon} />
                        </Tag>
                        <Tag size='lg' variant='solid' colorScheme='green' sx={{ marginLeft: '1px', marginBottom: '1vh', cursor: 'pointer', }} onClick={handleSort}>
                            <TagLabel>Order by Time</TagLabel>
                            <TagRightIcon as={TimeIcon} />
                        </Tag>
                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="droppable">
                            {(provided: any, snapshot: any) => (
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
                                                    expandSinglePoint={expandSinglePoint}
                                                    editPoint={editPoint}
                                                />
                                                :
                                                <input
                                                    type='text'
                                                    value={bulletPoint.history[bulletPoint.expand]}
                                                    className='note-input'
                                                    onChange={(e) => changeEditPoint(index, e.target.value)}
                                                    onKeyDown={event => updateEditPoint(index, event)}
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
            <GridItem rowSpan={4} colSpan={4}  sx={{ padding: '2px', borderTop: '1px solid #000', overflowY: 'auto', }}>
                <Tag size='lg' variant='solid' colorScheme='cyan' sx={{ marginLeft: '1px', }}>
                    <TagLabel>Summary</TagLabel>
                    <TagRightIcon as={CalendarIcon} />
                </Tag>
            </GridItem>
        </Grid>
    )
}

export default CornellNote