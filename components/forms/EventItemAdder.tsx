import React, { useState } from "react"
import Stack from "components/ui/Stack"
import type { FieldValues } from "react-hook-form"
import { Button } from "@mui/material"
import SelectSectionField from "components/forms/SelectSectionField"
import type { Option } from "components/forms/SelectSectionField"

interface EventItemAdderProps<T extends FieldValues> {
  sectionsOptions: Option[]
  selectedOptions: Option[]
  setSelectedOptions: React.Dispatch<React.SetStateAction<Option[]>>
  handleAddClick: () => void
  inputValue?: string
  setInputValue: React.Dispatch<React.SetStateAction<string>>
  className?: string
}

function EventItemAdder({
  sectionsOptions,
  selectedOptions,
  setSelectedOptions,
  handleAddClick,
  inputValue,
  setInputValue,
  className,
}: EventItemAdderProps<FieldValues>) {
  return (
    <Stack direction="row">
      <SelectSectionField
        label="Section"
        name=""
        options={sectionsOptions}
        selectedOptions={selectedOptions}
        setSelectedOptions={setSelectedOptions}
        inputValue={inputValue}
        setInputValue={setInputValue}
        className={className}
      />
      <Button onClick={handleAddClick} variant="contained" size="small" className="rounded">
        Add Sections
      </Button>
    </Stack>
  )
}

export default EventItemAdder
