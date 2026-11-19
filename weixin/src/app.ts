import { PropsWithChildren, useState, useEffect } from 'react'
import LoadingScreen from './components/LoadingScreen'
import './app.scss'

function App({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <LoadingScreen />
  }

  return children
}

export default App
