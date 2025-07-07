import * as React from "react";
import styles from "./CustomFileUpload.module.scss";
interface CustomFileUploadProps {
  label: string;
  accept?: string;
  onFileSelect: (file: File) => void;
}

const CustomFileUpload: React.FC<CustomFileUploadProps> = ({
  label,
  accept,
  onFileSelect,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className={styles.customfileupload}>
      <label>{label}</label>
      <input type="file" accept={accept} onChange={handleChange} />
    </div>
  );
};

export default CustomFileUpload;
