import React, { useState } from 'react'
import { Card, CardBody, Heading, Stack, StackDivider, Box, Text, Button } from '@chakra-ui/react'

const Onboarding: React.FC = () => {
    const [currentInput, setCurrentInput] = useState<string[]>(['', ''])
    const [inputList, setInputList] = useState<string[][]>([[], []])

    const setInput = (count: number, input: string) => {
        setCurrentInput(currentInput.map((inp, i) => {
            if (i === (count-1)) {
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
        const newInputList = [...inputList[count-1]]
        newInputList[index] = input
        const updatedList = inputList.map((list, i) => {
            if (i === (count-1)) {
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
            <Card style={{ marginBottom: '1vh', }}>
                <CardBody>
                    <Stack divider={<StackDivider />} spacing='4'>
                        <Box>
                            <Heading size='md' textTransform='uppercase' color='#54432C'>Prompt</Heading>
                            <Text pt='2' fontSize='md'>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor 
                                in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, 
                                sunt in culpa qui officia deserunt mollit anim id est laborum.
                            </Text>
                        </Box>
                        <Box>
                            <Heading size='md' textTransform='uppercase' color='#54432C'>User Summary</Heading>
                            <Text pt='2' fontSize='sm'>
                                {
                                    inputList[0].map((input, index) => (
                                        <input
                                            key={index}
                                            type='text'
                                            value={input}
                                            className='note-input'
                                            onChange={(e) => updateInput(1, index, e.target.value)}
                                        />
                                    ))
                                }
                                <input
                                    type='text'
                                    className='note-input'
                                    value={currentInput[0]}
                                    onChange={(e) => setInput(1, e.target.value)}
                                    onKeyDown={event => handleKeyDown(1, event)}
                                />
                            </Text>
                        </Box>
                    </Stack>
                </CardBody>
            </Card>
            <Card style={{ marginBottom: '1vh', }}>
                <CardBody>
                    <Stack divider={<StackDivider />} spacing='4'>
                        <Box>
                            <Heading size='md' textTransform='uppercase' color='#54432C'>Prompt</Heading>
                            <Text pt='2' fontSize='md'>
                                Velit sed ullamcorper morbi tincidunt ornare. Quis imperdiet massa tincidunt nunc pulvinar. Sapien 
                                pellentesque habitant morbi tristique. Amet dictum sit amet justo donec enim diam vulputate. At urna 
                                condimentum mattis pellentesque id. Donec pretium vulputate sapien nec sagittis aliquam malesuada 
                                bibendum. Eget arcu dictum varius duis at consectetur lorem. Nam aliquam sem et tortor consequat. Semper
                                eget duis at tellus at urna condimentum. Eget nulla facilisi etiam dignissim. Ut tristique et egestas 
                                quis ipsum. Ut morbi tincidunt augue interdum velit euismod in pellentesque massa. Volutpat consequat 
                                mauris nunc congue nisi vitae suscipit. Interdum posuere lorem ipsum dolor. Pulvinar mattis nunc sed 
                                blandit. Et egestas quis ipsum suspendisse ultrices gravida. Aliquet lectus proin nibh nisl condimentum 
                                id venenatis.
                            </Text>
                        </Box>
                        <Box>
                            <Heading size='md' textTransform='uppercase' color='#54432C'>User Summary</Heading>
                            <Text pt='2' fontSize='sm'>
                                {
                                    inputList[1].map((input, index) => (
                                        <input
                                            key={index}
                                            type='text'
                                            value={input}
                                            className='note-input'
                                            onChange={(e) => updateInput(2, index, e.target.value)}
                                        />
                                    ))
                                }
                                <input
                                    type='text'
                                    className='note-input'
                                    value={currentInput[1]}
                                    onChange={(e) => setInput(2, e.target.value)}
                                    onKeyDown={event => handleKeyDown(2, event)}
                                />
                            </Text>
                        </Box>
                    </Stack>
                </CardBody>
            </Card>
            <Button colorScheme='teal' style={{ marginBottom: '2vh', }}>Submit</Button>
        </div>
    );
};

export default Onboarding