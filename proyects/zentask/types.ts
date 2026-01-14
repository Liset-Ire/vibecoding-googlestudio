export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';
export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in-progress' | 'blocked' | 'done';

export interface Task {
  id: string;
  text: string; // Plain text fallback/search
  html?: string; // Rich text content
  completed: boolean;
  status: TaskStatus;
  createdAt: number;
  dueDate?: number | null;
  reminderOffset?: number | null;
  recurrence?: RecurrenceType;
  priority: Priority;
  tags: string[];
  subtasks: Task[];
  overdueAlerted?: boolean;
  reminderAlerted?: boolean;
}

export type FilterType = 'all' | 'active' | 'completed';

export type SortOption = 'custom' | 'newest' | 'oldest' | 'due-date' | 'priority' | 'a-z' | 'z-a';

export type Language = 'en' | 'es';

export interface TaskActionProps {
  onToggle: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string, newHtml?: string) => void;
  onBreakdown: (id: string) => Promise<void>;
  onAddSubtask: (parentId: string, text: string, html: string, priority: Priority) => void;
  onMove: (id: string, direction: 'top' | 'bottom') => void;
  onCopy: (id: string) => void;
}