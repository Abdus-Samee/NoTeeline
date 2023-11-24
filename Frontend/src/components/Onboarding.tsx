import React, { useState } from 'react'
import { Card, CardBody, Heading, Stack, StackDivider, Box, Text, Button } from '@chakra-ui/react'
import OnboardingHelper from './OnboardingHelper';

const Onboarding: React.FC = () => {
    const [currentInput, setCurrentInput] = useState<string[]>(['', '', ''])
    const [inputList, setInputList] = useState<string[][]>([[], [], []])
    
    const embedIds = ['Ff4fRgnuFgQ', 'Ff4fRgnuFgQ', 'FWTNMzK9vG4']

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
            const input = currentInput[count-1]
            const newInputList = [...inputList[count-1]]
            newInputList.push(input)
            const updatedList = inputList.map((list, i) => {
                if (i === (count-1)) {
                    return newInputList
                }
                return list
            })
            setInputList(updatedList)

            setCurrentInput(currentInput.map((inp, i) => {
                if (i === (count-1)) {
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

    return (
        <div className='onboarding-ui'>
            <h1 className='note-title'>
                Onboarding Session
                {/* <hr style={{ width: '75%', border: '1px dashed #566949' }} /> */}
            </h1>
            {embedIds.map((embedId, index) => (
                <OnboardingHelper 
                    key={index}
                    index={index}
                    embedId={embedId}
                    setInput={setInput}
                    handleKeyDown={handleKeyDown}
                    updateInput={updateInput}
                />
            ))}
            <Button colorScheme='teal' style={{ marginBottom: '2vh', }}>Submit</Button>
        </div>
    );
};

export default Onboarding