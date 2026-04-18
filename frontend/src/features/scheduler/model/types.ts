export type ViewMode = "week" | "month";
export type ScreenMode = "create" | "answer";
export type AnswerStatus = "ok" | "maybe" | "ng";

export type TimeSlot = {
  id: string;
  start: Date;
  end: Date;
};

export type GoogleEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
};

export type CandidateSlot = TimeSlot & {
  answer?: AnswerStatus;
};
