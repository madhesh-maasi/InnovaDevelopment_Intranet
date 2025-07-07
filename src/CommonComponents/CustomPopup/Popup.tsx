/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */

import * as React from "react";
import { Dialog } from "primereact/dialog";
import styles from "./Popup.module.scss";
import { memo, useEffect } from "react";
import "./Popup.css";
import DefaultButton from "../Buttons/DefaultButton/DefaultButton";

interface Props {
  popupTitle?: string;
  PopupType: "QuickLinks" | "Meeting" | "Feedback" | "InnovaTeam" | "News";
  popupActions: PopupActionBtn[]; // Ensure type safety for popup actions
  defaultCloseBtn?: boolean;
  content?: React.ReactNode;
  response?: any;
  popupWidth?: string | number;
  onHide: () => void;
  visibility: boolean;
  confirmationTitle?: string;
  isLoading?: boolean;
  popupHeight?: boolean;
}

interface PopupActionBtn {
  text: string;
  endIcon?: React.ReactNode;
  startIcon?: React.ReactNode;
  disabled?: boolean;
  btnType: any;
  onClick: any;
}

const Popup = ({
  PopupType,
  popupActions,
  popupTitle,
  defaultCloseBtn,
  onHide,
  visibility,
  content,
  response = {
    Loading: false,
    Title: "",
    Message: "",
  },
  popupWidth,
  confirmationTitle,
  isLoading,
  popupHeight,
  ...btnRest
}: Props): JSX.Element => {
  const headerElement = (
    <div
      className={`${
        defaultCloseBtn
          ? styles.popupHeaderWithoutCloseIcon
          : styles.popupHeader
      }`}
    >
      <div className={styles.header}>{popupTitle}</div>
    </div>
  );

  const footerContent = (): JSX.Element => (
    <div className={styles.popupFooter}>
      {popupActions?.map((btn, id) => (
        <DefaultButton
          style={{
            minWidth: "85px",
            borderRadius: "5px",
          }}
          key={id}
          btnType={btn.btnType}
          text={btn.text}
          disabled={btn.disabled}
          endIcon={btn.endIcon}
          startIcon={btn.startIcon}
          onClick={btn.onClick}
          {...btnRest}
        />
      ))}
    </div>
  );

  const popupContent = <div className={styles.contentWrapper}>{content}</div>;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <Dialog
      closable={defaultCloseBtn}
      draggable={false}
      position="center"
      className={styles.popupWrapper}
      visible={visibility}
      modal
      header={
        popupTitle !== "Conversation" ? (
          headerElement
        ) : (
          <div className={styles.conversationHeader}>Feedback</div>
        )
      }
      style={{ width: popupWidth }}
      onHide={onHide}
      footer={popupTitle !== "Conversation" ? footerContent() : null}
    >
      {isLoading ? (
        <div className={styles.loaderWrapper}>
          <i className="pi pi-spin pi-spinner" style={{ fontSize: "2rem" }} />
        </div>
      ) : (
        popupContent
      )}
    </Dialog>
  );
};

export default memo(Popup);
