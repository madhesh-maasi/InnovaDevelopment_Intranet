/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
import { SPLists } from "../../Config/config";
import SpServices from "../SPServices/SpServices";

const FetchCompanyValue = async () => {
  const items = await SpServices.SPReadItems({
    Listname: SPLists.CompanyValueList,
    Expand: "AttachmentFiles",
    Select: "Title,Description,AttachmentFiles",
  });

  const formatted = items.map((item: any) => {
    return {
      Title: item.Title,
      Description: item.Description,
      ImgUrl:
        item.AttachmentFiles.length > 0
          ? item.AttachmentFiles[0].ServerRelativeUrl
          : "",
    };
  });

  return formatted;
};
export { FetchCompanyValue };
