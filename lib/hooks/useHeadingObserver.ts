import { useEffect, useState, useRef } from "react"

export function useHeadingObserver() {
  const observer = useRef<IntersectionObserver | undefined>()
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
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

    const headings = document.querySelectorAll("h2, h3, h4, h5, h6")
    headings.forEach((heading) => observer.current?.observe(heading))
    return () => observer.current?.disconnect()
  }, [])

  return { activeId }
}
