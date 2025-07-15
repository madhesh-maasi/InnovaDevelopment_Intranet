import { sp } from "@pnp/sp";
import { SPLibrary, SPLists } from "../../Config/config";
import { IMeetingItem } from "../../Interface/MeetingInterface";
import SpServices from "../SPServices/SpServices";
import { setMeetingItem } from "../../Redux/Features/MeetingSlice";

// console.log("uploadToMeetingAttachments called:", videoFile);
// debugger;
// try {
//   const fileAddResult = await sp.web
//     .getFolderByServerRelativeUrl("MeetingAttachments") // no folders
//     .files.add(videoFile.name, videoFile, true); // overwrite = true

//   console.log("FileResult", fileAddResult);
//   const item = await fileAddResult.file.getItem(); // Get associated item
//   return item; // This is the ID used in the lookup field
// } catch (error) {
//   console.error("Error uploading video:", error);
//   throw error;
// }

const uploadToMeetingAttachments = async (videoFile: any) => {
  try {
    const fileAddResult = await sp.web
      .getFolderByServerRelativePath("MeetingAttachments")
      .files.addUsingPath(videoFile.name, videoFile.content, {
        Overwrite: true,
      });

    // Await the metadata directly, no mixing of .then()
    const item = await (await fileAddResult.file.getItem())(); // Await the proxy call
    // console.log("Uploaded Data", item);

    const fileDetails = await fileAddResult.file.select(
      "Name",
      "ID",
      "ServerRelativeUrl",
      "TimeCreated"
    )();
    // console.log("FileDetails", fileDetails);
    const metadata = {
      FileType: "Video",
      Id: item?.ID, // Use the awaited object here
      FileName: fileDetails?.Name,
      FileUrl: `${window.location.origin}${fileDetails?.ServerRelativeUrl}`,
      UploadedDate: fileDetails?.TimeCreated,
    };
    // console.log("Returned upload metadata:", metadata);
    return metadata;
  } catch (error) {
    console.error("Error uploading file and extracting metadata:", error);
    return null;
  }
};
const addToMeetingList = async (
  payloadData: any,
  setMeetingsData: any,
  dispatch: any,
  toastRef?: any
) => {
  const requestPayload = {
    Title: payloadData.FileType,
    Link: payloadData.FileUrl,
    LinkName: payloadData.FileName,
    MeetingAttachmentsOfId: payloadData.Id,
  };

  await SpServices.SPAddItem({
    Listname: SPLists.MeetingList,
    RequestJSON: requestPayload,
  }).then(() => {
    toastRef?.current?.show({
      severity: "success",
      summary: "Success",
      detail: "Meeting data added successfully!",
      life: 3000,
    });
  });
  const localStateData = {
    Type: payloadData.FileType,
    FileName: payloadData.FileName,
    FileUrl: payloadData.FileUrl,
    Date: payloadData.UploadedDate,
  };
  setMeetingsData((prev: any[]) => [...prev, localStateData]);
  dispatch(setMeetingItem(localStateData));
};

const FetchMeetingsData = async (Type?: any): Promise<IMeetingItem[]> => {
  const isView = Type === "View";
  const items = await SpServices.SPReadItems({
    Listname: SPLists.MeetingList,
    Expand: "MeetingAttachmentsOf",
    Select: "ID,Title,Link,Created,MeetingAttachmentsOf/Id,LinkName",
    Orderby: "ID",
    Orderbydecorasc: false,
    Topcount: isView ? 5000 : 5,
  });

  const formatted: IMeetingItem[] = [];

  for (const item of items) {
    // console.log("Data from meeting", items);

    if (item.Title === "Link") {
      formatted.push({
        Type: "Link",
        FileName: item.LinkName || "Unknown Link",
        FileUrl: item.Link,
        Date: item.Created,
      });
    } else if (item.Title === "Video" && item.LinkName) {
      const fileItem = await SpServices.SPReadItems({
        Listname: SPLibrary.MeetingLibrary,
        Filter: `Id eq ${item.MeetingAttachmentsOf?.Id}`,
        Select: "FileLeafRef,FileRef",
      });
      // console.log("FileItems", fileItem);

      const file = fileItem.find((file) => file.FileLeafRef === item.LinkName); // or item.FileName
      formatted.push({
        Type: "Video",
        FileName: file?.FileLeafRef || "Unknown Video",
        FileUrl: `${window.location.origin}${file?.FileRef}`,
        Date: item.Created,
      });
    }
  }

  return formatted;
};

export { FetchMeetingsData, uploadToMeetingAttachments, addToMeetingList };
