import React, { useEffect, useRef, useState } from "react"

interface CopyToClipboardProps {
  text: string
  onCopy?: () => void
  children: (props: { copy: () => Promise<void>; copied: boolean }) => React.ReactNode
}

const CopyToClipboard: React.FC<CopyToClipboardProps> = ({ text, onCopy, children }) => {
  const [copied, setCopied] = useState(false)
  const resetTimeoutRef = useRef<number | null>(null)

  const hideCopied = () => {
    setCopied(false)
  }

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current !== null) {
        window.clearTimeout(resetTimeoutRef.current)
      }
    }
  }, [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      if (resetTimeoutRef.current !== null) {
        window.clearTimeout(resetTimeoutRef.current)
      }
      setCopied(true)
      if (onCopy) onCopy()
      resetTimeoutRef.current = window.setTimeout(hideCopied, 2000)
    } catch (error) {
      console.error("Failed to copy text:", error)
    }
  }

  return <>{children({ copy, copied })}</>
}

export default CopyToClipboard
