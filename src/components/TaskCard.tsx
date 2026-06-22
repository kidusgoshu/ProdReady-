import React, { useState } from 'react';
import { ChecklistItem, CategoryInfo, Teammate, PriorityType, StatusType } from '../types';
import { 
  Edit3, Trash2, ChevronDown, ChevronUp
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

export default function TaskCard({ 
  task, 
  categories,
  team,
  onEdit, 
  onDelete, 
  onMoveStatus
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

  const getPriorityTag = (priority: PriorityType) => {
    switch (priority) {
      case 'high':
        return (
          <span 
            style={{
              color: 'var(--notion-red)',
              backgroundColor: 'rgba(224,62,62,0.08)',
              fontSize: '11px',
              padding: '2px 6px',
              borderRadius: '3px',
              fontWeight: 500,
              flexShrink: 0
            }}
          >
            High
          </span>
        );
      case 'medium':
        return (
          <span 
            style={{
              color: 'var(--notion-amber)',
              backgroundColor: 'rgba(217,115,13,0.08)',
              fontSize: '11px',
              padding: '2px 6px',
              borderRadius: '3px',
              fontWeight: 500,
              flexShrink: 0
            }}
          >
            Med
          </span>
        );
      case 'low':
        return (
          <span 
            style={{
              color: 'var(--notion-green)',
              backgroundColor: 'rgba(15,123,108,0.08)',
              fontSize: '11px',
              padding: '2px 6px',
              borderRadius: '3px',
              fontWeight: 500,
              flexShrink: 0
            }}
          >
            Low
          </span>
        );
    }
  };

  // Find assigned teammates
  const assignedTeammates = team.filter(member => task.assignedTo?.includes(member.id));

  const priorityColors: Record<PriorityType, string> = {
    high: '#e03e3e',
    medium: '#d9730d',
    low: '#0f7b6c'
  };
  const priorityColor = priorityColors[task.priority] || 'var(--n-border)';

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      id={`task-card-${task.id}`}
      className="group cursor-grab active:cursor-grabbing transition-all duration-200 select-none flex flex-col gap-2.5 p-3"
      style={{
        backgroundColor: 'var(--notion-bg-secondary)',
        border: '1px solid var(--n-border)',
        borderLeft: `2px solid ${priorityColor}`,
        borderRadius: '0'
      }}
    >
      
      {/* Row 1: Phase tag (left-border-accent) + Priority tag (right-aligned) */}
      <div className="flex items-center justify-between gap-2 overflow-hidden select-none">
        <div 
          className="truncate font-medium text-left" 
          style={{ 
            fontSize: '11px', 
            color: 'var(--notion-text-secondary)' 
          }}
        >
          {categoryInfo.name}
        </div>
        {getPriorityTag(task.priority)}
      </div>

      {/* Row 2: Task title */}
      <div>
        <h4 
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--notion-text-primary)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: '1.4'
          }}
          className={`text-left ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}
        >
          {task.title}
        </h4>
      </div>

      {/* Row 3: Description */}
      <div>
        <p 
          style={{
            fontSize: '12px',
            color: 'var(--notion-text-secondary)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: '1.4'
          }}
          className="text-left font-normal"
        >
          {task.description}
        </p>
      </div>

      {/* Optional Subtasks Track */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div 
          style={{
            backgroundColor: 'var(--notion-bg-hover)',
            borderRadius: '3px',
            padding: '5px 7px'
          }}
          className="mt-0.5"
        >
          <div className="flex items-center justify-between font-mono text-[9px] mb-1" style={{ color: 'var(--notion-text-secondary)' }}>
            <span>Steps:</span>
            <span>
              {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
            </span>
          </div>
          
          <div className="w-full bg-[var(--notion-border)] rounded-full h-1 overflow-hidden" style={{ height: '3px' }}>
            <div 
              className="h-full transition-all duration-300"
              style={{
                width: `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%`,
                backgroundColor: 'var(--notion-green)'
              }}
            />
          </div>
        </div>
      )}

      {/* Accordion implementation specs */}
      {task.notes && (
        <div 
          className="border-t pt-1"
          style={{ borderColor: 'var(--notion-border)' }}
        >
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ fontSize: '10px', color: 'var(--notion-text-secondary)' }}
            className="flex items-center gap-1 font-mono transition duration-150 font-bold bg-transparent border-none cursor-pointer p-0"
          >
            {isExpanded ? <ChevronUp style={{ width: '10px', height: '10px' }} /> : <ChevronDown style={{ width: '10px', height: '10px' }} />}
            <span>{isExpanded ? "Hide Specs" : "View Specs"}</span>
          </button>
          
          {isExpanded && (
            <div 
              style={{
                fontSize: '11px',
                backgroundColor: 'var(--notion-bg-hover)',
                color: 'var(--notion-text-primary)',
                border: '1px solid var(--notion-border)',
                borderRadius: '3px',
                marginTop: '4px',
              }}
              className="p-1 px-2 font-mono text-left whitespace-pre-wrap break-words leading-relaxed"
            >
              {task.notes}
            </div>
          )}
        </div>
      )}

      {/* Row 4: Assignee avatar + Unassigned text + status label */}
      <div 
        className="flex items-center justify-between border-t pt-2 select-none"
        style={{ borderColor: 'var(--notion-border)' }}
      >
        <div className="flex items-center gap-1.5 overflow-hidden">
          {assignedTeammates.length > 0 ? (
            <div className="flex items-center -space-x-1">
              {assignedTeammates.map(member => (
                <div 
                  key={member.id}
                  className={`w-[20px] h-[20px] rounded-full flex items-center justify-center text-white text-[9px] font-mono font-bold shrink-0 ${member.avatarColor}`}
                  title={`${member.name} (${member.role})`}
                >
                  {member.name[0].toUpperCase()}
                </div>
              ))}
            </div>
          ) : (
            <span style={{ fontSize: '12px', color: 'var(--notion-text-tertiary)' }}>Unassigned</span>
          )}
        </div>

        {/* Status indicator stamp */}
        <span 
          style={{
            fontSize: '11px',
            color: 'var(--n-tx3)',
            fontWeight: 400,
            background: 'none',
            border: 'none',
            padding: 0
          }} 
          className="uppercase font-mono"
        >
          {task.status === 'todo' ? 'TODO →' : task.status === 'in-progress' ? 'DOING →' : 'DONE ✔'}
        </span>
      </div>

      {/* Row 5: hover action buttons */}
      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-1 border-t pt-1" style={{ borderColor: 'var(--notion-border)' }}>
        
        {/* Rapid Status Shifts */}
        <div className="flex items-center gap-1.5 mr-auto">
          {task.status !== 'todo' && (
            <button
              onClick={() => {
                const prev: Record<StatusType, StatusType> = { 'todo': 'todo', 'in-progress': 'todo', 'completed': 'in-progress' };
                onMoveStatus(task.id, prev[task.status]);
              }}
              style={{ color: 'var(--notion-text-tertiary)', fontSize: '11px' }}
              className="hover:text-[var(--notion-text-primary)] cursor-pointer bg-transparent border-none p-0"
            >
              ← Back
            </button>
          )}
          {task.status !== 'completed' && (
            <button
              onClick={() => {
                const next: Record<StatusType, StatusType> = { 'todo': 'in-progress', 'in-progress': 'completed', 'completed': 'completed' };
                onMoveStatus(task.id, next[task.status]);
              }}
              style={{ color: 'var(--notion-text-tertiary)', fontSize: '11px' }}
              className="hover:text-[var(--notion-text-primary)] cursor-pointer bg-transparent border-none p-0"
            >
              Next →
            </button>
          )}
        </div>

        {/* Edit and Delete */}
        <button
          onClick={() => onEdit(task)}
          className="p-1 hover:bg-[var(--notion-bg-hover)] rounded transition duration-150 cursor-pointer text-neutral-500"
          style={{ color: 'var(--notion-text-tertiary)' }}
          title="Edit"
        >
          <Edit3 style={{ width: '13px', height: '13px' }} />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-1 hover:bg-rose-500/10 rounded transition duration-150 cursor-pointer hover:text-rose-500 text-neutral-500"
          style={{ color: 'var(--notion-text-tertiary)' }}
          title="Delete"
        >
          <Trash2 style={{ width: '13px', height: '13px' }} />
        </button>
      </div>

    </div>
  );
}
