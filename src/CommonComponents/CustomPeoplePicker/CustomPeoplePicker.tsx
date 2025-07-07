/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-floating-promises*/
/* eslint-disable @typescript-eslint/no-unused-expressions*/
import * as React from "react";
import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { useSelector } from "react-redux";
import { memo, useState, useEffect } from "react";
import styles from "./CustomPeoplePicker.module.scss";
import "./CustomPeoplePicker.css";
interface ICustomPeoplePickerProps {
  selectedItem?: any[];
  onChange?: (value: any[], filter?: boolean) => void;
  placeholder?: string;
  personSelectionLimit?: number;
  filter?: boolean;
  disabled?: boolean;
  minHeight?: string;
  maxHeight?: string;
}

const CustomPeoplePicker: React.FC<ICustomPeoplePickerProps> = ({
  selectedItem = [],
  onChange,
  placeholder = "Search by User",
  filter,
  personSelectionLimit = 1,
  disabled = false,
}) => {
  const context: any = useSelector((state: any) => state.MainSPContext.value);
  const webUrl: string = useSelector(
    (state: any) => state?.MainSPContext?.webUrl
  );
  const [pickerKey, setPickerKey] = useState<number>(0);
  useEffect(() => {
    if (selectedItem.length === 0) setPickerKey((prev) => prev + 1);
  }, [selectedItem, filter]);
  if (!context || !webUrl) return null;

  const handleChange = (items: any[], filter?: boolean) => {
    const users = items.map((item) => ({
      Id: item.id,
      Email: item.secondaryText,
      DisplayName: item.text,
    }));
    onChange?.(users, filter);
  };

  const defaultSelectedUsers = selectedItem.map(
    (item: any) => item.secondaryText || item.Email || item.email
  );

  return (
    <div className={styles.customPickerInput}>
      <PeoplePicker
        key={pickerKey}
        context={context}
        webAbsoluteUrl={webUrl}
        personSelectionLimit={personSelectionLimit}
        placeholder={placeholder}
        ensureUser={true}
        onChange={(items) => handleChange(items, filter)}
        principalTypes={[PrincipalType.User]}
        defaultSelectedUsers={defaultSelectedUsers}
        resolveDelay={500}
        disabled={disabled}
      />
    </div>
  );
};

export default memo(CustomPeoplePicker);
