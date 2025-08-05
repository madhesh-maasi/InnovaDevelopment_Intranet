/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import styles from "./CustomInputField.module.scss";
import { InputText } from "primereact/inputtext";
import "./CustomInputField.css";
interface CustomInputFieldProps {
  label?: string;
  value: string | undefined;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readonly?: boolean;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  onKeyDown?: any;
  isChat?: boolean;
  required?: boolean;
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
  isChat,
  required,
}) => {
  return (
    <div className={isChat ? styles.sendBox : styles.customInputWrapper}>
      <label className={styles.label}>
        {label}
        {required && (
          <label style={{ color: "red", paddingLeft: "2px" }}>*</label>
        )}
      </label>
      <InputText
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readonly}
        disabled={disabled}
        maxLength={maxLength}
        onKeyDown={onKeyDown}
      />
    </div>
  );
};

export default CustomInputField;
