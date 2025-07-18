/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable  @typescript-eslint/explicit-function-return-type */
import * as React from "react";
import { useState } from "react";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
// import styles from "./CustomSearchinput.module.scss";
import "./CustomSearchInput.css";
interface CustomSearchInputProps {
  placeholder?: string;
  searchFunction?: (value: string) => void;
}

const CustomSearchInput: React.FC<CustomSearchInputProps> = ({
  placeholder = "Search...",
  searchFunction = () => {},
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    searchFunction(value); // Calls the parent handler
  };

  return (
    <div className="search_input_wrapper">
      <IconField iconPosition="left" className="iconField">
        <div>
          <InputIcon className="pi pi-search" />
        </div>
        <div>
          <InputText
            placeholder={placeholder}
            value={inputValue}
            onChange={handleChange}
          />
        </div>
      </IconField>
    </div>
  );
};

export default CustomSearchInput;
