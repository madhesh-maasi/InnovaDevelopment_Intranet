import * as React from "react";
import { memo } from "react";
import styles from "./CustomaddBtn.module.scss";
type CustomAddBtnProps = {
  onClick?: () => void; // properly typed onClick prop
};

const CustomaddBtn: React.FC<CustomAddBtnProps> = ({ onClick }) => {
  return (
    <div className={styles.customplusbutton} onClick={onClick}>
      <i className="fa-solid fa-plus"></i>
    </div>
  );
};

export default memo(CustomaddBtn);
