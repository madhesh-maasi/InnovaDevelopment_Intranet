/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

export const togglePopupVisibility = (
  setPopupController: any,
  index: number,
  action: "open" | "close",
  popupTitle?: any,
  popupWidth?: any,
  defaultCloseBtn?: boolean,
  popupData?: any
): void => {
  setPopupController((prev: any) =>
    prev.map((popup: any, popupIndex: any) =>
      popupIndex === index
        ? {
            ...popup,
            open: action === "open" ? true : false,
            popupTitle: popupTitle || popup.popupTitle,
            popupWidth: popupWidth || popup.popupWidth,
            defaultCloseBtn: defaultCloseBtn || popup.defaultCloseBtn,
            popupData: popupData || "",
          }
        : { ...popup }
    )
  );
};
