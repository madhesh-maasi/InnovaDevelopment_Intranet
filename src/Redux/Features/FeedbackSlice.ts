import { createSlice } from "@reduxjs/toolkit";
import { IFeedbacktype } from "../../Interface/FeedbackInterface";

const initialState = {
  feedbacks: [] as IFeedbacktype[],
};

const FeedbackSlice = createSlice({
  name: "FeedbackSlice",
  initialState,
  reducers: {
    setFeedbacksdata: (state, action) => {
      state.feedbacks = action.payload;
    },
  },
});

export const { setFeedbacksdata } = FeedbackSlice.actions;
export default FeedbackSlice.reducer;
