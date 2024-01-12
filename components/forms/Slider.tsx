import { Label } from "flowbite-react"
import React from "react"
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form"

type Props<T extends FieldValues> = {
  label: string
  name: FieldPath<T>
  control: Control<T>
  rules?: Object
  min: number
  max: number
}

function Slider<T extends FieldValues>({ label, name, control, rules, min, max }: Props<T>): React.ReactElement {
  return (
    <div>
      <div className="mb-0 block">
        <Label htmlFor={name}>{label}</Label>
      </div>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
          return (
            <input
              className="w-full h-2 bg-gray-500 rounded-lg appearance-none cursor-pointer dark:bg-gray-500"
              id={name}
              type="range"
              min={min}
              max={max}
              onChange={onChange}
              onBlur={onBlur}
              value={value}
            ></input>
          )
        }}
      />
    </div>
  )
}

export default Slider
