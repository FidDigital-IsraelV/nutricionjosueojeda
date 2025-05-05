
import React, { createContext, useContext } from "react";
import { Checkbox } from "./checkbox";
import { cn } from "@/lib/utils";

type CheckboxGroupContextProps = {
  value: string[];
  onChange: (value: string[]) => void;
};

const CheckboxGroupContext = createContext<CheckboxGroupContextProps | undefined>(undefined);

// Fix the interface by not extending HTMLAttributes<HTMLDivElement>
interface CheckboxGroupProps {
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
  children: React.ReactNode;
}

export const CheckboxGroup = ({
  value,
  onChange,
  className,
  children,
  ...props
}: CheckboxGroupProps) => {
  return (
    <CheckboxGroupContext.Provider value={{ value, onChange }}>
      <div className={cn("flex flex-col gap-2", className)} {...props}>
        {children}
      </div>
    </CheckboxGroupContext.Provider>
  );
};

interface CheckboxGroupItemProps {
  value: string;
  label: string;
}

export const CheckboxGroupItem = ({ value, label }: CheckboxGroupItemProps) => {
  const context = useContext(CheckboxGroupContext);
  
  if (!context) {
    throw new Error("CheckboxGroupItem must be used within a CheckboxGroup");
  }
  
  const { value: selectedValues, onChange } = context;
  const isChecked = selectedValues.includes(value);
  
  const handleChange = (checked: boolean) => {
    if (checked) {
      onChange([...selectedValues, value]);
    } else {
      onChange(selectedValues.filter(v => v !== value));
    }
  };
  
  return (
    <div className="flex items-center space-x-2">
      <Checkbox 
        id={`checkbox-${value}`}
        checked={isChecked}
        onCheckedChange={handleChange}
      />
      <label 
        htmlFor={`checkbox-${value}`}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
      </label>
    </div>
  );
};
