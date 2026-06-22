import React, { useState } from 'react';
import { ChecklistItem, CategoryInfo, Teammate, StatusType } from '../types';
import TaskCard from './TaskCard';
import { Kanban, Coffee, ClipboardList, CheckCircle2 } from 'lucide-react';

interface TaskBoardProps {
  tasks: ChecklistItem[];
  categories: CategoryInfo[];
  team: Teammate[];
  onEdit: (task: ChecklistItem) => void;
  onDelete: (id: string) => void;
  onMoveStatus: (id: string, nextStatus: StatusType) => void;
  isLightMode?: boolean;
}

export default function TaskBoard({ 
  tasks, 
  categories,
  team,
  onEdit, 
  onDelete, 
  onMoveStatus,
  isLightMode = false 
}: TaskBoardProps) {
  const [activeDropColumn, setActiveDropColumn] = useState<StatusType | null>(null);

  const columns: { 
    id: StatusType; 
    name: string; 
    icon: React.ComponentType<any>; 
    color: string; 
    lightColor: string;
    bgHighlight: string;
    bgHighlightLight: string;
  }[] = [
    {
      id: 'todo',
      name: 'To Do Backlog',
      icon: ClipboardList,
      color: 'text-neutral-400 bg-neutral-900 border-neutral-800',
      lightColor: 'text-neutral-600 bg-neutral-200/55 border-neutral-300',
      bgHighlight: 'bg-neutral-850 border-neutral-700/60',
      bgHighlightLight: 'bg-neutral-200 border-neutral-300'
    },
    {
      id: 'in-progress',
      name: 'Active Validation',
      icon: Kanban,
      color: 'text-amber-400 bg-amber-500/10 border-amber-955/40',
      lightColor: 'text-amber-600 bg-amber-100 border-amber-250',
      bgHighlight: 'bg-amber-950/20 border-amber-700/40',
      bgHighlightLight: 'bg-amber-50 border-amber-300'
    },
    {
      id: 'completed',
      name: 'Production Signed Off',
      icon: CheckCircle2,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-955/40',
      lightColor: 'text-emerald-600 bg-emerald-100 border-emerald-250',
      bgHighlight: 'bg-emerald-950/20 border-emerald-700/40',
      bgHighlightLight: 'bg-emerald-50 border-emerald-300'
    }
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, columnId: StatusType) => {
    e.preventDefault();
    setActiveDropColumn(columnId);
  };

  const handleDragLeave = () => {
    setActiveDropColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnId: StatusType) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onMoveStatus(taskId, columnId);
    }
    setActiveDropColumn(null);
  };

  return (
    <div id="board-grid-cols" className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      {columns.map(col => {
        const colTasks = tasks.filter(task => task.status === col.id);
        const IconComponent = col.icon;
        const isHovering = activeDropColumn === col.id;

        return (
          <div
            key={col.id}
            onDragOver={handleDragOver}
            onDragEnter={(e) => handleDragEnter(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`flex flex-col h-full min-h-[500px] rounded-3xl p-4.5 border transition-all duration-300 ${
              isHovering 
                ? isLightMode
                  ? `${col.bgHighlightLight} shadow-md scale-[1.01]`
                  : `${col.bgHighlight} shadow-2xl scale-[1.01]`
                : isLightMode
                ? 'bg-neutral-100/50 border-neutral-200/90'
                : 'bg-neutral-900/15 backdrop-blur-md border-neutral-855/80'
            }`}
          >
            {/* Column Header */}
            <div className={`flex items-center justify-between mb-4.5 pb-2.5 border-b flex-shrink-0 ${
              isLightMode ? 'border-neutral-200/80' : 'border-neutral-800/60'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg border flex-shrink-0 ${
                  isLightMode ? col.lightColor : col.color
                }`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <h3 className={`text-sm font-bold tracking-tight font-sans ${
                  isLightMode ? 'text-neutral-800' : 'text-white'
                }`}>{col.name}</h3>
              </div>
              <span className={`font-mono text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                isLightMode 
                  ? 'bg-neutral-200/80 border-neutral-300 text-neutral-600' 
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400'
              }`}>
                {colTasks.length}
              </span>
            </div>

            {/* List region layout */}
            <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[60vh] md:max-h-[75vh] pr-1.5 scrollbar-thin">
              {colTasks.length > 0 ? (
                colTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    categories={categories}
                    team={team}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onMoveStatus={onMoveStatus}
                    isLightMode={isLightMode}
                  />
                ))
              ) : (
                <div className={`h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed rounded-2xl select-none ${
                  isLightMode ? 'border-neutral-200 text-neutral-400' : 'border-neutral-800/60 text-neutral-650'
                }`}>
                  <Coffee className={`w-8 h-8 mb-2 animate-bounce ${
                    isLightMode ? 'text-neutral-300' : 'text-neutral-700'
                  }`} />
                  <p className={`text-xs font-bold font-sans ${isLightMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                    No tasks in this swimlane
                  </p>
                  <p className={`text-[10px] font-mono mt-1 ${isLightMode ? 'text-neutral-400' : 'text-neutral-550'}`}>
                    {col.id === 'todo' && "Backlog completely cleared!"}
                    {col.id === 'in-progress' && "Drag cards here to run validations."}
                    {col.id === 'completed' && "Commit changes to mark production ready."}
                  </p>
                </div>
              )}
            </div>
            
          </div>
        );
      })}
    </div>
  );
}
