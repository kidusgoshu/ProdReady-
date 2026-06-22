import React, { useState, useEffect } from 'react';
import { ChecklistItem, CategoryInfo, Teammate, PriorityType, StatusType, ChecklistItemSubtask } from '../types';
import { X, Save, BadgeCheck, AlertCircle, Sparkles, FolderArchive, Users, Calendar, Clock, Hash, Plus, Trash2 } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<ChecklistItem>) => void;
  taskToEdit: ChecklistItem | null;
  categories: CategoryInfo[];
  team: Teammate[];
  isLightMode: boolean;
}

export default function TaskModal({ 
  isOpen, 
  onClose, 
  onSave, 
  taskToEdit,
  categories,
  team,
  isLightMode 
}: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<PriorityType>('medium');
  const [status, setStatus] = useState<StatusType>('todo');
  const [notes, setNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [timeline, setTimeline] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [subtasks, setSubtasks] = useState<ChecklistItemSubtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset or load dynamic defaults on dynamic parameters change
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setCategory(taskToEdit.category);
      setPriority(taskToEdit.priority);
      setStatus(taskToEdit.status);
      setNotes(taskToEdit.notes || '');
      setAssignedTo(taskToEdit.assignedTo || []);
      setDueDate(taskToEdit.dueDate || '');
      setTimeline(taskToEdit.timeline || '');
      setTagsInput(taskToEdit.tags?.join(', ') || '');
      setSubtasks(taskToEdit.subtasks || []);
    } else {
      setTitle('');
      setDescription('');
      setCategory(categories[0]?.id || '');
      setPriority('medium');
      setStatus('todo');
      setNotes('');
      setAssignedTo([]);
      setDueDate('');
      setTimeline('');
      setTagsInput('');
      setSubtasks([]);
    }
    setNewSubtaskTitle('');
    setErrors({});
  }, [taskToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const handleValidateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Specification Title is strictly required';
    }
    if (!description.trim()) {
      newErrors.description = 'Detailed target guideline or objective is strictly required';
    }
    if (!category) {
      newErrors.category = 'Please match a focus development phase';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      id: taskToEdit?.id,
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      status,
      notes: notes.trim(),
      assignedTo,
      dueDate: dueDate || undefined,
      timeline: timeline.trim() || undefined,
      tags: tagsInput ? tagsInput.split(',').map(t => {
        let clean = t.trim();
        if (!clean) return '';
        if (!clean.startsWith('#')) clean = '#' + clean;
        return clean;
      }).filter(Boolean) : undefined,
      subtasks: subtasks.length > 0 ? subtasks : undefined,
      custom: taskToEdit ? taskToEdit.custom : true
    });
    onClose();
  };

  const handleToggleTeammate = (memberId: string) => {
    if (assignedTo.includes(memberId)) {
      setAssignedTo(assignedTo.filter(id => id !== memberId));
    } else {
      setAssignedTo([...assignedTo, memberId]);
    }
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const item: ChecklistItemSubtask = {
      id: `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: newSubtaskTitle.trim(),
      completed: false
    };
    setSubtasks([...subtasks, item]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  const handleToggleSubtaskLocal = (id: string) => {
    setSubtasks(subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };

  return (
    <div 
      id="task-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60 overflow-y-auto"
    >
      <div 
        onSubmit={handleValidateAndSubmit}
        id="task-modal-form-card"
        className={`w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border flex flex-col max-h-[90vh] transition-all duration-300 ${
          isLightMode 
            ? 'bg-white border-neutral-200 text-neutral-800' 
            : 'bg-neutral-900 border-neutral-800 text-white'
        }`}
      >
        {/* Modal Header */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isLightMode ? 'border-neutral-150' : 'border-neutral-800/80'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`text-base font-black tracking-tight ${isLightMode ? 'text-neutral-900' : 'text-white'}`}>
                {taskToEdit ? "Redefine Standards Clause" : "Add Specification Checklist Item"}
              </h3>
              <p className={`text-[10px] font-mono uppercase tracking-wider ${isLightMode ? 'text-neutral-450' : 'text-neutral-500'}`}>
                {taskToEdit ? `Modifying Spec #${taskToEdit.id}` : "Appending from scratch"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl transition cursor-pointer ${
              isLightMode ? 'hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700' : 'hover:bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Fields */}
        <form onSubmit={handleValidateAndSubmit} className="flex-1 overflow-y-auto p-5.5 space-y-4">
          
          {/* TITLE FIELD */}
          <div className="space-y-1.5">
            <label className={`text-[10px] font-mono uppercase tracking-widest font-bold block ${
              isLightMode ? 'text-neutral-500' : 'text-neutral-400'
            }`}>
              Verification Standard Name *
            </label>
            <input
              type="text"
              className={`w-full font-sans text-xs rounded-xl p-3 outline-none border transition-all ${
                isLightMode 
                  ? 'bg-neutral-50 focus:bg-white text-neutral-900 border-neutral-200 focus:border-blue-500' 
                  : 'bg-neutral-950/50 border-neutral-800 focus:bg-neutral-950 focus:border-neutral-700 text-white'
              }`}
              placeholder="e.g. CSRF Protection Tokens Validation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && (
              <p className="text-[10px] font-medium text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.title}
              </p>
            )}
          </div>

          {/* OBJECTIVE DESCRIPTION */}
          <div className="space-y-1.5">
            <label className={`text-[10px] font-mono uppercase tracking-widest font-bold block ${
              isLightMode ? 'text-neutral-500' : 'text-neutral-400'
            }`}>
              Detailed Guideline / Objective *
            </label>
            <textarea
              rows={3}
              className={`w-full font-sans text-xs rounded-xl p-3 outline-none border transition-all resize-none ${
                isLightMode 
                  ? 'bg-neutral-50 focus:bg-white text-neutral-900 border-neutral-200 focus:border-blue-500' 
                  : 'bg-neutral-950/50 border-neutral-800 focus:bg-neutral-950 focus:border-neutral-700 text-white'
              }`}
              placeholder="Clearly state what has to be implemented or audited to pass this test..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {errors.description && (
              <p className="text-[10px] font-medium text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* DEVELOPMENT PHASE SELECTOR */}
            <div className="space-y-1.5">
              <label className={`text-[10px] font-mono uppercase tracking-widest font-bold block ${
                isLightMode ? 'text-neutral-500' : 'text-neutral-400'
              }`}>
                Development Phase Grouping
              </label>
              <select
                className={`w-full font-sans text-xs rounded-xl p-3 outline-none border cursor-pointer ${
                  isLightMode 
                    ? 'bg-neutral-50 text-neutral-900 border-neutral-200 focus:border-blue-500' 
                    : 'bg-neutral-950/50 border-neutral-800 focus:bg-neutral-950 text-white'
                }`}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id} className={isLightMode ? 'text-neutral-900' : 'bg-neutral-950 text-white'}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* CRITICALITY / RISK LEVEL */}
            <div className="space-y-1.5">
              <label className={`text-[10px] font-mono uppercase tracking-widest font-bold block ${
                isLightMode ? 'text-neutral-500' : 'text-neutral-400'
              }`}>
                Risk Criticality Level
              </label>
              <select
                className={`w-full font-sans text-xs rounded-xl p-3 outline-none border cursor-pointer ${
                  isLightMode 
                    ? 'bg-neutral-50 text-neutral-900 border-neutral-200 focus:border-blue-500' 
                    : 'bg-neutral-950/50 border-neutral-800 focus:bg-neutral-950 text-white'
                }`}
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityType)}
              >
                <option value="high" className="text-rose-500">🔥 High Safeguard</option>
                <option value="medium" className="text-amber-500">⚠️ Medium Alert</option>
                <option value="low" className="text-blue-500">⚙️ Low Staging</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* TASK STATUS */}
            <div className="space-y-1.5">
              <label className={`text-[10px] font-mono uppercase tracking-widest font-bold block ${
                isLightMode ? 'text-neutral-500' : 'text-neutral-400'
              }`}>
                Task Flow Status
              </label>
              <select
                className={`w-full font-sans text-xs rounded-xl p-3 outline-none border cursor-pointer ${
                  isLightMode 
                    ? 'bg-neutral-50 text-neutral-900 border-neutral-200 focus:border-blue-500' 
                    : 'bg-neutral-950/50 border-neutral-800 focus:bg-neutral-950 text-white'
                }`}
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusType)}
              >
                <option value="todo">📋 To Do Backlog</option>
                <option value="in-progress">⚙️ Active Validation</option>
                <option value="completed">✅ Signed Off</option>
              </select>
            </div>

            {/* CREW DELEGATION SELECTION */}
            <div className="space-y-1.5">
              <label className={`text-[10px] font-mono uppercase tracking-widest flex items-center gap-1 font-bold ${
                isLightMode ? 'text-neutral-500' : 'text-neutral-400'
              }`}>
                <Users className="w-3.5 h-3.5" /> Delegate To Crew
              </label>
              <div className={`p-2 rounded-xl border max-h-[85px] overflow-y-auto space-y-1 scrollbar-thin ${
                isLightMode 
                  ? 'bg-neutral-50 border-neutral-200' 
                  : 'bg-neutral-950/40 border-neutral-800'
              }`}>
                {team.map(member => {
                  const isChecked = assignedTo.includes(member.id);
                  return (
                    <label 
                      key={member.id} 
                      className="flex items-center gap-2 cursor-pointer py-0.5"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleTeammate(member.id)}
                        className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span className={`text-[10px] font-sans truncate ${
                        isLightMode ? 'text-neutral-700' : 'text-neutral-200'
                      }`} title={`${member.name} (${member.role})`}>
                        {member.name} ({member.role.split(' ')[0]})
                      </span>
                    </label>
                  );
                })}
                {team.length === 0 && (
                  <p className="text-[9px] text-neutral-500 italic p-1">No crew members defined.</p>
                )}
              </div>
            </div>
          </div>

          {/* DUE DATE & TIMELINE DUAL COLUMNS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={`text-[10px] font-mono uppercase tracking-widest flex items-center gap-1 font-bold ${
                isLightMode ? 'text-neutral-500' : 'text-neutral-400'
              }`}>
                <Calendar className="w-3.5 h-3.5 text-blue-500" /> Deadline Date
              </label>
              <input
                type="date"
                className={`w-full font-sans text-xs rounded-xl p-3 outline-none border ${
                  isLightMode 
                    ? 'bg-neutral-50 text-neutral-900 border-neutral-200 focus:border-blue-500' 
                    : 'bg-neutral-950/50 border-neutral-800 focus:bg-neutral-950 text-white'
                }`}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className={`text-[10px] font-mono uppercase tracking-widest flex items-center gap-1 font-bold ${
                isLightMode ? 'text-neutral-500' : 'text-neutral-400'
              }`}>
                <Clock className="w-3.5 h-3.5 text-amber-500" /> Timeline Duration
              </label>
              <input
                type="text"
                className={`w-full font-sans text-xs rounded-xl p-3 outline-none border ${
                  isLightMode 
                    ? 'bg-neutral-50 text-neutral-900 border-neutral-200 focus:border-blue-500' 
                    : 'bg-neutral-950/50 border-neutral-800 focus:bg-neutral-950 text-white'
                }`}
                placeholder="e.g. Under review (2 days), Q3"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
              />
            </div>
          </div>

          {/* DYNAMIC METADATA TAGS */}
          <div className="space-y-1.5">
            <label className={`text-[10px] font-mono uppercase tracking-widest flex items-center gap-1 font-bold ${
              isLightMode ? 'text-neutral-500' : 'text-neutral-400'
            }`}>
              <Hash className="w-3.5 h-3.5 text-purple-400" /> Hashtag Groupings
            </label>
            <input
              type="text"
              className={`w-full font-sans text-xs rounded-xl p-3 outline-none border ${
                isLightMode 
                  ? 'bg-neutral-50 text-neutral-900 border-neutral-200 focus:border-blue-500' 
                  : 'bg-neutral-950/50 border-neutral-800 focus:bg-neutral-950 text-white'
              }`}
              placeholder="Comma separated: security, backend, tls13"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
            <span className="block text-[9px] text-neutral-500 font-mono">Auto-prefixes tags with '#'</span>
          </div>

          {/* INTERACTIVE SUBTASK BUILDER */}
          <div className="space-y-2">
            <label className={`text-[10px] font-mono uppercase tracking-widest flex items-center gap-1 font-bold ${
              isLightMode ? 'text-neutral-500' : 'text-neutral-400'
            }`}>
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" /> Actionable Subtasks ({subtasks.length})
            </label>
            
            <div className="flex gap-2">
              <input
                type="text"
                className={`flex-1 font-sans text-xs rounded-xl p-2.5 outline-none border ${
                  isLightMode 
                    ? 'bg-neutral-50 text-neutral-900 border-neutral-200 focus:border-blue-500' 
                    : 'bg-neutral-950/50 border-neutral-800 focus:bg-neutral-950 text-white'
                }`}
                placeholder="Add subtask requirement..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 rounded-xl bg-blue-600 hover:bg-blue-550 text-white font-bold text-xs"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className={`p-3 rounded-2xl border space-y-1.5 max-h-[110px] overflow-y-auto scrollbar-thin ${
                isLightMode ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-950/40 border-neutral-805'
              }`}>
                {subtasks.map(sub => (
                  <div key={sub.id} className="flex items-center justify-between gap-2.5 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={sub.completed}
                        onChange={() => handleToggleSubtaskLocal(sub.id)}
                        className="rounded border-neutral-300 text-emerald-500 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span className={`truncate font-sans leading-none ${
                        sub.completed 
                          ? 'line-through text-neutral-500' 
                          : isLightMode ? 'text-neutral-800' : 'text-neutral-200'
                      }`}>
                        {sub.title}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(sub.id)}
                      className="text-neutral-500 hover:text-rose-500 p-1 rounded-md"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* IMPLEMENTATION NOTES */}
          <div className="space-y-1.5">
            <label className={`text-[10px] font-mono uppercase tracking-widest font-bold block ${
              isLightMode ? 'text-neutral-500' : 'text-neutral-400'
            }`}>
              Implementation Notes / Code Specs (Supports markdown/code styles)
            </label>
            <textarea
              rows={3}
              className={`w-full font-mono text-[10px] rounded-xl p-3 outline-none border resize-none ${
                isLightMode 
                  ? 'bg-neutral-50 focus:bg-white text-neutral-900 border-neutral-200 focus:border-blue-500' 
                  : 'bg-neutral-950/50 border-neutral-800 focus:bg-neutral-950 focus:border-neutral-700 text-emerald-450 dark:text-emerald-400'
              }`}
              placeholder="e.g. Use process.env.API_KEY securely. Run cpatch for XSS on output parameters."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

        </form>

        {/* Modal Submit Actions Footer */}
        <div className={`p-4.5 border-t gap-3.5 flex items-center justify-end flex-shrink-0 ${
          isLightMode ? 'border-neutral-150' : 'border-neutral-800/80'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2.5 rounded-xl text-xs transition duration-150 cursor-pointer ${
              isLightMode 
                ? 'bg-neutral-100/80 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900' 
                : 'bg-neutral-850 hover:bg-neutral-805 text-neutral-300 hover:text-white'
            }`}
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={(e) => handleValidateAndSubmit(e)}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer text-white bg-blue-600 hover:bg-blue-550 transition`}
          >
            <Save className="w-3.5 h-3.5 text-white" />
            <span>{taskToEdit ? "Recommit Spec" : "Commit Spec"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
