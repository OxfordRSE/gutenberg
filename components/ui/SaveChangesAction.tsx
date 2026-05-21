import React from "react"
import { Button, Spinner } from "flowbite-react"
import { HiCheckCircle } from "react-icons/hi"

type Props = {
  isSubmitting: boolean
  error?: string | null
  showSuccess: boolean
  submitLabel?: string
  savingLabel?: string
  successLabel?: string
  submitDataCy?: string
  feedbackDataCy?: string
}

const SaveChangesAction: React.FC<Props> = ({
  isSubmitting,
  error = null,
  showSuccess,
  submitLabel = "Save Changes",
  savingLabel = "Saving...",
  successLabel = "Changes saved.",
  submitDataCy,
  feedbackDataCy,
}) => {
  return (
    <div className="flex justify-end">
      <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
        <div aria-live="polite" className="min-h-6 text-right text-sm" data-cy={feedbackDataCy}>
          {error ? (
            <span className="text-red-600 dark:text-red-400">{error}</span>
          ) : showSuccess ? (
            <span className="inline-flex items-center gap-2 text-green-600 dark:text-green-400">
              <HiCheckCircle className="h-5 w-5" />
              {successLabel}
            </span>
          ) : null}
        </div>
        <Button type="submit" disabled={isSubmitting} data-cy={submitDataCy}>
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Spinner size="sm" />
              {savingLabel}
            </span>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </div>
  )
}

export default SaveChangesAction
