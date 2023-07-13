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
import { set } from 'cypress/types/lodash'
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
  const [ activeEvent, setActiveEvent ] = useActiveEvent();
  const { commentThreads, error, isLoading, mutate } = useCommentThreads(activeEvent?.id);
  const [ activeThreadId, setActiveThreadId ] = useState<number | undefined>(undefined);


  const showButton = ref && !isCollapsed && clientRect != undefined

  const { similarThreads, contentText } = useMemo(() => {
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

    const similarThreads = commentThreads?.filter((thread) => {
      const threadTokens = nlp.readDoc( thread.textRef )
      .tokens()
      .filter(
        (t) => t.out(its.type) === 'word' && !t.out(its.stopWordFlag)
      );
      const threadBow = threadTokens.out(its.value, as.bow) as Bow;
      return similarity.bow.cosine( contentBow, threadBow ) > 0.90;
    });
    return { similarThreads, contentText };
  }, [content, commentThreads])

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
      const newThreads = commentThreads ? [...commentThreads, thread] : [thread];
      mutate(newThreads);
      setActiveThreadId(thread.id);
    });
  }


  const handleDeleteThread = (thread: CommentThread) => {
    if (!commentThreads) return;
    mutate(commentThreads.filter((t) => t.id !== thread.id));
    if (activeThreadId === thread.id) {
      setActiveThreadId(undefined);
    }
  }


  return (
    <>
      <div ref={ref} className="relative">
        {content}
          <div className={`absolute top-0 right-0 md:-right-6 xl:-right-[420px]`}>
            <div className={`w-[420px]`}>
              { similarThreads?.map((thread) => (
                <Thread 
                  key={thread.id} thread={thread} active={activeThreadId === thread.id} 
                  setActive={(active: boolean) => active ? setActiveThreadId(thread.id) : setActiveThreadId(undefined)}
                  onDelete={() => handleDeleteThread(thread)}
                />
              ))}
            </div>
          </div>
      </div>
      { activeEvent && <Popover target={ref?.current} onCreate={handleCreateThread} />}
    </>
  )
}

export default Paragraph 
