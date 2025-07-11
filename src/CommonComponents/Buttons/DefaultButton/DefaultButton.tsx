/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { memo } from "react";
import { Button } from "primereact/button";
import styles from "./DefaultButton.module.scss";
import "./DefaultButton.css";

interface Props {
  text: any;
  endIcon?: any;
  startIcon?: any;
  disabled?: boolean;
  btnType: "primaryBtn" | "closeBtn";
  onlyIcon?: boolean;
  title?: string;
  onClick?: any;
  type?: "button" | "submit" | "reset";
  style?: React.CSSProperties;
  className?: string;
}

const DefaultButton = ({
  text,
  btnType,
  endIcon,
  startIcon,
  disabled = false,
  title = "",
  onlyIcon = false,
  onClick,
  type = "button",
  style,
  className = "",
}: Props): JSX.Element => {
  // Define a mapping object for btnType to CSS classes
  const btnTypeClassMap: Record<Props["btnType"], string> = {
    primaryBtn: styles.primary,
    closeBtn: styles.closeBtn,
  };

  const buttonClass = `${styles.DefaultButtonWrapper} ${btnTypeClassMap[btnType]} ${className}`;

  return (
    <Button
      tooltip={title}
      tooltipOptions={{ position: "top" }}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
      iconPos="left"
      icon={onlyIcon ? startIcon : undefined}
      label={onlyIcon ? "" : text}
      type={type}
      style={{
        padding: "10px 20px",
        whiteSpace: "nowrap",
        fontSize: "14px",
        borderRadius: "4px !important",
        ...style,
      }}
    />
  );
};

export default memo(DefaultButton);
