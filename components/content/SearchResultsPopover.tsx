import exp from 'constants'
import { Button } from 'flowbite-react'
import useActiveEvent from 'lib/hooks/useActiveEvents'
import { CommentThread } from 'pages/api/commentThread'
import React, { FunctionComponent, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { BiCommentAdd } from 'react-icons/bi'
import { useTextSelection } from 'use-text-selection'
import { SearchResult } from 'lib/search/vectorDb'
import { Card } from 'flowbite-react'

interface PortalProps {
  children: React.ReactNode
}

const Portal = ({ children }: PortalProps) => {
  return createPortal(children, document.body)
}

export function SearchResultsPopover({ target, results, isOpen }: {target: RefObject<HTMLElement>, results: SearchResult[], isOpen: boolean }) {
  console.log(target)
  const clientRect = target.current?.getBoundingClientRect()

  if (clientRect == undefined) return null
  console.log('popover', results)
  return (
    <Portal>
        <ul style={{
          left: clientRect.x,
          top: clientRect.y + clientRect.height + window.scrollY,
          position: 'absolute',
        }}>
          {results.map((result) => (
            <li key={result.id}>
              <Card className="rounded-none" href={result.url?? ''}>
              <h6 className="font-bold tracking-tight text-gray-800 dark:text-white">{`${result.course} : ${result.page}`}</h6>
              <p className="text-sm2 text-gray-600 dark:text-gray-400">{result.title}</p>
              </Card>
            </li>  
          ))}
        </ul>
    </Portal>
  )
}
