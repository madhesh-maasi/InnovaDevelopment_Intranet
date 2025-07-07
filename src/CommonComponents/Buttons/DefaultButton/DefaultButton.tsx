/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { Button, ButtonProps } from "@mui/material";
import styles from "./DefaultButton.module.scss";
import { memo } from "react";

interface Props extends ButtonProps {
  text: any;
  endIcon?: any;
  startIcon?: any;
  disabled?: boolean;
  btnType: "primaryBtn" |  "closeBtn";
  onlyIcon?: boolean;
  title?: string;
}

const DefaultButton = ({
  text,
  btnType,
  endIcon,
  startIcon,
  disabled,
  title,
  onlyIcon = false,
  ...rest
}: Props): JSX.Element => {
  // Define a mapping object for btnType to CSS classes
  const btnTypeClassMap: Record<Props["btnType"], string> = {
    primaryBtn: styles.primary,
    closeBtn: styles.closeBtn,
  };

  // Dynamically select the CSS class based on btnType
  const buttonClass = `${styles.DefaultButtonWrapper} ${btnTypeClassMap[btnType]}`;

  return (
    <Button
      title={title !== "" ? title : ""}
      className={buttonClass}
      variant="outlined"
      {...rest}
      endIcon={endIcon}
      startIcon={startIcon}
      disabled={disabled}
      sx={{
        padding: "10px 20px",
        whiteSpace: "nowrap",
        fontSize: "14px",
        borderRadius:"5px"
      }}
    >
      {text}
    </Button>
  );
};

export default memo(DefaultButton);
