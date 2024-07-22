import { set } from "cypress/types/lodash"
import { useEffect, useState, useRef } from "react"

export function useHeadingObserver() {
  const observer = useRef<IntersectionObserver | undefined>()
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const headings = document.querySelectorAll("h2")
    const handleObserver = (entries: any) => {
      entries.forEach((entry: any) => {
        if (entry?.isIntersecting) {
          setActiveId(entry.target.id)
        }
      })
    }

    observer.current = new IntersectionObserver(handleObserver, {
      rootMargin: "14% 0px -95% 0px",
      threshold: 1,
    })

    window.addEventListener("scroll", () => handleScroll(headings))

    headings.forEach((heading) => observer.current?.observe(heading))
    console.log('observing')
    return () => {
      observer.current?.disconnect()
      window.removeEventListener("scroll", handleScroll)
    }
    
  }, [])

  const handleScroll = (headings: any) => {
    const isAtTop = window.scrollY === 0;
    if (isAtTop) {
      setActiveId(headings[0].id);
    }
    const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight
    if (isAtBottom) {
      setActiveId(headings[headings.length - 1].id)
    }
  }



  return { activeId }
}
