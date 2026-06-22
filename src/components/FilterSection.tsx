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

        <div className="flex flex-wrap gap-1.5 animate-fade-in">
          {/* Default ALL button */}
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 uppercase tracking-wide border rounded-md ${
              selectedCategory === 'all'
                ? 'bg-accent text-accent-foreground border-neutral-300 dark:border-neutral-700 bg-neutral-250 dark:bg-neutral-800 text-neutral-950 dark:text-neutral-50 shadow-sm font-semibold'
                : 'bg-transparent text-muted-foreground text-neutral-500 dark:text-neutral-450 border-transparent hover:bg-muted hover:bg-neutral-100 dark:hover:bg-neutral-900 font-normal'
            }`}
          >
            <span>All Phases</span>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
              selectedCategory === 'all'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
                : 'border border-neutral-300 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400'
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
                className={`px-3.5 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 border rounded-md ${
                  isSelected
                    ? 'bg-accent text-accent-foreground border-neutral-300 dark:border-neutral-700 bg-neutral-250 dark:bg-neutral-800 text-neutral-950 dark:text-neutral-50 shadow-sm font-semibold'
                    : 'bg-transparent text-muted-foreground text-neutral-500 dark:text-neutral-455 border-transparent hover:bg-muted hover:bg-neutral-100 dark:hover:bg-neutral-900 font-normal'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                  isSelected
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
                    : 'border border-neutral-300 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          ROW 3: Criticality filters promoted to 3 Clickable Metric Cards
          ========================================================================= */}
      <div className={`pt-4 border-t ${
        isLightMode ? 'border-neutral-150' : 'border-neutral-800/40'
      }`}>
        <div className="flex items-center gap-1.5 mb-3.5">
          <SlidersHorizontal className={`w-3.5 h-3.5 ${isLightMode ? 'text-neutral-500' : 'text-neutral-400'}`} />
          <span className={`text-[10px] font-mono uppercase tracking-widest font-bold ${
            isLightMode ? 'text-neutral-550' : 'text-neutral-400'
          }`}>
            Risk Criticality Safeguard
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* HIGH CARD */}
          <button
            onClick={() => setSelectedPriority(selectedPriority === 'high' ? 'all' : 'high')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 text-center cursor-pointer ${
              selectedPriority === 'high'
                ? 'ring-2 ring-red-500 border-red-500 scale-[1.02]'
                : 'border-transparent'
            } ${
              isLightMode 
                ? 'bg-red-50 text-red-800 hover:bg-red-100/60 shadow-xs' 
                : 'bg-red-900/40 text-red-200 hover:bg-radial border-neutral-900/50'
            }`}
          >
            <span className="text-xl font-medium">{getPriorityCount('high')}</span>
            <span className="text-xs">High</span>
          </button>

          {/* MEDIUM CARD */}
          <button
            onClick={() => setSelectedPriority(selectedPriority === 'medium' ? 'all' : 'medium')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 text-center cursor-pointer ${
              selectedPriority === 'medium'
                ? 'ring-2 ring-amber-500 border-amber-500 scale-[1.02]'
                : 'border-transparent'
            } ${
              isLightMode 
                ? 'bg-amber-50 text-amber-800 hover:bg-amber-100/60 shadow-xs' 
                : 'bg-amber-900/40 text-amber-200 hover:bg-radial border-neutral-900/50'
            }`}
          >
            <span className="text-xl font-medium">{getPriorityCount('medium')}</span>
            <span className="text-xs">Med</span>
          </button>

          {/* LOW CARD */}
          <button
            onClick={() => setSelectedPriority(selectedPriority === 'low' ? 'all' : 'low')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 text-center cursor-pointer ${
              selectedPriority === 'low'
                ? 'ring-2 ring-green-500 border-green-500 scale-[1.02]'
                : 'border-transparent'
            } ${
              isLightMode 
                ? 'bg-green-50 text-green-800 hover:bg-green-100/60 shadow-xs' 
                : 'bg-green-900/40 text-green-200 hover:bg-radial border-neutral-900/50'
            }`}
          >
            <span className="text-xl font-medium">{getPriorityCount('low')}</span>
            <span className="text-xs">Low</span>
          </button>
        </div>
      </div>

    </div>
  );
}
