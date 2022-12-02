import React,{ ReactNode } from 'react'
import ReactDom from 'react-dom'
import ReactMarkdown from 'react-markdown'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {dark} from 'react-syntax-highlighter/dist/esm/styles/prism'
import directive from "remark-directive";
import visit from "unist-util-visit";


import Challenge from './Challenge';
import Solution from './Solution';
import { render } from 'react-dom';
import { first } from 'cypress/types/lodash';
import remarkDirective from 'remark-directive'
import remarkDirectiveRehype from 'remark-directive-rehype'

const challenge: RegExp = /{([a-zA-Z_]*)\.challenge}(.*)$/;
const solution: RegExp = /{\.solution}/;

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

function Solution({node, ...props}) {
  return (
    'solution here'
  );
}

function Challenge({node, ...props}) {
  return (
    'challenge here'
  );
}

const renderer = {
  blockquote(quote) {
    //const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
    console.log('quote', quote)
    let is_challenge = false;
    let challenge_id = '';
    let challenge_title= '';
    let is_solution = false;
    const check_element = (elem) => {
      if (!elem || !elem.props || !elem.props.children) {
          console.log('not a react element')
          return false;
      }
      if (elem.props.children.length > 0) {
        let first_child = elem.props.children[0]
        console.log('first child is', first_child)
        if (typeof first_child === 'string' || first_child instanceof String) {
          const challenge_match = first_child.match(challenge);
          const solution_match = first_child.match(solution);
            if (challenge_match) {
                is_challenge = true;
                challenge_id = challenge_match[1];
                challenge_title = challenge_match[2];
                elem.props.children[0] = ''
                return true;
            }
            if (solution_match) {
                is_solution = true;
                elem.props.children[0] = ''
                return true;
            }
        }
      }
      return false;
    };
    if (Array.isArray(quote)) {
      let to_delete = null
      for (let i = 0; i < quote.length; i++) {
          if (check_element(quote[i])) {
            to_delete = i;

          }
      }
      if (to_delete) {
        delete quote[to_delete];
      }
    } else {
        check_element(elem);
    }

    if (is_challenge) {
        console.log("CHALLENGE", quote)
        return (<Challenge content={quote} id={challenge_id} title={challenge_title}/>);
    }
    if (is_solution) {
        return (<Solution content={quote}/>);
    }
    console.log("BLOCKQUOTE", quote)
    return (
        <blockquote>{quote}</blockquote>
    );
  },
  code({node, inline, className, children, ...props}) {
        const match = /language-(\w+)/.exec(className || '')
        return !inline && match ? (
          <SyntaxHighlighter
            children={String(children).replace(/\n$/, '')}
            style={dark}
            language={match[1]}
            PreTag="div"
            {...props}
          />
        ) : (
          <code className={className} {...props}>
            {children}
          </code>
        )
      }
};

type Props = {
  markdown: string,
}

const Content: React.FC<Props> = ( { markdown }) => {
  return (
    <ReactMarkdown 
      remarkPlugins={[directive, reactMarkdownRemarkDirective]}
      children={markdown} 
      components={components} 
    />
  )
}

export default Content
 