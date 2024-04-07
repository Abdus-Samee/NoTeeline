import { useState } from 'react'
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
  Checkbox,
  Box,
  Heading,
 } from '@chakra-ui/react'
import { DeleteIcon, ChevronLeftIcon, ArrowLeftIcon, HamburgerIcon, CloseIcon, } from '@chakra-ui/icons'
import { motion, AnimatePresence } from 'framer-motion'

import Onboarding from './components/Onboarding'
import CornellNote from './components/CornellNote'

import { Note_t, useNoteStore } from './state/noteStore'
import logo from './assets/images/logo.png'
import './App.css'

const App_c = () => {
  const { notes, addNote, checkUniqueName, removeNote, fetchNote} = useNoteStore((state) => ({
    notes: state.notes,
    addNote: state.addNote,
    checkUniqueName: state.checkUniqueName,
    removeNote: state.removeNote,
    fetchNote: state.fetchNote
  }))

  
  const [name, setName] = useState<string>('')
  const [active, setActive] = useState<string>('')
  const [showLeftPane, setShowLeftPane] = useState(true)
  const [selectedNote, setSelectedNote] = useState<Note_t>({
    name: '',
    ytId: '',
    micronote: true,
    content: [],
    transcription: [],
    expansion: [],
    generatedSummary: '',
    generatedSummary_P: '',
    theme_count: 0,
    time_count: 0,
    expand_count: 0,
    created_at: 0,
    updated_at: 0,
    recording_start: 0,
  })
  const [isChecked, setIsChecked] = useState(true)
  
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
      ytId: '',
      micronote: true, //isChecked,
      content: [],
      transcription: [],
      expansion: [],
      generatedSummary: '',
      generatedSummary_P: '',
      theme_count: 0,
      time_count: 0,
      expand_count: 0,
      created_at: Date.now(),
      updated_at: Date.now(),
      recording_start: 0,
    })

    setName('')
    setIsChecked(true)
    onClose()
  }

  const reset = () => {
    setName('')
    onClose()
  }

  const handleOption = (tab : string) => {
    setActive(tab)
    console.log('Selected ' + tab)
    if(tab !== 'onboarding'){
      const note: Note_t = fetchNote(tab)
      setSelectedNote({...note})
    }
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

  const handleCheckBoxChange = (event: any) => {
    setIsChecked(event.target.checked)
    console.log(event.target.checked)
  }

  return (
    <div className='note-ui-root'>
      <AnimatePresence>
      {showLeftPane && (
      <motion.div
        className='sidebar'
        initial={{ width: '20%', }}
        animate={{ width: '20%' }}
        exit={{ width: '0%', }}
        transition={{ duration: 0.3, ease: 'easeInOut', }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', background: '#54432C', }}>
          <div 
            style={{ 
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
          <img src={logo} alt='Logo' className='logo' />
          <header>
            NoTeeline
          </header>
          </div>
          <span style={{ paddingRight: '5px', cursor: 'pointer'}}>
            <CloseIcon 
              w={4} 
              h={4}
              sx={{ cursor: 'pointer', }}
              color='#FFECB8'
              onClick={() => setShowLeftPane(!showLeftPane)}
            />  
          </span>
        </div>
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
              <DeleteIcon style={{ cursor: 'pointer', }} onClick={(event) => {event.stopPropagation(); deleteNote(note)}} />
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
                  {/*<br />
                  <Checkbox defaultChecked onChange={handleCheckBoxChange}>
                    Enable micro note taking
                  </Checkbox>*/}
              </ModalBody>
              <ModalFooter>
                  <Button colorScheme='blue' mr={3} onClick={saveNote}>
                      Save
                  </Button>
                  <Button onClick={reset}>Cancel</Button>
              </ModalFooter>
          </ModalContent>
        </Modal>
      </motion.div>
      )}
      </AnimatePresence>
      <div 
        className='note-content'
        style={{
          left: showLeftPane ? '19%' : '0%',
          width: showLeftPane ? '81%' : '98%',
          transition: 'left 0.3s ease, width 0.3s ease',
        }}
      >
        {!showLeftPane && (
          <div
            style={{
              position: '-webkit-sticky',
              position: 'sticky',
              top: '0',
              zIndex: '1',
              background: '#fff',
              display: 'inline-flex',
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              //border: '1px solid red',
            }}
          >
          <Box 
            width={8} 
            height={8} 
            style={{
              textAlign: 'center', 
              marginTop: '1%',
              marginLeft: '1%',
              borderRadius: '50%', 
              background: '#54432C', 
          }}>
            <HamburgerIcon
              w={6}
              h={6}
              color='#fff'
              sx={{ cursor: 'pointer', marginLeft: '0vw', }}
              onClick={() => setShowLeftPane(!showLeftPane)}
            />
          </Box>
            <Box
              style={{
                marginTop: '1%',
              }}
            >
              <Heading fontSize={30} fontWeight={600}>
                NoTeeline
              </Heading>
            </Box>
          </div>
        )}
        {active === 'onboarding' && <Onboarding />}
        {active !== '' && active !== 'onboarding' && <CornellNote name={active} note={selectedNote} />}
      </div>
    </div>
  )
}

export default App_c
