import React,{ ReactNode } from 'react'
import Footer from './Footer'
import Header from './Header'
import styles from '../styles/Home.module.css'

type Props = {
  children: ReactNode
}

const Layout: React.FC<Props> = ( props ) => (
  <div className={styles.container}>
    <Header />
    <main className={styles.main}>{props.children}</main>
    <Footer />
  </div>
)

export default Layout
