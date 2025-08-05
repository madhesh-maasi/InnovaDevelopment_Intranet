import { configureStore } from "@reduxjs/toolkit";
import MainSPContext from "../Features/MainSPContextSlice";
import QuickLinkSlice from "../Features/QuickLinkSlice";
import FeedbackSlice from "../Features/FeedbackSlice";
import InnovaTeamSlice from "../Features/InnovaTeamSlice";
import MeetingSlice from "../Features/MeetingSlice";
import TableOfContentSlice from "../Features/TableOfContentSlice";
import TrainingSlice from "../Features/TrainingSlice";
const store = configureStore({
  reducer: {
    MainSPContext: MainSPContext,
    QuickLinkSlice: QuickLinkSlice,
    FeedbackSlice: FeedbackSlice,
    InnovaTeamSlice: InnovaTeamSlice,
    MeetingSlice: MeetingSlice,
    TableOfContent: TableOfContentSlice,
    Training: TrainingSlice,
  },
  devTools: false,
});

export { store };
