import React from 'react';
import { Project, ChecklistItem, Teammate, CategoryInfo } from '../types';
import { 
  X, Printer, Shield, ChevronRight, Award, Trophy, Users, CheckCircle2, 
  AlertTriangle, Clock, Calendar, CheckSquare, Activity, FileCheck
} from 'lucide-react';

interface ExecutiveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  isLightMode: boolean;
}

export default function ExecutiveReportModal({
  isOpen,
  onClose,
  project,
  isLightMode
}: ExecutiveReportModalProps) {
  if (!isOpen) return null;

  const totalTasks = project.items.length;
  const completedTasks = project.items.filter(i => i.status === 'completed').length;
  const inProgressTasks = project.items.filter(i => i.status === 'in-progress').length;
  const todoTasks = project.items.filter(i => i.status === 'todo').length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const highPriorityTasks = project.items.filter(i => i.priority === 'high');
  const outstandingHighPriority = highPriorityTasks.filter(i => i.status !== 'completed');

  // Teammate metrics compiler
  interface MemberMetrics {
    member: Teammate;
    assignedCount: number;
    completedCount: number;
    inProgressCount: number;
    todoCount: number;
    criticalPending: number;
    efficiencyRating: string;
    reviewComment: string;
  }

  const memberMetrics: MemberMetrics[] = project.team.map(m => {
    const assigned = project.items.filter(i => i.assignedTo?.includes(m.id));
    const completed = assigned.filter(i => i.status === 'completed').length;
    const inProgress = assigned.filter(i => i.status === 'in-progress').length;
    const todo = assigned.filter(i => i.status === 'todo').length;
    const critical = assigned.filter(i => i.priority === 'high' && i.status !== 'completed').length;

    let efficiency = '0%';
    let review = '';
    if (assigned.length > 0) {
      const percentage = Math.round((completed / assigned.length) * 100);
      efficiency = `${percentage}%`;
      
      if (percentage >= 80) {
        review = 'Excellent velocity. Consistently meeting high staging security parameters ahead of shipping.';
      } else if (percentage >= 50) {
        review = 'Optimal contribution. Actively validating complex staging benchmarks and deployment operations.';
      } else if (critical > 0) {
        review = 'Action needed. Currently holding outstanding critical items. Needs cross-functional assistance.';
      } else {
        review = 'Validation stage. Developing code logic resilience, under reviewing for integration compliance.';
      }
    } else {
      efficiency = 'N/A';
      review = 'Awaiting allocation. No active compliance assignments declared in the current release iteration.';
    }

    return {
      member: m,
      assignedCount: assigned.length,
      completedCount: completed,
      inProgressCount: inProgress,
      todoCount: todo,
      criticalPending: critical,
      efficiencyRating: efficiency,
      reviewComment: review
    };
  });

  // Category statistics compiler
  const categoryStats = project.categories.map(cat => {
    const catItems = project.items.filter(i => i.category === cat.id);
    const catDone = catItems.filter(i => i.status === 'completed').length;
    return {
      category: cat,
      total: catItems.length,
      done: catDone,
      percent: catItems.length > 0 ? Math.round((catDone / catItems.length) * 105) : 0 // slight aesthetic bias or normal capping
    };
  });

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-lg bg-neutral-950/70 overflow-y-auto print:bg-white print:absolute print:inset-0 print:p-0">
      
      <div 
        id="printable-executive-report"
        className={`w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none ${
          isLightMode 
            ? 'bg-white border-neutral-200 text-neutral-800' 
            : 'bg-neutral-900 border-neutral-800 text-white'
        }`}
      >
        
        {/* Header (Hidden in Print) */}
        <div className="p-5 border-b flex items-center justify-between print:hidden border-neutral-200/60 dark:border-neutral-800/85">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight text-neutral-900 dark:text-white">
                Executive Audit & Performance Report
              </h3>
              <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                Staging to Production Validation Review
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerPrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-550 text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print to PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Report Canvas Frame Container */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 font-sans print:overflow-visible print:px-4 print:py-6 print:text-black">
          
          {/* Cover Header Block */}
          <div className="border-b-4 border-blue-600 pb-6 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
              <span className="text-[10px] font-mono uppercase tracking-widest bg-blue-500/15 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full font-black print:text-xs">
                PRODREADY CONSOLIDATED AUDIT SPECIFICATION
              </span>
              <span className="text-xs font-mono text-neutral-500">
                Report Date: {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
              {project.name}
            </h1>
            <p className="text-xs text-neutral-500 max-w-3xl leading-relaxed">
              {project.description || 'Verified and compiled software compliance checklist tracking data integrity, secrets lifecycle, and architectural specifications.'}
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200/80 dark:border-neutral-805">
              <span className="text-[10px] font-mono uppercase block text-neutral-500">Overall Progress</span>
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono tracking-tight">{progressPercent}%</span>
              <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-blue-500 h-full" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200/80 dark:border-neutral-805">
              <span className="text-[10px] font-mono uppercase block text-neutral-500">Completed Specifications</span>
              <span className="text-2xl font-black text-emerald-500 font-mono tracking-tight">{completedTasks} <span className="text-xs text-neutral-500 font-normal">/ {totalTasks}</span></span>
              <span className="block text-[10px] text-neutral-500 mt-1">{totalTasks - completedTasks} outstanding steps</span>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200/80 dark:border-neutral-805">
              <span className="text-[10px] font-mono uppercase block text-neutral-500">Active Validation</span>
              <span className="text-2xl font-black text-amber-500 font-mono tracking-tight">{inProgressTasks}</span>
              <span className="block text-[10px] text-neutral-500 mt-1">Undergoing testing loops</span>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200/80 dark:border-neutral-805">
              <span className="text-[10px] font-mono uppercase block text-neutral-500">Outstanding High Risk</span>
              <span className={`text-2xl font-black font-mono tracking-tight ${outstandingHighPriority.length > 0 ? 'text-rose-500 font-bold' : 'text-neutral-500'}`}>
                {outstandingHighPriority.length}
              </span>
              <span className="block text-[10px] text-neutral-500 mt-1">Must resolve before ship</span>
            </div>

          </div>

          {/* Section: Operational Performance Index */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2 border-neutral-200 dark:border-neutral-800">
              <Activity className="w-4.5 h-4.5 text-blue-500" />
              <h2 className="text-base font-extrabold tracking-tight text-neutral-900 dark:text-white">
                Staging Team Performance Review (Velocity Index)
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[600px]">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-mono font-bold uppercase text-[9px] tracking-wider bg-neutral-500/5">
                    <th className="py-2.5 px-3">Collaborator / Position</th>
                    <th className="py-2.5 px-3 text-center">Assigned</th>
                    <th className="py-2.5 px-3 text-center">Signed Off</th>
                    <th className="py-2.5 px-3 text-center">Running</th>
                    <th className="py-2.5 px-3 text-center">Blocked High</th>
                    <th className="py-2.5 px-3 text-center">Staged KPI</th>
                    <th className="py-2.5 px-3">Performance Comment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-805">
                  {memberMetrics.map(item => (
                    <tr key={item.member.id} className="hover:bg-neutral-500/5">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-mono font-bold ${item.member.avatarColor}`}>
                            {item.member.name.split(' ').map(n=>n[0]).join('')}
                          </div>
                          <div>
                            <span className="font-bold block text-neutral-850 dark:text-neutral-200">{item.member.name}</span>
                            <span className="text-[9px] text-neutral-500 font-mono">{item.member.role}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold">{item.assignedCount}</td>
                      <td className="py-3 px-3 text-center font-mono text-emerald-500 font-bold">{item.completedCount}</td>
                      <td className="py-3 px-3 text-center font-mono text-amber-500">{item.inProgressCount}</td>
                      <td className={`py-3 px-3 text-center font-mono font-bold ${item.criticalPending > 0 ? 'text-rose-500' : 'text-neutral-400'}`}>
                        {item.criticalPending}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-blue-600 dark:text-blue-400">
                        {item.efficiencyRating}
                      </td>
                      <td className="py-3 px-3 text-neutral-600 dark:text-neutral-400 leading-relaxed text-[11px] max-w-xs truncate" title={item.reviewComment}>
                        {item.reviewComment}
                      </td>
                    </tr>
                  ))}
                  {memberMetrics.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-4 text-center text-neutral-500 italic">No assigned crew members available on roster to compile metrics.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Category/Phase Gating Health */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2 border-neutral-200 dark:border-neutral-800">
              <CheckSquare className="w-4.5 h-4.5 text-blue-500" />
              <h2 className="text-base font-extrabold tracking-tight text-neutral-900 dark:text-white">
                Operational Domains Gating Matrix
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {categoryStats.map(stat => {
                const isComplete = stat.done === stat.total && stat.total > 0;
                return (
                  <div key={stat.category.id} className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-805 bg-neutral-50 dark:bg-radial from-neutral-950/20 text-xs">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-bold text-neutral-800 dark:text-neutral-200 truncate pr-1">{stat.category.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                        isComplete 
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : stat.total === 0 ? 'bg-neutral-500/10 text-neutral-500' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {stat.total === 0 ? 'Empty' : isComplete ? 'PASSED 100%' : 'PENDING'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-mono text-[9px] text-neutral-500 mb-1">
                      <span>Valedation checklist steps:</span>
                      <span>{stat.done} / {stat.total}</span>
                    </div>
                    {/* Progress Bar overlay */}
                    <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${stat.percent > 100 ? 100 : stat.percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: High & Medium Risks Outstanding Checklist */}
          {outstandingHighPriority.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2 border-rose-500/30">
                <AlertTriangle className="w-4.5 h-4.5 text-rose-500" />
                <h2 className="text-base font-extrabold tracking-tight text-rose-500">
                  Critical Vulnerabilities & Staging Blockers
                </h2>
              </div>

              <div className="space-y-3.5">
                {outstandingHighPriority.map(task => {
                  const phase = project.categories.find(c => c.id === task.category)?.name || 'General';
                  const leads = project.team.filter(t => task.assignedTo?.includes(t.id)).map(t => t.name).join(', ') || 'Unassigned';
                  return (
                    <div key={task.id} className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-xs flex flex-col gap-1">
                      <div className="flex items-start md:items-center justify-between gap-2.5">
                        <span className="font-bold text-neutral-900 dark:text-neutral-100">{task.title}</span>
                        <span className="text-[9px] font-mono whitespace-nowrap bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2 py-0.5 rounded-full uppercase tracking-wide font-black">
                          CRITICAL DEPLOY RISK
                        </span>
                      </div>
                      <p className="text-neutral-600 dark:text-neutral-400 text-[11px] mt-1 pr-1 leads-relaxed">
                        {task.description}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[9px] font-mono text-neutral-500 border-t border-dashed border-rose-500/15 pt-2">
                        <span>Phase Milestone: <strong className="text-neutral-600 dark:text-neutral-400">{phase}</strong></span>
                        <span>Assignee owner: <strong className="text-neutral-600 dark:text-neutral-400">{leads}</strong></span>
                        {task.dueDate && <span>Deadline: <strong className="text-rose-500 font-bold">{task.dueDate}</strong></span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Summary Executive Signoff Log (Signature blocks for PDF report prints) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t pt-10 border-neutral-300 dark:border-neutral-800">
            <div>
              <p className="text-xs italic text-neutral-500 dark:text-neutral-400 leading-relaxed">
                "Compliance verification ensures client databases, rate policies, PII encryption blocks, OAuth models, and regression CI matrices conform strictly to high staging parameters. Any skipped checks are done under explicit product architectural decision risk exception codes."
              </p>
              <div className="flex items-center gap-1.5 mt-4 text-[10px] font-mono text-neutral-400">
                <Activity className="w-3.5 h-3.5 text-blue-500" />
                <span>Computed validation score: {progressPercent}% of target specifications.</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border-b border-neutral-400 dark:border-neutral-700 pb-1.5 flex flex-col justify-end min-h-[60px] text-[10px] text-center font-mono">
                <span className="text-neutral-400 block font-bold">QA Lead Signature</span>
                <span className="text-neutral-500 text-[8px] uppercase block">Validation Date</span>
              </div>
              <div className="border-b border-neutral-400 dark:border-neutral-700 pb-1.5 flex flex-col justify-end min-h-[60px] text-[10px] text-center font-mono">
                <span className="text-neutral-400 block font-bold">DevSecOps signoff</span>
                <span className="text-neutral-500 text-[8px] uppercase block">Ship release Code</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer print note */}
        <div className="p-4 bg-neutral-100 dark:bg-neutral-950/40 text-center text-[9px] font-mono text-neutral-500 border-t border-neutral-200/40 dark:border-neutral-900 print:bg-white print:text-black">
          Report compiled off-site securely via ProdReady Consolidated STG. No external API logs stored.
        </div>

      </div>

    </div>
  );
}
