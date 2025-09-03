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
  step?: number
  "data-cy"?: string
}

function Slider<T extends FieldValues>({
  label,
  name,
  control,
  rules,
  min,
  max,
  step = 1,
  ...rest
}: Props<T>): React.ReactElement {
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
          const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
            const v = Number(e.target.value)
            onChange(v)
          }
          return (
            <input
              id={name}
              name={name}
              type="range"
              min={min}
              max={max}
              step={step}
              value={Number(value ?? min)}
              onChange={handle}
              onInput={handle}
              onBlur={onBlur}
              className="w-full h-2 bg-gray-500 rounded-lg appearance-none cursor-pointer dark:bg-gray-500"
              {...rest}
            />
          )
        }}
      />
    </div>
  )
}

export default Slider
