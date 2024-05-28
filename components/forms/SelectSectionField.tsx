import React, { useState } from "react"
import { useForm, Control, Controller, FieldPath, FieldValues } from "react-hook-form"
import { Autocomplete, TextField, Checkbox } from "@mui/material"
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank"
import CheckBoxIcon from "@mui/icons-material/CheckBox"
import { Button } from "flowbite-react"
import { set } from "cypress/types/lodash"

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
const checkedIcon = <CheckBoxIcon fontSize="small" />

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
  className?: React.ComponentProps<"div">["className"]
  selectedOptions: Option[]
  setSelectedOptions: React.Dispatch<React.SetStateAction<Option[]>>
}

function SelectSectionField<T extends FieldValues>({
  label,
  name,
  options,
  control,
  rules,
  className,
  selectedOptions,
  setSelectedOptions,
}: Props<T>): React.ReactElement {
  const labelId = `${name}-label`
  const [inputValue, setInputValue] = useState("")

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <div className={className} id="select">
          <Autocomplete
            multiple
            inputValue={inputValue}
            disableCloseOnSelect={true}
            onChange={(event, newValue) => setSelectedOptions(newValue)}
            id={name}
            options={options}
            getOptionLabel={(option) => option.label}
            filterOptions={(options) => options}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            sx={{ width: 1000 }}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
                {option.label}
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label={labelId}
                error={!!error}
                onChange={(e) => setInputValue(e.target.value)}
                variant="outlined"
              />
            )}
          />
          <Button type="submit">Save</Button>
        </div>
      )}
    />
  )
}

export default SelectSectionField
