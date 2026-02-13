import React, { JSX, ReactNode, useRef } from "react"
import ReactMarkdown, { ExtraProps, Components } from "react-markdown"
import CodeBlock from "components/content/CodeBlock"

import directive from "remark-directive"
import { visit } from "unist-util-visit"

import remarkMath from "remark-math"
import remarkGfm from "remark-gfm"
import rehypeKatex from "rehype-katex"
import "katex/dist/katex.min.css" // `rehype-katex` does not import the CSS for you

import Challenge from "./Challenge"
import Solution from "./Solution"
import Callout from "./Callout"
import { MaterialCourse, MaterialSection, MaterialTheme } from "lib/material"
import Paragraph from "./Paragraph"
import Heading from "./Heading"
import { reduceRepeatingPatterns, extractTextValues } from "lib/utils"
import Link from "next/link"

type ReactMarkdownProps = React.JSX.IntrinsicElements["p"] & ExtraProps
type HeadingProps = React.JSX.IntrinsicElements["h2"] & ExtraProps
type CodeProps = React.JSX.IntrinsicElements["code"] & ExtraProps
type ListProps = React.JSX.IntrinsicElements["li"] & ExtraProps

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

const isLikelyExternal = (href: string): boolean => {
  return (
    // Fully qualified URL
    /^https?:\/\//i.test(href) ||
    // Starts with www.
    /^www\.[^\s]+\.[^\s]+/.test(href) ||
    // Has a domain-like pattern
    /^[^\s\/]+\.[^\s]+/.test(href)
  )
}

const p = (sectionStr: string) => {
  function p({ node, children, ...props }: ReactMarkdownProps) {
    return <Paragraph content={children} section={sectionStr} />
  }
  return p
}

const list = (sectionStr: string) => {
  function list({ node, children, ...props }: ListProps) {
    return (
      <li className="mdli">
        <Paragraph content={children} section={sectionStr} />
      </li>
    )
  }
  return list
}

const h = (sectionStr: string, tag: string) => {
  function h({ node, children, ...props }: HeadingProps) {
    // so we can have ids that match the anchor links
    const spanId = reduceRepeatingPatterns(extractTextValues(node)).replace(/ /g, "-").replace(/:/g, "")
    return <Heading content={children} section={sectionStr} tag={tag} spanId={spanId} />
  }
  return h
}

function solution({ node, children, ...props }: ReactMarkdownProps) {
  return <Solution content={children} />
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

function code({ node, className, children, ...props }: CodeProps): React.JSX.Element {
  const match = /language-(\w+)/.exec(className || "")
  const code = String(children).replace(/\n$/, "")
  const isBlockCode = Boolean(className && /language-(\w+)/.test(className))

  if (isBlockCode) {
    return <CodeBlock code={code} language={match?.[1]} className={className} />
  } else {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    )
  }
}

type Props = {
  markdown: string
  theme?: MaterialTheme
  course?: MaterialCourse
  section?: MaterialSection
}

const Content: React.FC<Props> = ({ markdown, theme, course, section }) => {
  const sectionStr = `${theme ? theme.repo + "." : ""}${theme ? theme.id + "." : ""}${course ? course.id + "." : ""}${
    section ? section.id : ""
  }`

  function replaceBaseUrl(markdown: string): string {
    const baseUrl = `${process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}/material/${theme?.repo}`
    return markdown.replace(/\{\{\s*base_url\s*\}\}/g, baseUrl)
  }

  const transformLink = (href: string): string => {
    if (!href) return href
    if (href.startsWith("#")) return href // anchor link — don't rewrite

    const cleanedHref = href.replace(/\.md$/i, "")

    // Check for relative links BEFORE external links to avoid false positives
    // Relative links starting with ./
    if (cleanedHref.startsWith("./")) {
      const linkedPage = cleanedHref.slice(2)

      // if we are in /diagram we need to do one less level
      if (section) return `/material/${theme?.repo}/${theme?.id}/${course?.id}/${linkedPage}`
      if (course) return `/material/${theme?.repo}/${theme?.id}/${linkedPage}`
      if (theme) return `/material/${theme?.repo}/${linkedPage}`
    }

    // Relative links starting with ../
    if (cleanedHref.startsWith("../")) {
      const linkedPage = cleanedHref.slice(3)
      // From a section, ../ goes up to the course level, then the linked page is within the theme
      if (section) return `/material/${theme?.repo}/${theme?.id}/${linkedPage}`
      // From a course, ../ goes up to the theme level, then the linked page is within the repo
      if (course) return `/material/${theme?.repo}/${linkedPage}`
      // From a theme, ../ goes up to the repo level
      if (theme) return `/material/${linkedPage}`
      return cleanedHref
    }

    //External links - check after relative links
    if (isLikelyExternal(cleanedHref)) {
      return cleanedHref.startsWith("http") ? href : `https://${href}`
    }

    // Bare links without ./ or ../ prefix (sibling sections in same course)
    // These are relative to the current course directory
    if (!cleanedHref.includes("/") && !cleanedHref.startsWith("http")) {
      // Treat as sibling section within the same course
      if (section && course && theme) {
        return `/material/${theme.repo}/${theme.id}/${course.id}/${cleanedHref}`
      }
      if (course && theme) {
        return `/material/${theme.repo}/${theme.id}/${cleanedHref}`
      }
      if (theme) {
        return `/material/${theme.repo}/${cleanedHref}`
      }
    }

    //Internal absolute paths starting with /
    if (cleanedHref.startsWith("/")) {
      const absolutePath = cleanedHref.replace(/^\/+/, "")
      return `/material/${theme?.repo}/${absolutePath}`
    }

    // Fallback for other cases - treat as absolute path
    return `/material/${theme?.repo}/${cleanedHref}`
  }

  markdown = replaceBaseUrl(markdown) // we look for {{ base_url }} and replace it with a domain/material/${theme.repo}

  return (
    <div className="mx-auto prose prose-base max-w-2xl prose-slate dark:prose-invert prose-pre:bg-[#263E52] px-5">
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
          h2: h(sectionStr, "h2"),
          h3: h(sectionStr, "h3"),
          h4: h(sectionStr, "h4"),
          a: ({ node, ...props }) => {
            const newHref = transformLink(props.href || "")
            return <Link {...props} href={newHref} />
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
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
