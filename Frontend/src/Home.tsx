import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Button,
  Input,
  Text,
  useToast,
} from '@chakra-ui/react'

const Home = () => {
  const [gptKey, setGptKey] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string>('')

  const toast = useToast()
  const navigate = useNavigate()

  const handleSubmit = () => {
    console.log(gptKey)
    if(gptKey === ''){
      setErrorMsg('No GPT key provided...')
    }else{
      localStorage.setItem('gptKey', JSON.stringify(gptKey))
      setErrorMsg('')
      navigate('/note')
    }
  }
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: '15vh',
    }}>
    <Text fontSize='5xl' style={{ color: 'purple', }}>NoTeeline</Text>
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20%',
      marginTop: '8vh',
      borderRadius: '10px',
      backgroundColor: '#BCA37F',
      minWidth: '25vw',
    }}>
      <FormControl>
        <Input 
          type='text' 
          value={gptKey} 
          placeholder='Enter your GPT Key'
          _placeholder={{ color: 'grey.500', }}
          style={{ color: '#fff', border: '1px solid #000', background: '#54432C', }}
          onChange={(e) => setGptKey(e.target.value)}
        />
        {errorMsg !== '' && 
          <FormHelperText style={{ color: 'red', }}>{errorMsg}</FormHelperText>
        }
        <Button colorScheme='green' style={{ marginTop: '1vh', }} onClick={handleSubmit}>Submit</Button>
      </FormControl>
    </div>
    </div>
  )
}

export default Home
