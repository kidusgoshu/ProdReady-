import React, { useState } from 'react';
import { ChecklistItem, CategoryInfo, Teammate, PriorityType, StatusType } from '../types';
import { 
  Shield, Server, Code2, CheckSquare, Database, FileText, 
  Flame, AlertCircle, ArrowDownCircle, ArrowLeft, ArrowRight, 
  Edit3, Trash2, ChevronDown, ChevronUp, FileCode, Users,
  Layers, Cpu, Globe, Lock, Settings, Terminal,
  Calendar, Clock, Hash
} from 'lucide-react';

interface TaskCardProps {
  key?: string;
  task: ChecklistItem;
  categories: CategoryInfo[];
  team: Teammate[];
  onEdit: (task: ChecklistItem) => void;
  onDelete: (id: string) => void;
  onMoveStatus: (id: string, nextStatus: StatusType) => void;
  isLightMode?: boolean;
}

const categoryIcons: Record<string, React.ComponentType<any>> = {
  Shield,
  Server,
  Code2,
  CheckSquare,
  Database,
  FileText,
  Layers,
  Cpu,
  Globe,
  Lock,
  Settings,
  Terminal
};

export default function TaskCard({ 
  task, 
  categories,
  team,
  onEdit, 
  onDelete, 
  onMoveStatus,
  isLightMode = false 
}: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const categoryInfo = categories.find(cat => cat.id === task.category) || {
    id: 'general',
    name: 'General Group',
    icon: 'Shield',
    color: 'border-neutral-500 text-neutral-400 bg-neutral-500/10',
    lightColor: 'bg-neutral-500/10',
    textColor: 'text-neutral-500'
  };
  
  const IconComponent = categoryIcons[categoryInfo.icon] || Shield;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    const element = e.currentTarget as HTMLElement;
    setTimeout(() => {
      element.style.opacity = '0.4';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const element = e.currentTarget as HTMLElement;
    element.style.opacity = '1';
  };

  const getPriorityBadge = (priority: PriorityType) => {
    switch (priority) {
      case 'high':
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${
            isLightMode
              ? 'bg-rose-100 text-rose-700 border-rose-200'
              : 'bg-rose-500/10 text-rose-455 text-rose-400 border-rose-500/30'
          }`}>
            <Flame className="w-3 h-3 fill-rose-500/15" />
            Critical Red
          </span>
        );
      case 'medium':
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${
            isLightMode
              ? 'bg-amber-100 text-amber-700 border-amber-200'
              : 'bg-amber-500/10 text-amber-455 text-amber-400 border-amber-500/30'
          }`}>
            <AlertCircle className="w-3 h-3" />
            Medium Alert
          </span>
        );
      case 'low':
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold border ${
            isLightMode
              ? 'bg-blue-100 text-blue-700 border-blue-200'
              : 'bg-blue-500/10 text-blue-455 text-blue-400 border-blue-500/30'
          }`}>
            <ArrowDownCircle className="w-3 h-3" />
            Low Staging
          </span>
        );
    }
  };

  // Find assigned teammates
  const assignedTeammates = team.filter(member => task.assignedTo?.includes(member.id));

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      id={`task-card-${task.id}`}
      className={`group border cursor-grab active:cursor-grabbing hover:shadow-lg transition-all duration-300 relative select-none flex flex-col gap-3.5 overflow-hidden p-4 rounded-2xl ${
        isLightMode
          ? 'bg-white border-neutral-200/90 hover:border-neutral-300'
          : 'bg-neutral-900 border-neutral-800 hover:border-neutral-750'
      } ${
        task.status === 'completed' 
          ? isLightMode 
            ? 'opacity-85 bg-neutral-50/70 border-neutral-200/50' 
            : 'opacity-80 hover:opacity-105 border-neutral-900/60'
          : ''
      }`}
    >
      
      {/* Top Banner Category/Badge Indicator */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <div className={`p-1 rounded-lg border flex-shrink-0 ${
            isLightMode 
              ? 'bg-neutral-100 border-neutral-200 text-neutral-700' 
              : categoryInfo.color
          }`}>
            <IconComponent className="w-3 h-3" />
          </div>
          <span className={`text-[9px] font-mono font-bold uppercase tracking-wider truncate ${
            isLightMode ? 'text-neutral-500' : 'text-neutral-400'
          }`}>
            {categoryInfo.name}
          </span>
        </div>
        
        <div className="flex items-center gap-1 flex-shrink-0">
          {getPriorityBadge(task.priority)}
          {task.custom && (
            <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider border ${
              isLightMode
                ? 'bg-neutral-150 border-neutral-250 text-neutral-600'
                : 'bg-blue-900/40 border-blue-700/50 text-blue-400'
            }`}>
              Custom
            </span>
          )}
        </div>
      </div>

      {/* Main title and brief guideline */}
      <div className="space-y-1">
        <h4 className={`text-xs font-bold tracking-tight leading-snug group-hover:text-blue-500 transition-all duration-200 ${
          isLightMode ? 'text-neutral-900' : 'text-white'
        } ${
          task.status === 'completed' 
            ? 'line-through text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-400' 
            : ''
        }`}>
          {task.title}
        </h4>
        <p className={`text-[11px] leading-relaxed line-clamp-2 ${
          isLightMode ? 'text-neutral-600' : 'text-neutral-400'
        }`}>
          {task.description}
        </p>

        {/* TAGS LIST */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {task.tags.map((tag, idx) => (
              <span key={idx} className="px-1.5 py-0.5 rounded-md bg-sky-500/10 text-[9px] font-mono font-bold text-sky-500 border border-sky-500/10">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* DEADLINE & TIMELINE */}
        {(task.dueDate || task.timeline) && (
          <div className="grid grid-cols-2 gap-2 mt-2 text-[9px] font-mono">
            {task.dueDate && (
              <span className={`inline-flex items-center gap-1.5 p-1 px-1.5 rounded-lg border ${
                new Date(task.dueDate) < new Date() && task.status !== 'completed'
                  ? 'bg-rose-500/10 text-rose-500 font-bold border-rose-500/20'
                  : isLightMode ? 'bg-neutral-100 text-neutral-600 border border-neutral-200' : 'bg-neutral-950 text-neutral-450 border border-neutral-850'
              }`}>
                <Calendar className="w-3 h-3 text-blue-500 shrink-0" />
                <span className="truncate">{task.dueDate}</span>
              </span>
            )}
            {task.timeline && (
              <span className={`inline-flex items-center gap-1.5 p-1 px-1.5 rounded-lg border ${
                isLightMode ? 'bg-neutral-100 text-neutral-600 border border-neutral-200' : 'bg-neutral-950 text-neutral-450 border border-neutral-850'
              }`}>
                <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="truncate">{task.timeline}</span>
              </span>
            )}
          </div>
        )}

        {/* SUBTASKS PROGRESS INDICATOR */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className={`mt-2 bg-neutral-100/30 dark:bg-neutral-950/20 p-2.5 rounded-xl border ${
            isLightMode ? 'border-neutral-150' : 'border-neutral-850/60'
          }`}>
            <div className="flex items-center justify-between font-mono text-[9px] mb-1">
              <span className={isLightMode ? 'text-neutral-500' : 'text-neutral-450'}>Review Steps Passed:</span>
              <span className="font-bold">
                {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
              </span>
            </div>
            
            <div className="w-full bg-neutral-250 dark:bg-neutral-800 rounded-full h-1 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Accordion Notes Action Bar */}
      {task.notes && (
        <div className={`border-t pt-1.5 text-[11px] ${
          isLightMode ? 'border-neutral-150' : 'border-neutral-800/60'
        }`}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-1 text-[10px] font-mono transition duration-150 font-bold ${
              isLightMode 
                ? 'text-neutral-500 hover:text-neutral-800' 
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            <FileCode className="w-3 h-3 text-blue-500" />
            {isExpanded ? "Hide Implementation Specs" : "View Implementation Specs"}
          </button>
          
          {isExpanded && (
            <div className={`mt-1.5 text-[10px] font-mono p-2 rounded-xl border whitespace-pre-wrap break-words leading-relaxed ${
              isLightMode
                ? 'bg-neutral-50 border-neutral-200 text-emerald-800'
                : 'bg-neutral-950 p-2 rounded-lg border border-neutral-800 text-emerald-400/90'
            }`}>
              {task.notes}
            </div>
          )}
        </div>
      )}

      {/* Team Member Assignment Bar */}
      <div className={`flex items-center justify-between pt-2 border-t text-[10px] ${
        isLightMode ? 'border-neutral-100 text-neutral-550' : 'border-neutral-800/40 text-neutral-400'
      }`}>
        <span className="font-mono flex items-center gap-1 shrink-0">
          <Users className="w-3 h-3 text-neutral-400" /> Owner:
        </span>
        <div className="flex items-center justify-end gap-1.5 overflow-hidden max-w-[70%]">
          <div className="flex items-center -space-x-1.5 overflow-hidden">
            {assignedTeammates.map(member => (
              <div 
                key={member.id}
                className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-mono font-black border border-white dark:border-neutral-900 shrink-0 ${member.avatarColor}`}
                title={`${member.name} (${member.role})`}
              >
                {member.name[0].toUpperCase()}
              </div>
            ))}
          </div>
          {assignedTeammates.length > 0 ? (
            <span className="text-[9px] font-mono truncate text-neutral-500 dark:text-neutral-400">
              {assignedTeammates.map(m => m.name.split(' ')[0]).join(', ')}
            </span>
          ) : (
            <span className={`text-[9px] font-mono italic ${isLightMode ? 'text-neutral-400' : 'text-neutral-500'}`}>Unassigned</span>
          )}
        </div>
      </div>

      {/* Footer Interface */}
      <div className={`flex items-center justify-between border-t pt-2 mt-0.5 text-xs ${
        isLightMode ? 'border-neutral-150' : 'border-neutral-850'
      }`}>
        
        {/* Device Comfort Controls */}
        <div className="flex items-center gap-1">
          {task.status !== 'todo' && (
            <button
              onClick={() => {
                const prev: Record<StatusType, StatusType> = { 'todo': 'todo', 'in-progress': 'todo', 'completed': 'in-progress' };
                onMoveStatus(task.id, prev[task.status]);
              }}
              className={`p-1.5 rounded-lg border transition duration-150 cursor-pointer ${
                isLightMode
                  ? 'bg-neutral-100 border-neutral-200/90 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
                  : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white'
              }`}
              title="Move left"
            >
              <ArrowLeft className="w-3 h-3" />
            </button>
          )}

          <span className={`text-[8px] font-mono px-1.5 capitalize font-extrabold uppercase tracking-wide ${
            isLightMode ? 'text-neutral-400' : 'text-neutral-550'
          }`}>
            {task.status === 'todo' ? 'Todo' : task.status === 'in-progress' ? 'Running' : 'Done'}
          </span>

          {task.status !== 'completed' && (
            <button
              onClick={() => {
                const next: Record<StatusType, StatusType> = { 'todo': 'in-progress', 'in-progress': 'completed', 'completed': 'completed' };
                onMoveStatus(task.id, next[task.status]);
              }}
              className={`p-1.5 rounded-lg border transition duration-150 cursor-pointer ${
                isLightMode
                  ? 'bg-neutral-100 border-neutral-200/90 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
                  : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white'
              }`}
              title="Promote status"
            >
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Administration actions */}
        <div className={`flex items-center gap-1.5 transition duration-200 ${
          isLightMode 
            ? 'text-neutral-400 hover:text-neutral-800' 
            : 'text-neutral-500 opacity-80 group-hover:opacity-100'
        }`}>
          <button
            onClick={() => onEdit(task)}
            className={`p-1 hover:bg-neutral-300/30 rounded-lg transition duration-150 cursor-pointer ${
              isLightMode ? 'hover:text-black' : 'hover:text-white'
            }`}
            title="Edit spec parameters"
          >
            <Edit3 className="w-3 h-3" />
          </button>
          
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 hover:bg-rose-500/10 rounded text-neutral-500 hover:text-rose-500 transition duration-150 cursor-pointer"
            title="Delete standard checklist item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
      
    </div>
  );
}
