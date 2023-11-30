import React, { useState } from 'react'
import { Button, useToast } from '@chakra-ui/react'

import { useNoteStore, OnboardingSection } from '../state/noteStore'
import OnboardingHelper from './OnboardingHelper'

const Onboarding: React.FC = () => {
    const { addOnboarding } = useNoteStore((state) => ({
        addOnboarding: state.addOnboarding,
    }))
    const [notes, setNotes] = useState<string[]>(['', '', ''])
    const [currentInput, setCurrentInput] = useState<string[]>(['', '', ''])
    const [inputList, setInputList] = useState<string[][]>([[], [], []])

    const toast = useToast()

    const onboardingSections = [
        {
            embedId: 'Ff4fRgnuFgQ',
            opts: {
                height: '390',
                width: '640',
                playerVars: {
                    autoplay: 0,
                    start: 1886,
                    end: 1920,
                },
            },
            transcript: "So, you know, we're gonna, I've talked about a bunch of this stuff, but you'll have, you know, an assistant that"+
                "you can talk to in WhatsApp. You know, I think, I think in the future, every creator will, will have kind of an AI agent"+
                "that can kind of act on their behalf that their fans can talk to. I want to get to the point where every small business"+
                "basically has an AI agent that people can talk to for, you know, to do commerce and customer support and things like that."+
                "So there can be all these different things.",
        },
        {
            embedId: 'Ff4fRgnuFgQ',
            opts: {
                height: '390',
                width: '640',
                playerVars: {
                    autoplay: 0,
                    start: 2749, //45:49
                    end: 2773, //46:13
                },
            },
            transcript: "it's not like there can be just one singular AI that can answer all the questions"+
                "for a person because that AI might not actually be aligned with you as a business to really just do"+
                "the best job providing support for your product. So I think that there's gonna be a clear need in the market"+
                "and in people's lives for there to be a bunch of these. ",
        },
        {
            embedId: 'FWTNMzK9vG4',
            opts: {
                height: '390',
                width: '640',
                playerVars: {
                    autoplay: 0,
                    start: 290, //4:50
                    end: 316, //5:16
                },
            },
            transcript: "Some simple strategies include breaking a task into smaller elements"+
                "or journaling about why it's stressing you out"+
                "and addressing those underlying concerns."+
                "Try removing nearby distractions that make it easy to impulsively procrastinate."+
                "And more than anything, it helps to cultivate an attitude of self-compassion,"+
                "forgiving yourself, and making a plan to do better next time.",
        },
    ]
    
    const handleNoteChange = (count: number, input: string) => {
        setNotes(notes.map((note, i) => {
            if (i === count) {
                return input
            }
            return note
        }))
    }

    //keep track of the current editting input
    const setInput = (count: number, input: string) => {
        setCurrentInput(currentInput.map((inp, i) => {
            if (i === count) {
                return input
            }
            return inp
        }))
    }

    //count -> denotes the row number of 2D-state
    const handleKeyDown = (count: number, event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            const input = currentInput[count]
            const newInputList = [...inputList[count]]
            newInputList.push(input)
            const updatedList = inputList.map((list, i) => {
                if (i === (count)) {
                    return newInputList
                }
                return list
            })
            setInputList(updatedList)

            setCurrentInput(currentInput.map((inp, i) => {
                if (i === count) {
                    return ''
                }
                return inp
            }))
        }
    }

    const updateInput = (count: number, index: number, input: string) => {
        const newInputList = [...inputList[count]]
        newInputList[index] = input
        const updatedList = inputList.map((list, i) => {
            if (i === count) {
                return newInputList
            }
            return list
        })
        setInputList(updatedList)
    }

    const checkForRemainingInputs = () => {
        let updatedList: string[][] = [...inputList]

        for(let i = 0; i < currentInput.length; i++) {
            const input = currentInput[i]
            if (input !== '') {
                updatedList = updatedList.map((list, idx) => {
                    if (i === idx) {
                        return [...list, input]
                    }else return list
                })
                // setInputList(updatedList)
            }
        }

        return updatedList
    }

    const handleOnboardingSubmit = () => {
        const updatedList = checkForRemainingInputs()

        console.log('notes:', notes)
        console.log('inputList:', updatedList)

        onboardingSections.forEach((onboardingSection, index) => {
            const note = notes[index]
            const inputList = updatedList[index]
            const onboardingSectionObj: OnboardingSection = {
                id: index,
                note: note,
                keypoints: inputList,
                transcript: onboardingSection.transcript,
            }
            addOnboarding(onboardingSectionObj)
        })

        toast({
            title: 'Onboarding Session Saved',
            description: 'Your onboarding session has been saved successfully',
            status: 'success',
            duration: 5000,
            isClosable: true,
        })        
    }

    return (
        <div className='onboarding-ui'>
            {/*<h1 className='note-title'>
                Onboarding Session
                <hr style={{ width: '75%', border: '1px dashed #566949' }} />
            </h1>*/}
            {onboardingSections.map((onboardingSection, index) => (
                <OnboardingHelper 
                    key={index}
                    index={index}
                    embedId={onboardingSection.embedId}
                    opts={onboardingSection.opts}
                    handleNoteChange={handleNoteChange}
                    setInput={setInput}
                    handleKeyDown={handleKeyDown}
                    updateInput={updateInput}
                />
            ))}
            <Button 
                colorScheme='teal' 
                style={{ marginBottom: '2vh', }}
                onClick={handleOnboardingSubmit}
            >
                Submit
            </Button>
        </div>
    );
};

export default Onboarding