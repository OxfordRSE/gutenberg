import React, { useRef, useState } from "react"

interface SolutionProps {
  id: string
  content: React.ReactNode
}

const Solution: React.FC<SolutionProps> = ({ id, content }) => {
  const [active, setActive] = useState(false)
  const [height, setHeight] = useState("0px")
  const [rotate, setRotate] = useState("transform duration-700 ease")

  const contentSpace = useRef<null | HTMLDivElement>(null)
  const solutionContentSpace = useRef<null | HTMLDivElement>(null)

  function toggleAccordion() {
    setActive((prevState) => !prevState)
    // @ts-ignore
    setHeight(active ? "0px" : `${contentSpace.current.scrollHeight}px`)
    setRotate(active ? "transform duration-700 ease" : "transform duration-700 ease rotate-180")

    setTimeout(() => {
      if (solutionContentSpace.current !== null && !active) {
        solutionContentSpace.current.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" })
      }
    }, 700)
  }

  const title = "Solution"
  const headingId = `${id}-heading`
  const panelId = `${id}-panel`

  return (
    <div className="pt-1 flex flex-col">
      <button
        id={headingId}
        aria-expanded={active ? "true" : "false"}
        aria-controls={panelId}
        className="rounded bg-slate-200 dark:bg-slate-700 font-bold appearance-none cursor-pointer flex items-center justify-between"
        onClick={toggleAccordion}
      >
        <p className="px-4 my-2">{title}</p>
        <svg
          data-accordion-icon
          className={`w-6 h-6 ${rotate} shrink-0`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          ></path>
        </svg>
      </button>
      <div
        id={panelId}
        ref={contentSpace}
        role="region"
        aria-labelledby={headingId}
        aria-hidden={active ? "false" : "true"}
        style={{ maxHeight: `${height}` }}
        className="overflow-hidden transition-max-height duration-700 ease-in-out"
      >
        <div ref={solutionContentSpace} className="pb-5">
          {content}
        </div>
      </div>
    </div>
  )
}

export default Solution
