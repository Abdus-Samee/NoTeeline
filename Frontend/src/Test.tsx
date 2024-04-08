import { useEffect, useState } from 'react'
import OpenAI from 'openai'
import { openai } from './utils/helper.ts'

const Test = () => {
  const prompts = [
    'Write 2 sentences about Fibonacci sequence',
    'Write 3 sentences on pollution',
    'What is hakuna matata?',
  ]

  const API_KEY = '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'

  const genResponses = async (prompts) => {
    const responses = await Promise.all(
      prompts.map(async (prompt, idx) => {
        try{
          const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
              model: 'gpt-4-1106-preview',
              messages: [{ role: 'user', content: prompt }],
              stream: true,
            }),
          })

          const reader = res.body.getReader()
          const decoder = new TextDecoder('utf-8')
          let response = ''

          while(true){
            const chunk = await reader.read()
            const { done, value } = chunk
            if(done){
              break
            }
            const decodedChunk = decoder.decode(value)
            const lines = decodedChunk.split('\n')
            const parsedLines = lines.map(line => line.replace(/^data: /, '').trim()).filter(line => line !== '' && line !== '[DONE]').map(line => JSON.parse(line))

            for (const parsedLine of parsedLines){
              const { choices } = parsedLine
              const { delta } = choices[0]
              const { content } = delta
              if(content){
                response += content
                console.log(`response for prompt ${idx+1}: ${response}`)
              }
            }

            //response += decodedChunk
          }
          return response
        }catch(e){
          console.log('Error ' + e)
        }
      })
    )

    /*responses.forEach((response, index) => {
      console.log(`Response for prompt ${index+1} => ${response}`)
    })*/
  }
  
  useEffect(() => {
    genResponses(prompts) 
  }, [])
  
  return(
    <div>
      Testing Component ...
    </div>
  )
}

export default Test
