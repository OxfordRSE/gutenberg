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
import Thread from './Thread'
import Popover from './Popover'
import useCommentThreads from 'lib/hooks/useCommentThreads'
import postComment from 'lib/actions/postComment'
import postCommentThread from 'lib/actions/postCommentThread'
import useActiveEvent from 'lib/hooks/useActiveEvents'
import { CommentThread } from 'pages/api/commentThread'
import { post } from 'cypress/types/jquery'
const nlp = winkNLP( model );
const its = nlp.its;
const as = nlp.as;


interface ParagraphProps {  
  content: React.ReactNode
  section: string
}


const Paragraph: React.FC<ParagraphProps> = ({ content, section }) => {
  const ref = useRef(undefined)
  let [ target, setTarget ] = useState(null)
  const { isCollapsed, clientRect } = useTextSelection(ref?.current || undefined)
  const [screenSize, setScreenSize] = useState(getCurrentDimension());
  const [ activeEvent, setActiveEvent ] = useActiveEvent();
  const { commentThreads, error, isLoading, mutate } = useCommentThreads(activeEvent?.id);

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
    setScreenSize(getCurrentDimension())
  }, [])




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

  let contentText = ""
  if (typeof content === 'string') {
    contentText = content
  } else if (Array.isArray(content)) {
    contentText = content.filter((c) => typeof c === 'string').join('')
  }

  const handleCreateThread = (text: string) => {
    if (!activeEvent) return;
    const textRefStart = contentText.indexOf(text);
    const textRefEnd = textRefStart + text.length;
    postCommentThread({
      textRef: contentText,
      textRefStart,
      textRefEnd,
      eventId: activeEvent.id,
      section,
    })
    .then((thread) => {
      mutate(commentThreads ? [...commentThreads, thread] : [thread]);
    });
  }


  const similarThreads = useMemo(() => {
    const contentTokens = nlp.readDoc( contentText )
    .tokens()
    .filter(
      (t) => t.out(its.type) === 'word' && !t.out(its.stopWordFlag)
    );
    const contentBow = contentTokens.out(its.value, as.bow) as Bow;

    const similarThreads = commentThreads?.filter((thread) => {
      const threadTokens = nlp.readDoc( thread.textRef )
      .tokens()
      .filter(
        (t) => t.out(its.type) === 'word' && !t.out(its.stopWordFlag)
      );
      const threadBow = threadTokens.out(its.value, as.bow) as Bow;
      return similarity.bow.cosine( contentBow, threadBow ) > 0.90;
    });
    return similarThreads;
  }, [contentText, commentThreads])

  const commentWidth = Math.round((screenSize.width - 700) / 2);

  const lhsThreads = similarThreads?.filter((thread, i) => i % 2 == 0);
  const rhsThreads = similarThreads?.filter((thread, i) => i % 2 == 1);


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
              { lhsThreads?.map((thread) => (
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
              { rhsThreads?.map((thread) => (
                <Thread thread={thread} />
              ))}
          </div>
        </div>
      </div>
      <Popover target={ref?.current} onCreate={handleCreateThread} />
      
    </>
  )
}

export default Paragraph 
