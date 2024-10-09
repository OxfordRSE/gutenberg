import { Html, Head, Main, NextScript } from "next/document"

export default function Document() {
  return (
    <Html lang="en-GB">
      <Head>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.5.2/flowbite.min.css" rel="stylesheet" />
      </Head>
      <body className="bg-white dark:bg-slate-900">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
