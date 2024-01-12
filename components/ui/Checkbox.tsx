import { useState, ChangeEvent } from "react"

interface CheckboxProps {
  label: string
  checked: boolean
  onChange?: (isChecked: boolean) => void
}

function Checkbox({ label, checked, onChange }: CheckboxProps) {
  const [isChecked, setIsChecked] = useState<boolean>(checked)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked
    setIsChecked(isChecked)
    onChange && onChange(isChecked)
  }

  return (
    <label className="inline-flex items-center">
      <input
        type="checkbox"
        className="form-checkbox h-5 w-5 text-blue-600"
        checked={isChecked}
        onChange={handleChange}
      />
      <span className="ml-2 text-gray-700">{label}</span>
    </label>
  )
}

export default Checkbox
