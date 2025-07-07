import { createSlice } from "@reduxjs/toolkit";
import { IMeetingItem } from "../../Interface/MeetingInterface";
const initialState = {
  MeetingType: [] as IMeetingItem[],
};

const MeetingSlice = createSlice({
  name: "MeetingSlice",
  initialState,
  reducers: {
    setMeetingItem: (state, action) => {
      state.MeetingType = action.payload;
    },
  },
});
export const { setMeetingItem } = MeetingSlice.actions;
export default MeetingSlice.reducer;
