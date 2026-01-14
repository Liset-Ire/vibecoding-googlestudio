import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, CheckCircle2, ArrowUpDown, Globe, Calendar as CalendarIcon, Clock, BellRing, Repeat, Tag, AlertCircle, Palette, HelpCircle, X, Trash2, AlertTriangle, Type, Minus, Plus as PlusIcon } from 'lucide-react';
import { Task, FilterType, SortOption, Language, RecurrenceType, Priority, TaskStatus } from './types';
import { TaskItem } from './components/TaskItem';
import { breakdownTaskWithAI, generateLogoWithAI } from './services/geminiService';
import { Button } from './components/Button';
import { RichInput } from './components/RichInput';

const translations = {
  en: {
    title: "ZenTask",
    subtitle: "Stay focused, get things done.",
    placeholder: "What needs to be done?",
    filterAll: "All",
    filterActive: "Active",
    filterCompleted: "Completed",
    sortCustom: "Custom",
    sortNewest: "Newest",
    sortOldest: "Oldest",
    sortDueDate: "Due Date",
    sortPriority: "Priority",
    sortAZ: "A-Z",
    sortZA: "Z-A",
    itemsLeft: "left",
    noTasks: "No tasks found",
    noTasksSub: "Add a task to get started on your journey.",
    clearFilters: "Clear filters",
    clearCompleted: "Clear Completed",
    editTask: "Edit Task",
    magicBreakdown: "Magic Breakdown",
    addSubtask: "Add Subtask",
    deleteTask: "Delete Task",
    processing: "Processing...",
    overdue: "Overdue",
    today: "Today",
    time: "Time",
    reminder: "Notify me",
    remindNone: "None",
    remind15m: "15 min before",
    remind30m: "30 min before",
    remind1h: "1 hour before",
    remind2h: "2 hours before",
    remind1d: "1 day before",
    repeat: "Repeat",
    repeatNone: "No Repeat",
    repeatDaily: "Daily",
    repeatWeekly: "Weekly",
    repeatMonthly: "Monthly",
    taskOverdue: "Task Overdue",
    taskOverdueBody: "was not completed on time.",
    reminderTitle: "Task Reminder",
    reminderBody: "is due soon.",
    priorityHigh: "High",
    priorityMedium: "Medium",
    priorityLow: "Low",
    tagsPlaceholder: "Tags (comma separated)...",
    genLogo: "Generate Theme Logo",
    help: "Help & FAQ",
    faqTitle: "Frequently Asked Questions",
    confirmDelete: "Are you sure you want to delete this task?",
    statusTodo: "To Do",
    statusInProgress: "In Progress",
    statusBlocked: "Blocked",
    statusDone: "Done",
    cancel: "Cancel",
    delete: "Delete",
    deleteTitle: "Delete Task?",
    deleteWarning: "This action cannot be undone.",
    moveTop: "Move to Top",
    moveBottom: "Move to Bottom",
    copy: "Copy Task",
    taskCompleted: "Task Completed",
    taskCompletedBody: "Great job! You finished",
  },
  es: {
    title: "ZenTask",
    subtitle: "Mantente enfocado, termina tus tareas.",
    placeholder: "¿Qué necesitas hacer?",
    filterAll: "Todas",
    filterActive: "Activas",
    filterCompleted: "Completadas",
    sortCustom: "Personalizado",
    sortNewest: "Más recientes",
    sortOldest: "Más antiguas",
    sortDueDate: "Fecha de vencimiento",
    sortPriority: "Prioridad",
    sortAZ: "A-Z",
    sortZA: "Z-A",
    itemsLeft: "pendientes",
    noTasks: "No se encontraron tareas",
    noTasksSub: "Agrega una tarea para comenzar tu viaje.",
    clearFilters: "Limpiar filtros",
    clearCompleted: "Borrar completadas",
    editTask: "Editar tarea",
    magicBreakdown: "Desglose Mágico",
    addSubtask: "Agregar Subtarea",
    deleteTask: "Eliminar tarea",
    processing: "Procesando...",
    overdue: "Vencida",
    today: "Hoy",
    time: "Hora",
    reminder: "Notificarme",
    remindNone: "Ninguno",
    remind15m: "15 min antes",
    remind30m: "30 min antes",
    remind1h: "1 hora antes",
    remind2h: "2 horas antes",
    remind1d: "1 día antes",
    repeat: "Repetir",
    repeatNone: "No repetir",
    repeatDaily: "Diariamente",
    repeatWeekly: "Semanalmente",
    repeatMonthly: "Mensualmente",
    taskOverdue: "Tarea Vencida",
    taskOverdueBody: "no se completó a tiempo.",
    reminderTitle: "Recordatorio",
    reminderBody: "vence pronto.",
    priorityHigh: "Alta",
    priorityMedium: "Media",
    priorityLow: "Baja",
    tagsPlaceholder: "Etiquetas (separadas por coma)...",
    genLogo: "Generar Logo del Tema",
    help: "Ayuda y Preguntas",
    faqTitle: "Preguntas Frecuentes",
    confirmDelete: "¿Estás seguro de que quieres eliminar esta tarea?",
    statusTodo: "Por Hacer",
    statusInProgress: "En Progreso",
    statusBlocked: "Bloqueada",
    statusDone: "Hecho",
    cancel: "Cancelar",
    delete: "Eliminar",
    deleteTitle: "¿Eliminar tarea?",
    deleteWarning: "Esta acción no se puede deshacer.",
    moveTop: "Mover al principio",
    moveBottom: "Mover al final",
    copy: "Copiar tarea",
    taskCompleted: "Tarea Completada",
    taskCompletedBody: "¡Buen trabajo! Terminaste",
  }
};

