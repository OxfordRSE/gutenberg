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
      const data = (await res.json()) as Data
      if (!res.ok || !data.course) {
        throw new Error(data.error || "Failed to create course")
      }

      await router.push(`/courses/${data.course.id}#edit`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create course")
    } finally {
      setIsSubmitting(false)
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
              <Textfield label="Title" name="name" control={control} />
              <Textarea label="Summary" name="summary" control={control} />
              <SelectField
                label="Level"
                name="level"
                control={control}
                options={[
                  { label: "", value: "" },
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
