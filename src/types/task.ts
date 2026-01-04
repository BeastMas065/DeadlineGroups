export type TaskType = 'solo' | 'group';
export type TaskStatus = 'upcoming' | 'active' | 'completed' | 'expired';

export interface TaskUpdate {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface GroupMember {
  id: string;
  name: string;
  joinedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
  deadline: Date;
  createdAt: Date;
  creatorId: string;
  creatorName: string;
  groupLink?: string;
  members?: GroupMember[];
  updates?: TaskUpdate[];
  subtasks?: Subtask[];
}
