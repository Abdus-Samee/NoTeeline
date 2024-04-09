import { useState, useEffect } from 'react'
import { EditIcon } from '@chakra-ui/icons'

type BulletPointProps = {
    index: number,
    expand: number,
    history: string[],
    created_at: number,
    editPoint: (id: number) => void,
    state: number,
    tempString: string,
}

const BulletPoint = ({index, expand, history, created_at, editPoint, state, tempString, }: BulletPointProps) => {
    const [, setExpanded] = useState<number>(expand)
    const [pointToShow, setPointToShow] = useState<string | null>(null)
    const [toStateOne, setToStateOne] = useState<boolean>(true)

    // increase expand
    // call openai api
    // add to history

    useEffect(() => {
        if(state === 1){
          if(index === 0) console.log(`Received => ${tempString}`)
          let updatedPoint = ''
          if(toStateOne){
            setToStateOne(false)
          }else{
            updatedPoint = pointToShow
          }
          //let updatedPoint = pointToShow
          updatedPoint += tempString
          setPointToShow(updatedPoint)
        }
        else if(history.length > expand){
            const point = history[expand]
            setPointToShow(point)
            setExpanded(expand)
            setToStateOne(true)
        }else{
            //setPointToShow('')
            //setPointToShow('Expanding/Reducing...')
            setToStateOne(true)
            setExpanded(expand)
        }
    }, [tempString, expand, history])

    const handleContextMenu = (e: any) => {
        e.stopPropagation()
        e.preventDefault()
    }

    const formatCreateTime = (time: number) => {
        let x = Math.floor(time / 60)
        let y = Math.floor(time - x * 60)
        
        let min = (x >= 10) ? `${x}` : `0${x}`
        let sec = (y >= 10) ? `${y}` : `0${y}`

        return `${min}:${sec}`
    }
    
    return (
        <div
            className='bullet-point'
            onContextMenu={handleContextMenu}
        >
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#3D57FF', }}>{formatCreateTime(created_at)}</span> {pointToShow}
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
