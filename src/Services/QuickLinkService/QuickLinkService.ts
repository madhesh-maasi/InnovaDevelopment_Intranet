// import { sp } from "@pnp/sp";
import { SPLists } from "../../Config/config";
import SpServices from "../SPServices/SpServices";

const getQuickLinks = async () => {
  const items = await SpServices.SPReadItems({
    Listname: SPLists.QuickLinksList,
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

const addQuickLinks = async (
  payload: any,
  setQuickLinks: any,
  dispatch: any
) => {
  try {
    const addedItem = await SpServices.SPAddItem({
      Listname: SPLists.QuickLinksList,
      RequestJSON: {
        Title: payload.Title,
        Link: payload.Link,
      },
    });
    const itemId = addedItem?.data?.Id;
    if (!itemId) throw new Error("Failed to create item");
    debugger;
    await SpServices.SPAddAttachment({
      ListName: SPLists.QuickLinksList,
      ListID: itemId,
      FileName: payload.Logo.name,
      Attachments: payload.Logo,
    });

    const updated = await getQuickLinks();
    setQuickLinks(updated);
    dispatch(setQuickLinks(updated));
  } catch (error) {
    console.error("Error adding QuickLink with attachment:", error);
  }
};

export { getQuickLinks, addQuickLinks };
