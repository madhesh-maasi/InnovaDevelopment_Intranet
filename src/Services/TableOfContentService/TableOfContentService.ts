/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-useless-escape */

import { sp } from "@pnp/sp";
import { SPLists } from "../../Config/config";
import { ITableOfContentType } from "../../Interface/TableOfContentInterface";
import { setTableOfContent } from "../../Redux/Features/TableOfContentSlice";
import SpServices from "../SPServices/SpServices";

const FetchTableOfContentData = async () => {
  const items = await SpServices.SPReadItems({
    Listname: SPLists.TableOfContentList,
    Orderby: "ID",
    Orderbydecorasc: false,
    Filter: [{ FilterKey: "IsDeleted", Operator: "ne", FilterValue: "1" }],
  });
  const formattedData = items.map((data: any): ITableOfContentType => {
    return {
      Id: data.ID,
      RoleGuide: data.Title,
      DepartmentProcess: data.DepartmentProcess,
      SOP: data.SOP,
    };
  });
  return formattedData;
};
const createSitePage = async (roleGuide: string): Promise<string> => {
  const pageName = roleGuide
    .trim()
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
  const page = await web.addClientsidePage(pageName, roleGuide, "Article"); // or "Home"
  await page.save();

  const url = `${
    window.location.origin
  }${"/sites/InnovaDevelopments"}/SitePages/${pageName}.aspx`;
  return url;
};
const addTableOfContent = async (
  payload: any,
  setTableData: any,
  dispatch: any,
  toastRef?: any
) => {
  try {
    // Step 1: Create site page and get its URL
    const pageUrl = await createSitePage(payload.RoleGuide);

    // Step 2: Prepare list payload
    const requestPayload = {
      Title: payload.RoleGuide,
      DepartmentProcess: payload.DepartmentProcess,
      SOP: pageUrl,
    };

    // Step 3: Add item to SharePoint list and get the result (ID)
    const createdItem = await SpServices.SPAddItem({
      Listname: SPLists.TableOfContentList,
      RequestJSON: requestPayload,
    }).then();
    const newRow = {
      Id: createdItem?.data?.ID,
      RoleGuide: payload.RoleGuide,
      DepartmentProcess: payload.DepartmentProcess,
      SOP: pageUrl,
    };
    toastRef?.current?.show({
      severity: "success",
      summary: "Success",
      detail: "Item added successfully!",
      life: 3000,
    });
    setTableData((prev: any[]) => [newRow, ...prev]);
    dispatch(setTableOfContent(newRow));
  } catch (err) {
    console.error("Error while adding the data", err);
  }
};

const updateTableOfContent = async (
  updateItemId: any,
  payload: any,
  getTableOfContentData: any,
  toastRef?: any
) => {
  const requestPayload = {
    Title: payload.RoleGuide,
    DepartmentProcess: payload.DepartmentProcess,
    SOP: payload.SOP,
  };
  // console.log("update id", updateItemId);
  await SpServices.SPUpdateItem({
    Listname: SPLists.TableOfContentList,
    RequestJSON: requestPayload,
    ID: updateItemId,
  })
    .then((res: any) => {
      getTableOfContentData();
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
const deleteTableOfContent = async (
  deleteItemId: any,
  setAllData: any,
  allData: any,
  toastRef?: any
) => {
  await SpServices.SPUpdateItem({
    Listname: SPLists.TableOfContentList,
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
export {
  FetchTableOfContentData,
  addTableOfContent,
  updateTableOfContent,
  deleteTableOfContent,
};
