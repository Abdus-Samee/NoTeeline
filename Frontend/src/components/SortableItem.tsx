import React from 'react'
import {useSortable} from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities'
import BulletPoint from './BulletPoint'

const SortableItem = (props: any) => {
  const id = props.id
  const point = props.bulletPoint.point
  const created_at = props.bulletPoint.created_at
  const editable = props.bulletPoint.editable
  const expandSinglePoint = props.expandSinglePoint
  const editPoint = props.editPoint
  const changeEditPoint = props.changeEditPoint
  const updateEditPoint = props.updateEditPoint

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: props.id})
  
  const style = {
    // cursor: 'pointer',
    border: '1px solid green',
    padding: '2px',
    marginBottom: '1vh',
    transform: CSS.Transform.toString(transform),
    transition,
  }
  
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {
        !editable ?
        <BulletPoint
          index={id}
          point={point}
          created_at={created_at}
          expandSinglePoint={expandSinglePoint}
          editPoint={editPoint}
        />
        :
        <input
          type="text"
          value={point}
          className='note-input'
          onChange={(e) => changeEditPoint(id, e.target.value)}
          onKeyDown={(e) => updateEditPoint(id, e)}
        />
      }
    </div>
  )
}

export default SortableItem