import React, { useEffect, useState } from 'react'
import { Button, Progress } from '@chakra-ui/react'

type Quiz_t = {
    question: string;
    answer: string;
    options: string[];
}

const Quiz: React.FC<any> = ({ quizInfo, changeQuizInfo }) => {
    const [quiz, setQuiz] = useState<number>(0)
    const [progress, setProgress] = useState<number>(0)
    const [colourGreen, setColourGreen] = useState<number>(-1)
    const [colourRed, setColourRed] = useState<number>(-1)

    useEffect(() => {
        if(quizInfo){
            setQuiz(quizInfo.quiz)
            setProgress(quizInfo.qp)
            setColourGreen(quizInfo.colourGreen)
            setColourRed(quizInfo.colourRed)
        }
    }, [])

    const data: Quiz_t[] = [
        {
            question: 'Question 1',
            answer: 'C1',
            options: ['W1', 'C1', 'W2', 'W3']
        },
        {
            question: 'Question 2',
            answer: 'C2',
            options: ['C2', 'W1', 'W2', 'W3']
        },
        {
            question: 'Question 3',
            answer: 'C3',
            options: ['W1', 'W2', 'W3', 'C3']
        },
        {
            question: 'Question 4',
            answer: 'C4',
            options: ['W1', 'W2', 'C4', 'W3']
        },
    ]

    const checkQuizAnswer = (idx: number) => {
        console.log(data[quiz].options[idx], data[quiz].answer)
        if(data[quiz].options[idx] === data[quiz].answer){
            setColourGreen(idx)
            changeQuizInfo({ quiz: quiz, colourGreen: idx, colourRed: colourRed })
        }else{
            setColourRed(idx)
            const correctIndex = data[quiz].options.indexOf(data[quiz].answer)
            setColourGreen(correctIndex)
            changeQuizInfo({ quiz: quiz, qp: progress, colourGreen: correctIndex, colourRed: idx })
        }
    }

    const handleNext = () => {
        const q = quiz+1 < data.length ? quiz+1 : quiz
        setColourGreen(-1)
        setColourRed(-1)
        setQuiz(q)
        const qp = (quiz == 3) ? 4 : q
        const currentProgress = (qp / data.length) * 100
        changeQuizInfo({ quiz: q, qp: currentProgress, colourGreen: -1, colourRed: -1 })
        setProgress(currentProgress)
    }

    return(
        <div className='quiz-container'>
            <Progress value={progress} sx={{ marginTop: '-3.5vh', marginBottom: '0.5vh', borderRadius: '15px', }} />
            <h4 className='quiz-question'>{data[quiz].question}</h4>
            <div className='quiz-options'>
            {data[quiz].options.map((option, idx) => (
                <div 
                    key={idx} 
                    className='quiz-option' 
                    onClick={() => checkQuizAnswer(idx)}
                    style={{
                        background: `${idx === colourGreen ? '#98D771' : idx === colourRed ? '#EA4F4F' : ''}`,
                        cursor: `${colourGreen === -1 ? 'pointer' : ''}`
                    }}
                >
                        {option}
                </div>
            ))}
            </div>
            <Button variant='outline' colorScheme='blue' onClick={handleNext}>Next</Button>
        </div>
    )
}

export default Quiz