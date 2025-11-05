import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface DraftJob {
  title?: string;
  company?: string;
  type?: string;
  responsibilities?: string;
  logo: string;
  website: string;
  skills?: string;
  jobplace?: string;
  benefits?: string[];
  vacancies?: number;
  education?: string;
  salary?: string;
  location?: string;
  experience?: string;
  deadline?: string;
  lat?: number;
  lng?: number;
}

const initialState: { draft: DraftJob | null } = {
  draft: null,
};

const jobSlice = createSlice({
  name: "job",
  initialState,
  reducers: {
    saveDraftJob(state, action: PayloadAction<DraftJob>) {
      state.draft = action.payload;
    },
    clearDraftJob(state) {
      state.draft = null;
    },
  },
});

export const { saveDraftJob, clearDraftJob } = jobSlice.actions;
export default jobSlice.reducer;



// interface JobState {
//   draft: any | null;
// }

// const initialState: JobState = {
//   draft: null,
// };

// const jobSlice = createSlice({
//   name: "job",
//   initialState,
//   reducers: {
//     saveDraftJob: (state, action: PayloadAction<any>) => {
//       state.draft = action.payload;
//     },
//     clearDraftJob: (state) => {
//       state.draft = null;
//     },
//   },
// });
