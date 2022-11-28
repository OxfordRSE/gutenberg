import React,{ ReactNode } from 'react'
import Footer from './Footer'
import Header from './Header'

type Props = {
  children: ReactNode
}

const Layout: React.FC<Props> = ( props ) => (
  <div class="container mx-auto prose prose-base dark:prose-invert">
    <Header />
    <main>{props.children}</main>
    <Footer />
  </div>
)

export default Layout
