import React from "react"
import { useForm, Control, Controller, FieldPath, FieldValues } from "react-hook-form"
import { Autocomplete, TextField, Checkbox } from "@mui/material"
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank"
import CheckBoxIcon from "@mui/icons-material/CheckBox"
import { Chip } from "@mui/material"

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
const checkedIcon = <CheckBoxIcon fontSize="small" />

export type Option = {
  value: any
  label: string
}

type Props<T extends FieldValues> = {
  label?: string
  name: FieldPath<T>
  options: Option[]
  rules?: Object
  className?: React.ComponentProps<"div">["className"]
  selectedOptions: Option[]
  setSelectedOptions: React.Dispatch<React.SetStateAction<Option[]>>
  inputValue?: string
  setInputValue: React.Dispatch<React.SetStateAction<string>>
}

function SelectSectionField<T extends FieldValues>({
  label,
  name,
  options,
  className,
  selectedOptions,
  setSelectedOptions,
  inputValue,
  setInputValue,
}: Props<T>): React.ReactElement {
  const filterOptions = (options: Option[], { inputValue }: { inputValue: string }) => {
    return options.filter((option) => option.label.toLowerCase().includes(inputValue.toLowerCase()))
  }
  return (
    <div className={className} id="select">
      <Autocomplete
        multiple
        inputValue={inputValue}
        disableCloseOnSelect={true}
        onChange={(event, newValue) => setSelectedOptions(newValue)}
        value={selectedOptions}
        id={name}
        options={options}
        getOptionLabel={(option) => option.label}
        filterOptions={filterOptions}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        sx={{ width: 1000 }}
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
            {option.label}
          </li>
        )}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              label={option.label}
              {...getTagProps({ index })}
              className="dark:bg-teal-500 dark:text-white"
              key={`chip-${option.value}`}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Choose Sections"
            label={name}
            error={false}
            onChange={(e) => setInputValue(e.target.value)}
            variant="outlined"
            className="block w-full rounded-lg border disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50
            border-gray-300 text-gray-900 focus:border-cyan-500 focus:ring-cyan-500 dark:border-gray-600
            dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500"
          />
        )}
      />
    </div>
  )
}

export default SelectSectionField
