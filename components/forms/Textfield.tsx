import React, { useEffect, useState } from "react"
import { Control, Controller, FieldPath, FieldValues, useFormState } from "react-hook-form"
import { Label, TextInput as FlowbiteTextfield } from "flowbite-react"

type Props<T extends FieldValues> = {
  label?: string
  name: FieldPath<T>
  control: Control<T>
  rules?: Object
  textfieldProps?: Object
}

function Textfield<T extends FieldValues>({
  label,
  name,
  control,
  rules,
  textfieldProps,
}: Props<T>): React.ReactElement {
  return (
    <div data-cy={`textfield-${name}`}>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field: { onChange, onBlur, value }, fieldState: { error, isDirty, isTouched } }) => {
          return (
            <>
              <div className="mb-1 block">
                <Label
                  htmlFor={name}
                  value={!error ? label : error?.message || (error?.type === "required" ? "Required" : "")}
                />
              </div>
              <FlowbiteTextfield
                name={name}
                id={name}
                value={value === undefined || value === null ? "" : value}
                onChange={onChange}
                onBlur={onBlur}
                {...textfieldProps}
              />
            </>
          )
        }}
      />
    </div>
  )
}

export default Textfield
