import React from "react"
import Head from "next/head"
import { PageTemplate } from "lib/pageTemplate"

type Props = {
  pageInfo?: PageTemplate
  pageTitle?: string
}

//const style = fs.readFileSync('./node_modules/highlight.js/styles/github.css', "utf8");

const Header: React.FC<Props> = ({ pageInfo, pageTitle }) => {
  const logoSrc = pageInfo?.logo.src
  const description = pageInfo?.description
  return (
    <Head>
      <title>{pageTitle || pageInfo?.title}</title>
      {pageInfo && <meta name="description" content={description} />}
      {pageInfo && <link rel="icon" href={logoSrc} />}
    </Head>
  )
}

export default Header