const faqs = {
  en: [
    { q: "How do I add a new task?", a: "Type your task in the input box at the top. You can add rich text (bold, italics), date, time, priority, and tags, then click the + button or press Enter." },
    { q: "How do recurring tasks work?", a: "Select a frequency (Daily, Weekly, Monthly) from the repeat dropdown. When you complete the task, a new instance is automatically created for the next scheduled date." },
    { q: "What is Magic Breakdown?", a: "It uses AI to analyze your task and split it into smaller, actionable subtasks automatically. Click the sparkles icon on a task to use it." },
    { q: "How do I create a custom logo?", a: "Click the palette icon in the header. The AI will generate a unique minimalist logo for your list based on the app theme." },
    { q: "Can I add subtasks manually?", a: "Yes, hover over a task and click the 'Add Subtask' icon (list with plus sign) to add subtasks manually." },
    { q: "How does priority sorting work?", a: "Set a priority (High, Medium, Low) when creating a task. Use the sort dropdown to select 'Priority' to see High priority tasks at the top." },
    { q: "Where is my data stored?", a: "Your tasks are stored locally in your browser's Local Storage. They are not synced to the cloud, so they remain private to this device." },
    { q: "How do I use tags?", a: "Enter tags separated by commas in the tags input (e.g., 'work, urgent'). You can then filter tasks by clicking the tag buttons that appear below the input." },
    { q: "How do I edit a task?", a: "Click the pencil icon on a task to enter edit mode. You can modify the text, rich formatting, and save changes." },
    { q: "What do the notifications do?", a: "If you set a reminder time, the app will send a browser notification and play a sound when the task is due or at the specified reminder time." },
    { q: "What happens when I complete a task?", a: "A satisfying sound plays, and if permissions are granted, you get a browser notification to celebrate your progress." },
    { q: "What does the spinning icon mean in the status dropdown?", a: "It indicates that the task status is set to 'In Progress', helping you distinguish started tasks from to-do items." },
    { q: "How do I quickly move a task to the top?", a: "Click the 'Move to Top' button (arrow pointing to a line) in the task actions menu to instantly bring it to the beginning of the list." },
    { q: "How do I move a task to the bottom?", a: "Click the 'Move to Bottom' button (arrow pointing down to a line) to send the task to the end of the list." },
    { q: "Can I duplicate a task?", a: "Yes, click the 'Copy Task' icon (two overlapping squares). It creates a fresh copy with the same details but resets the status to 'To Do'." },
    { q: "Does copying a task also copy its subtasks?", a: "Yes, the entire hierarchy of subtasks is deep-copied, so you don't lose any detailed breakdown." },
    { q: "How do I adjust the text size?", a: "Use the font size controls (A- and A+) in the header to make the text larger or smaller according to your preference." },
    { q: "Why did my completed task reappear?", a: "It might be a recurring task. When you complete a recurring task, the next instance is automatically scheduled and added to your list." },
    { q: "Can I use a completed task as a template?", a: "Absolutely. Just click the 'Copy' button on a completed task to create a new active version of it." },
    { q: "What happens if I complete a main task with incomplete subtasks?", a: "The app will prompt you to confirm if you want to automatically mark all incomplete subtasks as done." }
  ],
  es: [
    { q: "¿Cómo agrego una nueva tarea?", a: "Escribe tu tarea en el campo de entrada. Puedes agregar texto enriquecido, fecha, hora, prioridad y etiquetas, luego haz clic en el botón + o presiona Enter." },
    { q: "¿Cómo funcionan las tareas recurrentes?", a: "Selecciona una frecuencia (Diaria, Semanal, Mensual) en el menú de repetición. Al completar la tarea, se crea automáticamente una nueva instancia para la siguiente fecha programada." },
    { q: "¿Qué es el Desglose Mágico?", a: "Usa IA para analizar tu tarea y dividirla en subtareas más pequeñas y accionables automáticamente. Haz clic en el icono de destellos en una tarea para usarlo." },
    { q: "¿Cómo creo un logo personalizado?", a: "Haz clic en el icono de paleta en el encabezado. La IA generará un logo minimalista único para tu lista basado en el tema de la aplicación." },
    { q: "¿Puedo agregar subtareas manualmente?", a: "Sí, pasa el cursor sobre una tarea y haz clic en el icono 'Agregar Subtarea' (lista con signo más) para añadir subtareas manualmente." },
    { q: "¿Cómo funciona el orden por prioridad?", a: "Establece una prioridad (Alta, Media, Baja) al crear una tarea. Usa el menú de ordenamiento para seleccionar 'Prioridad' y ver las tareas urgentes al principio." },
    { q: "¿Dónde se guardan mis datos?", a: "Tus tareas se guardan localmente en el almacenamiento de tu navegador. No se sincronizan en la nube, por lo que permanecen privadas en este dispositivo." },
    { q: "¿Cómo uso las etiquetas?", a: "Ingresa etiquetas separadas por comas en la entrada de etiquetas (ej. 'trabajo, urgente'). Luego puedes filtrar tareas haciendo clic en los botones de etiqueta." },
    { q: "¿Cómo edito una tarea?", a: "Haz clic en el icono de lápiz en una tarea para entrar al modo de edición. Puedes modificar el texto y el formato." },
    { q: "¿Qué hacen las notificaciones?", a: "Si estableces una hora de recordatorio, la aplicación enviará una notificación del navegador y reproducirá un sonido cuando la tarea venza o en el momento del recordatorio." },
    { q: "¿Qué sucede cuando completo una tarea?", a: "Se reproduce un sonido satisfactorio y, si hay permiso, recibes una notificación del navegador para celebrar tu progreso." },
    { q: "¿Qué significa el icono giratorio en el estado?", a: "Indica que el estado de la tarea es 'En Progreso', ayudándote a distinguir las tareas iniciadas de las pendientes." },
    { q: "¿Cómo muevo una tarea al principio rápidamente?", a: "Haz clic en el botón 'Mover al principio' (flecha hacia línea) para llevarla instantáneamente al inicio de la lista." },
    { q: "¿Cómo muevo una tarea al final?", a: "Haz clic en el botón 'Mover al final' para enviar la tarea al final de la lista." },
    { q: "¿Puedo duplicar una tarea?", a: "Sí, haz clic en el icono 'Copiar Tarea'. Crea una copia nueva con los mismos detalles pero reinicia el estado a 'Por Hacer'." },
    { q: "¿Copiar una tarea copia sus subtareas?", a: "Sí, se copia toda la jerarquía de subtareas, por lo que no pierdes ningún detalle del desglose." },
    { q: "¿Cómo ajusto el tamaño del texto?", a: "Usa los controles de tamaño de fuente (A- y A+) en el encabezado para agrandar o achicar el texto según tu preferencia." },
    { q: "¿Por qué reapareció mi tarea completada?", a: "Puede ser una tarea recurrente. Al completarse, se programa y agrega automáticamente la siguiente instancia a tu lista." },
    { q: "¿Puedo usar una tarea completada como plantilla?", a: "Absolutamente. Simplemente haz clic en el botón 'Copiar' en una tarea completada para crear una nueva versión activa." },
    { q: "¿Qué pasa si completo una tarea principal con subtareas incompletas?", a: "La aplicación te preguntará si deseas marcar automáticamente todas las subtareas incompletas como hechas." }
  ]
};

