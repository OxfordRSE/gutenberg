import ThemeCards from "components/ThemeCards"
import react, { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Material, Excludes } from "lib/material"

interface PortalProps {
  children: React.ReactNode
}

const Portal = ({ children }: PortalProps) => {
  return createPortal(children, document.body)
}

interface Props {
  material: Material
  excludes?: Excludes
  target?: HTMLElement | null
  onMouseEnter: () => void
  onMouseLeave: () => void
}

const ThemeCardsPopover = ({ material, excludes, target, onMouseEnter, onMouseLeave }: Props) => {
  const [style, setStyle] = useState({ top: 0, left: 0 })
  // delay the render ever so slightly to stop flickering
  useEffect(() => {
    const timeout = setTimeout(() => {
      // remove the hidden class from our div
      const popover = document.querySelector("[data-cy=theme-cards-popover]")
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
        className="hidden border border-gray-200 shadow-md dark:border-gray-700 bg-white dark:bg-gray-800"
        data-cy="theme-cards-popover"
        style={{
          left: style.left,
          top: style.top,
          position: "absolute",
          zIndex: 1000,
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <ThemeCards material={material} excludes={excludes} includeSummary={false} />
      </div>
    </Portal>
  )
}

export default ThemeCardsPopover
