import type { NextPage, GetStaticProps } from "next"
import Layout from "components/Layout"
import { Material, getMaterial, removeMarkdown } from "lib/material"
import { makeSerializable } from "lib/utils"
import { PageTemplate, loadPageTemplate } from "lib/pageTemplate"
import Title from "components/ui/Title"
import { Button, Card } from "flowbite-react"
import { Modal } from "flowbite-react"
import CourseGrid from "components/courses/CourseGrid"
import useProfile from "lib/hooks/useProfile"
import { useMemo, useState } from "react"
import { basePath } from "lib/basePath"
import { HiRefresh } from "react-icons/hi"
import Link from "next/link"
import useSWR, { Fetcher } from "swr"
import type { Course } from "pages/api/course"
import revalidateTimeout from "lib/revalidateTimeout"
import { sortCourses } from "lib/courseSort"
import { CourseStatus } from "@prisma/client"
import CourseFilters from "components/courses/CourseFilters"
import { BreadcrumbItem } from "lib/breadcrumbs"
import { matchesCourseFilters } from "lib/courseFilters"
import { partitionCoursesForListPage } from "lib/courseSections"
import { hasBuildDatabase, runBuildPrismaQuery } from "lib/buildPrisma"
import type { CourseSyncReview } from "lib/courseSync"
import useMyCourseProgress from "lib/hooks/useMyCourseProgress"

type CoursesProps = {
  material: Material
  courses: Course[]
  pageInfo: PageTemplate
}

type CoursesData = { courses?: Course[]; error?: string }
type SyncDefaultsReviewResponse =
  | {
      mode: "review"
      review: CourseSyncReview
      summary: { unchanged: number; newCourses: number; changedCourses: number }
    }
  | {
      mode: "apply"
      created: number
      updated: number
      skipped: number
      appliedExternalIds: string[]
    }
  | { error: string }

const coursesFetcher: Fetcher<CoursesData, string> = (url) => fetch(url).then((r) => r.json())
const breadcrumbs: BreadcrumbItem[] = [{ label: "Courses" }]

