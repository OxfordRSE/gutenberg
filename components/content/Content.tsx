import React, { ReactNode } from "react"
import ReactDom from "react-dom"
import ReactMarkdown, { Components, uriTransformer } from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { CopyToClipboard } from "react-copy-to-clipboard"
import { FaClipboard } from "react-icons/fa"

import { lucario as codeStyle } from "react-syntax-highlighter/dist/cjs/styles/prism"

import directive from "remark-directive"
import { visit } from "unist-util-visit"

import remarkMath from "remark-math"
import remarkGfm from "remark-gfm"
import rehypeKatex from "rehype-katex"
import "katex/dist/katex.min.css" // `rehype-katex` does not import the CSS for you

import Challenge from "./Challenge"
import Solution from "./Solution"
import { first } from "cypress/types/lodash"
import remarkDirective from "remark-directive"
import remarkDirectiveRehype from "remark-directive-rehype"
import { CodeComponent, CodeProps, ReactMarkdownProps } from "react-markdown/lib/ast-to-react"
import Callout from "../Callout"
import { Course, Section, Theme } from "lib/material"
import Paragraph from "./Paragraph"

function reactMarkdownRemarkDirective() {
  return (tree: any) => {
    visit(tree, ["textDirective", "leafDirective", "containerDirective"], (node) => {
      node.data = {
        hName: node.name,
        hProperties: node.attributes,
        ...node.data,
      }
      return node
    })
  }
}

const p = (sectionStr: string) => {
  function p({ node, children, ...props }: ReactMarkdownProps) {
    return <Paragraph content={children} section={sectionStr} />
  }
  return p
}

const list = (sectionStr: string) => {
  function list({ node, children, ...props }: ReactMarkdownProps) {
    return (
      <li className="mdli">
        <Paragraph content={children} section={sectionStr} />
      </li>
    )
  }
  return list
}

let solutionCount = 0
function solution({ node, children, ...props }: ReactMarkdownProps) {
  solutionCount++
  return <Solution id={`solution-${solutionCount}`} content={children} />
}

type CalloutProps = ReactMarkdownProps & {
  variant: string
}

function callout({ node, children, variant, ...props }: CalloutProps) {
  return <Callout content={children} variant={variant} />
}

type ChallengeProps = ReactMarkdownProps & {
  title: string
  id: string
}

const challenge = (sectionStr: string) => {
  function challenge({ node, children, title, id, ...props }: ChallengeProps) {
    return <Challenge content={children} title={title} id={id} section={sectionStr} />
  }
  return challenge
}

function code({ node, inline, className, children, ...props }: CodeProps): JSX.Element {
  const match = /language-(\w+)/.exec(className || "")
  const code = String(children).replace(/\n$/, "")
  if (!inline) {
    if (match) {
      return (
        <div className="relative m-0">
          <CopyToClipboard text={code}>
            <button className="group absolute top-0 right-0 bg-transparent text-xs text-grey-700 hover:bg-grey-900 px-2 py-1 rounded flex items-center space-x-1">
              <FaClipboard className="group-hover:text-white" />
              <span className="group-hover:text-white">Copy</span>
            </button>
          </CopyToClipboard>
          <SyntaxHighlighter
            style={codeStyle}
            codeTagProps={{ className: "text-sm" }}
            language={match[1]}
            customStyle={{ margin: 0 }}
            PreTag="div"
            {...props}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      )
    } else {
      return (
        <div className="p-3 relative">
          <CopyToClipboard text={code}>
            <button className="group absolute top-0 right-0 bg-transparent text-xs text-grey-700 hover:text-grey-900 px-2 py-1 rounded flex items-center space-x-1">
              <FaClipboard className="group-hover:text-white" />
              <span className="group-hover:text-white">Copy</span>
            </button>
          </CopyToClipboard>
          <code className={className} {...props}>
            {children}
          </code>
        </div>
      )
    }
  } else {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    )
  }
}

//function transformImageUri(src, alt, title)  {
//  console.log('transformImageUri(', src, alt, title, ')')
//  let url = uriTransformer(src)
//  return url
//}

type Props = {
  markdown: string
  theme?: Theme
  course?: Course
  section?: Section
}

const Content: React.FC<Props> = ({ markdown, theme, course, section }) => {
  const sectionStr = `${theme ? theme.repo + "." : ""}${theme ? theme.id + "." : ""}${course ? course.id + "." : ""}${
    section ? section.id : ""
  }`
  return (
    <div className="mx-auto prose prose-base max-w-2xl prose-slate dark:prose-invert prose-pre:bg-[#263E52] prose-pre:p-0">
      <ReactMarkdown
        remarkPlugins={[directive, reactMarkdownRemarkDirective, remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // @ts-expect-error
          solution,
          callout,
          challenge: challenge(sectionStr),
          code,
          p: p(sectionStr),
          li: list(sectionStr),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}

type MarkdownProps = {
  markdown: string
}

export const Markdown: React.FC<Props> = ({ markdown }) => {
  return (
    <div className="mx-auto prose prose-base max-w-2xl prose-slate dark:prose-invert prose-pre:bg-[#263E52] prose-pre:p-0">
      <ReactMarkdown
        remarkPlugins={[directive, reactMarkdownRemarkDirective, remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}

export default Content
