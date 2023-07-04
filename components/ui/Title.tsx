import React from 'react'

type Props = {
  text: string,
}

const Header: React.FC<Props> = ( props ) =>  {
  return (
    <p className='text-center text-2xl font-bold mb-4'>{props.text}</p>
  )
}

export default Header
