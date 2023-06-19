import React, { useEffect, useRef, useState } from 'react'
import useSWR, { Fetcher, useSWRConfig } from 'swr'
import { ResponseData as ApiProblem } from 'pages/api/problems/[sectionTag]/[problemTag]'
import { useForm, Controller } from "react-hook-form";
import { useSession, signIn, signOut } from "next-auth/react"
import { basePath } from 'lib/basePath'
import { Tooltip, Button, Checkbox, Label, Modal, Select, Textarea, TextInput } from 'flowbite-react'
import { MdEdit, MdOutlineCheckBoxOutlineBlank, MdOutlineCheckBox  } from 'react-icons/md'
import { ProblemUpdate } from 'lib/types'

interface ChallengeProps {
  content: React.ReactNode,
  title: string,
  id: string,
  section: string,
}

const fetcher: Fetcher<ApiProblem, string> = url => fetch(url).then(r => r.json())

const Challenge: React.FC<ChallengeProps> = ({ content, title, id, section }) => {
  const { data: session } = useSession()
  const apiPath = `${basePath}/api/problems/${section}/${id}`
  const { data, mutate } = useSWR(apiPath, fetcher)
  const { mutate: mutateGlobal } = useSWRConfig()

  const [showModal, setShowModal] = useState(false)
  const problem = data?.problem
  const noProblem = !problem || typeof problem === 'string'
  const defaultProblem = {
    tag: id,
    complete: false,
    difficulty: 5,
    notes: '',
    solution: '',
    section,
  };
  const { control, handleSubmit, reset, setValue } = useForm<ProblemUpdate>({ defaultValues: problem || defaultProblem });
  const problemApi = ( problem: ProblemUpdate ) => {
    console.log('problemApi', problem)
    if (typeof problem.difficulty === 'string') {
      problem.difficulty = parseInt(problem.difficulty)
    }
    const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem: problem })
    };
    fetch(apiPath, requestOptions)
        .then(response => response.json())
        .then(data => {
            mutate(data.problem)
            mutateGlobal((key: string) => key.startsWith(`${basePath}/api/event/`) && key.endsWith(`/problems`))
        });
  };

  const onSubmit = (problem: ProblemUpdate) => {
    problemApi(problem)
    setShowModal(false)
  };

  const handleClickComplete = (complete: boolean) => {
    const newComplete = !complete
    if (noProblem) {
      problemApi({ ...defaultProblem, complete: newComplete })
    } else {
      problemApi({ ...problem, complete: newComplete })
    }
    setValue('complete', newComplete)
    setShowModal(newComplete)
  }

  useEffect(() => {
    if (problem) {
      if (noProblem) {
        reset(defaultProblem)
      } else {
        reset(problem);
      }
    }
  }, [JSON.stringify(problem)]);

  let headerColor = 'bg-slate-700 dark:bg-slate-300'
  if (problem && typeof problem !== 'string' && problem.complete) {
    headerColor = 'bg-green-600 dark:bg-green-400'
  }
  const isComplete = problem?.complete || false

  return (
    <div className="border border-gray-200 rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-gray-700 mb-4">
      <div className={`flex items-center justify-between rounded-t-lg ${headerColor} pl-1 `}>

        
        <h3 className="w-full mx-2 my-0 text-slate-100 dark:text-black">{title}</h3>
        {session && 
         <>
         <div className='flex items-center space-x-2 mr-2'>
          <Tooltip content={isComplete ? 'Mark as incomplete' : 'Mark as complete'} placement="bottom">
            <Button className="bg-slate-50 dark:bg-slate-800" size="xxs" pill={true} onClick={() => handleClickComplete(isComplete)}>
              {isComplete ?  <MdOutlineCheckBox className="h-4 w-4" /> : <MdOutlineCheckBoxOutlineBlank className="h-4 w-4" />}
            </Button>
          </Tooltip>
          { !noProblem && 
            <Tooltip content={"Edit feedback"} placement="bottom">
            <Button className="mr-2 bg-slate-50 dark:bg-slate-800" size="xxs" pill={true} onClick={() => setShowModal(true)}>
              <MdEdit className="h-4 w-4" />
            </Button>
            </Tooltip>
          }
          </div>
        <Modal
          show={showModal}
          size="3xl"
          dismissible={true}
          onClose={() => setShowModal(false)}
        >
          <Modal.Header>
            Edit Challenge
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-6 px-6 pb-4 sm:pb-6 lg:px-8 xl:pb-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              <p className="text-sm text-slate-100 dark:text-slate-400 mb-4">
                Submitted data is <span className='font-bold'>entirely optional</span> but allows us to improve this course. All data is saved securely, is only available to course instructors, and can be deleted on request.
              </p>
              <div className="mb-4 block">
                <Controller
                  name="complete"
                  control={control}
                  render={({ field }) => {
                    console.log('field', field)
                    return (
                    <Checkbox id="complete" {...field} checked={field.value} value={field.value ? 1 : 0} />
                    )
                  }
                  }
                />
                <Label className="ml-2" htmlFor="complete">
                  Mark as complete
                </Label>
              </div>
              <div>
                <div className="mb-4 block">
                  <Label
                    htmlFor="solution"
                    value="Your solution"
                  />
                <Controller
                  name="solution"
                  control={control}
                  render={({ field }) => 
                    <Textarea
                      id="solution"
                      required={false}
                      rows={5}
                      {...field}
                    />
                  }
                />
                </div>
              </div>
              <div>
                <div className="mb-4 block">
                  <Label
                    htmlFor="difficulty"
                    value="Difficulty (1-10) compared with surrounding challenges"
                  />
                  <Controller
                    name="difficulty"
                    control={control}
                    render={({ field }) => 
                      <input id="difficulty" type="range" min="0" max="10" className="w-full h-2 bg-gray-500 rounded-lg appearance-none cursor-pointer dark:bg-gray-500"  {...field}></input>
                    }
                  />
                </div>
              </div>
              <div>
                <div className="mb-4 block">
                  <Label
                    htmlFor="notes"
                    value="Feedback for course instructors"
                  />
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => 
                    <Textarea
                      id="notes"
                      placeholder="Leave a comment..."
                      required={false}
                      rows={3}
                      {...field}
                    />
                  }
                />
                </div>
              </div>
              <div className="w-full mt-4">
                <Button type="submit">
                  Save
                </Button>
              </div>
              </form>
            </div>
          </Modal.Body>
        </Modal>
         </>
        }
      </div>
      <div className="mx-2 pb-2">
        {content}
      </div>
    </div>
  )
}

export default Challenge
