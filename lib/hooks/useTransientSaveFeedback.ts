import { useCallback, useEffect, useRef, useState } from "react"

type Options = {
  successDurationMs?: number
}

const useTransientSaveFeedback = ({ successDurationMs = 2500 }: Options = {}) => {
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearSuccessTimeout = useCallback(() => {
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current)
      successTimeoutRef.current = null
    }
  }, [])

  const begin = useCallback(() => {
    clearSuccessTimeout()
    setError(null)
    setShowSuccess(false)
  }, [clearSuccessTimeout])

  const succeed = useCallback(() => {
    clearSuccessTimeout()
    setError(null)
    setShowSuccess(true)
    successTimeoutRef.current = setTimeout(() => {
      setShowSuccess(false)
      successTimeoutRef.current = null
    }, successDurationMs)
  }, [clearSuccessTimeout, successDurationMs])

  const fail = useCallback(
    (message: string) => {
      clearSuccessTimeout()
      setShowSuccess(false)
      setError(message)
    },
    [clearSuccessTimeout]
  )

  const dismissSuccess = useCallback(() => {
    clearSuccessTimeout()
    setShowSuccess(false)
  }, [clearSuccessTimeout])

  useEffect(() => {
    return () => {
      clearSuccessTimeout()
    }
  }, [clearSuccessTimeout])

  return {
    error,
    showSuccess,
    begin,
    succeed,
    fail,
    dismissSuccess,
  }
}

export default useTransientSaveFeedback
