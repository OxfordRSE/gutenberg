import NavDiagram from "components/NavDiagram"
import React, { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Material, Theme, Course, Excludes } from "lib/material"

interface Props {
  material: Material
  theme: Theme
  course?: Course
  excludes?: Excludes
  target?: HTMLElement | null
  onMouseEnter: () => void
  onMouseLeave: () => void
}

interface PortalProps {
  children: React.ReactNode
}

const Portal = ({ children }: PortalProps) => {
  return createPortal(children, document.body)
}

const NavDiagramPopover = ({ material, theme, course, excludes, target, onMouseEnter, onMouseLeave }: Props) => {
  const [style, setStyle] = useState({ top: 0, left: 0 })
  // delay the render ever so slightly to stop flickering
  useEffect(() => {
    const timeout = setTimeout(() => {
      // remove the hidden class from our div
      const popover = document.querySelector("[data-cy=nav-diagram-popover]")
      if (popover) {
        popover.classList.remove("hidden")
      }
    }, 50)
    return () => clearTimeout(timeout)
  }, [])
  useEffect(() => {
    if (target) {
      const rect = target.getBoundingClientRect()
      const top = rect.top + rect.height
      const left = rect.left
      setStyle({
        top: top + window.scrollY,
        left: left + window.scrollX,
      })
    }
  }, [target])

  return (
    <Portal>
      <div
        className="hidden"
        data-cy="nav-diagram-popover"
        style={{
          left: style.left,
          top: style.top,
          position: "absolute",
          height: "512px",
          width: "600px",
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <NavDiagram
          material={material}
          theme={theme}
          course={course}
          excludes={excludes}
          style={{ aspectRatio: "12 / 9", width: "100%" }}
        />
      </div>
    </Portal>
  )
}

export default NavDiagramPopover
