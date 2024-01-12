import React, { useRef, useState } from "react"

interface AccordionProps {
  title: React.ReactNode
  content: React.ReactNode
}

const Accordion: React.FC<AccordionProps> = ({ title, content }) => {
  const [active, setActive] = useState(false)
  const [height, setHeight] = useState("0px")
  const [rotate, setRotate] = useState("transform duration-700 ease")

  const contentSpace = useRef(null)

  function toggleAccordion() {
    setActive((prevState) => !prevState)
    // @ts-ignore
    setHeight(active ? "0px" : `${contentSpace.current.scrollHeight}px`)
    setRotate(active ? "transform duration-700 ease" : "transform duration-700 ease rotate-180")
  }

  return (
    <div className="flex flex-col">
      <button
        className="box-border appearance-none cursor-pointer focus:outline-none flex items-center justify-between"
        onClick={toggleAccordion}
      >
        <p className="inline-block text-footnote light">{title}</p>
        <svg
          data-accordion-icon
          className={`w-6 h-6 ${rotate} shrink-0`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clip-rule="evenodd"
          ></path>
        </svg>
      </button>
      <div
        ref={contentSpace}
        style={{ maxHeight: `${height}` }}
        className="overflow-hidden transition-max-height duration-700 ease-in-out"
      >
        <div className="pb-5">{content}</div>
      </div>
    </div>
  )
}

export default Accordion
