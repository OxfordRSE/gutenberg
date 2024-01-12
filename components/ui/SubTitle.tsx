import React from "react"

type Props = {
  text: string
}

const SubTitle: React.FC<Props> = (props) => {
  return <p className="text-center text-lg font-bold mb-4">{props.text}</p>
}

export default SubTitle
