import { useState, useEffect, useRef } from 'react'
import { useSpring, animated } from '@react-spring/web'
import { createUseGesture, pinchAction } from '@use-gesture/react'
import { useToast } from '@chakra-ui/react'
import { EditIcon } from '@chakra-ui/icons'

type BulletPointProps = {
    index: number,
    point: string,
    created_at: number,
    expandSinglePoint: (point: string, created_at: number) => Promise<string | null>,
    editPoint: (id: number, point: string) => void
}

const BulletPoint = ({index, point, created_at, expandSinglePoint, editPoint}: BulletPointProps) => {
    const [expanded, setExpanded] = useState(false)
    const [pointToShow, setPointToShow] = useState(point)
    const toast = useToast()

    useEffect(() => {
        const handler = (e: Event) => e.preventDefault()
        document.addEventListener('gesturestart', handler)
        document.addEventListener('gesturechange', handler)
        document.addEventListener('gestureend', handler)
        
        return () => {
            document.removeEventListener('gesturestart', handler)
            document.removeEventListener('gesturechange', handler)
            document.removeEventListener('gestureend', handler)
        }
    }, [])

    const ref = useRef<HTMLDivElement>(null)
    const useGesture = createUseGesture([pinchAction])
    const [style, api] = useSpring(() => ({
        x: 0,
        y: 0,
        scale: 1,
        display: 'inline-block',
        rotateZ: 0,
    }))

    useGesture(
        {
          onPinch: ({ origin: [ox, oy], first, movement: [ms], memo }) => {
            if (first) {
              const { width, height, x, y } = ref.current!.getBoundingClientRect()
              const tx = ox - (x + width / 2)
              const ty = oy - (y + height / 2)
              memo = [style.x.get(), style.y.get(), tx, ty]
            }
    
            const x = memo[0] - (ms - 1) * memo[2]
            const y = memo[1] - (ms - 1) * memo[3]
            // console.log('pinching ', s)
            // api.start({ scale: s, rotateZ: a, x, y })
            return memo
          },
          onPinchEnd: async (state) => {
            console.log('pinch end')
            toast({
                title: 'Expanding...',
                description: 'Please wait while we expand the bullet point',
                status: 'info',
                duration: 2000,
                position: 'top-right',
                isClosable: true,
            })

            const res = await expandSinglePoint(point, created_at)

            if (res) {
                setExpanded(true)
                setPointToShow(res)
            }            
          },
        },
        {
          target: ref,
          pinch: { scaleBounds: { min: 0.5, max: 2 }, rubberband: true },
        }
    )
    
    return (
        <li className='bullet-point'>
            <animated.div
                ref={ref}
                style={style}
            >
                {pointToShow}
            </animated.div>
            <EditIcon 
                className='bullet-point-cross' 
                w={4} 
                color='green.500' 
                onClick={() => editPoint(index, point)} 
            />
        </li>
    )
}

export default BulletPoint