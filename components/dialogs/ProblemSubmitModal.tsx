import React from "react"
import { Modal, Button } from "flowbite-react"
import { useForm } from "react-hook-form"
import Stack from "components/ui/Stack"
import Checkbox from "components/forms/Checkbox"
import Textarea from "components/forms/Textarea"
import Slider from "components/forms/Slider"
import { ProblemUpdate } from "lib/types"

interface ProblemSubmitModalProps {
  show: boolean
  onClose: () => void
  defaultValues: ProblemUpdate
  onSubmit: (problem: ProblemUpdate) => void
}

const ProblemSubmitModal: React.FC<ProblemSubmitModalProps> = ({ show, onClose, defaultValues, onSubmit }) => {
  const { control, handleSubmit, reset } = useForm<ProblemUpdate>({
    defaultValues,
  })

  // reset form when defaultValues change
  React.useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  return (
    <Modal show={show} size="3xl" dismissible={true} onClose={onClose}>
      <Modal.Header>Edit Challenge</Modal.Header>
      <Modal.Body>
        <div className="space-y-6 px-6 pb-4 sm:pb-6 lg:px-8 xl:pb-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={4}>
              <p className="text-sm text-gray-900 dark:text-slate-400">
                Submitted data is <span className="font-bold">entirely optional</span> but allows us to improve this
                course. All data is saved securely, is only available to course instructors, and can be deleted on
                request.
              </p>
              <Checkbox name="complete" control={control} label="Mark as complete" />
              <Textarea name="solution" control={control} label="Your solution" />
              <Slider
                name="difficulty"
                control={control}
                label="Difficulty (1-10) compared with surrounding challenges"
                min={0}
                max={10}
              />
              <Textarea name="notes" control={control} label="Feedback for course instructors" />
              <Button type="submit">Save</Button>
            </Stack>
          </form>
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default ProblemSubmitModal
