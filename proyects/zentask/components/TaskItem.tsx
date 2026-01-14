import React, { useState } from 'react';
import { Check, Trash2, Edit2, Sparkles, Save, Calendar, GripVertical, Bell, Repeat, CornerDownRight, Tag, AlertCircle, ListPlus, ArrowUpToLine, ArrowDownToLine, Copy, Loader2 } from 'lucide-react';
import { Task, Priority, TaskStatus, Language } from '../types';
import { RichInput } from './RichInput';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string, newHtml?: string) => void;
  onBreakdown: (id: string) => Promise<void>;
  onAddSubtask: (parentId: string, text: string, html: string, priority: Priority) => void;
  onMove: (id: string, direction: 'top' | 'bottom') => void;
  onCopy: (id: string) => void;
  isDraggable: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
  labels: {
    edit: string;
    magic: string;
    delete: string;
    overdue: string;
    today: string;
    addSubtask: string;
    statusTodo: string;
    statusInProgress: string;
    statusBlocked: string;
    statusDone: string;
    moveTop: string;
    moveBottom: string;
    copy: string;
  };
  depth?: number;
  language: Language;
}

export const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  onToggle, 
  onStatusChange,
  onDelete, 
  onEdit,
  onBreakdown,
  onAddSubtask,
  onMove,
  onCopy,
  isDraggable,
  onDragStart,
  onDragOver,
  onDrop,
  labels,
  depth = 0,
  language
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [editHtml, setEditHtml] = useState(task.html || task.text);
  
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskHtml, setNewSubtaskHtml] = useState('');
  const [newSubtaskText, setNewSubtaskText] = useState('');

  const [isBreakingDown, setIsBreakingDown] = useState(false);

  const handleSave = () => {
    if (editText.trim()) {
      onEdit(task.id, editText.trim(), editHtml);
      setIsEditing(false);
    }
  };

  const handleSubtaskSubmit = () => {
    if (newSubtaskText.trim()) {
      onAddSubtask(task.id, newSubtaskText, newSubtaskHtml, task.priority);
      setNewSubtaskText('');
      setNewSubtaskHtml('');
      setIsAddingSubtask(false);
    }
  };

  const handleBreakdown = async () => {
    setIsBreakingDown(true);
    await onBreakdown(task.id);
    setIsBreakingDown(false);
  };

  const getDueDateStatus = () => {
    if (!task.dueDate) return null;
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate);
    const dueDay = new Date(task.dueDate);
    dueDay.setHours(0, 0, 0, 0);

    const isOverdue = due < now && !task.completed;
    const isToday = dueDay.getTime() === today.getTime();
    
    const timeString = due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = due.toLocaleDateString();

    if (isOverdue) return { color: 'text-red-500 font-medium', label: `${labels.overdue} (${dateString} ${timeString})` };
    if (isToday && !task.completed) return { color: 'text-amber-600', label: `${labels.today}, ${timeString}` };
    
    return { color: 'text-slate-400', label: `${dateString} ${timeString}` };
  };

  const dateStatus = getDueDateStatus();
  const isOverdue = task.dueDate && task.dueDate < Date.now() && !task.completed;

  const priorityColors = {
    high: 'border-l-4 border-l-red-500',
    medium: 'border-l-4 border-l-amber-400',
    low: 'border-l-4 border-l-slate-300'
  };

  const priorityIconColors = {
    high: 'text-red-500',
    medium: 'text-amber-400',
    low: 'text-slate-300'
  };

  const statusColors = {
    todo: 'bg-slate-100 text-slate-700 border-slate-200',
    'in-progress': 'bg-blue-50 text-blue-700 border-blue-200',
    blocked: 'bg-rose-50 text-rose-700 border-rose-200',
    done: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  let containerClasses = "";
  if (task.completed) {
      containerClasses = "border-slate-100 bg-slate-50/50";
  } else if (isOverdue) {
      containerClasses = `border-red-200 bg-red-50/30 shadow-sm hover:shadow-md hover:border-red-300 ${priorityColors[task.priority]}`;
  } else {
      containerClasses = `border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 ${priorityColors[task.priority]}`;
  }

  return (
    <div className={`mb-3 ${depth > 0 ? 'ml-6' : ''}`}>
      <div 
        className={`group relative flex items-start gap-3 p-4 bg-white border rounded-xl transition-all duration-200 ${containerClasses}`}
        draggable={isDraggable && depth === 0}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {isDraggable && depth === 0 && (
          <div className="mt-1 text-slate-300 cursor-grab active:cursor-grabbing hover:text-slate-500">
            <GripVertical size={20} />
          </div>
        )}
        
        <button 
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task.id);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-emerald-500 text-transparent'}`}
        >
          <Check size={14} strokeWidth={3} />
        </button>

        <div className="flex-1 min-w-0 flex flex-col">
          {isEditing ? (
            <div className="flex flex-col gap-2 w-full" onMouseDown={(e) => e.stopPropagation()}>
               <RichInput 
                value={editHtml}
                onChange={(html, text) => {
                  setEditHtml(html);
                  setEditText(text);
                }}
                className="w-full"
                language={language}
               />
               <div className="flex gap-2 justify-end">
                <button 
                  type="button"
                  onClick={handleSave} 
                  className="text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded text-xs flex items-center gap-1"
                >
                  <Save size={14} /> Save
                </button>
                <button 
                  type="button"
                  onClick={() => { setIsEditing(false); setEditText(task.text); setEditHtml(task.html || task.text); }} 
                  className="text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded text-xs"
                >
                  Cancel
                </button>
               </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <div 
                className={`text-base select-text transition-all duration-200 ${task.completed ? 'text-slate-400' : 'text-slate-700'}`}
                dangerouslySetInnerHTML={{ __html: task.completed ? `<strike>${task.html || task.text}</strike>` : (task.html || task.text) }}
                onClick={(e) => {
                   if (window.getSelection()?.toString().length === 0) {
                     e.stopPropagation();
                     onToggle(task.id);
                   }
                }}
                onMouseDown={(e) => e.stopPropagation()}
              />
              
              {task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {task.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                      <Tag size={8} className="mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5" onMouseDown={(e) => e.stopPropagation()}>
                <div className="relative group/status">
                   {task.status === 'in-progress' && (
                     <div className="absolute left-2 top-1/2 -translate-y-1/2 text-blue-700 pointer-events-none">
                       <Loader2 size={10} className="animate-spin" />
                     </div>
                   )}
                   <select 
                      value={task.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        onStatusChange(task.id, e.target.value as TaskStatus);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className={`appearance-none ${task.status === 'in-progress' ? 'pl-6' : 'pl-2'} pr-6 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border cursor-pointer focus:outline-none focus:ring-1 focus:ring-offset-0 focus:ring-indigo-300 ${statusColors[task.status]}`}
                   >
                     <option value="todo">{labels.statusTodo}</option>
                     <option value="in-progress">{labels.statusInProgress}</option>
                     <option value="blocked">{labels.statusBlocked}</option>
                     <option value="done">{labels.statusDone}</option>
                   </select>
                   <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-50">
                     <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                       <path d="m6 9 6 6 6-6"/>
                     </svg>
                   </div>
                </div>

                <div className={`flex items-center gap-1 text-xs font-medium capitalize ${priorityIconColors[task.priority]}`}>
                  <AlertCircle size={10} />
                  <span>{task.priority}</span>
                </div>

                {dateStatus && (
                  <div className={`flex items-center gap-1 text-xs ${dateStatus.color}`}>
                    <Calendar size={10} />
                    <span>{dateStatus.label}</span>
                  </div>
                )}
                {task.reminderOffset && !task.completed && (
                  <div className="flex items-center gap-1 text-xs text-indigo-400" title="Reminder active">
                    <Bell size={10} />
                  </div>
                )}
                {task.recurrence && task.recurrence !== 'none' && !task.completed && (
                  <div className="flex items-center gap-1 text-xs text-emerald-500" title={`Repeats ${task.recurrence}`}>
                    <Repeat size={10} />
                    <span className="capitalize">{task.recurrence}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div 
          className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isEditing ? 'hidden' : ''}`}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {!task.completed && (
            <>
               <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsAddingSubtask(!isAddingSubtask); }} 
                className={`p-2 rounded-lg transition-colors ${isAddingSubtask ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                title={labels.addSubtask}
              >
                <ListPlus size={16} />
              </button>
              
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); handleBreakdown(); }} 
                disabled={isBreakingDown}
                className={`p-2 rounded-lg transition-colors ${isBreakingDown ? 'text-indigo-400 animate-pulse' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'}`}
                title={labels.magic}
              >
                {isBreakingDown ? (
                   <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <Sparkles size={16} />
                )}
              </button>
            </>
          )}

          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} 
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title={labels.edit}
          >
            <Edit2 size={16} />
          </button>

          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onMove(task.id, 'top'); }} 
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title={labels.moveTop}
          >
            <ArrowUpToLine size={16} />
          </button>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onMove(task.id, 'bottom'); }} 
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title={labels.moveBottom}
          >
            <ArrowDownToLine size={16} />
          </button>

           <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onCopy(task.id); }} 
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title={labels.copy}
          >
            <Copy size={16} />
          </button>

          <button 
            type="button"
            onClick={(e) => { 
                e.stopPropagation(); 
                onDelete(task.id); 
            }} 
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title={labels.delete}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {isAddingSubtask && (
         <div 
            className="ml-10 mb-3 p-3 bg-slate-50 border border-slate-200 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200"
            onMouseDown={(e) => e.stopPropagation()}
         >
             <div className="flex gap-2">
               <CornerDownRight className="text-slate-300 mt-2" size={16} />
               <div className="flex-1">
                 <RichInput 
                    value={newSubtaskHtml}
                    onChange={(html, text) => {
                      setNewSubtaskHtml(html);
                      setNewSubtaskText(text);
                    }}
                    placeholder="Add a subtask..."
                    className="bg-white text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubtaskSubmit();
                      }
                    }}
                    language={language}
                 />
                 <div className="flex justify-end gap-2 mt-2">
                    <button 
                        type="button"
                        onClick={() => setIsAddingSubtask(false)} 
                        className="text-xs text-slate-500 hover:text-slate-700"
                    >
                        Cancel
                    </button>
                    <button 
                        type="button"
                        onClick={handleSubtaskSubmit} 
                        className="text-xs bg-slate-800 text-white px-3 py-1 rounded hover:bg-slate-700"
                    >
                        Add Subtask
                    </button>
                 </div>
               </div>
             </div>
         </div>
      )}

      {task.subtasks && task.subtasks.length > 0 && (
        <div className="relative">
          <div className="absolute left-[30px] top-0 bottom-4 w-px bg-slate-200" />
          
          {task.subtasks.map((subtask) => (
             <TaskItem
                key={subtask.id}
                task={subtask}
                onToggle={onToggle}
                onStatusChange={onStatusChange}
                onDelete={onDelete}
                onEdit={onEdit}
                onBreakdown={onBreakdown}
                onAddSubtask={onAddSubtask}
                onMove={onMove}
                onCopy={onCopy}
                isDraggable={false}
                labels={labels}
                depth={depth + 1}
                language={language}
             />
          ))}
        </div>
      )}
    </div>
  );
};