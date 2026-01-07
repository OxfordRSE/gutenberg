import { useCallback, useLayoutEffect, useState } from "react"

type ClientRect = Record<keyof Omit<DOMRect, "toJSON">, number>

type TextSelectionState = {
  clientRect?: ClientRect
  isCollapsed?: boolean
  textContent?: string
}

const defaultState: TextSelectionState = {}

const roundRect = (rect: DOMRect): ClientRect => {
  const rounded: ClientRect = {
    x: Math.round(rect.x),
    y: Math.round(rect.y),
    top: Math.round(rect.top),
    right: Math.round(rect.right),
    bottom: Math.round(rect.bottom),
    left: Math.round(rect.left),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  }

  return rounded
}

const getRangeRect = (range: Range): ClientRect | undefined => {
  const rects = range.getClientRects()
  if (rects.length > 0) {
    return roundRect(rects[0])
  }

  const node = range.commonAncestorContainer
  const element = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement
  if (!element) {
    return undefined
  }

  return roundRect(element.getBoundingClientRect())
}

export const useTextSelection = (target?: HTMLElement) => {
  const [state, setState] = useState<TextSelectionState>(defaultState)

  const handler = useCallback(() => {
    const selection = window.getSelection()
    if (selection == null || selection.rangeCount === 0) {
      setState(defaultState)
      return
    }

    const range = selection.getRangeAt(0)
    if (target != null && !target.contains(range.commonAncestorContainer)) {
      setState(defaultState)
      return
    }

    const contents = range.cloneContents()
    const clientRect = getRangeRect(range)

    setState({
      clientRect,
      isCollapsed: range.collapsed,
      textContent: contents.textContent ?? undefined,
    })
  }, [target])

  useLayoutEffect(() => {
    document.addEventListener("selectionchange", handler)
    document.addEventListener("keydown", handler)
    document.addEventListener("keyup", handler)
    window.addEventListener("resize", handler)

    return () => {
      document.removeEventListener("selectionchange", handler)
      document.removeEventListener("keydown", handler)
      document.removeEventListener("keyup", handler)
      window.removeEventListener("resize", handler)
    }
  }, [handler])

  return state
}
