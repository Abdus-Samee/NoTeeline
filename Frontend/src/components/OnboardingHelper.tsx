import React, { useState, useEffect } from 'react'
import { Card, CardBody, Heading, Stack, StackDivider, Box, Textarea, Text, Button } from '@chakra-ui/react'
import YouTube from 'react-youtube'

type OnboardingHelperProps = {
    index: number,
    embedId: string,
    opts: any,
    handleNoteChange: (count: number, input: string) => void,
    setInput: (count: number, input: string) => void,
    handleKeyDown: (count: number, event: React.KeyboardEvent<HTMLInputElement>) => void,
    updateInput: (count: number, index: number, input: string) => void,
    getSpecificOnboarding: any,
}

const OnboardingHelper: React.FC<OnboardingHelperProps> = ({index, embedId, opts, handleNoteChange, setInput, handleKeyDown, updateInput, getSpecificOnboarding}: OnboardingHelperProps) => {
    const [newPoint, setNewPoint] = useState<string>('')
    const [note, setNote] = useState<string>('')
    const [inputList, setInputList] = useState<string[]>([])

    useEffect(() => {
        // console.log(storedOnboarding)
        const obj = getSpecificOnboarding(index)
        setNote(obj.note)
        setInputList(obj.keypoints)
    }, [])

    const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value
        setNote(value)
        handleNoteChange(index, value)
    }

    const handleOldInputChange = (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
        const updatedList = inputList.map((input, idx) => {
            if (i === idx) {
                return e.target.value
            }
            return input
        })
        setInputList(updatedList)
        updateInput(index, i, e.target.value)
    }

    const handleNewInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(index, e.target.value)
        setNewPoint(e.target.value)
    }

    const handleKeyDownPress = (count: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            const input = newPoint
            const newInputList = [...inputList]
            newInputList.push(input)
            setInputList(newInputList)
            handleKeyDown(count, e)
            setNewPoint('')
        }
    }

    return (
        <Card style={{ marginBottom: '1vh', }}>
            <CardBody>
                <Stack divider={<StackDivider />} spacing='4'>
                    <Box>
                        <YouTube 
                            videoId={embedId}
                            opts={opts}
                            style={{ marginBottom: '5vh', }}
                        />
                    </Box>
                    <Box>
                        <Heading size='md' textTransform='uppercase' color='#54432C'>User Full Note</Heading>
                        <Textarea
                            placeholder='Enter your note here...'
                            size='sm'
                            resize='vertical'
                            value={note}
                            onChange={handleTextAreaChange}
                        />
                    </Box>
                    <Box>
                        <Heading size='md' textTransform='uppercase' color='#54432C'>Keypoints</Heading>
                        {
                            inputList.map((input, i) => (
                                <input
                                    key={i}
                                    type='text'
                                    value={input}
                                    className='note-input'
                                    onChange={(e) => handleOldInputChange(e, i)}
                                />
                            ))
                        }
                        <input
                            type='text'
                            className='note-input'
                            value={newPoint}
                            onChange={(e) => handleNewInputChange(e)}
                            onKeyDown={event => handleKeyDownPress(index, event)}
                        />
                    </Box>
                </Stack>
            </CardBody>
        </Card>
    )
}

export default OnboardingHelper
