import React from "react"
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form"
import { Label, Select, SelectProps } from "flowbite-react"

type Option = {
  value: any
  label: string
}

type Props<T extends FieldValues> = {
  label?: string
  name: FieldPath<T>
  options: Option[]
  control: Control<T>
  rules?: Object
  selectProps?: SelectProps
  className?: React.ComponentProps<"div">["className"]
}

function SelectField<T extends FieldValues>({
  label,
  name,
  options,
  control,
  rules,
  selectProps,
  className,
}: Props<T>): React.ReactElement {
  const labelId = `${name}-label`
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <div className={className} id="select">
          <div className="mb-2 block">
            <Label htmlFor={name} value={label} />
          </div>
          <Select
            name={name}
            id={name}
            value={value === undefined || value === null ? "" : value}
            onChange={onChange}
            onBlur={onBlur}
            {...selectProps}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      )}
    />
  )
}

export default SelectField
