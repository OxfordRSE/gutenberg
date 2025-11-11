import type { NextPage, GetStaticProps } from "next"
import prisma from "lib/prisma"
import Layout from "components/Layout"
import { makeSerializable } from "lib/utils"
import { Material, getMaterial, removeMarkdown, getExcludes } from "lib/material"
import { EventFull as Event } from "lib/types"
import { PageTemplate, loadPageTemplate } from "lib/pageTemplate"
import ThemeCards from "components/navdiagram/ThemeCards"
import revalidateTimeout from "lib/revalidateTimeout"
import Title from "components/ui/Title"
import SubTitle from "components/ui/SubTitle"
import Link from "next/link"

type HomeProps = {
  material: Material
  events: Event[]
  pageInfo: PageTemplate
}

const Home: NextPage<HomeProps> = ({ material, events, pageInfo }) => {
  const pageTitle = pageInfo?.title ? `Material Themes: ${pageInfo.title}` : "Material Themes"
  return (
    <Layout material={material} pageInfo={pageInfo} pageTitle={pageTitle}>
      <Title text="Material Themes" className="text-3xl font-bold text-center p-3" style={{ marginBottom: "0px" }} />
      <Link className="text-blue-500 italic" href={`/material/diagram`}>
        <SubTitle text="view full diagram" />
      </Link>
      <ThemeCards material={material} />
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  const pageInfo = loadPageTemplate()
  const events = await prisma.event
    .findMany({
      where: { hidden: false },
    })
    .catch((e) => {
      return []
    })
  let material = await getMaterial()
  removeMarkdown(material, material)

  return {
    props: {
      material: makeSerializable(material),
      events: makeSerializable(events),
      pageInfo: makeSerializable(pageInfo),
    },
    revalidate: revalidateTimeout,
  }
}

export default Home
