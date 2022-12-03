import React,{ ReactNode } from 'react'
import ReactDom from 'react-dom'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { lucario } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import directive from "remark-directive";
import { visit } from "unist-util-visit";


import Challenge from './Challenge';
import Solution from './Solution';
import { render } from 'react-dom';
import { first } from 'cypress/types/lodash';
import remarkDirective from 'remark-directive'
import remarkDirectiveRehype from 'remark-directive-rehype'

function reactMarkdownRemarkDirective() {
  return (tree) => {
    visit(
      tree,
      ["textDirective", "leafDirective", "containerDirective"],
      (node) => {
        node.data = {
          hName: node.name,
          hProperties: node.attributes,
          ...node.data
        };
        return node;
      }
    );
  };
}

function solution({node, children, ...props}) {
  return (
    <Solution content={children} />
  );
}

function challenge({node, children, title, id, ...props}) {
  console.log('challenge:', props)
  return (
    <Challenge content={children} title={title} id={id}/>
  );
}

function code({node, inline, className, children, ...props}) {
  const match = /language-(\w+)/.exec(className || '')
  if (!inline) {
    if (match) {
      return (
      <SyntaxHighlighter
        children={String(children).replace(/\n$/, '')}
        style={lucario}
        language={match[1]}
        PreTag="div"
        {...props}
      />
      );
    } else {
      return (
        <div className="p-3">
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

type Props = {
  markdown: string,
}

const Content: React.FC<Props> = ( { markdown }) => {
  return (
    <ReactMarkdown 
      remarkPlugins={[directive, reactMarkdownRemarkDirective]}
      components={{solution, challenge, code}} 
    >
      {markdown}
    </ReactMarkdown>
  )
}

export default Content
 