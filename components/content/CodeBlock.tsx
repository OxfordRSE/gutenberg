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
          {({ copy, copied }) => (
            <span className="absolute right-0 top-0 z-10 inline-flex flex-col items-end">
              <button
                type="button"
                onClick={() => void copy()}
                className="group bg-transparent text-xs text-grey-700 hover:bg-grey-900 px-2 py-1 rounded flex items-center space-x-1"
              >
                <FaClipboard className="group-hover:text-white" />
                <span className="group-hover:text-white">Copy</span>
              </button>
              {copied && (
                <span
                  data-cy="copy-feedback"
                  role="status"
                  aria-live="polite"
                  className="pointer-events-none mt-2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white shadow-lg dark:bg-gray-100 dark:text-gray-900"
                >
                  Copied to clipboard!
                </span>
              )}
            </span>
          )}
        </CopyToClipboard>
        <SyntaxHighlighter
          language={language}
          PreTag="div"
          style={codeStyle}
          codeTagProps={{ className: "text-sm" }}
          customStyle={{ margin: 0 }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    )
  }

  return (
    <div className="p-3 relative">
      <CopyToClipboard text={code}>
        {({ copy, copied }) => (
          <span className="absolute right-0 top-0 z-10 inline-flex flex-col items-end">
            <button
              type="button"
              onClick={() => void copy()}
              className="group bg-transparent text-xs text-grey-700 hover:text-grey-900 px-2 py-1 rounded flex items-center space-x-1"
            >
              <FaClipboard className="group-hover:text-white" />
              <span className="group-hover:text-white">Copy</span>
            </button>
            {copied && (
              <span
                data-cy="copy-feedback"
                role="status"
                aria-live="polite"
                className="pointer-events-none mt-2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white shadow-lg dark:bg-gray-100 dark:text-gray-900"
              >
                Copied to clipboard!
              </span>
            )}
          </span>
        )}
      </CopyToClipboard>
      <code className={className}>{code}</code>
    </div>
  )
}

export default CodeBlock
