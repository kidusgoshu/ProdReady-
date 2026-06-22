import React from 'react';
import { Stats, CategoryInfo, ChecklistItem, Teammate } from '../types';
import { 
  Shield, Server, Code2, CheckSquare, Database, FileText, 
  AlertCircle, CheckCircle2, Circle, TrendingUp, Users,
  Layers, Cpu, Globe, Lock, Settings, Terminal
} from 'lucide-react';

interface StatsSectionProps {
  stats: Stats;
  items: ChecklistItem[];
  categories: CategoryInfo[];
  team: Teammate[];
  onSelectCategory: (category: string | 'all') => void;
  selectedCategory: string | 'all';
  isLightMode: boolean;
  accent: {
    primaryText: string;
    progressBar: string;
  };
  onAssignClick?: (memberId: string) => void;
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

export default function StatsSection({ 
  stats, 
  items, 
  categories,
  team,
  onSelectCategory, 
  selectedCategory,
  isLightMode,
  accent,
  onAssignClick
}: StatsSectionProps) {
  
  // Calculate category-specific progress dynamically based on project defined focus subgroups
  const categoryStats = categories.map(cat => {
    const catItems = items.filter(item => item.category === cat.id);
    const total = catItems.length;
    const completed = catItems.filter(item => item.status === 'completed').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      category: cat,
      total,
      completed,
      percentage
    };
  });

