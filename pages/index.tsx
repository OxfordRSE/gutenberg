import type { NextPage, GetStaticProps } from 'next'
import git from 'isomorphic-git'
import http from 'isomorphic-git/http/node'
import { Theme as DbTheme } from '@prisma/client'
import prisma from 'lib/prisma'
import Layout from 'components/Layout'
import { makeSerializable } from 'lib/utils'
import { Material, getMaterial, remove_markdown } from 'lib/material'
import Content from 'components/Content'


type HomeProps = {
  material: Material
}

const Home: NextPage<HomeProps> = ({ material }) => {
  return (
    <Layout>

      <Content markdown={material.markdown} />

      <h1>
        Themes
      </h1>

      <div>
        {material.themes.map(theme => (
        <a key={theme.id} href={`/material/${theme.id}`}>
          <h2>{theme.name}</h2>
        </a>
        ))}
      </div>
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
