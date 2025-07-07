import * as React from "react";
import styles from "./CustomFileUpload.module.scss";

interface CustomFileUploadProps {
  label: string;
  accept?: string;
  onFileSelect: (file: File | null) => void;
}

const CustomFileUpload: React.FC<CustomFileUploadProps> = ({
  label,
  accept,
  onFileSelect,
}) => {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleClear = () => {
    setSelectedFile(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={styles.customFileUploadWrapper}>
      <label className={styles.label}>{label}</label>
      <div className={styles.uploadContainer}>
        <button
          type="button"
          className={styles.uploadButton}
          onClick={handleButtonClick}
          aria-label={
            selectedFile ? `Change file: ${selectedFile.name}` : "Upload file"
          }
        >
          {selectedFile ? "Change File" : "Choose File"}
        </button>
        <input
          type="file"
          accept={accept}
          ref={fileInputRef}
          className={styles.fileInput}
          onChange={handleChange}
          tabIndex={-1}
        />
        {selectedFile && (
          <div className={styles.fileInfo}>
            <span className={styles.fileName}>{selectedFile.name}</span>
            <button
              type="button"
              className={styles.clearButton}
              onClick={handleClear}
              aria-label="Remove selected file"
            >
              &times;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomFileUpload;
