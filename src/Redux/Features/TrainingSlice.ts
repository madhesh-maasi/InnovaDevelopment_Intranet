import { createSlice } from "@reduxjs/toolkit";
import { ITrainingType } from "../../Interface/TrainingInterface";
const initialState = {
  training: [] as ITrainingType[],
};

const Training = createSlice({
  name: "Training",
  initialState,
  reducers: {
    setTraining: (state, action) => {
      state.training = action.payload;
    },
  },
});
export const { setTraining } = Training.actions;
export default Training.reducer;
