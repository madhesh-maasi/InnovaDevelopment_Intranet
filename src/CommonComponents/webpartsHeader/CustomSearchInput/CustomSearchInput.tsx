/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable  @typescript-eslint/explicit-function-return-type */

import * as React from "react";
import { useState } from "react";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import styles from './CustomSearchinput.module.scss'
const CustomSearchInput: React.FC<{ searchFunction?: any }> = ({
  searchFunction,
}) => {
  const [inputValue, setInputValue] = useState("");
  return (
    <div className={styles.search_input_wrapper}>
      <IconField iconPosition="left">
      <InputIcon className="pi pi-search" style={{padding:"0px 5px"}}> </InputIcon>
      <InputText
        placeholder="Search by user"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          searchFunction(e.target.value);
        }}
      />
    </IconField>
    </div>
    
  );
};

export default CustomSearchInput;
