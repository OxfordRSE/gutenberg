import { Card } from 'flowbite-react'
import React, { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Markdown } from './Content'


interface ThreadProps {
  thread: any 
}

const Thread = ({ thread }: ThreadProps) => {
  return (
    <div className="flex flex-col gap-2 items-center">
     { thread.comments.map((comment) => (
      <Card className="w-full max-w-lg">
        <Markdown markdown={comment.markdown} />
      </Card>
     ))}
    </div>
  )
}

export default Thread;