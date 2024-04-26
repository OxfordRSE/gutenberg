import React from "react"

type Props = {
  text: string
}

const Header: React.FC<Props> = (props) => {
  return (
    <h1 className="text-center text-2xl font-bold mb-4" data-cy="title">
      {props.text}
    </h1>
  )
}

export default Header
