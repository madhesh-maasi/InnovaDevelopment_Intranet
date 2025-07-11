/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SPLists } from "../../Config/config";
import SpServices from "../SPServices/SpServices";

const getSubDepartmentQuickLinks = async () => {
  const items = await SpServices.SPReadItems({
    Listname: SPLists.SubDepartmentQuickLinkList,
    Expand: "AttachmentFiles",
    Select: "Title,Link,AttachmentFiles",
  });

  const formatted = items.map((item: any) => {
    return {
      Title: item.Title,
      Link: item.Link,
      Logo:
        item.AttachmentFiles.length > 0
          ? item.AttachmentFiles[0].ServerRelativeUrl
          : "",
    };
  });

  return formatted;
};

const addSubDepartmentQuickLinks = async (
  payload: any,
  setSubDepartmentQuickLinks: any
) => {
  try {
    const addedItem = await SpServices.SPAddItem({
      Listname: SPLists.SubDepartmentQuickLinkList,
      RequestJSON: {
        Title: payload.Title,
        Link: payload.Link,
      },
    });
    const itemId = addedItem?.data?.Id;
    if (!itemId) throw new Error("Failed to create item");
    await SpServices.SPAddAttachment({
      ListName: SPLists.SubDepartmentQuickLinkList,
      ListID: itemId,
      FileName: payload.Logo.name,
      Attachments: payload.Logo,
    });

    const updated = await getSubDepartmentQuickLinks();
    setSubDepartmentQuickLinks(updated);
  } catch (error) {
    console.error("Error adding QuickLink with attachment:", error);
  }
};

export { getSubDepartmentQuickLinks, addSubDepartmentQuickLinks };
