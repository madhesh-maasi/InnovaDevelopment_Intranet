import * as React from "react";
import styles from "./CustomHeader.module.scss";
interface CustomHeaderProps {
  Header: string;
  dropDown?: string;
  search?: string;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({ Header }) => {
  return (
    <>
      <div className={styles.webpartHeader}>{Header}</div>
    </>
  );
};

export default CustomHeader;
