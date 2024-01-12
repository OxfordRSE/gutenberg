import React from "react"
import { Control, Controller, FieldPath, FieldValues, Path, PathValue } from "react-hook-form"
import { Label, Select, SelectProps } from "flowbite-react"
import DateTimePicker from "react-datetime-picker"
import "react-datetime-picker/dist/DateTimePicker.css"
import "react-calendar/dist/Calendar.css"
import "react-clock/dist/Clock.css"
import { Value } from "react-datetime-picker/dist/cjs/shared/types"

type Props<T extends FieldValues> = {
  label?: string
  name: FieldPath<T>
  control: Control<T>
  rules?: Object
}

function DateTimeField<T extends FieldValues>({ label, name, control, rules }: Props<T>): React.ReactElement {
  const labelId = `${name}-label`
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
        return (
          <div className="max-w-md" id="select">
            <div className="mb-2 block">
              <Label htmlFor={name} value={label} />
            </div>
            <DateTimePicker
              id={name}
              name={name}
              className="font-normal  text-gray-700 dark:text-gray-400"
              onChange={(value: Value) => onChange(value as PathValue<T, Path<T>>)}
              onBlur={onBlur}
              value={value}
            />
          </div>
        )
      }}
    />
  )
}

export default DateTimeField
