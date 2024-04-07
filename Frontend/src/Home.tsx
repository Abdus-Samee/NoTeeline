import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Button,
  Input,
  Flex,
  Spacer,
  Box,
  Heading,
  Text,
  useToast,
} from '@chakra-ui/react'
import { InfoOutlineIcon } from '@chakra-ui/icons'
import { Typewriter } from 'react-simple-typewriter'

const Home = () => {
  const [gptKey, setGptKey] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string>('')

  const toast = useToast()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
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
    <Flex
      width='full'
      flexDirection='column'
      align='center'
      justify='center'
      style={{ marginTop: '20vh', }}
    >
      <Box mb={10} style={{ fontWeight: '600', fontSize: '18px', }}>
        <Typewriter
          words={['Write, Organize, Review, and Summarize Personalized Notes']}
          cursor
          cursorStyle='_'
          typeSpeed={30}
        />
      </Box>
      <Box
        p={8}
        minWidth='25vw'
        maxWidth='30vw'
        borderWidth={1}
        borderRadius={8}
        boxShadow='lg'
      >
        <Box textAlign='center'>
          <Heading color='#4338CA'>NoTeeline</Heading>
        </Box>
        <Box my={4} textAlign='center'>
          <form>
            <FormControl>
              <Input 
                type='text'
                placeholder='Enter your GPT4 key'
                onChange={(e) => setGptKey(e.target.value)}
              />
              {errorMsg !== '' &&
                <FormHelperText
                  style={{ color: 'red', fontWeight: 'bold', }}
                >
                  {errorMsg}
                </FormHelperText>
              }
            </FormControl>
            <Button
              width='half'
              type='submit'
              mt={4}
              colorScheme='teal'
              variant='outline'
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </form>
        </Box>
        <Box textAlign='left'>
          <Text fontSize='xs' color='grey' as='em'>
            <InfoOutlineIcon /> The GPT4 key you provide will be used for the expansion of micronotes, theme generation, cue questions, and summarization. Be careful to provide the correct key!
          </Text>
        </Box>
      </Box>
    </Flex>
   )
}

export default Home
