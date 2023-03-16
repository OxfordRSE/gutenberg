import React, { useEffect, useRef, useState } from 'react'
import useSWR, { Fetcher } from 'swr'
import { ResponseData as ApiProblem } from 'pages/api/problems/[problemTag]'
import { useForm, Controller } from "react-hook-form";
import { useSession, signIn, signOut } from "next-auth/react"
import { basePath } from 'lib/basePath'
import { Button, Checkbox, Label, Modal, Select, Textarea, TextInput } from 'flowbite-react'
import { MdEdit } from 'react-icons/md'
import { ProblemUpdate } from 'lib/types'

interface ChallengeProps {
  content: React.ReactNode,
  title: string,
  id: string,
}

const fetcher: Fetcher<ApiProblem, string> = url => fetch(url).then(r => r.json())

const Challenge: React.FC<ChallengeProps> = ({ content, title, id }) => {
  const { data: session } = useSession()
  const apiPath = `${basePath}/api/problems/${id}`
  const { data, mutate } = useSWR(apiPath, fetcher)
  const [showModal, setShowModal] = useState(false)
  const problem = data?.problem
  const defaultProblem = {
    tag: id,
    complete: false,
    difficulty: 5,
    notes: '',
    solution: '',
  }
  const { control, handleSubmit, reset } = useForm({ defaultValues: defaultProblem });
  const onSubmit = (problem: ProblemUpdate) => {
    if (typeof problem === 'string') {
      return
    }
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
          if (typeof data.problem !== 'string') {
            mutate(data.problem)
          }
        });
    setShowModal(false)
  };

  useEffect(() => {
      if (problem) {
        if (typeof problem === 'string') {
          reset(defaultProblem)
        } else {
          reset(problem);
        }
      }
  }, [problem]);

  let headerColor = 'bg-slate-700 dark:bg-slate-300'
  if (problem && typeof problem !== 'string' && problem.complete) {
    headerColor = 'bg-green-600 dark:bg-green-400'
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-gray-700 mb-4">
      <div className={`flex items-center justify-between rounded-t-lg ${headerColor}`}>
        <h3 className="w-full mx-2 my-0 text-slate-100 dark:text-black">{title}</h3>
        {session && 
         <>
         <Button className="mr-2 bg-slate-50 dark:bg-slate-800" size="xs" pill={true} onClick={() => setShowModal(true)}>
           <MdEdit className="h-4 w-4" />
         </Button>
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
                  render={({ field }) => 
                    <Checkbox id="complete" {...field} value={field.value ? 1 : 0} />
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
