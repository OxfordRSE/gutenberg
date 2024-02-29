import React, { FunctionComponent, useEffect, useState } from "react"
import { createPortal } from "react-dom"

interface PortalProps {
  children: React.ReactNode
}

const Portal = ({ children }: PortalProps) => {
  return createPortal(children, document.body)
}

const NavDiagramPopover = ({ target, onMouseEnter, onMouseLeave }: { target?: HTMLElement | null, onMouseEnter: () => void, onMouseLeave: () => void }) => {
  const [style, setStyle] = useState({ top: 0, left: 0 })
  const [timeoutId, setTimeoutId] = useState<number | undefined>(undefined)

  console.log("ppopop", target)

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
        style={{ left: style.left, top: style.top, position: "absolute" }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        asda;dflkasfp;oas ~asd;lamfsaf Asdal'[;;msfaf asdafgsafxzgzxgxgxasdzxf asdafszxf
      </div>
    </Portal>
  )
}

export default NavDiagramPopover
