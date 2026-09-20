export type Habit = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  schedule_days?: number[] | null;
  created_at: string;
};

export type Completion = {
  id: string;
  habit_id: string;
  user_id: string;
  date: string;
  done: boolean;
};

export type HabitWithCompletions = Habit & {
  completions: Completion[];
  streak: number;
};
