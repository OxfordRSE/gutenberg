
import React from 'react';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { Label, Select, SelectProps } from 'flowbite-react';
import DateTimePicker from 'react-datetime-picker';

type Props<T extends FieldValues> = {
  label?: string;
  name: FieldPath<T>;
  control: Control<T>;
  rules?: Object;
};

function DateTimeField<T extends FieldValues>({ label, name, control, rules }: Props<T>): React.ReactElement {
  const labelId = `${name}-label`;
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
        return (
            <div className="max-w-md" id="select">
            <div className="mb-2 block">
                <Label
                htmlFor={name}
                value={label}
                />
            </div>
            <DateTimePicker 
              id={name}
              name={name}
              onChange={onChange} 
              onBlur={onBlur}
              value={value} 
            />
            </div>
        )
      }}
    />
  );
};

export default DateTimeField;
