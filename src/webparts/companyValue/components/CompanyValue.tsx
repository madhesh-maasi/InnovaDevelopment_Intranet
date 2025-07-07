import * as React from "react";
import styles from "./CompanyValue.module.scss";
import type { ICompanyValueProps } from "./ICompanyValueProps";
import { escape } from "@microsoft/sp-lodash-subset";
import { Provider } from "react-redux";
import { store } from "../../../Redux/Store/Store";
const CompanyValue: React.FC<ICompanyValueProps> = ({ context }) => {
  return <></>;
};
export default (props: ICompanyValueProps): JSX.Element => (
  <Provider store={store}>
    <CompanyValue context={props.context} />
  </Provider>
);
