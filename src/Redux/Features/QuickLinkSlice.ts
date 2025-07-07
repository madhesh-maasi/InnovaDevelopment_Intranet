/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import { IQuickLink } from "../../Interface/BannerInterface";

const initialState = {
  quickLinks: [] as IQuickLink[],
};
const QuickLinkSlice = createSlice({
    name:"QuickLinkSlice",
    initialState,
    reducers:{
        setQuickLinks:(state,action)=>{
            state.quickLinks=action.payload;
        }
    }
})

export const {setQuickLinks}=QuickLinkSlice.actions;
export default QuickLinkSlice.reducer