import { useLayoutEffect, useState, useRef } from "react"

export function useHeadingObserver() {
  const observer = useRef<IntersectionObserver | undefined>()
  const [activeId, setActiveId] = useState<string | null>(null)

  useLayoutEffect(() => {
    const initializeObserver = () => {
      const headings = document.querySelectorAll("h2")

      if (headings.length === 0) {
        return
      }

      const handleObserver = (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      }

      const handleScroll = () => {
        if (headings.length === 0) return
        // is at the top
        if (window.scrollY === 0) {
          setActiveId(headings[0].id)
        }
        // is at the bottom
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
          setActiveId(headings[headings.length - 1].id)
        }
      }

      window.addEventListener("scroll", handleScroll)
      observer.current = new IntersectionObserver(handleObserver, {
        root: null,
        rootMargin: "-0px 0px -40% 0px",
        threshold: 1,
      })

      headings.forEach((heading) => {
        observer.current?.observe(heading)
      })
    }

    // Use MutationObserver to detect when headings are added to the DOM
    const targetNode = document.body
    const config = { childList: true, subtree: true }

    const mutationObserver = new MutationObserver(() => {
      initializeObserver() // Re-initialize the observer when the DOM changes the mutation observer stops this from breaking on page reload
    })

    mutationObserver.observe(targetNode, config)
    return () => {
      mutationObserver.disconnect()
      observer.current?.disconnect()
    }
  }, [activeId])

  return { activeId }
}
