import * as React from "react";
import styles from "./DepartmentBanner.module.scss";
import type { IDepartmentBannerProps } from "./IDepartmentBannerProps";
import "../../../Config/style.css";
export default (props: IDepartmentBannerProps): JSX.Element => (
  <div className={styles.bannerContainer}>
    <div className={styles.titleWrapper}>Business Development</div>
  </div>
);
