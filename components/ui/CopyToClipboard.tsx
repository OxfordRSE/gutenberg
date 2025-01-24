import React, { useState } from "react"

interface CopyToClipboardProps {
  text: string
  onCopy?: () => void
  children: React.ReactNode
}

const CopyToClipboard: React.FC<CopyToClipboardProps> = ({ text, onCopy, children }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      if (onCopy) onCopy()
      setTimeout(() => setCopied(false), 2000) // Reset after 2 seconds
    } catch (error) {
      console.error("Failed to copy text:", error)
    }
  }

  return (
    <div>
      <div onClick={handleCopy} style={{ display: "inline-block", cursor: "pointer" }}>
        {children}
      </div>
      {copied && <span className="text-xs text-green-500 ml-3">Copied to clipboard!</span>}
    </div>
  )
}

export default CopyToClipboard
