import * as React from "react";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import "./CustomDropdown.css";
import { useCallback } from "react";
interface ICustomDropDownProps {
  value: string | number | any;
  options: any[];
  onChange?: (value: string | any) => void;
  onClickFunction?: (value: boolean) => void;
  type?: "text" | "number";
  placeholder?: string;
  size?: "SM" | "MD" | "XL";
  isValid?: any;
  errorMsg?: string;
  sectionType?: "three" | "two" | "one";
  withLabel?: boolean;
  labelText?: string;
  disabled?: boolean;
  readOnly?: any;
  mandatory?: boolean;
  autoFocus?: boolean;
  onKeyDown?: any;
}
const CustomDropdown: React.FC<ICustomDropDownProps> = ({
  value,
  options,
  onChange,
  onClickFunction,
  placeholder = "",
  size = "MD",
  isValid = true,
  errorMsg,
  sectionType,
  labelText,
  withLabel,
  disabled = false,
  readOnly,
  mandatory,
  autoFocus,
  onKeyDown,
}) => {
  const handleChange = useCallback(
    (event: DropdownChangeEvent) => {
      onChange?.(event.value);
    },
    [onChange]
  );

  return (
    <div>
      <Dropdown
        value={value}
        onChange={handleChange}
        options={options}
        optionLabel="label"
        placeholder={placeholder}
        className="w-full md:w-14rem"
      />
    </div>
  );
};

export default CustomDropdown;
