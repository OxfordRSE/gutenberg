import React from 'react'
import Head from 'next/head'
import { Course, Theme } from 'pages'
var fs = require('fs');




type Props = {
  theme: Theme,
  course: Course,
}

//const style = fs.readFileSync('./node_modules/highlight.js/styles/github.css', "utf8");

const Header: React.FC<Props> = ( props ) =>  {
  return (
    <Head>
      <title>Training Courses</title>
      <meta name="description" content="Created by OxRSE team" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  )
}

export default Header
