import React, { useEffect, useRef, useState, useMemo } from "react"
import { useForm, Controller } from "react-hook-form"
import { useSession, signIn, signOut } from "next-auth/react"
import { basePath } from "lib/basePath"
import { Tooltip, Button, Label, Modal, Select, TextInput } from "flowbite-react"
import { MdEdit, MdOutlineCheckBoxOutlineBlank, MdOutlineCheckBox } from "react-icons/md"
import { ProblemUpdate } from "lib/types"
import Checkbox from "components/forms/Checkbox"
import Textarea from "components/forms/Textarea"
import Slider from "components/forms/Slider"
import Stack from "components/ui/Stack"
import useProblem from "lib/hooks/useProblem"
import putProblem from "lib/actions/putProblem"
import { useSWRConfig } from "swr"

interface ChallengeProps {
  content: React.ReactNode
  title: string
  id: string
  section: string
}

const Challenge: React.FC<ChallengeProps> = ({ content, title, id, section }) => {
  const { data: session } = useSession()
  const { problem, mutate } = useProblem(section, id)
  const stringifyProblem = JSON.stringify(problem)
  const { mutate: mutateGlobal } = useSWRConfig()

  const [showModal, setShowModal] = useState(false)
  const noProblem = !problem || typeof problem === "string"
  const defaultProblem = useMemo(
    () => ({
      tag: id,
      complete: false,
      difficulty: 5,
      notes: "",
      solution: "",
      section,
    }),
    [id, section]
  )
  const { control, handleSubmit, reset, setValue } = useForm<ProblemUpdate>({ defaultValues: defaultProblem })
  const problemApi = (problem: ProblemUpdate) => {
    if (typeof problem.difficulty === "string") {
      problem.difficulty = parseInt(problem.difficulty)
    }
    putProblem(section, id, problem).then((data) => {
      if (data.problem) {
        mutate(data.problem)
        mutateGlobal((key: string) => key.startsWith(`${basePath}/api/event/`) && key.endsWith(`/problems`))
      }
    })
  }

  const onSubmit = (problem: ProblemUpdate) => {
    problemApi(problem)
    setShowModal(false)
  }

  const handleClickComplete = (complete: boolean) => {
    const newComplete = !complete
    if (noProblem) {
      problemApi({ ...defaultProblem, complete: newComplete })
    } else {
      problemApi({ ...problem, complete: newComplete })
    }
    //@ts-ignore
    setValue("complete", newComplete)
    setShowModal(newComplete)
  }

  useEffect(() => {
    if (problem) {
      if (noProblem) {
        reset(defaultProblem)
      } else {
        reset(problem)
      }
    }
  }, [stringifyProblem, defaultProblem, problem, noProblem, reset])

  let headerColor = "bg-slate-700 dark:bg-slate-300"
  if (problem && typeof problem !== "string" && problem.complete) {
    headerColor = "bg-green-600 dark:bg-green-400"
  }
  let isComplete = false
  if (problem && typeof problem !== "string") {
    isComplete = problem.complete
  }

  return (
    <div id={id} className="border border-gray-200 rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-gray-700 mb-4">
      <div className={`flex items-center justify-between rounded-t-lg ${headerColor} pl-1 `}>
        <h3 className="w-full mx-2 my-0 text-slate-100 dark:text-black">{title}</h3>
        {session && (
          <>
            <div className="flex items-center space-x-2 mr-2">
              <Tooltip content={isComplete ? "Mark as incomplete" : "Mark as complete"} placement="bottom">
                <Button
                  className="bg-slate-50 dark:bg-slate-800"
                  size="xxs"
                  pill={true}
                  onClick={() => handleClickComplete(isComplete)}
                >
                  {isComplete ? (
                    <MdOutlineCheckBox className="h-4 w-4 text-black dark:text-white" />
                  ) : (
                    <MdOutlineCheckBoxOutlineBlank className="h-4 w-4 text-black dark:text-white" />
                  )}
                </Button>
              </Tooltip>
              {!noProblem && (
                <Tooltip content={"Edit feedback"} placement="bottom">
                  <Button
                    className="mr-2 bg-slate-50 dark:bg-slate-800"
                    size="xxs"
                    pill={true}
                    onClick={() => setShowModal(true)}
                  >
                    <MdEdit className="h-4 w-4 text-black dark:text-white" />
                  </Button>
                </Tooltip>
              )}
            </div>
            <Modal show={showModal} size="3xl" dismissible={true} onClose={() => setShowModal(false)}>
              <Modal.Header>Edit Challenge</Modal.Header>
              <Modal.Body>
                <div className="space-y-6 px-6 pb-4 sm:pb-6 lg:px-8 xl:pb-8">
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={4}>
                      <p className="text-sm text-gray-900 dark:text-slate-400">
                        Submitted data is <span className="font-bold">entirely optional</span> but allows us to improve
                        this course. All data is saved securely, is only available to course instructors, and can be
                        deleted on request.
                      </p>
                      <Checkbox name={"complete"} control={control} label="Mark as complete" />
                      <Textarea name={"solution"} control={control} label="Your solution" />
                      <Slider
                        name={"difficulty"}
                        control={control}
                        label="Difficulty (1-10) compared with surrounding challenges"
                        min={0}
                        max={10}
                      />
                      <Textarea name={"notes"} control={control} label="Feedback for course instructors" />
                      <Button type="submit">Save</Button>
                    </Stack>
                  </form>
                </div>
              </Modal.Body>
            </Modal>
          </>
        )}
      </div>
      <div className="mx-2 pb-2">{content}</div>
    </div>
  )
}

export default Challenge
