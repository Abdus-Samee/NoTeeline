/* eslint-disable */

import React, { useState, useEffect } from 'react'
import { Button, useToast } from '@chakra-ui/react'
import comparisonVideo from '../assets/videos/comparison.mp4'
import cookingVideo from '../assets/videos/cooking.mp4'
import mitochondriaVideo from '../assets/videos/Mitochondria_AdobeExpress.mp4'
import tedxVideo from '../assets/videos/tedX.mp4'

import { useNoteStore, OnboardingSection } from '../state/noteStore'
import OnboardingHelper from './OnboardingHelper'

const Onboarding: React.FC = () => {
    const { addOnboarding, fetchAllOnboardings } = useNoteStore((state) => ({
        addOnboarding: state.addOnboarding,
        fetchAllOnboardings: state.fetchAllOnboardings,
    }))
    const [notes, setNotes] = useState<string[]>(['', '', ''])
    const [currentInput, setCurrentInput] = useState<string[]>(['', '', ''])
    const [inputList, setInputList] = useState<string[][]>([[], [], []])
    const [storedOnboardings, setStoredOnboardings] = useState<any>(null)

    let onboardingSections = [
        {
            videoSrc: comparisonVideo,
            firstPoint: 'btm wheel',
            transcript: "look at something basic like meta Quest 3 has this little wheel on the " + 
                "bottom that you can use to adjust the Optics inside well Apple didn't want to " +
                "put this little physical wheel that you have to manually do instead there are " + 
                "literal Motors inside a vision pro it'll use the cameras to look at your eyes " + 
                "then adjust them the lenses so it matches you perfectly for the first time that " + 
                "you put it on",
        },
        // {
        //     videoSrc: cookingVideo,
        //     transcript: "the base of this recipe consists of only two ingredients just like my favorite " + 
        //     "drink water now we're gonna take two cups or around 500 milliliters of whipping cream and pour " + 
        //     "that into a bowl and get our motorized blendicles working at somewhere between three and forty " + 
        //     "five thousand rpms if you don't like holding things and you don't have a stand mixer you can make " + 
        //     "a duct tape mixer instead or you can use a whisk if you want to turn your bicep into a thick",
        // },
        {
            videoSrc: mitochondriaVideo,
            firstPoint: 'ATP',
            transcript: "mitochondria. Here, food is converted into chemical energy called ATP. ATP is released by " + 
            "the mitochondria,  so cells can use it. Mitochondria consists of two membranes, an outer membrane separating " + 
            "it from  the cytosol, and an inner membrane surrounding the so called matrix. The area between these  membranes is " + 
            "called the inter membrane space. ATP is generated at the inner membrane of mitochondria  by an efficient mechanism " + 
            "called oxidative phosphorylation",
        },
        {
            videoSrc: tedxVideo,
            firstPoint: 'motivation fickle',
            transcript: "Why does motivation seem so fickle? And what even is it in the first place? Psychologists define motivation as " + 
            "the desire or impetus to initiate and maintain a particular behavior. In other words, it's the energy that drives you to do something. " + 
            "And knowing the source of that drive is particularly important when it comes to understanding how to maintain it.",
        },
    ]

    const toast = useToast()

    useEffect(() => {
      const onboardings = fetchAllOnboardings()
      setStoredOnboardings(() => onboardings)
      console.log('Fetched stored onboardings...')
    }, [])

    const getSpecificOnboarding = (idx: number) => {
      return storedOnboardings.length > 0 ? storedOnboardings[idx] : null
    }
    
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

    // if user presses submit button without entering latest note-point
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
                keypoints: inputList.length > 0 ? inputList : [onboardingSections[index].firstPoint],
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

    const handleDownload = () => {
        // Convert the state to a JSON string
        const onboardings = fetchAllOnboardings()
        const stateJson = JSON.stringify(onboardings)
    
        // Create a Blob with the JSON data
        const blob = new Blob([stateJson], { type: 'application/json' })
    
        // Create a temporary link element
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
    
        // Set the download attribute with the desired file name
        link.download = 'onboarding.json'
    
        // Append the link to the document
        document.body.appendChild(link)
    
        // Trigger a click on the link to start the download
        link.click();
    
        // Remove the link from the document
        document.body.removeChild(link);
    }

    return (
        <div className='onboarding-ui'>
            {/*<h1 className='note-title'>
                Onboarding Session
                <hr style={{ width: '75%', border: '1px dashed #566949' }} />
            </h1>*/}
            {
              storedOnboardings !== null ?
              onboardingSections.map((onboardingSection, index) => (
                  <OnboardingHelper 
                      key={index}
                      index={index}
                      firstPoint={onboardingSection.firstPoint}
                      videoSrc={onboardingSection.videoSrc}
                      handleNoteChange={handleNoteChange}
                      setInput={setInput}
                      handleKeyDown={handleKeyDown}
                      updateInput={updateInput}
                      getSpecificOnboarding={getSpecificOnboarding}
                  />
              ))
              :
              <h3>Loading onboarding data...</h3>
            }
            <Button 
                colorScheme='teal' 
                style={{ marginBottom: '2vh', }}
                onClick={handleOnboardingSubmit}
            >
                Submit
            </Button>
            {/* <Button 
                colorScheme='orange' 
                style={{ marginBottom: '2vh', marginLeft: '1vw', }}
                onClick={handleDownload}
            >
                Download Data
            </Button> */}
        </div>
    );
};

export default Onboarding
