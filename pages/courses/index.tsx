import type { NextPage, GetServerSideProps } from "next"
import prisma from "lib/prisma"
import Layout from "components/Layout"
import { Material, getMaterial, removeMarkdown } from "lib/material"
import { makeSerializable } from "lib/utils"
import { PageTemplate, loadPageTemplate } from "lib/pageTemplate"
import Title from "components/ui/Title"
import { Card, Button } from "flowbite-react"
import { Prisma } from "@prisma/client"
import CourseGrid from "components/courses/CourseGrid"
import useProfile from "lib/hooks/useProfile"
import { useState } from "react"
import { basePath } from "lib/basePath"

type Course = Prisma.CourseGetPayload<{}>

type CoursesProps = {
  material: Material
  courses: Course[]
  pageInfo: PageTemplate
}

const Courses: NextPage<CoursesProps> = ({ material, courses, pageInfo }) => {
  const { userProfile } = useProfile()
  const [syncError, setSyncError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)

  const handleSyncDefaults = async () => {
    setSyncError(null)
    setSyncing(true)
    try {
      const res = await fetch(`${basePath}/api/course/sync-defaults`, { method: "POST" })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.error || "Failed to sync defaults")
      }
      window.location.reload()
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : "Failed to sync defaults")
    } finally {
      setSyncing(false)
    }
  }

  return (
    <Layout material={material} pageInfo={pageInfo} pageTitle={`Courses: ${pageInfo.title}`}>
      <div className="flex items-center justify-between gap-3 px-3 pt-3">
        <Title text="Courses" className="text-3xl font-bold text-center p-3" style={{ marginBottom: "0px" }} />
        {userProfile?.admin && (
          <Button size="sm" onClick={handleSyncDefaults} disabled={syncing}>
            {syncing ? "Syncing…" : "Sync default courses"}
          </Button>
        )}
      </div>
      <div className="px-2 md:px-10 lg:px-10 xl:px-20 2xl:px-32">
        {syncError && <div className="mb-3 text-sm text-red-600 dark:text-red-400">{syncError}</div>}
        {courses.length === 0 ? (
          <Card>
            <p className="text-gray-700 dark:text-gray-300">No courses are available yet.</p>
          </Card>
        ) : (
          <CourseGrid courses={courses} />
        )}
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const pageInfo = loadPageTemplate()
  let material = await getMaterial()
  removeMarkdown(material, material)

  const courses = await prisma.course.findMany({
    where: { hidden: false },
    orderBy: { updatedAt: "desc" },
  })

  return {
    props: makeSerializable({ material, courses, pageInfo }),
  }
}

export default Courses
