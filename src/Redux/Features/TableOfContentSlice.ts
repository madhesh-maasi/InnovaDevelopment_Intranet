import { createSlice } from "@reduxjs/toolkit";
import { ITableOfContentType } from "../../Interface/TableOfContentInterface";
const initialState = {
  tableOfcontent: [] as ITableOfContentType[],
};

const TableOfContentSlice = createSlice({
  name: "TableOfContentSlice",
  initialState,
  reducers: {
    setTableOfContent: (state, action) => {
      state.tableOfcontent = action.payload;
    },
  },
});
export const { setTableOfContent } = TableOfContentSlice.actions;
export default TableOfContentSlice.reducer;
