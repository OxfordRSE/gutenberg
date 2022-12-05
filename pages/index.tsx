import type { NextPage, GetStaticProps } from 'next'
import git from 'isomorphic-git'
import http from 'isomorphic-git/http/node'
import { Theme as DbTheme } from '@prisma/client'
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
      <div className="grid m-2 gap-3 grid-cols-2">
        {material.themes.map((theme) => (
          <a key={theme.id} href={`material/${theme.id}`} className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
              <h5 className="mb-2 text-lg font-bold tracking-tight text-gray-900 dark:text-white">{theme.name}</h5>
              <p className="font-normal truncate ... text-gray-700 dark:text-gray-400">{theme.summary}</p>
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
