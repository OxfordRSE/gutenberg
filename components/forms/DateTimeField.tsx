import React from "react"
import { Control, Controller, FieldPath, FieldValues, Path, PathValue } from "react-hook-form"
import { Label, Select, SelectProps } from "flowbite-react"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import dayjs from "dayjs"

type Props<T extends FieldValues> = {
  label?: string
  name: FieldPath<T>
  control: Control<T>
  rules?: Object
  defaultValue?: Date
}

function DateTimeField<T extends FieldValues>({
  label,
  name,
  control,
  rules,
  defaultValue,
}: Props<T>): React.ReactElement {
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
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                format="YYYY-MM-DD HH:mm"
                name={name}
                ampm={false}
                className="font-normal bg-grey-100 dark:bg-gray-600 dark:text-gray-200"
                value={dayjs(value)}
                slotProps={{ openPickerIcon: { className: "bg-grey-100 dark:bg-gray-600 dark:text-gray-200" } }}
                onChange={onChange}
              />
            </LocalizationProvider>
          </div>
        )
      }}
    />
  )
}

export default DateTimeField
