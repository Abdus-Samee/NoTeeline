import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import App from './App.tsx'

import './index.css'

const theme = extendTheme({
  styles: {
    global: () => ({
      body: {
        bg: "",
        padding: 0,
      }
    })
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
)
