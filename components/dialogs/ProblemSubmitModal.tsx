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
    <Modal show={show} size="3xl" dismissible onClose={onClose}>
      <div data-cy="challenge-edit-modal">
        <Modal.Header>Edit Challenge</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit(onSubmit)} data-cy="challenge-edit-form">
            <Checkbox name="complete" control={control} label="Mark as complete" data-cy="field-complete" />
            <Textarea name="solution" control={control} label="Your solution" data-cy="field-solution" />
            <Slider
              name="difficulty"
              control={control}
              label="Difficulty (1-10) compared with surrounding challenges"
              min={0}
              max={10}
              data-cy="field-difficulty"
            />
            <Textarea name="notes" control={control} label="Feedback for course instructors" data-cy="field-notes" />
            <Button type="submit" data-cy="challenge-save">
              Save
            </Button>
          </form>
        </Modal.Body>
      </div>
    </Modal>
  )
}

export default ProblemSubmitModal
