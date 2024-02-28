import { useState, useEffect } from "react"

interface WindowSize {
  width?: number | undefined
  height?: number | undefined
}

// this hook is used to get the window size
// can be used to remove or change components based on a min size (i.e. exclude mobiles)
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: undefined,
    height: undefined,
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      }

      window.addEventListener("resize", handleResize)
      handleResize()
      return () => window.removeEventListener("resize", handleResize)
    }
  }, [])
  return windowSize
}

export default useWindowSize
