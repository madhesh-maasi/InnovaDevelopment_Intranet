/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-wrapper-object-types*/
import { createSlice } from "@reduxjs/toolkit";
import { IUserDetails } from "../../Interface/CommonInterface";
export interface IMainData {
  webUrl: string;
  tenantUrl: String;
  siteUrl: string;
  value: any[];
  currentUserDetails: IUserDetails;
}
const mainData: IMainData = {
  webUrl: "",
  tenantUrl: "",
  siteUrl: "",
  value: [],
  currentUserDetails: {
    Id: null,
    ImgUrl: "",
    DisplayName: "",
    Email: "",
  },
};

const MainSPContext = createSlice({
  name: "MainSPContext",
  initialState: mainData,
  reducers: {
    setWebUrl: (state, action) => {
      state.webUrl = action.payload;
    },
    setTenantUrl: (state, action) => {
      state.tenantUrl = action.payload;
    },
    setSiteUrl: (state, action) => {
      state.siteUrl = action.payload;
    },
    setMainSPContext: (state, action) => {
      state.value = action.payload;
    },
    setCurrentUserDetails: (state, payload) => {
      state.currentUserDetails = payload.payload;
    },
  },
});

export const {
  setMainSPContext,
  setCurrentUserDetails,
  setWebUrl,
  setTenantUrl,
  setSiteUrl,
} = MainSPContext.actions;
export default MainSPContext.reducer;
