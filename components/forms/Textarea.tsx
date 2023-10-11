import React, { useEffect, useState } from 'react';
import { Control, Controller, FieldPath, FieldValues, useFormState } from 'react-hook-form';
import { Label, Textarea as FlowbiteTextarea } from 'flowbite-react';

type Props<T extends FieldValues> = {
  label?: string;
  name: FieldPath<T>;
  control: Control<T>;
  rules?: Object;
  value?: string; 
  onValueChange?: (newValue: string) => void;
};

function Textarea<T extends FieldValues>({ label, name, control, rules, value, onValueChange}: Props<T>): React.ReactElement {  
  return (
    <div>
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, onBlur, value }, fieldState: { error, isDirty, isTouched } }) => {
        // Call the onValueChange callback whenever the value changes
        if (onValueChange && typeof onValueChange === 'function') {
          onValueChange(value);
        }
        return (
          <>
          <div className="mb-1 block">
          <Label
            htmlFor={name}
            value={ !error ? label : error?.message || (error?.type === 'required' ? 'Required' : '')}
          />
          </div>
          <FlowbiteTextarea
            name={name}
            id={name}
            value={value === undefined || value === null ? '' : value}
            onChange={onChange}
            onBlur={onBlur}
          />
          </>
        );
      }}
    />
    </div>
  );
};

export default Textarea;