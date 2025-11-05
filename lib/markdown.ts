import { createElement, Fragment, JSX } from "react"
import { jsx, jsxs } from "react/jsx-runtime"
import rehypeParse from "rehype-parse"
import rehype2react from "rehype-react"
import remarkParse from "remark-parse"
import directive from "remark-directive"
import remarkMath from "remark-math"
import remarkGfm from "remark-gfm"
import rehypeStringify from "rehype-stringify"
import remarkRehype from "remark-rehype"
import { PluggableList, unified } from "unified"
import { visit } from "unist-util-visit"

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

/**
 * Replace {{ base_url }} placeholders in HTML with [domain]/material/[repo]
 * @param html HTML string
 * @param repo repo name
 * @returns HTML string with base_url replaced.
 */
export function replaceBaseUrl(html: string, repo: string): string {
  const baseUrl = `${process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}/material/${repo}`
  return html.replace(/\{\{\s*base_url\s*\}\}/g, baseUrl)
}

type html2ReactProps = {
  html: string
  rehypePlugins?: PluggableList
  components?: Record<string, React.ComponentType<any>>
}

/**
 * Parse HTML string to React elements with Rehype.
 * @param options object
 * @param options.html HTML string to parse
 * @param options.rehypePlugins Optional list of Rehype plugins to use during parsing
 * @param options.components Optional mapping of HTML elements to React components
 * @returns React element tree
 */
export function html2React({ html, rehypePlugins = [], components }: html2ReactProps): JSX.Element {
  let parsedHTML = null
  try {
    parsedHTML = unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypePlugins)
      .use(rehype2react, {
        jsx,
        jsxs,
        Fragment,
        createElement,
        components,
      })
      .processSync(html).result
  } catch (error: any) {
    parsedHTML = error.message
  }
  return parsedHTML
}

type markdown2HtmlOptions = {
  markdown: string
  remarkPlugins?: PluggableList
}
/**
 * Parse Markdown to HTML with Remark.
 * @param options Options object
 * @param options.markdown Markdown string to convert
 * @param options.remarkPlugins Optional list of Remark plugins to use during conversion
 * @returns HTML string
 */
export function markdown2Html({ markdown, remarkPlugins = [] }: markdown2HtmlOptions): string {
  return unified()
    .use(remarkParse)
    .use(remarkPlugins)
    .use(remarkRehype)
    .use(rehypeStringify)
    .processSync(markdown)
    .toString()
}

/**
 * Convert Markdown course material to HTML, using a set of preset Remark plugins.
 * @param markdown Markdown course material
 * @returns HTML string
 */
export function material2Html(markdown: string): string {
  return markdown2Html({
    markdown,
    remarkPlugins: [directive, reactMarkdownRemarkDirective, remarkMath, remarkGfm],
  })
}
