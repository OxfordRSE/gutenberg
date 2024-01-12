import exp from "constants"
import { Button } from "flowbite-react"
import useActiveEvent from "lib/hooks/useActiveEvents"
import { CommentThread } from "pages/api/commentThread"
import React, { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { BiCommentAdd } from "react-icons/bi"
import { useTextSelection } from "use-text-selection"

interface PortalProps {
  children: React.ReactNode
}

const Portal = ({ children }: PortalProps) => {
  return createPortal(children, document.body)
}

const Popover = ({ target, onCreate }: { target?: HTMLElement; onCreate: (text: string) => void }) => {
  const { isCollapsed, clientRect, textContent } = useTextSelection(target)

  if (clientRect == undefined || isCollapsed) return null

  return (
    <Portal>
      <Button
        data-cy="new-comment-button"
        style={{
          left: clientRect.x + clientRect.width / 2 - 25,
          top: clientRect.y - 50 + window.scrollY,
          position: "absolute",
        }}
        size="xs"
        onClick={() => textContent && onCreate(textContent)}
      >
        <BiCommentAdd className="h-5 w-5 mr-1" />
        Comment
      </Button>
    </Portal>
  )
}

export default Popover
