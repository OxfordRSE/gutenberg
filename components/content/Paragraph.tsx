import { Button, Card } from 'flowbite-react'
import React, { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTextSelection } from 'use-text-selection'
import { BiCommentAdd } from 'react-icons/bi'

//import { similarity } from 'sentence-similarity'
import similarity from 'wink-nlp/utilities/similarity'

import winkNLP, { Bow } from 'wink-nlp';
import model from 'wink-eng-lite-web-model' 
import { Markdown } from './Content'
import style from 'react-syntax-highlighter/dist/cjs/styles/prism/lucario'
const nlp = winkNLP( model );
const its = nlp.its;
const as = nlp.as;




interface ThreadProps {
  thread: any 
}

const Thread = ({ thread }: ThreadProps) => {
  return (
    <div className="flex flex-col gap-2">
     { thread.comments.map((comment) => (
      <Card>
        <Markdown markdown={comment.markdown} />
      </Card>
     ))}
    </div>
  )
}


interface PortalProps {
  children: React.ReactNode
}

const Portal = ({ children }: PortalProps) => {
  return createPortal(children, document.body)
}

export const Popover = ({ target }: { target?: HTMLElement }) => {
  const { isCollapsed, clientRect } = useTextSelection(target)


  if (clientRect == undefined || isCollapsed) return null

  const handleComment = () => {
  }

  return (
    <Portal>
      <Button
        style={{
          left: clientRect.x + clientRect.width / 2 - 25,
          top: clientRect.y - 50,
          position: 'absolute',
        }}
        size="xs"
      >
          <BiCommentAdd className="h-5 w-5 mr-1" />
          Comment
        </Button>
    </Portal>
  )
}

interface ParagraphProps {
  content: React.ReactNode
}

const Paragraph: React.FC<ParagraphProps> = ({ content }) => {
  const ref = useRef(undefined)
  let [ target, setTarget ] = useState(null)
  const { isCollapsed, clientRect } = useTextSelection(ref?.current || undefined)
  const [screenSize, setScreenSize] = useState(getCurrentDimension());

  function getCurrentDimension(){
    if (typeof window !== "undefined") {
      return {
          width: window.innerWidth,
          height: window.innerHeight
      }
    } else {
      return {
          width: 0,
          height: 0
      }
    }
  }

  useEffect(() => {
      const updateDimension = () => {
          setScreenSize(getCurrentDimension())
      }
      window.addEventListener('resize', updateDimension);
  
  
      return(() => {
          window.removeEventListener('resize', updateDimension);
      })
  }, [screenSize])


  const showButton = ref && !isCollapsed && clientRect != undefined

  

  const similarThreads = useMemo(() => {
    let contentText = ""
    if (typeof content === 'string') {
      contentText = content
    } else if (Array.isArray(content)) {
      contentText = content.filter((c) => typeof c === 'string').join('')
    }

    const contentTokens = nlp.readDoc( contentText )
    .tokens()
    .filter(
      (t) => t.out(its.type) === 'word' && !t.out(its.stopWordFlag)
    );
    const contentBow = contentTokens.out(its.value, as.bow) as Bow;

    const threads = [
      { 
        id: 1, 
        text: 'Importing a library is like getting a piece of lab equipment out of a storage locker and setting it up on the bench. Libraries provide additional functionality to the basic Python package, much like a new piece of equipment adds functionality to a lab space. Just like in the lab, importing too many libraries can sometimes complicate and slow down your programs - so we only import what we need for each program.',
        start: 0,
        end: 19,
        comments: [
          { 
            markdown: 'This is a [comment](link) with **markdown**',
          },
          {
            markdown: 'This is another comment',
          },
        ]
      },
      { 
        id: 1, 
        text: 'Importing a library is like getting a piece of lab equipment out of a storage locker and setting it up on the bench. Libraries provide additional functionality to the basic Python package, much like a new piece of equipment adds functionality to a lab space. Just like in the lab, importing too many libraries can sometimes complicate and slow down your programs - so we only import what we need for each program.',
        start: 0,
        end: 19,
        comments: [
          { 
            markdown: 'This is a [comment](link) with **markdown**',
          },
          {
            markdown: 'This is another comment',
          },
        ]
      },
    ]
  
    const similarThreads = threads.filter((thread) => {
      const threadTokens = nlp.readDoc( thread.text )
      .tokens()
      .filter(
        (t) => t.out(its.type) === 'word' && !t.out(its.stopWordFlag)
      );
      const threadBow = threadTokens.out(its.value, as.bow) as Bow;
      return similarity.bow.cosine( contentBow, threadBow ) > 0.90;
    });
    return similarThreads;
  }, [content])

  const commentWidth = Math.round((screenSize.width - 700) / 2);

  const lhsThreads = similarThreads.filter((thread, i) => i % 2 == 0);
  const rhsThreads = similarThreads.filter((thread, i) => i % 2 == 1);

  return (
    <>
      <div ref={ref} className="relative">
        {content}
          <div className={`absolute top-0`} style={{
            transform: `translate(-${commentWidth}px, 0)` 

          }}>
            <div className={`h-full`} style={{
              width: `${commentWidth - 10}px`,
            }}>
              { lhsThreads.map((thread) => (
                <Thread thread={thread} />
              ))}
          </div>
        </div>
        <div className={`absolute top-0 right-0`} style={{
            transform: `translate(${commentWidth}px, 0)`
        }}>
            <div className={`h-full`} style={{
              width: `${commentWidth - 10}px`,
            }}>
              { rhsThreads.map((thread) => (
                <Thread thread={thread} />
              ))}
          </div>
        </div>
      </div>
      <Popover target={ref?.current}/>
      
    </>
  )
}

export default Paragraph 