  // Teammate level progress calculations
  const teammateStats = team.map(member => {
    const assignedItems = items.filter(item => item.assignedTo?.includes(member.id));
    const total = assignedItems.length;
    const completed = assignedItems.filter(item => item.status === 'completed').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      member,
      total,
      completed,
      percentage
    };
  });

  // SVG parameters for standard circle gauge
  const radius = 48;
  const strokeWidth = 9;
  const circumference = 2 * Math.PI * radius;
  const fillOffset = circumference - (stats.progressPercentage / 100) * circumference;

  return (
    <div id="stats-section-container" className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      
      {/* =========================================================================
          COLUMN 1: DYNAMIC OVERALL PROGRESS RADIAL WIDGET
          ========================================================================= */}
      <div 
        id="overall-progress-card" 
        className={`rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group shadow-lg transition duration-300 border ${
          isLightMode 
            ? 'bg-white border-neutral-200/95 shadow-neutral-100' 
            : 'bg-neutral-900/60 backdrop-blur-xl border-neutral-800/80'
        }`}
      >
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl group-hover:opacity-100 transition-all duration-700 ${
          isLightMode ? 'bg-blue-500/5 group-hover:bg-blue-500/10' : 'bg-emerald-500/10 group-hover:bg-emerald-500/20'
        }`} />
        
        <div className="flex flex-col space-y-2 text-center md:text-left z-10">
          <span className={`text-[10px] font-mono uppercase tracking-widest font-extrabold ${
            isLightMode ? 'text-neutral-450' : 'text-neutral-500'
          }`}>Ready Quotient</span>
          <h2 className={`text-2xl font-black tracking-tight font-sans ${
            isLightMode ? 'text-neutral-900' : 'text-white'
          }`}>Project Velocity</h2>
          <p className={`text-xs max-w-[190px] leading-relaxed ${
            isLightMode ? 'text-neutral-600' : 'text-neutral-400'
          }`}>
            {stats.progressPercentage === 100 
              ? "100% production certified! Launch instantly." 
              : stats.progressPercentage > 75 
              ? "Vibe checks robust! Secure final deployment thresholds."
              : stats.progressPercentage > 40
              ? "Midway verification active. Core safeguards locked."
              : "Early staging. Defining essential validation parameters."}
          </p>
        </div>

        {/* Circular Progress Gauge */}
        <div className="relative flex items-center justify-center w-32 h-32 z-10 select-none">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              className={isLightMode ? 'stroke-neutral-100' : 'stroke-neutral-850'}
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Fill ring with selected accent path */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              className={`transition-all duration-1000 ease-out ${
                isLightMode ? 'stroke-blue-600' : 'stroke-emerald-500'
              }`}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={fillOffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className={`text-2xl font-black font-mono tracking-tight ${
              isLightMode ? 'text-neutral-900' : 'text-white'
            }`}>{stats.progressPercentage}%</span>
            <span className={`text-[8px] font-mono uppercase tracking-wider font-bold ${
              isLightMode ? 'text-neutral-550' : 'text-neutral-500'
            }`}>Overall</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          COLUMN 2: DYNAMIC ACTIVE PHASES SUMMARY
          ========================================================================= */}
      <div 
        id="category-stats-card" 
        className={`rounded-3xl p-5 flex flex-col justify-between shadow-lg transition duration-300 border ${
          isLightMode 
            ? 'bg-white border-neutral-200/90 hover:border-neutral-300' 
            : 'bg-neutral-900/60 backdrop-blur-xl border-neutral-800/85 hover:border-neutral-750'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col">
            <span className={`text-[10px] font-mono uppercase tracking-widest font-extrabold ${
              isLightMode ? 'text-neutral-450' : 'text-neutral-500'
            }`}>Focus Phases</span>
            <span className={`text-xs font-bold ${isLightMode ? 'text-neutral-800' : 'text-neutral-200'}`}>Dynamic Swimlanes</span>
          </div>
          <span className={`text-[10px] font-mono flex items-center gap-1 font-bold ${
            isLightMode ? 'text-neutral-600 font-semibold' : 'text-emerald-400'
          }`}>
            <TrendingUp className="w-3.5 h-3.5" />
            Targets
          </span>
        </div>

        <div className="space-y-1.5 max-h-[170px] overflow-y-auto pr-1 scrollbar-thin">
          {categoryStats.map(({ category, total, completed, percentage }) => {
            const IconComponent = categoryIcons[category.icon] || Shield;
            const isSelected = selectedCategory === category.id;

            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(isSelected ? 'all' : category.id)}
                className={`w-full text-left p-1.5 rounded-xl transition-all duration-150 flex items-center gap-2.5 border ${
                  isSelected 
                    ? isLightMode
                      ? 'bg-neutral-100 border-neutral-250'
                      : 'bg-neutral-800/80 border-neutral-700 shadow-xs' 
                    : 'bg-transparent border-transparent hover:bg-neutral-500/5'
                }`}
              >
                <div className={`p-1.5 rounded-lg border flex-shrink-0 ${
                  isLightMode 
                    ? 'bg-neutral-50 border-neutral-200 text-neutral-600'
                    : category.color
                }`}>
                  <IconComponent className="w-3 h-3" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={`font-semibold text-xs truncate ${
                      isLightMode ? 'text-neutral-850' : 'text-neutral-200'
                    }`}>{category.name}</span>
                    <span className={`font-mono text-[9px] font-bold ${
                      isLightMode ? 'text-neutral-500' : 'text-neutral-450'
                    }`}>{completed}/{total} ({percentage}%)</span>
                  </div>
                  
                  {/* Linear progress track */}
                  <div className={`w-full h-1 rounded-full overflow-hidden ${
                    isLightMode ? 'bg-neutral-150' : 'bg-neutral-800'
                  }`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLightMode 
                          ? 'bg-blue-600'
                          : category.id === 'security' ? 'bg-emerald-500' :
                            category.id === 'infrastructure' ? 'bg-blue-500' :
                            category.id === 'code-logic' ? 'bg-purple-500' :
                            category.id === 'testing-ci' ? 'bg-orange-500' :
                            category.id === 'data-integrity' ? 'bg-pink-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
          {categoryStats.length === 0 && (
            <div className={`text-center py-6 text-xs ${isLightMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
              No phases defined. Complete from scratch!
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          COLUMN 3: COHESIVE TEAM DELEGATION & COLLABORATOR TRACKING
          ========================================================================= */}
      <div 
        id="team-progress-card" 
        className={`rounded-3xl p-5 flex flex-col justify-between shadow-lg transition duration-300 border ${
          isLightMode 
            ? 'bg-white border-neutral-200/90 hover:border-neutral-300' 
            : 'bg-neutral-900/60 backdrop-blur-xl border-neutral-800/85 hover:border-neutral-750'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col">
            <span className={`text-[10px] font-mono uppercase tracking-widest font-extrabold ${
              isLightMode ? 'text-neutral-450' : 'text-neutral-500'
            }`}>Online Crew</span>
            <span className={`text-xs font-bold ${isLightMode ? 'text-neutral-800' : 'text-neutral-200'}`}>Team Performance</span>
          </div>
          <span className={`text-[10px] font-mono flex items-center gap-1 font-bold ${
            isLightMode ? 'text-neutral-500' : 'text-neural-500 text-neutral-400'
          }`}>
            <Users className="w-3.5 h-3.5 text-blue-500" />
            {team.length} Assigned
          </span>
        </div>

        <div className="space-y-1.5 max-h-[170px] overflow-y-auto pr-1 scrollbar-thin">
          {teammateStats.map(({ member, total, completed, percentage }) => (
            <div
              key={member.id}
              className={`p-1.5 rounded-xl flex items-center gap-2.5 border transition ${
                isLightMode 
                  ? 'bg-neutral-50/50 border-neutral-100' 
                  : 'bg-neutral-950/20 border-neutral-850/30'
              }`}
            >
              {/* Teammate Circle Icon / Initials */}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-mono font-black border ${member.avatarColor} border-white/10 shrink-0`}>
                {member.name.split(' ').map(n=>n[0]).join('').substr(0,2).toUpperCase()}
              </div>

              {/* Teammate Metrics */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3 text-left">
                  <div className="truncate flex-1">
                    <p className={`text-xs font-bold leading-none flex items-center gap-1.5 ${isLightMode ? 'text-neutral-800' : 'text-white'}`}>
                      <span className="truncate">{member.name}</span>
                      <button
                        onClick={() => onAssignClick?.(member.id)}
                        className="text-[10px] text-blue-500 dark:text-blue-400 font-semibold hover:bg-neutral-500/10 hover:underline px-1.5 py-0.5 rounded cursor-pointer transition shrink-0"
                      >
                        + assign
                      </button>
                    </p>
                    <span className={`text-[9px] font-mono leading-none ${isLightMode ? 'text-neutral-400' : 'text-neutral-550'}`}>{member.role}</span>
                  </div>

                  {total === 0 ? (
                    <span className="text-xs text-muted-foreground text-neutral-500 dark:text-neutral-450 shrink-0 font-normal">
                      No tasks assigned
                    </span>
                  ) : (
                    <div className="w-24 shrink-0 space-y-1">
                      <div className="w-full h-1 rounded-full bg-muted bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-primary bg-blue-600 dark:bg-emerald-500 transition-all duration-300"
                          style={{ width: `${(completed / total) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[8px] font-mono text-neutral-500 dark:text-neutral-400 leading-none">
                        <span>{Math.round((completed / total) * 100)}%</span>
                        <span>{completed}/{total}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {team.length === 0 && (
            <div className={`text-center py-6 text-xs ${isLightMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
              No collaborators defined yet. Add teammates to delegate specs!
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
