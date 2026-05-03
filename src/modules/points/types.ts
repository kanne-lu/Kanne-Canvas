export interface PointsInfo {
  points: number;
  totalPoints: number;
  level: number;
  levelName: string;
  nextLevelPoints: number;
  todayCheckedIn: boolean;
  consecutiveCheckInDays: number;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  points: number;
  type: 'daily' | 'achievement' | 'special';
  completed: boolean;
  progress?: number;
  target?: number;
}

export interface TaskResult {
  success: boolean;
  pointsEarned: number;
  newTotalPoints: number;
  levelUp?: boolean;
  newLevel?: number;
}

export interface CheckInResult {
  success: boolean;
  pointsEarned: number;
  consecutiveDays: number;
  newTotalPoints: number;
}

export interface InviteResult {
  success: boolean;
  pointsEarned: number;
  newTotalPoints: number;
}

export interface PointsRecord {
  id: string;
  type: 'earn' | 'consume';
  amount: number;
  balance: number;
  description: string;
  createdAt: string;
}

export interface PointsAPI {
  getPointsInfo(): Promise<PointsInfo>;
  checkIn(): Promise<CheckInResult>;
  inviteFriend(email: string): Promise<InviteResult>;
  getPointsHistory(page: number, size: number): Promise<PointsRecord[]>;
  getTasks(): Promise<Task[]>;
  completeTask(taskId: string): Promise<TaskResult>;
}
