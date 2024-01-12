import React from "react"
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form"
import { Checkbox as FlowbiteCheckbox, CheckboxProps, Label } from "flowbite-react"

type Props<T extends FieldValues> = {
  label: string
  name: FieldPath<T>
  control: Control<T>
  rules?: Object
  checkboxFieldProps?: CheckboxProps
}

function Checkbox<T extends FieldValues>({
  label,
  name,
  control,
  rules,
  checkboxFieldProps,
}: Props<T>): React.ReactElement {
  return (
    <div>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
          return (
            <FlowbiteCheckbox
              name={name}
              id={name}
              checked={value === undefined ? false : value}
              onChange={onChange}
              onBlur={onBlur}
              {...checkboxFieldProps}
            />
          )
        }}
      />
      <Label className="ml-2" htmlFor={name}>
        {label}
      </Label>
    </div>
  )
}

export default Checkbox
