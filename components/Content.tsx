import React,{ ReactNode } from 'react'
import ReactDom from 'react-dom'
import ReactMarkdown, {Components, uriTransformer} from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FaClipboard } from 'react-icons/fa';



import { lucario as codeStyle } from 'react-syntax-highlighter/dist/cjs/styles/prism';

import directive from "remark-directive";
import { visit } from "unist-util-visit";

import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css' // `rehype-katex` does not import the CSS for you

import { startCase } from 'lodash';

import Challenge from './Challenge';
import Solution from './Solution';
import { render } from 'react-dom';
import { first } from 'cypress/types/lodash';
import remarkDirective from 'remark-directive'
import remarkDirectiveRehype from 'remark-directive-rehype'
import { CodeComponent, CodeProps, ReactMarkdownProps } from 'react-markdown/lib/ast-to-react';
import Callout from './Callout';
import { Course, Section, Theme } from 'lib/material';


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

function callout({node, children, ...props}: ReactMarkdownProps) {
  return (
    <Callout content={children} />
  );
}

type ChallengeProps = ReactMarkdownProps & {
    title: string,
    id: string,
}

const challenge = (sectionStr: string) => {
  function challenge({node, children, title, id, ...props}: ChallengeProps) {
    return (
      <Challenge content={children} title={title} id={id} section={sectionStr}/>
    );
  }
  return challenge; 
}

function code({node, inline, className, children, ...props}: CodeProps): JSX.Element {

  if (inline) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    )
  }

  const code = String(children).replace(/\n$/, '')

  const languageMatch = /language-(\w+)/.exec(className || '')
  const explicitTitleMatch = /title="([^"]*)"/.exec(String(node?.data?.meta) || '');

  let languageString = 'text';
  if (languageMatch && languageMatch[1]) {
    languageString = languageMatch[1]
  }

  let titleString = '';
  if (explicitTitleMatch && explicitTitleMatch[1]) {
    titleString = explicitTitleMatch[1];
  } else if (languageMatch && languageMatch[1]) {
    titleString = startCase(languageMatch[1]);
  }

  const borderTextColor = 'text-black dark:text-white'
  const borderHoverColor = 'group-hover:text-neutral-700 dark:group-hover:text-neutral-300'
  const borderColor = 'border-neutral-300 dark:border-neutral-700'

  let headerColor = 'bg-neutral-300 dark:bg-neutral-700'
  if (titleString == 'Error') {
    headerColor = 'bg-red-300 dark:bg-red-700'
  }

  const copyToClipboardButton = (
    <CopyToClipboard text={code}>
      <button
        className={`group absolute top-0 right-0 bg-transparent text-xs ${borderTextColor} px-2 py-1 rounded flex items-center space-x-1`}>
        <FaClipboard className={`${borderTextColor} ${borderHoverColor}`}/><span className={`${borderTextColor} ${borderHoverColor}`}>Copy</span>
      </button>
    </CopyToClipboard>
  )

  const headerBox = (
    <div className={`border  rounded-t-md ${headerColor} ${borderColor} mb-4`}>
      <div className={`flex items-center justify-between rounded-t-md ${headerColor} pl-1`}>
        <h4 className={`w-full mx-2 my-0 ${borderTextColor}`}>{titleString}</h4>
        {copyToClipboardButton}
      </div>
    </div>
  )

  return (
    <div className="relative m-0">
      {headerBox}
      <SyntaxHighlighter
        style={codeStyle}
        codeTagProps={{className: "text-sm"}}
        language={languageString}
        customStyle={{margin: 0}}
        showLineNumbers={false}
        PreTag="div"
        {...props}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

//function transformImageUri(src, alt, title)  {
//  console.log('transformImageUri(', src, alt, title, ')')
//  let url = uriTransformer(src)
//  return url
//}

type Props = {
  markdown: string,
  theme?: Theme,
  course?: Course,
  section?: Section,
}

const Content: React.FC<Props> = ( { markdown, theme, course, section }) => {
  const sectionStr = `${theme ? theme.id + "." : ""}${course ? course.id + "." : ""}${section ? section.id : ""}`;
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
        }} 

      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}

export default Content
 