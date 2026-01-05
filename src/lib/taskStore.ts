import { Task, TaskStatus, TaskUpdate, Subtask, GroupMember, FocusSession } from '@/types/task';

const STORAGE_KEY = 'deadline-groups-tasks';
const USER_KEY = 'deadline-groups-user';

export const generateId = () => Math.random().toString(36).substring(2, 15);

export const generateGroupLink = (taskId: string) => {
  return `${window.location.origin}/join/${taskId}`;
};

export const getCurrentUser = () => {
  const stored = localStorage.getItem(USER_KEY);
  if (stored) return JSON.parse(stored);
  
  const user = {
    id: generateId(),
    name: `User_${generateId().substring(0, 4)}`,
  };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
};

export const getTasks = (): Task[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  const tasks = JSON.parse(stored) as Task[];
  return tasks.map(task => ({
    ...task,
    deadline: new Date(task.deadline),
    createdAt: new Date(task.createdAt),
    members: task.members?.map(m => ({ ...m, joinedAt: new Date(m.joinedAt) })),
    updates: task.updates?.map(u => ({ ...u, timestamp: new Date(u.timestamp) })),
  }));
};

export const saveTasks = (tasks: Task[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

export const getTaskStatus = (task: Task): TaskStatus => {
  const now = new Date();
  const deadline = new Date(task.deadline);
  
  if (task.status === 'completed') return 'completed';
  if (now > deadline) return 'expired';
  
  // Active if within 1 hour of deadline or past start
  const oneHourBefore = new Date(deadline.getTime() - 60 * 60 * 1000);
  if (now >= oneHourBefore) return 'active';
  
  return 'upcoming';
};

export const createTask = (
  title: string,
  description: string,
  commitment: string,
  type: 'solo' | 'group',
  deadline: Date
): Task => {
  const user = getCurrentUser();
  const id = generateId();
  
  const task: Task = {
    id,
    title,
    description,
    commitment,
    type,
    status: 'upcoming',
    deadline,
    createdAt: new Date(),
    creatorId: user.id,
    creatorName: user.name,
    groupLink: type === 'group' ? generateGroupLink(id) : undefined,
    members: type === 'group' ? [{ id: user.id, name: user.name, joinedAt: new Date() }] : undefined,
    updates: [],
    subtasks: [],
  };
  
  const tasks = getTasks();
  tasks.push(task);
  saveTasks(tasks);
  
  return task;
};

export const joinTask = (taskId: string): Task | null => {
  const user = getCurrentUser();
  const tasks = getTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) return null;
  
  const task = tasks[taskIndex];
  if (task.type !== 'group') return null;
  if (getTaskStatus(task) !== 'upcoming') return null;
  
  const alreadyMember = task.members?.some(m => m.id === user.id);
  if (alreadyMember) return task;
  
  task.members = task.members || [];
  task.members.push({ id: user.id, name: user.name, joinedAt: new Date() });
  
  saveTasks(tasks);
  return task;
};

export const leaveTask = (taskId: string): boolean => {
  const user = getCurrentUser();
  const tasks = getTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) return false;
  
  const task = tasks[taskIndex];
  if (task.creatorId === user.id) return false; // Creator can't leave
  
  task.members = task.members?.filter(m => m.id !== user.id);
  saveTasks(tasks);
  return true;
};

export const addUpdate = (taskId: string, content: string): TaskUpdate | null => {
  const user = getCurrentUser();
  const tasks = getTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) return null;
  
  const task = tasks[taskIndex];
  if (getTaskStatus(task) !== 'active') return null;
  
  const update: TaskUpdate = {
    id: generateId(),
    userId: user.id,
    userName: user.name,
    content,
    timestamp: new Date(),
  };
  
  task.updates = task.updates || [];
  task.updates.push(update);
  saveTasks(tasks);
  
  return update;
};

export const addSubtask = (taskId: string, title: string): Subtask | null => {
  const tasks = getTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) return null;
  
  const subtask: Subtask = {
    id: generateId(),
    title,
    completed: false,
  };
  
  tasks[taskIndex].subtasks = tasks[taskIndex].subtasks || [];
  tasks[taskIndex].subtasks.push(subtask);
  saveTasks(tasks);
  
  return subtask;
};

export const toggleSubtask = (taskId: string, subtaskId: string): boolean => {
  const tasks = getTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) return false;
  
  const task = tasks[taskIndex];
  if (getTaskStatus(task) !== 'active') return false;
  
  const subtask = task.subtasks?.find(s => s.id === subtaskId);
  if (!subtask) return false;
  
  subtask.completed = !subtask.completed;
  saveTasks(tasks);
  return true;
};

export const completeTask = (taskId: string): boolean => {
  const tasks = getTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) return false;
  
  tasks[taskIndex].status = 'completed';
  saveTasks(tasks);
  return true;
};

export const getTask = (taskId: string): Task | null => {
  const tasks = getTasks();
  return tasks.find(t => t.id === taskId) || null;
};

export const addFocusSession = (taskId: string, duration: number): FocusSession | null => {
  const tasks = getTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) return null;
  
  const session: FocusSession = {
    id: generateId(),
    startTime: new Date(Date.now() - duration * 1000),
    endTime: new Date(),
    duration,
    completed: true,
  };
  
  tasks[taskIndex].focusSessions = tasks[taskIndex].focusSessions || [];
  tasks[taskIndex].focusSessions.push(session);
  saveTasks(tasks);
  
  return session;
};

export const updateManualProgress = (taskId: string, progress: number): boolean => {
  const tasks = getTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) return false;
  
  tasks[taskIndex].manualProgress = Math.max(0, Math.min(100, progress));
  saveTasks(tasks);
  return true;
};
