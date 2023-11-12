import React, { useState, useEffect, useRef } from 'react'
import { Button, InputGroup, Input, InputRightElement, useToast, Spinner } from '@chakra-ui/react'
import { EditIcon } from '@chakra-ui/icons'
import axios from 'axios'
import OpenAI from 'openai'
import YouTube from 'react-youtube'
import Typed from 'react-typed'

import { NotePoint, ExpandedNote, TranscriptLine, useNoteStore } from '../state/noteStore'
import { expandPoint, callGPT, callGPTForSinglePoint } from '../utils/helper'
import BulletPoint from './BulletPoint'

type NoteProps = {
  name: string;
}

type bulletObject = {
    point: string;
    created_at: number;
    editable: boolean;
}

let mediaRecorder : any
let chunks : any[] = []
let audioURL : string

const Note: React.FC<NoteProps> = ({ name }) => {
    const { updateNote, addYouTubeId, fetchNote, updateNoteName, startRecording } = useNoteStore((state) => ({
        updateNote: state.updateNote,
        addYouTubeId: state.addYouTubeId,
        fetchNote: state.fetchNote,
        updateNoteName: state.updateNoteName,
        startRecording: state.startRecording
    }))
    const [bulletPoints, setBulletPoints] = useState<bulletObject[]>([])
    const [newPoint, setNewPoint] = useState<string>('')
    const [newTitle, setNewTitle] = useState<string>(name)
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

    const ref = useRef(null)
    const toast = useToast()
    let timeoutHandle : any

    useEffect(() => {
        const note = fetchNote(name)

        if(note.ytId !== ''){
            setEmbedId(note.ytId)
            setIsLink(true)
        }
        startRecording(name, Date.now())

        const points = note.content?.map((cont: NotePoint) => ({ 
            point: cont.point, 
            created_at: cont.created_at,
            editable: false,
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

            updatedPoints.push(np)
            
            updateNote(newTitle, updatedPoints)
            setBulletPoints([...bulletPoints, { ...np, editable: false }])
            setNewPoint('')
        }
    }

    const editPoint = (id: number, point : string) => {
        const newPoints = [...bulletPoints]
        newPoints[id].editable = true
        setBulletPoints(newPoints)
    }

    const changeEditPoint = (index : number, val : string) => {
        const newPoints = [...bulletPoints]
        newPoints[index].point = val
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
            toast({
                title: 'Transcription complete!',
                description: 'Your transcription is ready!',
                status: 'success',
                duration: 5000,
                isClosable: true,
            })
        }).catch(err => {
            console.log(err)
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
        setExpanding(0)

        const points = bulletPoints.map((point: bulletObject) => ({
            point: point.point,
            created_at: point.created_at,
        }))

        const res = await callGPT(points, transcription)
        console.log(res)
        setExpandedNotes(res)
        setExpanding(1)
    }

    const expandSinglePoint = async (point: string, created_at: number) => {
        // toast({
        //     title: 'Expanding...',
        //     description: 'Please wait!',
        //     status: 'info',
        //     duration: 2000,
        //     isClosable: true,
            
        // })

        const obj = {
            point: point,
            created_at: created_at,
        }

        const res = await callGPTForSinglePoint(obj, transcription)
        return res
    }

    return (
        <div className='note-ui'>
            <h1 className='note-title'>
                {editTitle ? 
                    <input
                        type='text'
                        value={newTitle}
                        className='note-input'
                        onChange={(e) => setNewTitle(e.target.value)}
                        onKeyDown={event => updateTitle(event)}
                    />
                    :
                    <>
                        {newTitle}
                        <EditIcon
                            className='note-title-edit'
                            w={4}
                            color='green.500'
                            onClick={() => setEditTitle(true)}
                        />
                    </>
                }
                {/* <hr style={{ width: '90%', border: '1px dashed #566949' }} /> */}
            </h1>
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
                        videoId={embedId}
                        onReady={loop}
                        onPlay={() => setPause(false)}
                        onPause={() => setPause(true)}
                        onEnd={stopVideo}
                        style={{ marginBottom: '5vh', }}
                    />
            }
            <ul style={{ fontSize: '1.1em', marginBottom: '2vh', }}>
                {bulletPoints.map((bulletPoint, index) => (
                    !bulletPoint.editable ?
                    <BulletPoint
                        key={index}
                        index={index}
                        point={bulletPoint.point}
                        created_at={bulletPoint.created_at}
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
                ))}
            </ul>
            <input
                type='text'
                placeholder='Write a point...'
                className='note-input'
                value={newPoint}
                onChange={(e) => setNewPoint(e.target.value)}
                onKeyDown={event => handleKeyDown(event)}
            />
            <Button disabled={expanding == 0} colorScheme='teal' onClick={expandNote} style={{ marginBottom: '5vh', }}>Expand Note</Button>
            {
                expanding === 0 && 
                <div
                    style={{ textAlign: 'center', }}
                >
                    <Spinner 
                        emptyColor='gray.200'
                        color='blue.500'
                    />
                    <p>Expanding Notes...</p>
                </div>
            }
            {
                expanding === 1 &&
                expandedNotes.map((exp, i) => (
                    <div key={i} style={{ marginBottom: '2vh', }}>
                        <h3
                            style={{ fontWeight: 'bold', }}
                        >
                            {exp.point}
                        </h3>
                        <Typed
                            strings={[exp.expansion]}
                            typeSpeed={40}
                        />
                    </div>
                ))
            }
            {recording && <audio src={recording} controls />}
        </div>
    )
}

export default Note