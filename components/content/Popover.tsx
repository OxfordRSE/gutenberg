import { Button } from "flowbite-react"
import { CSSProperties, useEffect, useRef } from "react"
import { BiCommentAdd } from "react-icons/bi"
import { useTextSelection } from "lib/hooks/useTextSelection"

// TODO: move this into a stylesheet.
const popoverStyle: CSSProperties = {
  position: "absolute",
  background: "transparent",
  inset: "unset",
}

const Popover = ({ target, onCreate }: { target?: HTMLElement; onCreate: (text: string) => void }) => {
  const { clientRect, textContent } = useTextSelection(target)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (textContent) {
      popoverRef.current?.showPopover()
    } else {
      popoverRef.current?.hidePopover()
    }
  }, [textContent])

  const onClick = () => {
    if (textContent) {
      onCreate(textContent)
    }
    popoverRef.current?.hidePopover()
  }

  if (popoverRef.current) {
    popoverRef.current.style.left = clientRect ? `${clientRect.left + clientRect.width / 2 - 25}px` : "0"
    popoverRef.current.style.top = clientRect ? `${clientRect.top - 50 + window.scrollY}px` : "0"
  }

  return (
    <div popover="manual" ref={popoverRef} style={popoverStyle} className="z-50">
      <Button data-cy="new-comment-button" size="xs" onClick={onClick}>
        <BiCommentAdd className="h-5 w-5 mr-1" />
        Comment
      </Button>
    </div>
  )
}

export default Popover
