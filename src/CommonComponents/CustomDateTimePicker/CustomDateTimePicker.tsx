import * as React from "react";
import { useCallback, useState } from "react";
import { Calendar } from "primereact/calendar";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "./CustomDateTime.css";
interface ICustomDateTimePickerProps {
  value: string | number | Date | null;
  minDate?: string | number | Date;
  onChange?: (value: Date | null) => void;
  placeholder?: string;
  isValid?: boolean;
  sectionType?: "three" | "two" | "one";
  withLabel?: boolean;
  label?: string;
  disabled?: boolean;
  readOnly?: boolean;
  mandatory?: boolean;
}

const CustomDateTimePicker: React.FC<ICustomDateTimePickerProps> = ({
  value,
  minDate,
  onChange,
  placeholder = "Select date and time",
  isValid = true,
  sectionType,
  label,
  withLabel,
  disabled = false,
  readOnly = false,
  mandatory = false,
}) => {
  const [focused, setFocused] = useState(false);

  const handleChange = useCallback(
    (e: any) => {
      onChange?.(e.value as Date);
    },
    [onChange]
  );

  return (
    <div className="customDatePickerWrapper">
      <label className="label">{label}</label>
      <Calendar
        value={value ? new Date(value) : null}
        onChange={handleChange}
        showIcon={true}
        placeholder={placeholder}
        disabled={disabled || readOnly}
        minDate={minDate ? new Date(minDate) : undefined}
        dateFormat="dd/mm/yy"
        hourFormat="24"
        inputClassName="p-inputtext"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        appendTo={document.body}
        className={focused ? "calendar-focused" : ""}
      />
    </div>
  );
};

export default CustomDateTimePicker;
