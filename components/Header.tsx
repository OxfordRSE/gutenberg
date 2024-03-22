import React from "react"
import Head from "next/head"
import { Course, Theme } from "lib/material"
import { PageTemplate } from "lib/pageTemplate"
var fs = require("fs")

type Props = {
  theme?: Theme
  course?: Course
  pageInfo?: PageTemplate
}

//const style = fs.readFileSync('./node_modules/highlight.js/styles/github.css', "utf8");

const Header: React.FC<Props> = ({ theme, course, pageInfo }) => {
  const logoSrc = pageInfo?.logo.src
  const logoAlt = pageInfo?.logo.alt
  const description = pageInfo?.description
  const pageTitle = pageInfo?.title
  return (
    <Head>
      <title>{pageTitle}</title>
      {pageInfo && <meta name="description" content={description} />}
      {pageInfo && <link rel="icon" href={logoSrc} />}
      <link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/1.6.4/flowbite.min.css" rel="stylesheet" />
    </Head>
  )
}

export default Header
