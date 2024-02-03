import { useState, useEffect } from 'react'
import { EditIcon } from '@chakra-ui/icons'

type BulletPointProps = {
    index: number,
    expand: number,
    history: string[],
    editPoint: (id: number) => void
}

const BulletPoint = ({index, expand, history, editPoint}: BulletPointProps) => {
    const [, setExpanded] = useState<number>(expand)
    const [pointToShow, setPointToShow] = useState<string | null>(null)

    // const toast = useToast()

    useEffect(() => {
        if(history.length >= expand){
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
                onClick={() => editPoint(index)}
            />
        </div>
    )
}

export default BulletPoint