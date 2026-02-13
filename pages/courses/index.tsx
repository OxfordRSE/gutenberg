import type { NextPage, GetStaticProps } from "next"
import Layout from "components/Layout"
import { Material, getMaterial, removeMarkdown } from "lib/material"
import { makeSerializable } from "lib/utils"
import { PageTemplate, loadPageTemplate } from "lib/pageTemplate"
import Title from "components/ui/Title"
import { Button, Card } from "flowbite-react"
import CourseGrid from "components/courses/CourseGrid"
import useProfile from "lib/hooks/useProfile"
import { useState } from "react"
import { basePath } from "lib/basePath"
import { HiRefresh } from "react-icons/hi"
import Link from "next/link"
import useSWR, { Fetcher } from "swr"
import type { Course } from "pages/api/course"
import revalidateTimeout from "lib/revalidateTimeout"
import { sortCourses } from "lib/courseSort"
import { CourseStatus } from "@prisma/client"
import CourseFilters from "components/courses/CourseFilters"

type CoursesProps = {
  material: Material
  courses: Course[]
  pageInfo: PageTemplate
}

type CoursesData = { courses?: Course[]; error?: string }

const coursesFetcher: Fetcher<CoursesData, string> = (url) => fetch(url).then((r) => r.json())

const Courses: NextPage<CoursesProps> = ({ material, courses: initialCourses, pageInfo }) => {
  const { userProfile, isLoading: profileLoading } = useProfile()
  const [syncError, setSyncError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const { data, isLoading, mutate } = useSWR(`${basePath}/api/course`, coursesFetcher, {
    fallbackData: { courses: initialCourses },
  })
  const courses = sortCourses(data?.courses ?? [])
  const visibleCourses = courses.filter((course) => !course.hidden)
  const hiddenCourses = courses.filter((course) => course.hidden)
  const myCourses = visibleCourses.filter((course) => {
    const status = course.UserOnCourse?.[0]?.status
    return status && status !== CourseStatus.DROPPED
  })
  const otherCourses = visibleCourses.filter((course) => {
    const status = course.UserOnCourse?.[0]?.status
    return !status || status === CourseStatus.DROPPED
  })

  const tagOptions = Array.from(
    new Set(
      visibleCourses
        .flatMap((course) => course.tags ?? [])
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b))

  const languageOptions = Array.from(
    new Set(
      visibleCourses
        .flatMap((course) => course.language ?? [])
        .map((language) => language.trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b))

  const applyFilters = (course: Course) => {
    const searchValue = search.trim().toLowerCase()
    const matchesSearch =
      !searchValue ||
      course.name.toLowerCase().includes(searchValue) ||
      (course.summary ?? "").toLowerCase().includes(searchValue)
    const matchesLevel = !selectedLevel || course.level === selectedLevel
    const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => (course.tags ?? []).includes(tag))
    const matchesLanguages =
      selectedLanguages.length === 0 || selectedLanguages.some((language) => (course.language ?? []).includes(language))

    return matchesSearch && matchesLevel && matchesTags && matchesLanguages
  }

  const filteredMyCourses = myCourses.filter(applyFilters).sort((a, b) => {
    const aStatus = a.UserOnCourse?.[0]?.status
    const bStatus = b.UserOnCourse?.[0]?.status
    const aCompleted = aStatus === CourseStatus.COMPLETED
    const bCompleted = bStatus === CourseStatus.COMPLETED
    if (aCompleted !== bCompleted) return aCompleted ? 1 : -1
    return 0
  })

  const filteredOtherCourses = otherCourses.filter(applyFilters)
  const filteredHiddenCourses = hiddenCourses.filter(applyFilters)

  const handleSyncDefaults = async () => {
    setSyncError(null)
    setSyncing(true)
    try {
      const res = await fetch(`${basePath}/api/course/sync-defaults`, { method: "POST" })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.error || "Failed to sync defaults")
      }
      await mutate()
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
        {!profileLoading && userProfile?.admin && (
          <div className="flex items-center gap-2">
            <Link href="/courses/add">
              <Button size="sm" color="info">
                Add course
              </Button>
            </Link>
            <Button size="sm" onClick={handleSyncDefaults} disabled={syncing}>
              <span className="flex items-center gap-2">
                <HiRefresh className={syncing ? "animate-spin" : ""} />
                {syncing ? "Syncing…" : "Sync courses"}
              </span>
            </Button>
          </div>
        )}
      </div>
      <div className="px-2 md:px-10 lg:px-10 xl:px-20 2xl:px-32">
        <CourseFilters
          search={search}
          setSearch={setSearch}
          selectedLevel={selectedLevel}
          setSelectedLevel={setSelectedLevel}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          selectedLanguages={selectedLanguages}
          setSelectedLanguages={setSelectedLanguages}
          tagOptions={tagOptions}
          languageOptions={languageOptions}
        />
        {syncError && <div className="mb-3 text-sm text-red-600 dark:text-red-400">{syncError}</div>}
        {isLoading ? (
          <Card>
            <p className="text-gray-700 dark:text-gray-300">Loading courses…</p>
          </Card>
        ) : filteredMyCourses.length === 0 && filteredOtherCourses.length === 0 ? (
          <Card>
            <p className="text-gray-700 dark:text-gray-300">
              {visibleCourses.length === 0 ? "No courses are available yet." : "No courses match your filters."}
            </p>
          </Card>
        ) : (
          <>
            {!profileLoading && userProfile && filteredMyCourses.length > 0 && (
              <div className="mb-8">
                <Title text="My Courses" className="text-2xl font-bold" style={{ marginBottom: "0px" }} />
                <div className="mt-3">
                  <CourseGrid courses={filteredMyCourses} />
                </div>
              </div>
            )}
            {filteredOtherCourses.length > 0 && (
              <div>
                <Title text="Available Courses" className="text-2xl font-bold" style={{ marginBottom: "0px" }} />
                <div className="mt-3">
                  <CourseGrid courses={filteredOtherCourses} />
                </div>
              </div>
            )}
          </>
        )}
        {!profileLoading && userProfile?.admin && filteredHiddenCourses.length > 0 && (
          <div className="mt-8">
            <Title text="Hidden Courses" className="text-2xl font-bold" style={{ marginBottom: "0px" }} />
            <div className="mt-3">
              <CourseGrid courses={filteredHiddenCourses} />
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const pageInfo = loadPageTemplate()
  let material = await getMaterial()
  removeMarkdown(material, material)

  if (!process.env.DATABASE_URL) {
    return {
      props: makeSerializable({ material, courses: [], pageInfo }),
      revalidate: revalidateTimeout,
    }
  }

  const prisma = (await import("lib/prisma")).default
  const courses = await prisma.course.findMany({ where: { hidden: false } })
  const coursesWithUser = courses.map((course) => ({ ...course, UserOnCourse: [] }))

  return {
    props: makeSerializable({ material, courses: sortCourses(coursesWithUser), pageInfo }),
    revalidate: revalidateTimeout,
  }
}

export default Courses
