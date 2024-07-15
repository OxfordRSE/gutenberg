import React from "react"

type Props = {
  text: string
  className?: string
}

const SubTitle: React.FC<Props> = (props) => {
  return <p className={`text-center text-lg font-bold mb-4 ${props.className}`}>{props.text}</p>
}

export default SubTitle
