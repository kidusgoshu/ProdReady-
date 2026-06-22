import { PriorityType, ChecklistItem, CategoryInfo } from '../types';
import { Search, Plus, RotateCcw, Flame, AlertCircle, ArrowDownCircle, SlidersHorizontal, Layers } from 'lucide-react';

interface FilterSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | 'all';
  setSelectedCategory: (category: string | 'all') => void;
  selectedPriority: PriorityType | 'all';
  setSelectedPriority: (priority: PriorityType | 'all') => void;
  onOpenAddModal: () => void;
  onResetToDefaults: () => void;
  items: ChecklistItem[];
  categories: CategoryInfo[];
  isLightMode: boolean;
  accent: {
    primaryBg: string;
    primaryText: string;
    bgSubtle: string;
    borderAccent: string;
    accentBadge: string;
    tabActiveBg: string;
    tabActiveText: string;
  };
}

export default function FilterSection({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedPriority,
  setSelectedPriority,
  onOpenAddModal,
  onResetToDefaults,
  items,
  categories,
  isLightMode,
  accent
}: FilterSectionProps) {
  
  // Calculate quantity count for each Category dynamically
  const getCategoryCount = (catId: string | 'all') => {
    if (catId === 'all') return items.length;
    return items.filter(i => i.category === catId).length;
  };

  // Calculate high, medium, low counts
  const getPriorityCount = (prio: PriorityType | 'all') => {
    if (prio === 'all') return items.length;
    return items.filter(i => i.priority === prio).length;
  };

  return (
    <div 
      id="apple-filter-panel" 
      className={`p-5 rounded-3xl border transition-all duration-300 shadow-xl space-y-5 mb-8 ${
        isLightMode 
          ? 'bg-white border-neutral-200/85' 
          : 'bg-neutral-900/40 backdrop-blur-xl border-neutral-855/70'
      }`}
    >
      
      {/* =========================================================================
          ROW 1: Search left, Primary actions right
          ========================================================================= */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* iOS style Search Input */}
        <div className="relative flex-1">
          <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
            isLightMode ? 'text-neutral-400' : 'text-neutral-500'
          }`} />
          <input
            type="text"
            className={`w-full font-sans text-sm rounded-2xl py-3 pl-11 pr-4 outline-none transition-all duration-300 font-normal ${
              isLightMode 
                ? 'bg-neutral-100 focus:bg-white text-neutral-850 placeholder-neutral-450 border border-transparent focus:border-neutral-250' 
                : 'bg-neutral-950/70 focus:bg-neutral-950 border border-neutral-800/80 focus:border-neutral-750 text-neutral-200 placeholder-neutral-550'
            }`}
            placeholder="Search standards (e.g. CSRF, rate limit, encryption, team member name)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Primary actions aligned on the right */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 flex-shrink-0">
          <button
            onClick={onResetToDefaults}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-mono transition-all duration-200 font-medium whitespace-nowrap cursor-pointer flex-1 sm:flex-initial ${
              isLightMode 
                ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-950' 
                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800/60'
            }`}
            title="Reset active project back to base templates"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Current Project
          </button>

          <button
            onClick={onOpenAddModal}
            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-semibold cursor-pointer shadow-md transition-all duration-250 flex-1 sm:flex-initial text-white ${accent.primaryBg}`}
          >
            <Plus className="w-4 h-4 text-white" />
            Append Spec Check
          </button>
        </div>

      </div>

      {/* =========================================================================
          ROW 2: Phase filters as wrapped chips 
          ========================================================================= */}
      <div className="space-y-2 pt-2 border-t border-neutral-100/10">
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-mono uppercase tracking-widest flex items-center gap-1.5 font-bold ${
            isLightMode ? 'text-neutral-500' : 'text-neutral-450'
          }`}>
            <Layers className="w-3 h-3 text-blue-500" /> Focus Development Phase
          </span>
          <span className="text-[10px] font-mono text-neutral-500">
            Select phase to isolate criteria
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {/* Default ALL button */}
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 uppercase tracking-wide ${
              selectedCategory === 'all'
                ? isLightMode
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'bg-white text-neutral-950 font-bold'
                : isLightMode
                ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
                : 'bg-neutral-950/40 hover:bg-neutral-800 text-neutral-400 border border-transparent hover:border-neutral-800'
            }`}
          >
            <span>All Phases</span>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
              selectedCategory === 'all'
                ? isLightMode ? 'bg-neutral-700 text-white' : 'bg-neutral-250 text-neutral-900'
                : isLightMode ? 'bg-neutral-200 text-neutral-500' : 'bg-neutral-900 text-neutral-500'
            }`}>
              {getCategoryCount('all')}
            </span>
          </button>

          {/* Phase pills mapped dynamically per project */}
          {categories.map(cat => {
            const isSelected = selectedCategory === cat.id;
            const count = getCategoryCount(cat.id);

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? isLightMode
                      ? 'bg-neutral-800 text-white shadow-sm font-semibold'
                      : accent.tabActiveBg + ' font-bold'
                    : isLightMode
                    ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
                    : 'bg-neutral-950/45 hover:bg-neutral-800 text-neutral-400 border border-transparent hover:border-neutral-800'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                  isSelected
                    ? isLightMode ? 'bg-neutral-600 text-white' : 'bg-neutral-950/30'
                    : isLightMode ? 'bg-neutral-200 text-neutral-500' : 'bg-neutral-900 text-neutral-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          ROW 3: Criticality filters as compact Segmented Controls
          ========================================================================= */}
      <div className={`pt-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isLightMode ? 'border-neutral-150' : 'border-neutral-800/40'
      }`}>
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className={`w-3.5 h-3.5 ${isLightMode ? 'text-neutral-500' : 'text-neutral-400'}`} />
          <span className={`text-[10px] font-mono uppercase tracking-widest font-bold ${
            isLightMode ? 'text-neutral-550' : 'text-neutral-400'
          }`}>
            Risk Criticality Safeguard
          </span>
        </div>

        {/* Balanced segmented layout mimicking native preferences */}
        <div className={`p-1 rounded-2xl flex items-center gap-0.5 max-w-[340px] w-full self-start sm:self-center border ${
          isLightMode ? 'bg-neutral-100 border-neutral-200' : 'bg-neutral-950/90 border-neutral-850'
        }`}>
          
          {/* ALL SEGMENT */}
          <button
            onClick={() => setSelectedPriority('all')}
            className={`flex-1 text-center py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
              selectedPriority === 'all'
                ? isLightMode 
                  ? 'bg-white text-neutral-900 shadow-sm' 
                  : 'bg-neutral-800 text-white shadow'
                : 'text-neutral-500 hover:text-neutral-400'
            }`}
          >
            All <span className="text-[9px] opacity-70">({getPriorityCount('all')})</span>
          </button>

          {/* HIGH SEGMENT */}
          <button
            onClick={() => setSelectedPriority('high')}
            className={`flex-1 text-center py-2 px-3 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer flex items-center justify-center gap-1 ${
              selectedPriority === 'high'
                ? isLightMode 
                  ? 'bg-rose-100 text-rose-700 shadow-sm' 
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'text-rose-500/60 hover:text-rose-500'
            }`}
            title="High Risks"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>High</span>
            <span className="text-[9px] opacity-80">({getPriorityCount('high')})</span>
          </button>

          {/* MEDIUM SEGMENT */}
          <button
            onClick={() => setSelectedPriority('medium')}
            className={`flex-1 text-center py-2 px-3 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer flex items-center justify-center gap-1 ${
              selectedPriority === 'medium'
                ? isLightMode 
                  ? 'bg-amber-100 text-amber-500 shadow-sm' 
                  : 'bg-amber-500/20 text-amber-400 border border-emerald-500/10 border-amber-500/30'
                : 'text-amber-500/60 hover:text-amber-500'
            }`}
            title="Medium Risks"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Med</span>
            <span className="text-[9px] opacity-80">({getPriorityCount('medium')})</span>
          </button>

          {/* LOW SEGMENT */}
          <button
            onClick={() => setSelectedPriority('low')}
            className={`flex-1 text-center py-2 px-3 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer flex items-center justify-center gap-1 ${
              selectedPriority === 'low'
                ? isLightMode 
                  ? 'bg-blue-100 text-blue-755 shadow-sm' 
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-blue-500/60 hover:text-blue-500'
            }`}
            title="Low Risks"
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
            <span>Low</span>
            <span className="text-[9px] opacity-80">({getPriorityCount('low')})</span>
          </button>

        </div>
      </div>

    </div>
  );
}
