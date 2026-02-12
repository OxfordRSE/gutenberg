import type { GetServerSideProps, NextPage } from "next"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/router"
import Layout from "components/Layout"
import Title from "components/ui/Title"
import Textfield from "components/forms/Textfield"
import Textarea from "components/forms/Textarea"
import SelectField from "components/forms/SelectField"
import Checkbox from "components/forms/Checkbox"
import Stack from "components/ui/Stack"
import { Button, Card } from "flowbite-react"
import { basePath } from "lib/basePath"
import prisma from "lib/prisma"
import { getMaterial, Material, removeMarkdown } from "lib/material"
import { makeSerializable } from "lib/utils"
import { loadPageTemplate, PageTemplate } from "lib/pageTemplate"
import { getServerSession } from "next-auth/next"
import { authOptions } from "pages/api/auth/[...nextauth]"
import type { Data } from "pages/api/course"
import { normalizeCourseJson, type CourseJsonInput } from "lib/courseJson"
import { putCourse, CourseUpdatePayload } from "lib/actions/putCourse"

type AddCourseProps = {
  material: Material
  pageInfo: PageTemplate
}

type AddCourseForm = {
  name: string
  summary: string
  level: string
  hidden: boolean
  languageText: string
  tagsText: string
}

function textToList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
}

const AddCourse: NextPage<AddCourseProps> = ({ material, pageInfo }) => {
  const router = useRouter()
  const { control, handleSubmit } = useForm<AddCourseForm>({
    defaultValues: {
      name: "",
      summary: "",
      level: "",
      hidden: false,
      languageText: "",
      tagsText: "",
    },
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [jsonText, setJsonText] = useState("")
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [isJsonSubmitting, setIsJsonSubmitting] = useState(false)

  const onSubmit = async (form: AddCourseForm) => {
    setError(null)
    setIsSubmitting(true)
    try {
      const payload = {
        name: form.name,
        summary: form.summary,
        level: form.level,
        hidden: form.hidden,
        language: textToList(form.languageText),
        tags: textToList(form.tagsText),
      }

      const res = await fetch(`${basePath}/api/course`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const isJson = res.headers.get("content-type")?.includes("application/json")
      const data = (isJson ? await res.json() : null) as Data | null
      if (!res.ok || !data?.course) {
        const fallback = isJson ? data?.error : await res.text()
        throw new Error(fallback || "Failed to create course")
      }

      await router.push(`/courses/${data.course.id}#edit`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create course")
    } finally {
      setIsSubmitting(false)
    }
  }

  const onSubmitJson = async () => {
    setJsonError(null)
    setIsJsonSubmitting(true)
    try {
      if (!jsonText.trim()) {
        throw new Error("Paste Course JSON first.")
      }

      let parsed: CourseJsonInput
      try {
        parsed = JSON.parse(jsonText) as CourseJsonInput
      } catch {
        throw new Error("JSON is invalid.")
      }

      const { base, groups, items } = normalizeCourseJson(parsed)
      if (!base.name.trim()) {
        throw new Error("JSON must include a course name.")
      }

      const res = await fetch(`${basePath}/api/course`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(base),
      })
      const isJson = res.headers.get("content-type")?.includes("application/json")
      const data = (isJson ? await res.json() : null) as Data | null
      if (!res.ok || !data?.course) {
        const fallback = isJson ? data?.error : await res.text()
        throw new Error(fallback || "Failed to create course")
      }

      let createdCourse = data.course
      if (groups.length > 0 || items.length > 0) {
        const payload: CourseUpdatePayload = {
          ...createdCourse,
          CourseGroup: groups.map((group, groupIndex) => ({
            id: 0,
            name: group.name,
            summary: group.summary,
            order: group.order ?? groupIndex + 1,
            courseId: createdCourse.id,
            CourseItem: group.items.map((item, itemIndex) => ({
              id: 0,
              order: item.order ?? itemIndex + 1,
              section: item.section,
              courseId: createdCourse.id,
              groupId: null,
            })),
          })),
          CourseItem: items.map((item, index) => ({
            id: 0,
            order: item.order ?? index + 1,
            section: item.section,
            courseId: createdCourse.id,
            groupId: null,
          })),
        }

        const updated = await putCourse(payload)
        if ("course" in updated && updated.course) {
          createdCourse = updated.course
        }
      }

      await router.push(`/courses/${createdCourse.id}#edit`)
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : "Failed to create course")
    } finally {
      setIsJsonSubmitting(false)
    }
  }

  return (
    <Layout material={material} pageInfo={pageInfo} pageTitle={`Add course: ${pageInfo.title}`}>
      <div className="px-2 md:px-10 lg:px-10 xl:px-20 2xl:px-32">
        <Title text="Add course" className="text-3xl font-bold" style={{ marginBottom: "0px" }} />
        <Card className="mt-4">
          {error && <div className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</div>}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack>
              <Textfield
                label="Title"
                name="name"
                control={control}
                rules={{ required: "Courses require a name." }}
              />
              <Textarea
                label="Summary"
                name="summary"
                control={control}
                rules={{ required: "Courses require a summary." }}
              />
              <SelectField
                label="Level"
                name="level"
                control={control}
                rules={{ required: "Courses require a level." }}
                options={[
                  { label: "Select course level…", value: "" },
                  { label: "Beginner", value: "beginner" },
                  { label: "Intermediate", value: "intermediate" },
                  { label: "Advanced", value: "advanced" },
                ]}
              />
              <Checkbox label="Hidden" name="hidden" control={control} />
              <Textarea label="Language (one per line)" name="languageText" control={control} />
              <Textarea label="Tags (one per line)" name="tagsText" control={control} />
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating…" : "Create course"}
                </Button>
              </div>
            </Stack>
          </form>
        </Card>
        <Card className="mt-6">
          <div className="space-y-2">
            <Title text="Import from JSON" />
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Paste Course JSON (same shape as `courses.defaults.json`).
            </p>
          </div>
          {jsonError && <div className="mb-3 mt-3 text-sm text-red-600 dark:text-red-400">{jsonError}</div>}
          <div className="mt-3">
            <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">Course JSON</label>
            <textarea
              className="min-h-[200px] w-full rounded-md border border-gray-300 bg-white p-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              value={jsonText}
              onChange={(event) => setJsonText(event.target.value)}
              placeholder={`{\n  "name": "Intro to C++ (Self-paced)",\n  "summary": "Self-paced version of the C++ introduction",\n  "level": "beginner",\n  "hidden": false,\n  "language": ["cpp"],\n  "tags": ["cpp", "basics"],\n  "groups": [\n    {\n      "name": "Foundations",\n      "summary": "Core language fundamentals",\n      "order": 1,\n      "items": [\n        "HPCu.technology_and_tooling.bash_shell.bash",\n        "HPCu.technology_and_tooling.ide.cpp"\n      ]\n    }\n  ]\n}`}
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={onSubmitJson} disabled={isJsonSubmitting}>
              {isJsonSubmitting ? "Importing…" : "Create from JSON"}
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)
  const userEmail = session?.user?.email || undefined
  const currentUser = userEmail ? await prisma.user.findUnique({ where: { email: userEmail } }) : null
  if (!currentUser?.admin) {
    return {
      redirect: {
        destination: "/courses",
        permanent: false,
      },
    }
  }

  const pageInfo = loadPageTemplate()
  let material = await getMaterial()
  removeMarkdown(material, material)

  return {
    props: makeSerializable({ material, pageInfo }),
  }
}

export default AddCourse
