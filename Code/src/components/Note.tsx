import React, { useState, useEffect } from 'react'
import { Button } from '@chakra-ui/react'
import { EditIcon } from '@chakra-ui/icons'

import { NotePoint, useNoteStore } from '../state/noteStore'

type NoteProps = {
  name: string;
}

type bulletObject = {
    point: string;
    created_at: number;
    editable: boolean;
}

const Note: React.FC<NoteProps> = ({ name }) => {
    const { updateNote, fetchNote, updateNoteName } = useNoteStore((state) => ({
        updateNote: state.updateNote,
        fetchNote: state.fetchNote,
        updateNoteName: state.updateNoteName,
    }))
    const [bulletPoints, setBulletPoints] = useState<bulletObject[]>([])
    const [newPoint, setNewPoint] = useState<string>('')
    const [newTitle, setNewTitle] = useState<string>(name)
    const [editTitle, setEditTitle] = useState<boolean>(false)

    useEffect(() => {
        const note = fetchNote(name)
        const points = note.content.map((cont: NotePoint) => ({ 
            point: cont.point, 
            created_at: cont.created_at,
            editable: false,
         }))
        setBulletPoints(points)
        // console.log(points)
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
                created_at: Date.now(),
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
            <ul style={{ fontSize: '1.1em', marginBottom: '2vh', }}>
                {bulletPoints.map((bulletPoint, index) => (
                    !bulletPoint.editable ?
                    <li 
                        key={index}
                        className='bullet-point' 
                    >
                        {bulletPoint.point} 
                        <EditIcon 
                            className='bullet-point-cross' 
                            w={4} 
                            color='green.500' 
                            onClick={() => editPoint(index, bulletPoint.point)} 
                        />
                    </li>
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
            <Button colorScheme='teal' style={{ marginBottom: '10vh', }}>Generate</Button>
        </div>
    )
}

export default Note