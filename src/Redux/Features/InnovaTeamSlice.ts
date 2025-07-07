
import { createSlice } from "@reduxjs/toolkit";
import { IInnovaTeamType } from "../../Interface/InnovaTeamInterface";
const initialState = {
  innovaTeam: [] as IInnovaTeamType[],
};

const InnovaTeamSlice = createSlice({
  name: "InnovaTeamSlice",
  initialState,
  reducers: {
    setInnovaTeam: (state, action) => {
      state.innovaTeam = action.payload;
    },
  },
});
export const { setInnovaTeam } = InnovaTeamSlice.actions;
export default InnovaTeamSlice.reducer;
