/* eslint-disable @typescript-eslint/no-explicit-any*/
import * as React from "react";
import styles from "./Quicklinks.module.scss";
import { IQuickLink } from "../../Interface/BannerInterface";
import { useSelector } from "react-redux/es/hooks/useSelector";

const Quicklinks: React.FC<IQuickLink> = (props: any) => {
  const tenantUrl = useSelector(
    (state: any) => state?.MainSPContext?.tenantUrl
  );
  const imgUrl = props.Logo ? `${tenantUrl}${props.Logo}` : "";
  return (
    <>
      {props?.Module === "SubDepartment" ? (
        <a
          href={props.Link}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.quickLinkcard}
        >
          <div className={styles.imageTag}>
            <img src={imgUrl} width="60px" height="60px" alt={props.Title} />
          </div>
          <div className={styles.titleTagforDept}>{props.Title}</div>
        </a>
      ) : (
        <a
          href={props.Link}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.quickLinkcard}
        >
          <div className={styles.imageTag}>
            <img src={imgUrl} width="18px" height="18px" alt={props.Title} />
          </div>
          <div className={styles.titleTag}>{props.Title}</div>
        </a>
      )}
    </>
  );
};

export default Quicklinks;
