/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
import * as React from "react";
import styles from "./CompanyValue.module.scss";
import type { ICompanyValueProps } from "./ICompanyValueProps";
import { Provider } from "react-redux";
import { store } from "../../../Redux/Store/Store";
import { useEffect, useState } from "react";
import { ICompanyValueType } from "../../../Interface/CompanyValueInterface";
import { FetchCompanyValue } from "../../../Services/CompanyValueService/CompanyValueService";
const CompanyValue: React.FC<ICompanyValueProps> = ({ context }) => {
  //   const companyValue = [
  //     {
  //       Title: "Integrity first",
  //       Description: `We operate with honesty and transparency in everything we do. Our clients and partners can expect
  // straightforward communication, fair pricing, and accountability at every project phase.`,
  //       ImgUrl: require("../assets/briefcase.png"),
  //     },
  //     {
  //       Title: "Client-Centered mindset",
  //       Description: `We view each project as a partnership. Listening to our clients' needs and exceeding expectations is our
  // standard—not a bonus. Their success is our success.`,
  //       ImgUrl: require("../assets/profile.png"),
  //     },
  //     {
  //       Title: "Innovation in execution",
  //       Description: `We operate with honesty and transparency in everything we do. Our clients and partners can
  // expect straightforward communication, fair pricing, and accountability at every project phase.`,
  //       ImgUrl: require("../assets/star.png"),
  //     },
  //     {
  //       Title: "Safety always",
  //       Description: `The well-being of our employees, subcontractors, and clients is paramount. We maintain strict safety
  // protocols and foster a culture where everyone is responsible for a safe work environment.`,
  //       ImgUrl: require("../assets/security.png"),
  //     },
  //   ];

  const [companyValue, setCompanyValue] = useState<ICompanyValueType[]>([]);
  const getCompanyValuedata = async () => {
    const companyvaluedata = await FetchCompanyValue();
    setCompanyValue(companyvaluedata);
  };
  useEffect(() => {
    getCompanyValuedata();
  }, []);
  return (
    <div className={styles.companyValueContainer}>
      {companyValue.map((value: any, index: number) => (
        <div
          key={index}
          className={`${styles.valueCard} ${
            index % 2 === 0 ? styles.leftAlign : styles.rightAlign
          }`}
        >
          <div>
            <img src={value.ImgUrl} alt={value.Title} className={styles.icon} />
          </div>
          <div className={styles.textWrapper}>
            <span>{value.Title}</span>
            <p>{value.Description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
export default (props: ICompanyValueProps): JSX.Element => (
  <Provider store={store}>
    <CompanyValue context={props.context} />
  </Provider>
);
