import React,{ ReactNode } from 'react'
import ReactDom from 'react-dom'
import ReactMarkdown, {Components, uriTransformer} from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

import { materialDark as codeStyle } from 'react-syntax-highlighter/dist/cjs/styles/prism';

import directive from "remark-directive";
import { visit } from "unist-util-visit";


import Challenge from './Challenge';
import Solution from './Solution';
import { render } from 'react-dom';
import { first } from 'cypress/types/lodash';
import remarkDirective from 'remark-directive'
import remarkDirectiveRehype from 'remark-directive-rehype'
import { CodeComponent, CodeProps, ReactMarkdownProps } from 'react-markdown/lib/ast-to-react';


function reactMarkdownRemarkDirective() {
  return (tree: any) => {
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

function solution({node, children, ...props}: ReactMarkdownProps) {
  return (
    <Solution content={children} />
  );
}

type ChallengeProps = ReactMarkdownProps & {
    title: string,
    id: string,
  }
function challenge({node, children, title, id, ...props}: ChallengeProps): JSX.Element {
  return (
    <Challenge content={children} title={title} id={id}/>
  );
}

function code({node, inline, className, children, ...props}: CodeProps): JSX.Element {
  const match = /language-(\w+)/.exec(className || '')
  if (!inline) {
    if (match) {
      return (
      <SyntaxHighlighter
        // @ts-expect-error
        style={codeStyle}
        codeTagProps={{className: "text-sm"}}
        language={match[1]}
        PreTag="div"
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
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

//function transformImageUri(src, alt, title)  {
//  console.log('transformImageUri(', src, alt, title, ')')
//  let url = uriTransformer(src)
//  return url
//}

type Props = {
  markdown: string,
}

const Content: React.FC<Props> = ( { markdown }) => {
  return (
    <div className="prose prose-base prose-slate dark:prose-invert prose-pre:bg-[#263E52] prose-pre:p-0">
      <ReactMarkdown 
        remarkPlugins={[directive, reactMarkdownRemarkDirective]}
        components={{
          // @ts-expect-error
          solution,
          challenge,
          code
        }} 
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}

export default Content
 