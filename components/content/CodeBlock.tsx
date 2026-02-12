import React from "react"
import { Prism, SyntaxHighlighterProps } from "react-syntax-highlighter"
import CopyToClipboard from "components/ui/CopyToClipboard"
import { FaClipboard } from "react-icons/fa"
import { lucario as codeStyle } from "react-syntax-highlighter/dist/cjs/styles/prism"

const SyntaxHighlighter = Prism as any as React.FC<SyntaxHighlighterProps>

type Props = {
  code: string
  language?: string
  className?: string
}

const CodeBlock: React.FC<Props> = ({ code, language, className }) => {
  if (language) {
    return (
      <div className="relative m-0">
        <CopyToClipboard text={code}>
          <button className="group absolute top-0 right-0 bg-transparent text-xs text-grey-700 hover:bg-grey-900 px-2 py-1 rounded flex items-center space-x-1">
            <FaClipboard className="group-hover:text-white" />
            <span className="group-hover:text-white">Copy</span>
          </button>
        </CopyToClipboard>
        <SyntaxHighlighter language={language} PreTag="div" style={codeStyle} codeTagProps={{ className: "text-sm" }} customStyle={{ margin: 0 }}>
          {code}
        </SyntaxHighlighter>
      </div>
    )
  }

  return (
    <div className="p-3 relative">
      <CopyToClipboard text={code}>
        <button className="group absolute top-0 right-0 bg-transparent text-xs text-grey-700 hover:text-grey-900 px-2 py-1 rounded flex items-center space-x-1">
          <FaClipboard className="group-hover:text-white" />
          <span className="group-hover:text-white">Copy</span>
        </button>
      </CopyToClipboard>
      <code className={className}>{code}</code>
    </div>
  )
}

export default CodeBlock
