/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-useless-escape */
import { sp } from "@pnp/sp";
import { SPLists } from "../../Config/config";
import SpServices from "../SPServices/SpServices";
import { ITrainingType } from "../../Interface/TrainingInterface";
import { setTraining } from "../../Redux/Features/TrainingSlice";

const FetchTrainingData = async () => {
  const items = await SpServices.SPReadItems({
    Listname: SPLists.TrainingList,
    Orderby: "ID",
    Orderbydecorasc: false,
    Filter: [{ FilterKey: "IsDeleted", Operator: "ne", FilterValue: "1" }],
  });
  const formattedData = items.map((data: any): ITrainingType => {
    return {
      Id: data.ID,
      Name: data.Title,
      URL: data.URL,
    };
  });
  return formattedData;
};
const createSitePage = async (Name: string): Promise<string> => {
  const pageName = Name.trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9\-]/g, ""); // sanitize filename
  const web = sp.web;
  try {
    const file = await web
      .getFileByServerRelativeUrl(`/SitePages/${pageName}`)
      .select("Exists")();
    if (file?.Exists) throw new Error("Page already exists!");
  } catch (err) {
    console.log(err);
  }
  const page = await web.addClientsidePage(pageName, Name, "Article"); // or "Home"
  await page.save();

  const url = `${
    window.location.origin
  }${"/sites/InnovaDevelopments"}/SitePages/${pageName}.aspx`;
  return url;
};
const addTraining = async (
  payload: any,
  setTableData: any,
  dispatch: any,
  toastRef?: any
) => {
  try {
    // Step 1: Create site page and get its URL
    const pageUrl = await createSitePage(payload.Name);

    // Step 2: Prepare list payload
    const requestPayload = {
      Title: payload.Name,
      URL: pageUrl,
    };

    // Step 3: Add item to SharePoint list and get the result (ID)
    const createdItem = await SpServices.SPAddItem({
      Listname: SPLists.TrainingList,
      RequestJSON: requestPayload,
    }).then();
    const newRow = {
      Id: createdItem?.data?.ID,
      Name: payload.Name,
      URL: pageUrl,
    };
    toastRef?.current?.show({
      severity: "success",
      summary: "Success",
      detail: "Item added successfully!",
      life: 3000,
    });
    setTableData((prev: any[]) => [newRow, ...prev]);
    dispatch(setTraining(newRow));
  } catch (err) {
    console.error("Error while adding the data", err);
  }
};
const updateTraining = async (
  updateItemId: any,
  payload: any,
  getTrainingData: any,
  toastRef?: any
) => {
  const requestPayload = {
    Title: payload.Name,
    URL: payload.URL,
  };
  await SpServices.SPUpdateItem({
    Listname: SPLists.TrainingList,
    RequestJSON: requestPayload,
    ID: updateItemId,
  })
    .then((res: any) => {
      getTrainingData();
      console.log("Succesfully updated");
      toastRef?.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Item Updated successfully!",
        life: 3000,
      });
    })
    .catch((err: any) => {
      console.log("Error while updating", err);
    });
};
const deleteTraining = async (
  deleteItemId: any,
  setAllData: any,
  allData: any,
  toastRef?: any
) => {
  await SpServices.SPUpdateItem({
    Listname: SPLists.TrainingList,
    RequestJSON: {
      IsDeleted: true,
    },
    ID: deleteItemId,
  }).then(() => {
    setAllData((prevData: any) =>
      prevData.filter((item: any) => item.Id !== deleteItemId)
    );
  });
  toastRef?.current?.show({
    severity: "success",
    summary: "Success",
    detail: "deleted successfully!",
    life: 3000,
  });
};
export { FetchTrainingData, addTraining, updateTraining, deleteTraining };
