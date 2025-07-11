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
const addTableOfContent = async (
  payload: any,
  setTableData: any,
  dispatch: any
) => {
  const requestPayload = {
    Title: payload.RoleGuide,
    DepartmentProcess: payload.DepartmentProcess,
    SOP: payload.SOP,
  };
  await SpServices.SPAddItem({
    Listname: SPLists.TableOfContentList,
    RequestJSON: requestPayload,
  });
  setTableData((prev: any[]) => [payload, ...prev]);
  dispatch(setTableOfContent(payload));
};
const updateTableOfContent = async (
  updateItemId: any,
  payload: any,
  getTableOfContentData: any
) => {
  debugger;
  const requestPayload = {
    Title: payload.RoleGuide,
    DepartmentProcess: payload.DepartmentProcess,
    SOP: payload.SOP,
  };
  console.log("update id", updateItemId);
  await SpServices.SPUpdateItem({
    Listname: SPLists.TableOfContentList,
    RequestJSON: requestPayload,
    ID: updateItemId,
  })
    .then((res: any) => {
      getTableOfContentData();
      console.log("Succesfully updated");
    })
    .catch((err: any) => {
      console.log("Error while updating", err);
    });
};
const deleteTableOfContent = async (
  deleteItemId: any,
  setAllData: any,
  allData: any
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
};
export {
  FetchTableOfContentData,
  addTableOfContent,
  updateTableOfContent,
  deleteTableOfContent,
};
