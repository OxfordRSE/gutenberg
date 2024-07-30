import { useEffect, useState, useRef } from "react"

export function useHeadingObserver() {
  const observer = useRef<IntersectionObserver | undefined>()
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const headings = document.querySelectorAll("h2")

    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry?.isIntersecting) {
          setActiveId(entry.target.id)
        }
      })
    }

    const initializeObserver = () => {
      observer.current = new IntersectionObserver(handleObserver, {
        root: null, // Use viewport as the root
        rootMargin: "-110px 0px -40% 0px",
        threshold: 1, // Adjusted thresholds
      })

      headings.forEach((heading) => {
        observer.current?.observe(heading)
      })
    }

    const handleScroll = () => {
      if (headings.length === 0) return

      const isAtTop = window.scrollY === 0
      if (isAtTop) {
        setActiveId(headings[0].id)
      }
      const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight
      if (isAtBottom) {
        setActiveId(headings[headings.length - 1].id)
      }
    }

    window.addEventListener("scroll", handleScroll)

    initializeObserver()

    return () => {
      window.removeEventListener("scroll", handleScroll)
      observer.current?.disconnect()
    }
  }, [])

  return { activeId }
}
