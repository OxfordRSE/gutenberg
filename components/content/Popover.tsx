import exp from 'constants'
import { Button } from 'flowbite-react'
import React, { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { BiCommentAdd } from 'react-icons/bi'
import { useTextSelection } from 'use-text-selection'


interface PortalProps {
  children: React.ReactNode
}

const Portal = ({ children }: PortalProps) => {
  return createPortal(children, document.body)
}

const Popover = ({ target }: { target?: HTMLElement }) => {
  const { isCollapsed, clientRect } = useTextSelection(target)


  if (clientRect == undefined || isCollapsed) return null

  const handleComment = () => {
  }

  return (
    <Portal>
      <Button
        style={{
          left: clientRect.x + clientRect.width / 2 - 25,
          top: clientRect.y - 50,
          position: 'absolute',
        }}
        size="xs"
      >
          <BiCommentAdd className="h-5 w-5 mr-1" />
          Comment
        </Button>
    </Portal>
  )
}

export default Popover;