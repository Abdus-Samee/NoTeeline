import { useState, useEffect, useRef } from 'react'
import { useSpring, animated } from '@react-spring/web'
import { createUseGesture, pinchAction } from '@use-gesture/react'
import { useToast } from '@chakra-ui/react'
import { EditIcon } from '@chakra-ui/icons'

type BulletPointProps = {
    index: number,
    expand: number,
    history: string[],
    expandSinglePoint: (point: string, created_at: number) => Promise<string | null>,
    editPoint: (id: number, point: string) => void
}

const BulletPoint = ({index, expand, history, expandSinglePoint, editPoint}: BulletPointProps) => {
    const [expanded, setExpanded] = useState<number>(expand)
    const [pointToShow, setPointToShow] = useState<string | null>(null)

    const toast = useToast()

    useEffect(() => {
        if(history.length > expand){
            const point = history[expand]               
            setPointToShow(point)
            setExpanded(expand)   
        }else{
            setPointToShow('Expanding...')
            setExpanded(expand)
        }
    }, [expand, history])

    const handleContextMenu = (e: any) => {
        e.stopPropagation()
        e.preventDefault()
    }
    
    return (
        <div
            className='bullet-point'
            onContextMenu={handleContextMenu}
        >
            {pointToShow}
            <EditIcon
                className='bullet-point-cross' 
                w={4}
                color='green.500' 
                onClick={() => editPoint(index, point)}
            />
        </div>
    )
}

export default BulletPoint