const Courses: NextPage<CoursesProps> = ({ material, courses: initialCourses, pageInfo }) => {
  const { userProfile, isLoading: profileLoading } = useProfile()
  const [syncError, setSyncError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [showSyncModal, setShowSyncModal] = useState(false)
  const [syncReview, setSyncReview] = useState<CourseSyncReview | null>(null)
  const [syncSummary, setSyncSummary] = useState<{
    unchanged: number
    newCourses: number
    changedCourses: number
  } | null>(null)
  const [selectedSyncExternalIds, setSelectedSyncExternalIds] = useState<string[]>([])
  const [applySyncing, setApplySyncing] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const { data, isLoading, mutate } = useSWR(`${basePath}/api/course`, coursesFetcher, {
    fallbackData: { courses: initialCourses },
  })
  const courses = sortCourses(data?.courses ?? [])
  const { visibleCourses, hiddenCourses, myCourses, otherCourses } = partitionCoursesForListPage(courses)

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

  const applyFilters = (course: Course) =>
    matchesCourseFilters(course, {
      search,
      selectedLevel,
      selectedTags,
      selectedLanguages,
    })

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
  const shouldLoadProgress = !!userProfile && filteredMyCourses.length > 0
  const { progressByCourseId } = useMyCourseProgress(shouldLoadProgress)

  const syncSelectionsCount = selectedSyncExternalIds.length
  const hasReviewChanges = (syncReview?.newCourses.length ?? 0) + (syncReview?.changedCourses.length ?? 0) > 0

  const defaultSelectedExternalIds = useMemo(
    () => syncReview?.newCourses.map((course) => course.externalId) ?? [],
    [syncReview]
  )

  const handleSyncDefaults = async () => {
    setSyncError(null)
    setSyncing(true)
    try {
      const res = await fetch(`${basePath}/api/course/syncDefaults`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "review" }),
      })
      const data = (await res.json()) as SyncDefaultsReviewResponse
      if (!res.ok || !("mode" in data) || data.mode !== "review") {
        throw new Error(("error" in data && data.error) || "Failed to review sync")
      }
      setSyncReview(data.review)
      setSyncSummary(data.summary)
      setSelectedSyncExternalIds(data.review.newCourses.map((course) => course.externalId))
      setShowSyncModal(true)
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : "Failed to sync defaults")
    } finally {
      setSyncing(false)
    }
  }

  const toggleSyncExternalId = (externalId: string) => {
    setSelectedSyncExternalIds((current) =>
      current.includes(externalId) ? current.filter((value) => value !== externalId) : [...current, externalId]
    )
  }

  const handleApplySync = async () => {
    setSyncError(null)
    setApplySyncing(true)
    try {
      const res = await fetch(`${basePath}/api/course/syncDefaults`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "apply", externalIds: selectedSyncExternalIds }),
      })
      const data = (await res.json()) as SyncDefaultsReviewResponse
      if (!res.ok || !("mode" in data) || data.mode !== "apply") {
        throw new Error(("error" in data && data.error) || "Failed to apply sync")
      }
      await mutate()
      setShowSyncModal(false)
      setSyncReview(null)
      setSyncSummary(null)
      setSelectedSyncExternalIds([])
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : "Failed to apply sync")
    } finally {
      setApplySyncing(false)
    }
  }

  return (
    <Layout material={material} pageInfo={pageInfo} pageTitle={`Courses: ${pageInfo.title}`} breadcrumbs={breadcrumbs}>
      <div className="flex items-center justify-between gap-3 px-3 pt-3">
        <Title text="Courses" className="text-3xl font-bold text-center p-3" style={{ marginBottom: "0px" }} />
        {!profileLoading && userProfile?.admin && (
          <div className="flex items-center gap-2">
            <Link href="/courses/stats">
              <Button size="sm" color="light">
                Stats
              </Button>
            </Link>
            <Link href="/courses/add">
              <Button size="sm" color="info">
                Add course
              </Button>
            </Link>
            <Button size="sm" onClick={handleSyncDefaults} disabled={syncing}>
              <span className="flex items-center gap-2">
                <HiRefresh className={syncing ? "animate-spin" : ""} />
                {syncing ? "Reviewing…" : "Sync default courses"}
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
                  <CourseGrid courses={filteredMyCourses} progressByCourseId={progressByCourseId} />
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
      <Modal show={showSyncModal} onClose={() => setShowSyncModal(false)} size="4xl">
        <Modal.Header>Review default course changes</Modal.Header>
        <Modal.Body data-cy="sync-review-modal">
          {syncSummary && (
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Card data-cy="sync-summary-unchanged">
                <div className="text-sm text-gray-600 dark:text-gray-400">Unchanged</div>
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">{syncSummary.unchanged}</div>
              </Card>
              <Card data-cy="sync-summary-new">
                <div className="text-sm text-gray-600 dark:text-gray-400">New courses</div>
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">{syncSummary.newCourses}</div>
              </Card>
              <Card data-cy="sync-summary-changed">
                <div className="text-sm text-gray-600 dark:text-gray-400">Changed courses</div>
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">{syncSummary.changedCourses}</div>
              </Card>
            </div>
          )}
          {syncReview && (
            <div className="space-y-4">
              {syncReview.newCourses.length > 0 && (
                <section data-cy="sync-section-new">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">New courses</h3>
                  <div className="mt-3 space-y-3">
                    {syncReview.newCourses.map((course) => (
                      <Card key={course.externalId} data-cy={`sync-course-${course.externalId}`}>
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            className="mt-1"
                            aria-label={`Select ${course.name} for sync`}
                            data-cy={`sync-checkbox-${course.externalId}`}
                            checked={selectedSyncExternalIds.includes(course.externalId)}
                            onChange={() => toggleSyncExternalId(course.externalId)}
                          />
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">{course.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{course.externalId}</div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </section>
              )}
              {syncReview.changedCourses.length > 0 && (
                <section data-cy="sync-section-changed">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Changed courses</h3>
                  <div className="mt-3 space-y-3">
                    {syncReview.changedCourses.map((course) => (
                      <Card key={course.externalId} data-cy={`sync-course-${course.externalId}`}>
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            className="mt-1"
                            aria-label={`Select ${course.name} for sync`}
                            data-cy={`sync-checkbox-${course.externalId}`}
                            checked={selectedSyncExternalIds.includes(course.externalId)}
                            onChange={() => toggleSyncExternalId(course.externalId)}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-gray-900 dark:text-white">{course.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{course.externalId}</div>
                            <div className="mt-3 space-y-3">
                              {course.diffs.map((diff) => (
                                <div
                                  key={`${course.externalId}-${diff.id}`}
                                  className="rounded border border-slate-200 p-3 dark:border-slate-700"
                                  data-cy={`sync-diff-${course.externalId}-${diff.id}`}
                                >
                                  <div className="font-medium text-gray-900 dark:text-white">{diff.label}</div>
                                  <div className="mt-2 grid grid-cols-1 gap-3 lg:grid-cols-2">
                                    <div>
                                      <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                        Current
                                      </div>
                                      <pre className="mt-1 max-h-80 overflow-auto whitespace-pre-wrap break-all rounded bg-slate-100 p-2 text-xs text-gray-800 dark:bg-slate-900 dark:text-gray-200">
                                        {diff.current}
                                      </pre>
                                    </div>
                                    <div>
                                      <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                        Incoming
                                      </div>
                                      <pre className="mt-1 max-h-80 overflow-auto whitespace-pre-wrap break-all rounded bg-emerald-50 p-2 text-xs text-gray-800 dark:bg-emerald-950/30 dark:text-gray-200">
                                        {diff.incoming}
                                      </pre>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </section>
              )}
              {!hasReviewChanges && (
                <Card>
                  <p className="text-gray-700 dark:text-gray-300">All default courses already match the database.</p>
                </Card>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setShowSyncModal(false)}>
            Close
          </Button>
          <Button
            data-cy="sync-apply-selected"
            onClick={handleApplySync}
            disabled={applySyncing || syncSelectionsCount === 0}
          >
            {applySyncing
              ? "Applying…"
              : `Apply selected (${syncSelectionsCount || defaultSelectedExternalIds.length || 0})`}
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const pageInfo = loadPageTemplate()
  let material = await getMaterial()
  removeMarkdown(material, material)

  if (!hasBuildDatabase()) {
    return {
      props: makeSerializable({ material, courses: [], pageInfo }),
      revalidate: revalidateTimeout,
    }
  }

  const courses = await runBuildPrismaQuery("pages/courses/index.tsx courses", [], (prisma) =>
    prisma.course.findMany({ where: { hidden: false } })
  )
  const coursesWithUser = courses.map((course) => ({ ...course, UserOnCourse: [] }))

  return {
    props: makeSerializable({ material, courses: sortCourses(coursesWithUser), pageInfo }),
    revalidate: revalidateTimeout,
  }
}

export default Courses
