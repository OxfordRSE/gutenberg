import type { NextPage, GetStaticProps } from 'next'
import git from 'isomorphic-git'
import http from 'isomorphic-git/http/node'
import prisma from 'lib/prisma'
import Layout from 'components/Layout'
import { makeSerializable } from 'lib/utils'
import { Material, getMaterial, remove_markdown } from 'lib/material'
import Content from 'components/Content'
import NavDiagram from 'components/NavDiagram'


type HomeProps = {
  material: Material
}

const Home: NextPage<HomeProps> = ({ material }) => {
  return (
    <Layout>
      <Content markdown={material.markdown} />
      <NavDiagram material={material}/>
    </Layout>
  )
}



export const getStaticProps: GetStaticProps = async (context) => {
  let material = await getMaterial()
  remove_markdown(material, material);
    
  return {
    props: {
      material: makeSerializable(material),
    },
  }
}

export default Home
