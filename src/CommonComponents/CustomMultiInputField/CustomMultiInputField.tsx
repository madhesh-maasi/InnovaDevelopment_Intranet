import * as React from "react";
import styles from "./CustomMultiInputField.module.scss";
import { InputTextarea } from "primereact/inputtextarea";

interface CustomMultiInputFieldProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  placeholder?: string;
  autoResize?: boolean;
  maxLength?: number;
  required?: boolean;
}

const CustomMultiInputField: React.FC<CustomMultiInputFieldProps> = ({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
  autoResize = true,
  maxLength,
  required,
}) => {
  return (
    <div className={styles.customMultiInputWrapper}>
      <label className={styles.label}>
        {label}
        {required && (
          <label style={{ color: "red", paddingLeft: "2px" }}>*</label>
        )}
      </label>
      <InputTextarea
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        autoResize={false}
        maxLength={maxLength}
        className={styles.textarea}
      />
    </div>
  );
};

export default CustomMultiInputField;
