import React from 'react'
import Head from 'next/head'
import { Course, Theme } from 'pages'
var fs = require('fs');
import 'node_modules/highlight.js/styles/github-dark.css';




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
      <link rel="stylesheet" href="https://unpkg.com/flowbite@1.5.4/dist/flowbite.min.css" />
      <script src="https://unpkg.com/flowbite@1.5.4/dist/flowbite.js"></script>
    </Head>
  )
}

export default Header
