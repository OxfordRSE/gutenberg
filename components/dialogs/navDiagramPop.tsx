import NavDiagram from "components/NavDiagram"
import React, { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Material, Theme, Excludes } from "lib/material"

interface PortalProps {
  children: React.ReactNode
}

const Portal = ({ children }: PortalProps) => {
  return createPortal(children, document.body)
}

const NavDiagramPopover = ({
  material,
  theme,
  excludes,
  target,
  onMouseEnter,
  onMouseLeave,
}: {
  material: Material
  theme: Theme
  excludes: Excludes
  target?: HTMLElement | null
  onMouseEnter: () => void
  onMouseLeave: () => void
}) => {
  const [style, setStyle] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (target) {
      const rect = target.getBoundingClientRect()
      const top = rect.top + rect.height // Position below the target element
      const left = rect.left // Align with the left edge of the target element
      setStyle({
        top: top + window.scrollY, // Adjust for page scroll
        left: left + window.scrollX, // Adjust for page scroll
      })
    }
  }, [target])

  console.log("style", style)

  return (
    <Portal>
      <div
        data-cy="nav-diagram-popover"
        style={{
          left: style.left,
          top: style.top,
          position: "absolute",
          height: "512px",
          width: "1024px",
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <NavDiagram material={material} theme={theme} excludes={excludes} />
      </div>
    </Portal>
  )
}

export default NavDiagramPopover
