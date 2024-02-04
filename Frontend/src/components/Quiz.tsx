import React, { useEffect, useState } from 'react'
import { Button, Progress } from '@chakra-ui/react'

export type Quiz_t = {
    question: string;
    answer: string;
    options: string[];
}

const Quiz: React.FC<any> = ({ quizzes, quizInfo, changeQuizInfo }) => {
    const [data, setData] = useState<Quiz_t[]>(quizzes)
    const [quiz, setQuiz] = useState<number>(0)
    const [progress, setProgress] = useState<number>(0)
    const [colourGreen, setColourGreen] = useState<number>(-1)
    const [colourRed, setColourRed] = useState<number>(-1)

    useEffect(() => {
        console.log(quizzes)
        setData(quizzes)
        if(quizInfo){
            setQuiz(quizInfo.quiz)
            setProgress(quizInfo.qp)
            setColourGreen(quizInfo.colourGreen)
            setColourRed(quizInfo.colourRed)
        }
    }, [])

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
        const qp = (quiz == (data.length-1)) ? data.length : q
        const currentProgress = (qp / data.length) * 100
        changeQuizInfo({ quiz: q, qp: currentProgress, colourGreen: -1, colourRed: -1 })
        setProgress(currentProgress)
    }

    const handleRegenerate = () => {
        setQuiz(0)
        setProgress(0)
        setColourGreen(-1)
        setColourRed(-1)
        changeQuizInfo({ quiz: 0, qp: 0, colourGreen: -1, colourRed: -1 })
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
            <Button variant='outline' colorScheme='green' onClick={progress === 100 ? handleRegenerate : handleNext}>{progress === 100 ? 'Regenerate quiz' : 'Next'}</Button>
        </div>
    )
}

export default Quiz