const App: React.FC = () => {
  // --- State ---
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('zenTask_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration: Add status if missing
      const migrate = (list: any[]): Task[] => list.map(t => ({
        ...t,
        status: t.status || (t.completed ? 'done' : 'todo'),
        subtasks: t.subtasks ? migrate(t.subtasks) : []
      }));
      return migrate(parsed);
    }
    return [];
  });
  
  const [logoUrl, setLogoUrl] = useState<string | null>(() => {
    return localStorage.getItem('zenTask_logo');
  });

  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('zenTask_fontSize');
    return saved ? parseInt(saved, 10) : 16;
  });
  
  // Modal State
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // Inputs
  const [inputHtml, setInputHtml] = useState('');
  const [inputText, setInputText] = useState('');
  const [inputDate, setInputDate] = useState('');
  const [inputTime, setInputTime] = useState('');
  const [reminderOffset, setReminderOffset] = useState<number>(0);
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [inputPriority, setInputPriority] = useState<Priority>('medium');
  const [inputTags, setInputTags] = useState('');

  // View Settings
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('custom');
  const [language, setLanguage] = useState<Language>('en');
  
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const t = translations[language];
  const currentFaqs = faqs[language];

  // --- Helpers for Tree Operations ---
  const updateTaskInTree = (taskList: Task[], id: string, updater: (t: Task) => Task): Task[] => {
    return taskList.map(task => {
      if (task.id === id) {
        return updater(task);
      }
      if (task.subtasks.length > 0) {
        return { ...task, subtasks: updateTaskInTree(task.subtasks, id, updater) };
      }
      return task;
    });
  };

  const findTask = (taskList: Task[], id: string): Task | null => {
    for (const task of taskList) {
      if (task.id === id) return task;
      const found = findTask(task.subtasks, id);
      if (found) return found;
    }
    return null;
  };

  const deleteTaskInTree = (taskList: Task[], id: string): Task[] => {
    return taskList.filter(task => task.id !== id).map(task => ({
      ...task,
      subtasks: deleteTaskInTree(task.subtasks, id)
    }));
  };

  const playSuccessSound = useCallback(() => {
    // Sound when completing a task
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => {
        // Autoplay policy might block this if no interaction, but usually clicking "complete" is interaction
        console.log("Audio play failed (interaction required):", e);
    });
  }, []);

  const notifySuccess = useCallback((taskText: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification(translations[language].taskCompleted, { 
            body: `${translations[language].taskCompletedBody} "${taskText}"` 
        });
    }
    playSuccessSound();
  }, [language, playSuccessSound]);

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('zenTask_data', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (logoUrl) {
      localStorage.setItem('zenTask_logo', logoUrl);
    }
  }, [logoUrl]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    localStorage.setItem('zenTask_fontSize', fontSize.toString());
  }, [fontSize]);

  // Alarm Loop
  useEffect(() => {
    const checkAlarms = () => {
      const now = Date.now();
      let hasUpdates = false;

      const checkRecursive = (list: Task[]): { list: Task[], changed: boolean } => {
         let listChanged = false;
         const newList = list.map(task => {
            let updatedTask = { ...task };
            let taskChanged = false;

            // Recurse first
            if (updatedTask.subtasks.length > 0) {
                const subResult = checkRecursive(updatedTask.subtasks);
                if (subResult.changed) {
                    updatedTask.subtasks = subResult.list;
                    taskChanged = true;
                }
            }

            if (updatedTask.completed || !updatedTask.dueDate) return taskChanged ? updatedTask : task;

            // Check Reminder
            if (updatedTask.reminderOffset && !updatedTask.reminderAlerted) {
                const remindTime = updatedTask.dueDate - updatedTask.reminderOffset;
                if (now >= remindTime && now < updatedTask.dueDate) {
                     if ("Notification" in window && Notification.permission === "granted") {
                        new Notification(t.reminderTitle, { body: `"${updatedTask.text}" ${t.reminderBody}` });
                     }
                     const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                     audio.volume = 0.5;
                     audio.play().catch(e => {});
                     updatedTask.reminderAlerted = true;
                     taskChanged = true;
                }
            }

            // Check Overdue
            if (now >= updatedTask.dueDate && !updatedTask.overdueAlerted) {
                 if ("Notification" in window && Notification.permission === "granted") {
                    new Notification(t.taskOverdue, { body: `"${updatedTask.text}" ${t.taskOverdueBody}` });
                 }
                 const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                 audio.play().catch(e => {});
                 updatedTask.overdueAlerted = true;
                 taskChanged = true;
            }
            
            if (taskChanged) listChanged = true;
            return taskChanged ? updatedTask : task;
         });
         return { list: newList, changed: listChanged };
      };

      setTasks(current => {
          const res = checkRecursive(current);
          return res.changed ? res.list : current;
      });
    };

    const intervalId = setInterval(checkAlarms, 10000); 
    return () => clearInterval(intervalId);
  }, [language, t]);


  // --- Actions ---
  const handleGenerateLogo = async () => {
    setIsGeneratingLogo(true);
    const url = await generateLogoWithAI();
    if (url) {
      setLogoUrl(url);
    }
    setIsGeneratingLogo(false);
  };

  const handleAddTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    let dueDate: number | null = null;
    if (inputDate) {
      const dateObj = new Date(inputDate);
      if (inputTime) {
        const [hours, minutes] = inputTime.split(':').map(Number);
        dateObj.setHours(hours, minutes, 0, 0);
      } else {
        dateObj.setHours(12, 0, 0, 0);
      }
      dueDate = dateObj.getTime();
    }

    const tags = inputTags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: inputText.trim(),
      html: inputHtml,
      completed: false,
      status: 'todo',
      createdAt: Date.now(),
      dueDate: dueDate,
      reminderOffset: reminderOffset > 0 ? reminderOffset : null,
      recurrence: recurrence,
      priority: inputPriority,
      tags: tags,
      subtasks: [],
      overdueAlerted: false,
      reminderAlerted: false,
    };

    setTasks(prev => [newTask, ...prev]);
    
    // Reset inputs
    setInputText('');
    setInputHtml('');
    setInputDate('');
    setInputTime('');
    setReminderOffset(0);
    setRecurrence('none');
    setInputPriority('medium');
    setInputTags('');
    
    if ((newTask.dueDate || newTask.reminderOffset) && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  };

  const handleAddSubtask = (parentId: string, text: string, html: string, priority: Priority) => {
    const newSubtask: Task = {
      id: crypto.randomUUID(),
      text: text,
      html: html,
      completed: false,
      status: 'todo',
      createdAt: Date.now(),
      priority: priority,
      tags: [],
      subtasks: []
    };

    setTasks(prev => updateTaskInTree(prev, parentId, (parent) => ({
      ...parent,
      subtasks: [...parent.subtasks, newSubtask]
    })));
  };

  const changeTaskStatus = useCallback((id: string, status: TaskStatus) => {
    setTasks(prev => {
        const task = findTask(prev, id);
        if (!task) return prev;
        
        const isCompleted = status === 'done';
        if (isCompleted && !task.completed) {
            // Defer notification to avoid side-effect in render phase, or simply call it here
            setTimeout(() => notifySuccess(task.text), 0);
        }

        // Check recursion if completing
        if (isCompleted && task.recurrence && task.recurrence !== 'none') {
            const baseDate = task.dueDate ? new Date(task.dueDate) : new Date();
            if (task.recurrence === 'daily') baseDate.setDate(baseDate.getDate() + 1);
            else if (task.recurrence === 'weekly') baseDate.setDate(baseDate.getDate() + 7);
            else if (task.recurrence === 'monthly') baseDate.setMonth(baseDate.getMonth() + 1);

            const nextTask: Task = {
                ...task,
                id: crypto.randomUUID(),
                completed: false,
                status: 'todo',
                createdAt: Date.now(),
                dueDate: baseDate.getTime(),
                overdueAlerted: false,
                reminderAlerted: false,
                subtasks: task.subtasks.map(st => ({...st, id: crypto.randomUUID(), completed: false, status: 'todo'})) 
            };
            return [nextTask, ...updateTaskInTree(prev, id, (t) => ({ ...t, status, completed: true }))];
        }

        return updateTaskInTree(prev, id, (t) => ({ ...t, status, completed: isCompleted }));
    });
  }, [notifySuccess]);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => {
        const task = findTask(prev, id);
        if (!task) return prev;

        if (!task.completed && task.subtasks.some(st => !st.completed)) {
            const confirm = window.confirm("This task has incomplete subtasks. Do you want to complete all of them?");
            if (confirm) {
                const completeRecursive = (t: Task): Task => ({
                    ...t,
                    completed: true,
                    status: 'done',
                    subtasks: t.subtasks.map(completeRecursive)
                });
                setTimeout(() => notifySuccess(task.text), 0);
                return updateTaskInTree(prev, id, (t) => completeRecursive(t));
            }
        }

        const newStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done';
        const toggledCompleted = newStatus === 'done';
        
        if (toggledCompleted) {
            setTimeout(() => notifySuccess(task.text), 0);
        }

        let newTasks = updateTaskInTree(prev, id, (t) => ({ ...t, completed: toggledCompleted, status: newStatus }));

        if (toggledCompleted && task.recurrence && task.recurrence !== 'none') {
            const baseDate = task.dueDate ? new Date(task.dueDate) : new Date();
            if (task.recurrence === 'daily') baseDate.setDate(baseDate.getDate() + 1);
            else if (task.recurrence === 'weekly') baseDate.setDate(baseDate.getDate() + 7);
            else if (task.recurrence === 'monthly') baseDate.setMonth(baseDate.getMonth() + 1);

            const nextTask: Task = {
                ...task,
                id: crypto.randomUUID(),
                completed: false,
                status: 'todo',
                createdAt: Date.now(),
                dueDate: baseDate.getTime(),
                overdueAlerted: false,
                reminderAlerted: false,
                subtasks: task.subtasks.map(st => ({...st, id: crypto.randomUUID(), completed: false, status: 'todo'})) 
            };
            newTasks = [nextTask, ...newTasks];
        }

        return newTasks;
    });
  }, [notifySuccess]);

  const deleteTask = useCallback((id: string) => {
    setTaskToDelete(id);
  }, []);

  const executeDelete = useCallback(() => {
    if (taskToDelete) {
      setTasks(prev => deleteTaskInTree(prev, taskToDelete));
      setTaskToDelete(null);
    }
  }, [taskToDelete]);

  const editTask = useCallback((id: string, newText: string, newHtml?: string) => {
    setTasks(prev => updateTaskInTree(prev, id, (t) => ({ ...t, text: newText, html: newHtml })));
  }, []);

  const handleBreakdown = useCallback(async (id: string) => {
    const task = findTask(tasks, id);
    if (!task) return;

    try {
      const subtasksTexts = await breakdownTaskWithAI(task.text, language);
      if (subtasksTexts.length === 0) return;

      const newSubtasks: Task[] = subtasksTexts.map(text => ({
        id: crypto.randomUUID(),
        text: text,
        completed: false,
        status: 'todo',
        createdAt: Date.now(),
        priority: task.priority,
        tags: [],
        subtasks: []
      }));

      setTasks(prev => updateTaskInTree(prev, id, (t) => ({
        ...t,
        subtasks: [...t.subtasks, ...newSubtasks]
      })));
    } catch (e) {
      console.error("Error breaking down task", e);
    }
  }, [tasks, language]);

  const handleMoveTask = useCallback((id: string, direction: 'top' | 'bottom') => {
    const moveInList = (list: Task[]): { list: Task[], found: boolean } => {
      const index = list.findIndex(t => t.id === id);
      if (index !== -1) {
        const item = list[index];
        const newList = [...list];
        newList.splice(index, 1);
        if (direction === 'top') {
          newList.unshift(item);
        } else {
          newList.push(item);
        }
        return { list: newList, found: true };
      }
      
      let foundInSub = false;
      const newList = list.map(t => {
        if (t.subtasks.length > 0) {
           const res = moveInList(t.subtasks);
           if (res.found) {
             foundInSub = true;
             return { ...t, subtasks: res.list };
           }
        }
        return t;
      });
      return { list: newList, found: foundInSub };
    };

    setTasks(prev => moveInList(prev).list);
  }, []);

  const handleCopyTask = useCallback((id: string) => {
    const copyInList = (list: Task[]): { list: Task[], found: boolean } => {
      const index = list.findIndex(t => t.id === id);
      if (index !== -1) {
        const original = list[index];
        // Deep clone helper
        const cloneTask = (t: Task): Task => ({
            ...t,
            id: crypto.randomUUID(),
            createdAt: Date.now(),
            completed: false, // Reset completion for the copy
            status: 'todo',   // Reset status for the copy
            overdueAlerted: false,
            reminderAlerted: false,
            subtasks: t.subtasks.map(cloneTask)
        });
        
        const copy = cloneTask(original);
        // Ensure text is same (deep clone already did this but just to be explicit)
        copy.text = original.text; 
        
        const newList = [...list];
        newList.splice(index + 1, 0, copy); // Insert after original
        return { list: newList, found: true };
      }
      
      let foundInSub = false;
      const newList = list.map(t => {
        if (t.subtasks.length > 0) {
           const res = copyInList(t.subtasks);
           if (res.found) {
             foundInSub = true;
             return { ...t, subtasks: res.list };
           }
        }
        return t;
      });
      return { list: newList, found: foundInSub };
    };

    setTasks(prev => copyInList(prev).list);
  }, []);

  // --- Filtering & Sorting ---
  const getAllTags = () => {
    const tags = new Set<string>();
    const traverse = (list: Task[]) => {
      list.forEach(t => {
        t.tags.forEach(tag => tags.add(tag));
        traverse(t.subtasks);
      });
    };
    traverse(tasks);
    return Array.from(tags);
  };

  const availableTags = getAllTags();

  let visibleTasks = tasks.filter(task => {
    if (filter === 'active' && task.completed) return false;
    if (filter === 'completed' && !task.completed) return false;
    if (selectedTag && !task.tags.includes(selectedTag)) return false;
    return true;
  });

  const priorityWeight = { high: 3, medium: 2, low: 1 };

  if (sortBy !== 'custom') {
    visibleTasks = [...visibleTasks].sort((a, b) => {
      switch (sortBy) {
        case 'newest': return b.createdAt - a.createdAt;
        case 'oldest': return a.createdAt - b.createdAt;
        case 'due-date':
           if (!a.dueDate) return 1; if (!b.dueDate) return -1;
           return a.dueDate - b.dueDate;
        case 'priority':
            return priorityWeight[b.priority] - priorityWeight[a.priority];
        case 'a-z': return a.text.localeCompare(b.text);
        case 'z-a': return b.text.localeCompare(a.text);
        default: return 0;
      }
    });
  }

  // --- DnD (Top Level Only) ---
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    dragOverItem.current = index;
  };
  const handleDragEnd = () => {
    const start = dragItem.current;
    const end = dragOverItem.current;
    if (start !== null && end !== null && start !== end) {
      const newTasks = [...tasks];
      const item = newTasks[start];
      newTasks.splice(start, 1);
      newTasks.splice(end, 0, item);
      setTasks(newTasks);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const activeCount = tasks.filter(t => !t.completed).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-10 px-4 sm:px-6 font-sans relative overflow-hidden">
      
      {/* Watermark Background */}
      {logoUrl && (
        <div className="fixed inset-0 pointer-events-none z-0 flex flex-col items-center justify-center opacity-[0.03]">
          <img src={logoUrl} alt="Watermark" className="w-[500px] h-[500px] object-contain mb-4" />
          <h1 className="text-9xl font-bold text-slate-900 tracking-tighter">ZenTask</h1>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setTaskToDelete(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col p-6 animate-in zoom-in-95 duration-200">
             <div className="flex flex-col items-center text-center gap-3">
               <div className="p-3 bg-red-50 text-red-500 rounded-full">
                  <AlertTriangle size={32} />
               </div>
               <h3 className="text-xl font-bold text-slate-900">{t.deleteTitle}</h3>
               <p className="text-slate-500 text-sm mb-4">
                 {t.confirmDelete} <br/> 
                 <span className="text-xs text-slate-400">{t.deleteWarning}</span>
               </p>
               <div className="flex gap-3 w-full">
                 <button 
                   onClick={() => setTaskToDelete(null)}
                   className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
                 >
                   {t.cancel}
                 </button>
                 <button 
                   onClick={executeDelete}
                   className="flex-1 py-2.5 px-4 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                 >
                   {t.delete}
                 </button>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowHelp(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <HelpCircle size={24} />
                </div>
                <h2 className="text-xl font-bold text-slate-900">{t.faqTitle}</h2>
              </div>
              <button 
                onClick={() => setShowHelp(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 space-y-6">
              {currentFaqs.map((faq, index) => (
                <div key={index} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <h3 className="font-semibold text-slate-900 mb-2 text-base flex items-start gap-2">
                    <span className="text-indigo-500 mt-0.5 text-sm">#{index + 1}</span>
                    {faq.q}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed pl-6">{faq.a}</p>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 text-center text-xs text-slate-400">
              ZenTask v1.0 • Designed with Gemini
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto relative z-10">
        
        {/* Header */}
        <header className="mb-8 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2 flex items-center justify-center sm:justify-start gap-3">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded-lg shadow-sm" />
              ) : (
                <CheckCircle2 className="text-indigo-600" size={32} />
              )}
              {t.title}
            </h1>
            <p className="text-slate-500">{t.subtitle}</p>
          </div>
          
          <div className="flex gap-2 items-center">
            
            {/* Font Size Controls */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-full px-2 py-1 mr-2 shadow-sm">
                <Type size={14} className="text-slate-400 ml-1" />
                <button 
                  onClick={() => setFontSize(s => Math.max(12, s - 1))}
                  className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-full"
                  title="Decrease Font Size"
                >
                   <Minus size={12} />
                </button>
                <span className="text-xs text-slate-400 w-4 text-center select-none">{fontSize}</span>
                <button 
                  onClick={() => setFontSize(s => Math.min(24, s + 1))}
                  className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-full"
                  title="Increase Font Size"
                >
                   <PlusIcon size={12} />
                </button>
            </div>

             <button 
                onClick={() => setShowHelp(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm"
                title={t.help}
            >
                <HelpCircle size={14} />
            </button>
            <button 
                onClick={handleGenerateLogo}
                disabled={isGeneratingLogo}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-sm font-medium text-indigo-600 hover:bg-indigo-100 transition-colors shadow-sm disabled:opacity-50"
                title={t.genLogo}
            >
                {isGeneratingLogo ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <Palette size={14} />
                )}
            </button>
            <button onClick={() => setLanguage(l => l === 'en' ? 'es' : 'en')} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-sm font-medium text-slate-600 hover:text-slate-900 shadow-sm">
                <Globe size={14} /> {language === 'en' ? 'ES' : 'EN'}
            </button>
          </div>
        </header>

        {/* Create Task Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-8">
          <form onSubmit={handleAddTask} className="flex flex-col gap-4">
            
            {/* Rich Text Input */}
            <div className="flex gap-2">
                <div className="flex-1">
                    <RichInput 
                        value={inputHtml}
                        onChange={(html, text) => {
                            setInputHtml(html);
                            setInputText(text);
                        }}
                        placeholder={t.placeholder}
                        onKeyDown={(e) => {
                             if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleAddTask();
                             }
                        }}
                        language={language}
                    />
                </div>
                <button 
                  type="submit"
                  disabled={!inputText.trim()}
                  className="bg-slate-900 hover:bg-slate-800 text-white w-12 rounded-xl disabled:opacity-50 flex items-center justify-center flex-shrink-0 self-start h-[50px] mt-[38px]"
                >
                  <Plus size={24} />
                </button>
            </div>
            
            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
               
               {/* Priority */}
               <div className="relative flex items-center">
                   <AlertCircle size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
                   <select
                     value={inputPriority}
                     onChange={(e) => setInputPriority(e.target.value as Priority)}
                     className="pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg w-full appearance-none cursor-pointer focus:border-indigo-400 focus:outline-none"
                   >
                     <option value="high">{t.priorityHigh}</option>
                     <option value="medium">{t.priorityMedium}</option>
                     <option value="low">{t.priorityLow}</option>
                   </select>
                   <ArrowUpDown size={12} className="absolute right-3 text-slate-400 pointer-events-none" />
               </div>

               {/* Tags */}
               <div className="relative flex items-center">
                   <Tag size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
                   <input
                     type="text"
                     value={inputTags}
                     onChange={(e) => setInputTags(e.target.value)}
                     placeholder={t.tagsPlaceholder}
                     className="pl-9 pr-2 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg w-full focus:border-indigo-400 focus:outline-none"
                   />
               </div>

               {/* Date */}
               <div className="relative flex items-center">
                <CalendarIcon size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
                <input 
                  type="date"
                  value={inputDate}
                  onChange={(e) => setInputDate(e.target.value)}
                  className="pl-9 pr-2 py-2 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 w-full"
                />
               </div>

               {/* Time */}
               <div className="relative flex items-center">
                <Clock size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
                <input 
                  type="time"
                  value={inputTime}
                  onChange={(e) => setInputTime(e.target.value)}
                  disabled={!inputDate}
                  className="pl-9 pr-2 py-2 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 w-full disabled:opacity-50"
                />
               </div>
            </div>

            {/* Extra Options Row */}
            <div className="grid grid-cols-2 gap-3">
                 {/* Reminder */}
               <div className="relative flex items-center">
                <BellRing size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
                <select 
                  value={reminderOffset}
                  onChange={(e) => setReminderOffset(Number(e.target.value))}
                  disabled={!inputDate}
                  className="pl-9 pr-6 py-2 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 w-full appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value={0}>{t.remindNone}</option>
                  <option value={900000}>15m</option>
                  <option value={1800000}>30m</option>
                  <option value={3600000}>1h</option>
                  <option value={86400000}>24h</option>
                </select>
                <ArrowUpDown size={12} className="absolute right-2 text-slate-400 pointer-events-none" />
               </div>

               {/* Recurrence */}
               <div className="relative flex items-center">
                <Repeat size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
                <select 
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
                  className="pl-9 pr-6 py-2 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 w-full appearance-none cursor-pointer"
                >
                  <option value="none">{t.repeatNone}</option>
                  <option value="daily">{t.repeatDaily}</option>
                  <option value="weekly">{t.repeatWeekly}</option>
                  <option value="monthly">{t.repeatMonthly}</option>
                </select>
                <ArrowUpDown size={12} className="absolute right-2 text-slate-400 pointer-events-none" />
               </div>
            </div>
          </form>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-1 bg-slate-200/50 p-1 rounded-lg">
                    {(['all', 'active', 'completed'] as FilterType[]).map((f) => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        {f === 'all' ? t.filterAll : f === 'active' ? t.filterActive : t.filterCompleted}
                    </button>
                    ))}
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="relative flex items-center">
                    <ArrowUpDown size={14} className="absolute left-2 text-slate-400 pointer-events-none" />
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="pl-8 pr-3 py-1.5 text-sm font-medium bg-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md appearance-none cursor-pointer focus:outline-none">
                        <option value="custom">{t.sortCustom}</option>
                        <option value="priority">{t.sortPriority}</option>
                        <option value="due-date">{t.sortDueDate}</option>
                        <option value="newest">{t.sortNewest}</option>
                        <option value="oldest">{t.sortOldest}</option>
                        <option value="a-z">{t.sortAZ}</option>
                        <option value="z-a">{t.sortZA}</option>
                    </select>
                    </div>
                </div>
            </div>

            {/* Tag Filter */}
            {availableTags.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tags:</span>
                    <button 
                        onClick={() => setSelectedTag(null)}
                        className={`px-2 py-1 rounded text-xs border ${!selectedTag ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200'}`}
                    >
                        All
                    </button>
                    {availableTags.map(tag => (
                        <button 
                            key={tag}
                            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                            className={`px-2 py-1 rounded text-xs border ${selectedTag === tag ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            )}
        </div>

        {/* Task List */}
        <div className="space-y-1">
          {visibleTasks.length > 0 ? (
            visibleTasks.map((task, index) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onStatusChange={changeTaskStatus}
                onDelete={deleteTask}
                onEdit={editTask}
                onBreakdown={handleBreakdown}
                onAddSubtask={handleAddSubtask}
                onMove={handleMoveTask}
                onCopy={handleCopyTask}
                labels={{
                  edit: t.editTask,
                  magic: t.magicBreakdown,
                  delete: t.deleteTask,
                  overdue: t.overdue,
                  today: t.today,
                  addSubtask: t.addSubtask,
                  statusTodo: t.statusTodo,
                  statusInProgress: t.statusInProgress,
                  statusBlocked: t.statusBlocked,
                  statusDone: t.statusDone,
                  moveTop: t.moveTop,
                  moveBottom: t.moveBottom,
                  copy: t.copy
                }}
                isDraggable={sortBy === 'custom'}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => { e.preventDefault(); handleDragEnter(e, index); }}
                onDrop={handleDragEnd}
                language={language}
              />
            ))
          ) : (
            <div className="text-center py-16 opacity-80 flex flex-col items-center">
              <div className="w-64 h-48 mb-6 rounded-2xl overflow-hidden shadow-sm relative bg-slate-100">
                <img src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=600" alt="Empty desk" className="w-full h-full object-cover opacity-80" />
              </div>
              <p className="text-slate-800 text-lg font-medium mb-1">{t.noTasks}</p>
              <p className="text-slate-500 text-sm max-w-xs">{t.noTasksSub}</p>
              {(filter !== 'all' || selectedTag) && (
                <button onClick={() => { setFilter('all'); setSelectedTag(null); }} className="mt-4 text-indigo-600 font-medium text-sm border border-indigo-100 bg-indigo-50 px-4 py-2 rounded-lg">
                  {t.clearFilters}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;