import React from "react"

type Props = {
  text: string
  className?: string
  style?: React.CSSProperties
}

const Header: React.FC<Props> = (props) => {
  return (
    <h1 style={props.style} className={`text-center text-2xl font-bold mb-4 ${props.className}`} data-cy="title">
      {props.text}
    </h1>
  )
}

export default Header
