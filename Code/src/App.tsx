import { useState, useRef } from 'react'
import { 
  Button, 
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useToast,
 } from '@chakra-ui/react'
import { DeleteIcon } from '@chakra-ui/icons'
import Typed from 'react-typed'
import { PulseLoader } from 'react-spinners'

import Note from './components/Note'
import Onboarding from './components/Onboarding'

import { Note_t, useNoteStore } from './state/noteStore'
import './App.css'

function App() {
  const { notes, addNote, checkUniqueName, removeNote} = useNoteStore((state) => ({
    notes: state.notes,
    addNote: state.addNote,
    checkUniqueName: state.checkUniqueName,
    removeNote: state.removeNote,
  }))

  
  const [name, setName] = useState<string>('')
  const [active, setActive] = useState<string>('')
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const saveNote = () => {
    if(name === '') {
      toast({
        title: 'Error',
        description: 'Please enter a name for the note',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    const res = checkUniqueName(name)
    console.log('unique', res)

    if(!res){
      toast({
        title: 'Error',
        description: 'Note with same name already exists!',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    //adding a new note for the first time in the state
    addNote({
      name,
      content: [],
      created_at: Date.now(),
      updated_at: Date.now(),
    })

    setName('')
    onClose()
  }

  const reset = () => {
    setName('')
    onClose()
  }

  const handleOption = (tab : string) => {
    setActive(tab)
    // console.log('active', tab)
  }

  const deleteNote = (note : Note_t) => {
    removeNote(note)
    if(active === note.name) setActive('')
    toast({
      title: 'Success',
      description: 'Note deleted successfully',
      status: 'success',
      duration: 5000,
      isClosable: true,
    })
  }

  return (
    <div className='note-ui-root'>
      <div className='sidebar'>
        <header>Note UI</header>
        <ul>
          <a 
            onClick={() => handleOption('onboarding')} 
            className={active === 'onboarding' ? 'active-tab' : ''}
          >
            <li style={{ cursor: 'pointer', }}>Onboarding Session</li>
          </a>
          {notes.map((note, index) => (
            <a 
              key={index} 
              className={active === note.name ? 'active-tab' : ''}
              style={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', }} 
              onClick={() => handleOption(note.name)}
            >
              <li 
                style={{ display: 'inline', cursor: 'pointer', }}
              >
                {note.name}
              </li>
              <DeleteIcon style={{ cursor: 'pointer', }} onClick={() => deleteNote(note)} />
            </a>
          ))}
        </ul>
        <footer>
          <Button color='#fff' onClick={onOpen} style={{ background: '#566949', }}>Add Note</Button>
        </footer>
        <Modal
              isOpen={isOpen}
              onClose={onClose}
        >
          <ModalOverlay />
          <ModalContent>
              <ModalHeader>Create your note</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                  <FormControl>
                      <FormLabel>Name</FormLabel>
                      <Input placeholder='Name of your note' onChange={(e) => setName(e.target.value)} />
                  </FormControl>
              </ModalBody>

              <ModalFooter>
                  <Button colorScheme='blue' mr={3} onClick={saveNote}>
                      Save
                  </Button>
                  <Button onClick={reset}>Cancel</Button>
              </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
      <div className='note-content'>
        {active === 'onboarding' && <Onboarding />}
        {active !== '' && active !== 'onboarding' && <Note name={active} />}
      </div>
    </div>
  )
}

export default App
