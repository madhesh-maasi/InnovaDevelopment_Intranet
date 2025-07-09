import * as React from "react";
import styles from "./CustomInputField.module.scss";
import { InputText } from "primereact/inputtext";

interface CustomInputFieldProps {
  label?: string;
  value: string | undefined;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readonly?: boolean;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  onKeyDown?: any;
}

const CustomInputField: React.FC<CustomInputFieldProps> = ({
  label,
  value,
  onChange,
  readonly,
  placeholder = "",
  disabled = false,
  maxLength,
  onKeyDown,
}) => {
  return (
    <div className={styles.customInputWrapper}>
      <label className={styles.label}>{label}</label>
      <InputText
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readonly}
        disabled={disabled}
        maxLength={maxLength}
        className={styles.inputText}
        onKeyDown={onKeyDown}
      />
    </div>
  );
};

export default CustomInputField;
