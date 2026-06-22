import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChecklistItem, CategoryInfo, Teammate, Project, PriorityType, StatusType, Stats, ThemeType, ColorSchemeType } from './types';
import { INITIAL_ITEMS, CATEGORIES, DEFAULT_TEAM } from './data';
import StatsSection from './components/StatsSection';
import FilterSection from './components/FilterSection';
import TaskBoard from './components/TaskBoard';
import TaskModal from './components/TaskModal';
import ExecutiveReportModal from './components/ExecutiveReportModal';
import NotificationToast, { ToastMessage } from './components/NotificationToast';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, Cloud, Sparkles, Key, AlertTriangle, Hammer, 
  Sun, Moon, Monitor, Palette, Plus, FolderPlus, Trash2, 
  Mail, Share2, FileText, CheckCircle2, ChevronRight, 
  Settings, Users, Layers, Upload, Download, Copy, Check, Info, FileCode,
  Printer, FileCheck
} from 'lucide-react';

const PROJECTS_STORAGE_KEY = 'vibe_to_prod_multi_projects';
const ACTIVE_PROJECT_KEY = 'vibe_to_prod_active_project_id';
const THEME_STORAGE_KEY = 'vibe_to_prod_apple_theme';
const SCHEME_STORAGE_KEY = 'vibe_to_prod_apple_color_scheme';

export default function App() {
  // --- CORE SYSTEM PROJECTS STATE ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');

  // --- SELECTION & INTERACTION STATES ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<PriorityType | 'all'>('all');

  // --- UI SWITCHES & DRAWERS ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<ChecklistItem | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // --- ADMINISTRATION DRAWERS ---
  const [currentAdminTab, setCurrentAdminTab] = useState<'none' | 'phases' | 'team' | 'import-export'>('none');

  // --- CUSTOM PROJECT GENERATOR FIELDS ---
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [projectPreset, setProjectPreset] = useState<'empty' | 'blueprint'>('blueprint');
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);

  // --- CUSTOM PHASE FIELDS ---
  const [phaseName, setPhaseName] = useState('');
  const [phaseDesc, setPhaseDesc] = useState('');
  const [phaseIcon, setPhaseIcon] = useState('Shield');
  const [phaseColor, setPhaseColor] = useState('default');

  // --- CUSTOM TEAM MEMBER FIELDS ---
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberAvatar, setMemberAvatar] = useState('bg-blue-500');

  // --- JSON IMPORT FIELD ---
  const [jsonImportText, setJsonImportText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- THEME & DECORATORS ---
  const [theme, setTheme] = useState<ThemeType>(() => {
    return (localStorage.getItem(THEME_STORAGE_KEY) as ThemeType) || 'system';
  });
  const [colorScheme, setColorScheme] = useState<ColorSchemeType>(() => {
    return (localStorage.getItem(SCHEME_STORAGE_KEY) as ColorSchemeType) || 'default';
  });

  // Handle system color theme preference
  const [systemIsLight, setSystemIsLight] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mql = window.matchMedia('(prefers-color-scheme: light)');
      setSystemIsLight(mql.matches);
      const listener = (e: MediaQueryListEvent) => setSystemIsLight(e.matches);
      mql.addEventListener('change', listener);
      return () => mql.removeEventListener('change', listener);
    }
  }, []);

  const isLightMode = useMemo(() => {
    if (theme === 'light') return true;
    if (theme === 'dark') return false;
    return systemIsLight;
  }, [theme, systemIsLight]);

  // Persist settings preferences
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(SCHEME_STORAGE_KEY, colorScheme);
  }, [colorScheme]);

  // Toast notifier helper
  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({
      id: Math.random().toString(),
      text,
      type
    });
  };

  // --- PROJECT PARSING & INITIAL DATA LOADING ---
  useEffect(() => {
    setIsSyncing(true);
    try {
      // 1. Check for shared project incoming via Magic URL Query string
      const urlParams = new URLSearchParams(window.location.search);
      const sharedPayload = urlParams.get('shared');
      let restoredProjects: Project[] = [];

      const storedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (storedProjects) {
        restoredProjects = JSON.parse(storedProjects);
      }

      if (sharedPayload) {
        try {
          const decoded = decodeURIComponent(escape(atob(sharedPayload)));
          const parsedProject = JSON.parse(decoded) as Project;
          if (parsedProject && parsedProject.name && parsedProject.items) {
            // Check if project already stored by matching ID or name
            const existsIdx = restoredProjects.findIndex(p => p.id === parsedProject.id || p.name === parsedProject.name);
            if (existsIdx > -1) {
              restoredProjects[existsIdx] = parsedProject;
            } else {
              restoredProjects.unshift(parsedProject);
            }
            localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(restoredProjects));
            localStorage.setItem(ACTIVE_PROJECT_KEY, parsedProject.id);
            setActiveProjectId(parsedProject.id);
            showToast(`Imported shared project "${parsedProject.name}" instantly!`, 'success');
            
            // Clean up the URL search query without reloading
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
          }
        } catch (decErr) {
          console.error("Magic link decay error", decErr);
          showToast("Failed to parse shared team URL.", "warning");
        }
      }

      // 2. Fallbacks if no projects in localStorage
      if (restoredProjects.length === 0) {
        const baselineProject: Project = {
          id: 'project-baseline',
          name: 'Classic ProdReady Baseline',
          description: 'The standard system security, infrastructure, and resilience compliance checklists out-of-the-box.',
          categories: CATEGORIES,
          items: INITIAL_ITEMS,
          team: DEFAULT_TEAM,
          createdAt: new Date().toISOString()
        };
        restoredProjects = [baselineProject];
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(restoredProjects));
      }

      setProjects(restoredProjects);

      // 3. Set Active Projects ID
      const storedActiveId = localStorage.getItem(ACTIVE_PROJECT_KEY);
      if (storedActiveId && restoredProjects.some(p => p.id === storedActiveId)) {
        setActiveProjectId(storedActiveId);
      } else {
        setActiveProjectId(restoredProjects[0].id);
      }
    } catch (err) {
      console.error('Initialization crash', err);
      showToast('State synchronization refresh required.', 'warning');
    } finally {
      setTimeout(() => setIsSyncing(false), 250);
    }
  }, []);

  // Sync state changes to projects array
  const persistProjectsList = (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    setIsSyncing(true);
    try {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updatedProjects));
      setTimeout(() => setIsSyncing(false), 150);
    } catch (err) {
      console.error('Persistence failure', err);
      showToast('Offline sync synchronization failure.', 'warning');
      setIsSyncing(false);
    }
  };

  // Derive Active Project details safely
  const activeProject = useMemo((): Project => {
    return projects.find(p => p.id === activeProjectId) || projects[0] || {
      id: 'blank',
      name: 'Stray Context',
      description: '',
      categories: [],
      items: [],
      team: [],
      createdAt: ''
    };
  }, [projects, activeProjectId]);

  // Update active project properties
  const updateActiveProjectState = (updatedFields: Partial<Project>) => {
    const nextProjectsList = projects.map(p => {
      if (p.id === activeProject.id) {
        return {
          ...p,
          ...updatedFields
        } as Project;
      }
      return p;
    });
    persistProjectsList(nextProjectsList);
  };

  // Switch Active Project
  const handleSelectActiveProject = (id: string) => {
    setActiveProjectId(id);
    localStorage.setItem(ACTIVE_PROJECT_KEY, id);
    setSelectedCategory('all');
    setSelectedPriority('all');
    showToast(`Switched workspace context to project: ${projects.find(p=>p.id === id)?.name}`, 'info');
  };

  // --- PROJECT ACTIONS (CREATE, CLONE, REMOVE) ---
  const handleCreateNewProjectFromScratch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
      showToast("Workspace name required to initialize project.", "warning");
      return;
    }

    const brandId = `project-${Math.random().toString(36).substr(2, 9)}`;
    const freshProject: Project = {
      id: brandId,
      name: newProjectName.trim(),
      description: newProjectDesc.trim() || 'A standalone custom audit workspace built completely from scratch.',
      categories: projectPreset === 'blueprint' ? CATEGORIES : [
        {
          id: 'core-vibe-checks',
          name: 'Staging & Vibes',
          description: 'General system checkpoints and staging audits',
          icon: 'Shield',
          color: 'border-blue-500 text-blue-400 bg-blue-500/10',
          lightColor: 'bg-blue-500/10',
          textColor: 'text-blue-500'
        }
      ],
      items: projectPreset === 'blueprint' ? INITIAL_ITEMS : [],
      team: projectPreset === 'blueprint' ? DEFAULT_TEAM : [
        {
          id: 'teammate-self',
          name: 'Owner (Lead)',
          role: 'Audit Administrator',
          email: 'admin@workspace.com',
          avatarColor: 'bg-indigo-600'
        }
      ],
      createdAt: new Date().toISOString()
    };

    const nextList = [freshProject, ...projects];
    persistProjectsList(nextList);
    setActiveProjectId(brandId);
    localStorage.setItem(ACTIVE_PROJECT_KEY, brandId);
    
    // Clear inputs and close
    setNewProjectName('');
    setNewProjectDesc('');
    setShowNewProjectForm(false);
    showToast(`Successfully booted workspace: ${freshProject.name}`, 'success');
  };

  const handleDeleteProject = (projId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (projects.length <= 1) {
      showToast("Cannot destroy the last remaining workspace. Create another first.", "warning");
      return;
    }
    if (confirm(`Are you absolutely sure you want to permanently erase the project "${projects.find(p=>p.id === projId)?.name}"? This deletes all custom checklists, team details, and specifications.`)) {
      const remaining = projects.filter(p => p.id !== projId);
      persistProjectsList(remaining);
      if (activeProjectId === projId) {
        const nextActive = remaining[0].id;
        setActiveProjectId(nextActive);
        localStorage.setItem(ACTIVE_PROJECT_KEY, nextActive);
      }
      showToast("Project workspace erased.", "info");
    }
  };

  // --- DYNAMIC PHASES (CATEGORIES) CRUD CONTROLLER ---
  const handleAddPhase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phaseName.trim()) {
      showToast("Phase name is required.", "warning");
      return;
    }
    const freshId = `phase-${Math.random().toString(36).substr(2, 6)}`;
    
    // Setup color palette presets
    const paletteMap: Record<string, any> = {
      default: { color: 'border-blue-500 text-blue-400 bg-blue-500/10', light: 'bg-blue-500/10', text: 'text-blue-450' },
      rose: { color: 'border-rose-500 text-rose-450 bg-rose-500/10', light: 'bg-rose-500/10', text: 'text-rose-450' },
      emerald: { color: 'border-emerald-500 text-emerald-440 bg-emerald-500/10', light: 'bg-emerald-555/10 bg-emerald-500/10', text: 'text-emerald-500' },
      purple: { color: 'border-purple-500 text-purple-400 bg-purple-500/10', light: 'bg-purple-500/10', text: 'text-purple-400' },
      amber: { color: 'border-amber-500 text-amber-400 bg-amber-500/10', light: 'bg-amber-500/10', text: 'text-amber-500' }
    };

    const palette = paletteMap[phaseColor] || paletteMap.default;

    const newPhase: CategoryInfo = {
      id: freshId,
      name: phaseName.trim(),
      description: phaseDesc.trim() || 'Custom focus phase details.',
      icon: phaseIcon,
      color: palette.color,
      lightColor: palette.light,
      textColor: palette.text
    };

    const nextPhases = [...activeProject.categories, newPhase];
    updateActiveProjectState({ categories: nextPhases });
    
    // Clear inputs
    setPhaseName('');
    setPhaseDesc('');
    showToast(`Focus Phase "${newPhase.name}" deployed dynamically.`, 'success');
  };

  const handleDeletePhase = (catId: string) => {
    if (activeProject.categories.length <= 1) {
      showToast("A project must maintain at least one Focus Development Phase.", "warning");
      return;
    }
    if (confirm("Are you sure you want to remove this phase grouping? Items under this phase will remain but fall back into General category.")) {
      const remainingPhases = activeProject.categories.filter(c => c.id !== catId);
      const sanitisedItems = activeProject.items.map(item => {
        if (item.category === catId) {
          return { ...item, category: remainingPhases[0].id };
        }
        return item;
      });
      updateActiveProjectState({
        categories: remainingPhases,
        items: sanitisedItems
      });
      showToast("Focus phase deleted successfully.", "info");
    }
  };

  // --- TEAM MEMBER DELEGATION CRUD CONTROLLER ---
  const handleAddTeammate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim() || !memberRole.trim()) {
      showToast("Name and roles are strictly required.", "warning");
      return;
    }

    const newCrew: Teammate = {
      id: `member-${Math.random().toString(36).substr(2, 6)}`,
      name: memberName.trim(),
      role: memberRole.trim(),
      email: memberEmail.trim() || `${memberName.trim().replace(/\s+/g, '.').toLowerCase()}@workspace.com`,
      avatarColor: memberAvatar
    };

    const nextTeam = [...activeProject.team, newCrew];
    updateActiveProjectState({ team: nextTeam });

    // Reset fields
    setMemberName('');
    setMemberRole('');
    setMemberEmail('');
    showToast(`Assigned online coordinate profile for collaborator: ${newCrew.name}`, 'success');
  };

  const handleDeleteTeammate = (memberId: string) => {
    if (confirm("Remove collaborator from project? All item assignments for this person will be unassigned.")) {
      const nextTeam = activeProject.team.filter(t => t.id !== memberId);
      const sanitisedItems = activeProject.items.map(item => {
        if (item.assignedTo?.includes(memberId)) {
          return {
            ...item,
            assignedTo: item.assignedTo.filter(id => id !== memberId)
          };
        }
        return item;
      });
      updateActiveProjectState({ 
        team: nextTeam,
        items: sanitisedItems
      });
      showToast("Collaborator profile de-registered successfully.", "info");
    }
  };

  // --- JSON EXPORT / IMPORT CONTROLLERS ---
  const handleJSONImportSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!jsonImportText.trim()) return;

    try {
      const parsed = JSON.parse(jsonImportText);
      
      // Basic signature validation
      if (!parsed.name || !Array.isArray(parsed.items)) {
        showToast("Invalid JSON schema. Needs 'name' and 'items' array.", "warning");
        return;
      }

      // Format input checklists safely
      const importedItems: ChecklistItem[] = parsed.items.map((i: any, index: number) => ({
        id: i.id || `uploaded-${index}-${Math.random().toString(36).substr(2, 5)}`,
        title: i.title || i.name || 'Untitled Requirement',
        description: i.description || i.objective || '',
        category: i.category || 'core-vibe-checks',
        priority: i.priority || 'medium',
        status: i.status || 'todo',
        notes: i.notes || i.implementationNotes || '',
        custom: true,
        assignedTo: Array.isArray(i.assignedTo) ? i.assignedTo : [],
        updatedAt: new Date().toISOString()
      }));

      // Map dynamic phases or merge
      const importedPhases: CategoryInfo[] = Array.isArray(parsed.categories) 
        ? parsed.categories 
        : activeProject.categories;

      const importedTeam: Teammate[] = Array.isArray(parsed.team)
        ? parsed.team
        : activeProject.team;

      if (confirm(`Would you like to import this as a COMPLETELY NEW PROJECT workspace named "${parsed.name}"? (Select Cancel to merge items directly into the active project standard checks instead)`)) {
        const brandId = `project-${Math.random().toString(36).substr(2, 9)}`;
        const fresh: Project = {
          id: brandId,
          name: parsed.name,
          description: parsed.description || 'Imported standards workspace archive.',
          categories: importedPhases,
          team: importedTeam,
          items: importedItems,
          createdAt: new Date().toISOString()
        };
        const nextList = [fresh, ...projects];
        persistProjectsList(nextList);
        setActiveProjectId(brandId);
        localStorage.setItem(ACTIVE_PROJECT_KEY, brandId);
        showToast(`Workspace imported: ${parsed.name}`, 'success');
      } else {
        // Merge directly in currently checked specification space
        const mergedItems = [...importedItems, ...activeProject.items];
        // Deduplicate titles or IDs
        const uniqueItems = mergedItems.filter((v, i, a) => a.findIndex(t => t.id === v.id || t.title === v.title) === i);
        updateActiveProjectState({ 
          items: uniqueItems,
          categories: [...activeProject.categories, ...importedPhases].filter((v, i, a) => a.findIndex(t => t.id === v.id || t.name === v.name) === i)
        });
        showToast(`Merged requirements directly into: ${activeProject.name}`, 'success');
      }

      // Reset
      setJsonImportText('');
      setCurrentAdminTab('none');
    } catch (err) {
      console.error(err);
      showToast("Failed to parse JSON text. Review brackets.", "warning");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const contents = event.target?.result as string;
      if (contents) {
        setJsonImportText(contents);
        showToast("JSON file read successfully. Review template content below.", "info");
      }
    };
    reader.readAsText(file);
  };

  const exportProjectToJSON = () => {
    try {
      const exportData = {
        name: activeProject.name,
        description: activeProject.description,
        categories: activeProject.categories,
        team: activeProject.team,
        items: activeProject.items
      };
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(exportData, null, 2)
      )}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `${activeProject.name.replace(/\s+/g, '_').toLowerCase()}_standards.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast("Download backup standards spec file triggered.", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to compile export specs.", "warning");
    }
  };

  const copyTemplateJSON = () => {
    const sample = {
      name: "Staging Custom Workspace",
      description: "Baseline verification standards for cloud launch.",
      categories: [
        {
          id: "custom-checks",
          name: "Vibe Verification",
          description: "Staging and local visual testing",
          icon: "Shield",
          color: "border-purple-500 text-purple-400 bg-purple-500/10",
          lightColor: "bg-purple-500/10",
          textColor: "text-purple-400"
        }
      ],
      team: [
        {
          id: "member-1",
          name: "Jane Dev",
          role: "Quality Assurance",
          email: "jane@workspace.com",
          avatarColor: "bg-purple-500"
        }
      ],
      items: [
        {
          id: "standard-1",
          title: "Aesthetic UI Padding Verification",
          description: "Confirm touch targets are >= 44px with zero spacing overflows in visual frames",
          category: "custom-checks",
          priority: "high",
          status: "todo",
          notes: "Use standard ResizeObserver on testing rigs.",
          assignedTo: ["member-1"]
        }
      ]
    };
    navigator.clipboard.writeText(JSON.stringify(sample, null, 2));
    showToast("Template copied to clipboard. Paste below or save to file!", "success");
  };

  // --- ONLINE SYNC ORCHESTRATION SHARING ---
  const handleGenerateMagicShareLink = () => {
    try {
      const payload = btoa(unescape(encodeURIComponent(JSON.stringify(activeProject))));
      const shareUrl = `${window.location.origin}${window.location.pathname}?shared=${payload}`;
      
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
      showToast("Magic online team sync link generated! Copied to clipboard.", "success");
      return shareUrl;
    } catch (err) {
      console.error(err);
      showToast("Share encoding failed.", "warning");
      return null;
    }
  };

  const handleSendDynamicTeamInvitationEmail = () => {
    const magicLink = handleGenerateMagicShareLink();
    if (!magicLink) return;

    // Calculate details for summary report
    const done = activeProject.items.filter(i=>i.status==='completed').length;
    const total = activeProject.items.length;
    const uncheckedCriticalList = activeProject.items.filter(i=>i.priority === 'high' && i.status !== 'completed').map(i=>`- ${i.title}`).join('\n');

    // Create teammate specific reports
    const memberBriefs = activeProject.team.map(member => {
      const memberTasks = activeProject.items.filter(i=>i.assignedTo?.includes(member.id));
      const finished = memberTasks.filter(i=>i.status === 'completed').length;
      return `${member.name} (${member.role}): ${finished}/${memberTasks.length} Done`;
    }).join('\n');

    const subject = encodeURIComponent(`[Sync Checklist] Action Needed: Project "${activeProject.name}" Staging Audit`);
    const emailBody = encodeURIComponent(
      `Hello Team!\n\nI have configured our staging & production readiness specifications matrix for: "${activeProject.name}".\n\n` +
      `We currently stands at ${done}/${total} tasks completed.\n\n` +
      `--------------------------------------------------\n` +
      `TEAM VELOCITY DISPATCH REPORT:\n` +
      `${memberBriefs || "No specific teammate delegations yet."}\n` +
      `--------------------------------------------------\n\n` +
      `⚠️ CURRENT CRITICAL OUTSTANDING CHECKS:\n` +
      `${uncheckedCriticalList || "All high risk items passed! Bravo."}\n\n` +
      `👉 ACCESS AND MERGE THIS WORKSPACE INSTANTLY WITH LIVE OFFLINE PERSISTENCE:\n` +
      `${magicLink}\n\n` +
      `Let's pass validations cleanly and avoid launching with developer bugs.\n` +
      `Cheers!`
    );

    window.open(`mailto:?subject=${subject}&body=${emailBody}`);
    showToast("Opening default mail dispatch interface...", "info");
  };

  // --- ITEM CHECKS INTEGRATION CONTROLLERS ---
  const handleSaveTask = (taskDetails: Partial<ChecklistItem>) => {
    if (taskDetails.id) {
      // Edit
      const nextItems = activeProject.items.map(item => {
        if (item.id === taskDetails.id) {
          return {
            ...item,
            ...taskDetails,
            updatedAt: new Date().toISOString()
          } as ChecklistItem;
        }
        return item;
      });
      updateActiveProjectState({ items: nextItems });
      showToast('Clause successfully redefined.', 'success');
    } else {
      // Append Custom Checklist item
      const newTask: ChecklistItem = {
        id: `custom-${Math.random().toString(36).substr(2, 9)}`,
        title: taskDetails.title || 'Untitled Specification',
        description: taskDetails.description || '',
        category: taskDetails.category || activeProject.categories[0]?.id || 'general',
        priority: taskDetails.priority || 'medium',
        status: 'todo',
        notes: taskDetails.notes || '',
        assignedTo: taskDetails.assignedTo || [],
        custom: true,
        updatedAt: new Date().toISOString()
      };
      const nextItems = [newTask, ...activeProject.items];
      updateActiveProjectState({ items: nextItems });
      showToast('Specification requirement added to backlog.', 'success');
    }
    setTaskToEdit(null);
  };

  const handleDeleteTask = (id: string) => {
    const target = activeProject.items.find(item => item.id === id);
    if (!target) return;

    if (target.custom) {
      const remaining = activeProject.items.filter(item => item.id !== id);
      updateActiveProjectState({ items: remaining });
      showToast('Spec requirement erased permanently.', 'success');
    } else {
      // Reset default template item instead of standard physical deletion
      const resetList = activeProject.items.map(item => {
        if (item.id === id) {
          return {
            ...item,
            notes: '',
            status: 'todo' as StatusType,
            assignedTo: [],
            updatedAt: new Date().toISOString()
          };
        }
        return item;
      });
      updateActiveProjectState({ items: resetList });
      showToast('Factory item reset. Custom annotations and delegacy erased.', 'info');
    }
  };

  const handleMoveStatus = (id: string, nextStatus: StatusType) => {
    const nextList = activeProject.items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: nextStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    });
    updateActiveProjectState({ items: nextList });

    const taskName = activeProject.items.find(item => item.id === id)?.title || 'Check';
    const statusLabels: Record<StatusType, string> = {
      'todo': 'Backlog',
      'in-progress': 'Active Validation',
      'completed': 'Signed Off Production'
    };
    showToast(`"${taskName}" promoted to ${statusLabels[nextStatus]}`, 'success');
  };

  const handleResetToDefaults = () => {
    if (confirm('Restore default classic benchmarks? This wipes custom checklists in this specific project.')) {
      updateActiveProjectState({
        items: INITIAL_ITEMS,
        categories: CATEGORIES,
        team: DEFAULT_TEAM
      });
      showToast('Benchmarking matrix factory values loaded successfully.', 'info');
    }
  };

  // --- QUERY ORCHESTRATORS ---
  const filteredTasks = useMemo(() => {
    return activeProject.items.filter(task => {
      // Search matching titles, descriptions, notes, and delegated names
      const assignedNames = activeProject.team
        .filter(m => task.assignedTo?.includes(m.id))
        .map(m => m.name.toLowerCase())
        .join(' ');

      const matchesSearch = 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignedNames.includes(searchQuery.toLowerCase()) ||
        (task.notes && task.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
      const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;

      return matchesSearch && matchesCategory && matchesPriority;
    });
  }, [activeProject.items, searchQuery, selectedCategory, selectedPriority, activeProject.team]);

  const calculatedStats = useMemo((): Stats => {
    const total = activeProject.items.length;
    const todo = activeProject.items.filter(i => i.status === 'todo').length;
    const inProgress = activeProject.items.filter(i => i.status === 'in-progress').length;
    const completed = activeProject.items.filter(i => i.status === 'completed').length;
    const highPriorityCount = activeProject.items.filter(i => i.priority === 'high' && i.status !== 'completed').length;
    const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      todo,
      inProgress,
      completed,
      highPriorityCount,
      progressPercentage
    };
  }, [activeProject.items]);

  // Accent selector configurations
  const accent = useMemo(() => {
    switch (colorScheme) {
      case 'emerald':
        return {
          primaryBg: 'bg-emerald-600 hover:bg-emerald-550 hover:scale-[1.01] text-white focus:ring-2 focus:ring-emerald-400/50',
          primaryText: 'text-emerald-600 dark:text-emerald-400',
          bgSubtle: 'bg-emerald-500/10',
          borderAccent: 'border-emerald-500/20 dark:border-emerald-500/10',
          accentBadge: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-450',
          tabActiveBg: 'bg-emerald-600 text-white font-bold shadow-sm shadow-emerald-500/20',
          tabActiveText: 'text-emerald-650 dark:text-emerald-400',
          bodyGradient: 'bg-gradient-to-br from-white to-emerald-50/10 dark:from-neutral-950 dark:via-emerald-950/5 dark:to-neutral-950',
          headerGradient: 'text-emerald-600 dark:bg-gradient-to-r dark:from-emerald-400 dark:to-teal-500 dark:text-transparent dark:bg-clip-text',
          cardRing: 'focus-within:ring-2 focus-within:ring-emerald-500/15 ring-emerald-505/5'
        };
      case 'sunset':
        return {
          primaryBg: 'bg-amber-600 hover:bg-amber-500 hover:scale-[1.01] text-white focus:ring-2 focus:ring-amber-400/50',
          primaryText: 'text-amber-600 dark:text-amber-400',
          bgSubtle: 'bg-amber-500/10',
          borderAccent: 'border-amber-500/20 dark:border-amber-500/10',
          accentBadge: 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-450',
          tabActiveBg: 'bg-amber-600 text-white font-bold shadow-sm shadow-amber-500/20',
          tabActiveText: 'text-amber-655 dark:text-amber-400',
          bodyGradient: 'bg-gradient-to-br from-white to-amber-50/10 dark:from-neutral-950 dark:via-amber-950/5 dark:to-neutral-950',
          headerGradient: 'text-rose-500 dark:bg-gradient-to-r dark:from-rose-500 dark:via-orange-500 dark:to-amber-500 dark:text-transparent dark:bg-clip-text',
          cardRing: 'focus-within:ring-2 focus-within:ring-amber-500/15 ring-amber-505/5'
        };
      case 'monochrome':
        return {
          primaryBg: 'bg-neutral-805 hover:bg-neutral-700 hover:scale-[1.01] dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-950 text-white focus:ring-2 focus:ring-neutral-400/50',
          primaryText: 'text-neutral-900 dark:text-neutral-100',
          bgSubtle: 'bg-neutral-500/10',
          borderAccent: 'border-neutral-250 dark:border-neutral-800',
          accentBadge: 'bg-neutral-500/10 border-neutral-350 dark:border-neutral-800 text-neutral-850 dark:text-neutral-300',
          tabActiveBg: 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-bold shadow-sm',
          tabActiveText: 'text-neutral-950 dark:text-neutral-100',
          bodyGradient: 'bg-gradient-to-br from-neutral-50 to-neutral-100/50 dark:from-neutral-950 dark:to-neutral-950',
          headerGradient: 'text-neutral-800 dark:bg-gradient-to-r dark:from-white dark:to-neutral-400 dark:text-transparent dark:bg-clip-text',
          cardRing: 'focus-within:ring-2 focus-within:ring-neutral-500/15 ring-neutral-500/5'
        };
      case 'royal':
        return {
          primaryBg: 'bg-indigo-600 hover:bg-indigo-500 hover:scale-[1.01] text-white focus:ring-2 focus:ring-indigo-400/50',
          primaryText: 'text-indigo-600 dark:text-indigo-400',
          bgSubtle: 'bg-indigo-505/10',
          borderAccent: 'border-indigo-500/20 dark:border-indigo-500/10',
          accentBadge: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-600 dark:text-indigo-400',
          tabActiveBg: 'bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-500/20',
          tabActiveText: 'text-indigo-605 dark:text-indigo-400',
          bodyGradient: 'bg-gradient-to-br from-white to-indigo-50/10 dark:from-neutral-950 dark:via-indigo-950/10 dark:to-neutral-950',
          headerGradient: 'text-indigo-600 dark:bg-gradient-to-r dark:from-indigo-400 dark:via-purple-400 dark:to-pink-450 dark:text-transparent dark:bg-clip-text',
          cardRing: 'focus-within:ring-2 focus-within:ring-indigo-500/15 ring-indigo-500/5'
        };
      case 'neon':
        return {
          primaryBg: 'bg-pink-600 hover:bg-pink-550 hover:scale-[1.01] text-white focus:ring-2 focus:ring-pink-400/50',
          primaryText: 'text-pink-650 dark:text-pink-400',
          bgSubtle: 'bg-pink-500/10',
          borderAccent: 'border-pink-500/25 dark:border-pink-550/10',
          accentBadge: 'bg-pink-505/15 border-pink-500/30 text-pink-600 dark:text-pink-450',
          tabActiveBg: 'bg-gradient-to-r from-pink-600 to-cyan-550 text-white font-bold shadow-sm shadow-pink-500/20',
          tabActiveText: 'text-pink-600 dark:text-pink-400',
          bodyGradient: 'bg-gradient-to-br from-white via-cyan-50/5 to-pink-50/5 dark:from-neutral-950 dark:via-pink-950/10 dark:to-neutral-950',
          headerGradient: 'text-pink-650 dark:bg-gradient-to-r dark:from-pink-500 dark:via-fuchsia-400 dark:to-cyan-400 dark:text-transparent dark:bg-clip-text',
          cardRing: 'focus-within:ring-2 focus-within:ring-pink-500/15 ring-pink-500/5'
        };
      case 'default':
      default:
        return {
          primaryBg: 'bg-blue-600 hover:bg-blue-550 hover:scale-[1.01] text-white focus:ring-2 focus:ring-blue-400/50',
          primaryText: 'text-blue-600 dark:text-blue-400',
          bgSubtle: 'bg-blue-500/10',
          borderAccent: 'border-blue-500/20 dark:border-blue-550/10',
          accentBadge: 'bg-blue-505/15 border-blue-500/30 text-blue-600 dark:text-blue-450',
          tabActiveBg: 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20',
          tabActiveText: 'text-blue-600 dark:text-blue-400',
          bodyGradient: 'bg-gradient-to-br from-white to-blue-50/5 dark:from-neutral-950 dark:via-blue-950/5 dark:to-neutral-950',
          headerGradient: 'text-blue-600 dark:bg-gradient-to-r dark:from-blue-600 dark:to-indigo-500 dark:text-transparent dark:bg-clip-text',
          cardRing: 'focus-within:ring-2 focus-within:ring-blue-500/15 ring-blue-500/5'
        };
    }
  }, [colorScheme]);

  return (
    <div className={isLightMode ? 'light' : 'dark'}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
          isLightMode ? 'bg-neutral-50 text-neutral-800' : 'bg-neutral-950 text-neutral-100'
        }`}
      >
        {/* =========================================================================
            HEADER PREFERENCES NAVIGATION
            ========================================================================= */}
        <header className={`sticky top-0 z-40 backdrop-blur-md border-b px-4 md:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4 select-none ${
          isLightMode 
            ? 'bg-white/85 border-neutral-200/80 shadow-xs' 
            : 'bg-neutral-950/80 border-b border-neutral-900/80'
        }`}>
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Sidebar toggle button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-2xl border transition-all cursor-pointer ${
                isLightMode 
                  ? 'bg-neutral-150 text-neutral-700 hover:bg-neutral-200 border-neutral-200' 
                  : 'bg-neutral-900/80 text-neutral-450 hover:text-white border-neutral-800 hover:border-neutral-750'
              }`}
              title="Toggle checklist workspaces dashboard panel"
            >
              <Settings className={`w-4 h-4 ${isSidebarOpen ? 'rotate-90' : 'rotate-0'} transition-transform duration-300`} />
            </button>

            <div className={`p-2 rounded-2xl flex items-center justify-center border shadow-sm ${
              isLightMode 
                ? 'bg-blue-50 border-blue-100 text-blue-600'
                : 'bg-blue-600/10 border-blue-500/20 text-blue-400'
            }`}>
              <ShieldCheck className="w-5 h-5 animate-pulse" />
            </div>

            <div>
              <h1 className={`text-sm md:text-base font-black tracking-tight flex items-center gap-1.5 ${
                isLightMode ? 'text-neutral-900' : 'text-white'
              }`}>
                ProdReady <span className="text-[9px] md:text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 px-1.5 py-0.5 rounded-full font-mono uppercase font-bold">Consolidated STG</span>
              </h1>
              <p className={`text-[9px] md:text-[10px] font-mono tracking-wide ${
                isLightMode ? 'text-neutral-500' : 'text-neutral-500'
              }`}>
                General Project Compliance & Delegation Audit
              </p>
            </div>
          </div>

          {/* Core styling segment bars */}
          <div className="flex flex-wrap items-center gap-3.5 w-full md:w-auto justify-end">
            
            {/* Color accent controls */}
            <div className={`flex items-center gap-2 p-1 px-1.5 rounded-xl border ${
              isLightMode ? 'bg-neutral-100 border-neutral-250' : 'bg-neutral-900/85 border-neutral-800'
            }`}>
              <Palette className={`w-3.5 h-3.5 ${isLightMode ? 'text-neutral-500' : 'text-neutral-400'}`} />
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setColorScheme('default')}
                  type="button"
                  className={`w-3 h-3 rounded-full bg-blue-500 cursor-pointer transition transform hover:scale-120 ${
                    colorScheme === 'default' ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''
                  }`}
                  title="Sapphire iOS Theme"
                />
                <button
                  onClick={() => setColorScheme('emerald')}
                  type="button"
                  className={`w-3 h-3 rounded-full bg-emerald-500 cursor-pointer transition transform hover:scale-120 ${
                    colorScheme === 'emerald' ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110' : ''
                  }`}
                  title="Security Emerald Theme"
                />
                <button
                  onClick={() => setColorScheme('sunset')}
                  type="button"
                  className={`w-3 h-3 rounded-full bg-amber-500 cursor-pointer transition transform hover:scale-120 ${
                    colorScheme === 'sunset' ? 'ring-2 ring-offset-2 ring-amber-500 scale-110' : ''
                  }`}
                  title="Sunset Alert Red Theme"
                />
                <button
                  onClick={() => setColorScheme('monochrome')}
                  type="button"
                  className={`w-3 h-3 rounded-full bg-neutral-400 cursor-pointer transition transform hover:scale-120 ${
                    colorScheme === 'monochrome' ? 'ring-2 ring-offset-2 ring-neutral-400 scale-110' : ''
                  }`}
                  title="Monochrome Minimalist Theme"
                />
                <button
                  onClick={() => setColorScheme('royal')}
                  type="button"
                  className={`w-3 h-3 rounded-full bg-indigo-500 cursor-pointer transition transform hover:scale-120 ${
                    colorScheme === 'royal' ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : ''
                  }`}
                  title="Cupertino Royal Theme"
                />
                <button
                  onClick={() => setColorScheme('neon')}
                  type="button"
                  className={`w-3 h-3 rounded-full bg-pink-500 cursor-pointer transition transform hover:scale-120 ${
                    colorScheme === 'neon' ? 'ring-2 ring-offset-2 ring-pink-500 scale-110' : ''
                  }`}
                  title="Retro Tokyo Synthwave Theme"
                />
              </div>
            </div>

            {/* Segmented iOS theme selector */}
            <div className={`p-1 rounded-2xl flex items-center gap-0.5 border ${
              isLightMode ? 'bg-neutral-100 border-neutral-200' : 'bg-neutral-900 border-neutral-800'
            }`}>
              <button
                onClick={() => setTheme('light')}
                type="button"
                className={`flex items-center justify-center p-2 rounded-xl text-xs transition duration-155 cursor-pointer ${
                  theme === 'light'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : isLightMode ? 'text-neutral-500 hover:text-neutral-800' : 'text-neutral-400 hover:text-white'
                }`}
                title="Force Light Staging"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                type="button"
                className={`flex items-center justify-center p-2 rounded-xl text-xs transition duration-155 cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-neutral-800 text-white shadow-md'
                    : isLightMode ? 'text-neutral-550 hover:text-neutral-800' : 'text-neutral-400 hover:text-white'
                }`}
                title="Force Dark Staging"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('system')}
                type="button"
                className={`flex items-center justify-center gap-1.5 p-2 px-2.5 rounded-xl text-xs transition duration-155 cursor-pointer ${
                  theme === 'system'
                    ? 'bg-neutral-805 text-neutral-100 bg-neutral-800 shadow'
                    : isLightMode ? 'text-neutral-500 hover:text-neutral-800' : 'text-neutral-400 hover:text-white'
                }`}
                title="System Lighting Default"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono leading-none hidden lg:inline">System</span>
              </button>
            </div>

            {/* Live syncing status indicator */}
            <div className={`hidden sm:flex items-center gap-1.5 text-[9px] font-mono px-3 py-2 rounded-xl border ${
              isLightMode 
                ? 'bg-neutral-100 border-neutral-200 text-neutral-600' 
                : 'bg-neutral-900 border-neutral-800 text-neutral-400'
            }`}>
              <Cloud className={`w-3.5 h-3.5 ${isSyncing ? 'text-amber-500 animate-spin' : 'text-emerald-500'}`} />
              <span>{isSyncing ? "Saving..." : "Local-First"}</span>
            </div>
          </div>
        </header>

        {/* =========================================================================
            CORE INTERACTIVE CONTAINER
            ========================================================================= */}
        <div className="flex-1 flex flex-col lg:flex-row relative">
          
          {/* =========================================================================
              SIDEBAR WORKSPACE MANAGEMENT CONTROLS
              ========================================================================= */}
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 330, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className={`shrink-0 border-r select-none h-full lg:sticky lg:top-[75px] overflow-y-auto max-h-[calc(100vh-75px)] p-5.5 space-y-6 ${
                  isLightMode 
                    ? 'bg-neutral-100 border-neutral-200' 
                    : 'bg-neutral-900/40 backdrop-blur-3xl border-neutral-900'
                }`}
              >
                {/* 1. Project workspace switch section */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono uppercase tracking-widest font-extrabold flex items-center gap-1 ${
                      isLightMode ? 'text-neutral-500' : 'text-neutral-450'
                    }`}>
                      <FileText className="w-3.5 h-3.5 text-blue-500" /> Active Workspace ({projects.length})
                    </span>
                    <button
                      onClick={() => setShowNewProjectForm(!showNewProjectForm)}
                      className="p-1 rounded-lg hover:bg-neutral-500/10 text-blue-500 cursor-pointer"
                      title="New Project"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Create project input section */}
                  {showNewProjectForm && (
                    <form 
                      onSubmit={handleCreateNewProjectFromScratch}
                      className={`p-3 rounded-2xl border space-y-2.5 transition animate-fadeIn ${
                        isLightMode ? 'bg-white border-neutral-255' : 'bg-neutral-950/80 border-neutral-800'
                      }`}
                    >
                      <p className="text-[9px] font-mono font-bold text-neutral-500 uppercase">Initialize Project Workspace</p>
                      <input
                        type="text"
                        className={`w-full text-xs font-sans p-2 rounded-xl outline-none border focus:border-blue-550 ${
                          isLightMode ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-900 border-neutral-805 text-white'
                        }`}
                        placeholder="e.g. Fitbit Runs API Integrator"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        required
                      />
                      <input
                        type="text"
                        className={`w-full text-xs font-sans p-2 rounded-xl outline-none border focus:border-blue-550 ${
                          isLightMode ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-900 border-neutral-805 text-white'
                        }`}
                        placeholder="Project description objective..."
                        value={newProjectDesc}
                        onChange={(e) => setNewProjectDesc(e.target.value)}
                      />

                      {/* Presets segment toggle */}
                      <div className="grid grid-cols-2 gap-1.5 p-0.5 rounded-lg bg-neutral-500/10 text-[10px] font-medium font-mono text-center">
                        <button
                          type="button"
                          onClick={() => setProjectPreset('blueprint')}
                          className={`py-1 rounded-md cursor-pointer ${
                            projectPreset === 'blueprint' 
                              ? isLightMode ? 'bg-white text-neutral-900 shadow' : 'bg-neutral-800 text-white shadow'
                              : 'text-neutral-500 hover:text-neutral-350'
                          }`}
                        >
                          Use Blueprint
                        </button>
                        <button
                          type="button"
                          onClick={() => setProjectPreset('empty')}
                          className={`py-1 rounded-md cursor-pointer ${
                            projectPreset === 'empty'
                              ? isLightMode ? 'bg-white text-neutral-900 shadow' : 'bg-neutral-800 text-white shadow'
                              : 'text-neutral-500 hover:text-neutral-350'
                          }`}
                        >
                          From Scratch
                        </button>
                      </div>

                      <div className="flex gap-2 text-[10px] justify-end">
                        <button
                          type="button"
                          onClick={() => setShowNewProjectForm(false)}
                          className="px-2.5 py-1.5 rounded-lg bg-neutral-500/10 text-neutral-400"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white font-bold"
                        >
                          Start Project
                        </button>
                      </div>
                    </form>
                  )}

                  {/* List of active projects toggle buttons */}
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 scrollbar-thin">
                    {projects.map(p => {
                      const isActive = p.id === activeProject.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => handleSelectActiveProject(p.id)}
                          className={`p-2.5 rounded-2xl border text-left cursor-pointer transition flex items-center justify-between gap-3 ${
                            isActive
                              ? isLightMode 
                                ? 'bg-white border-neutral-300 shadow-xs' 
                                : 'bg-neutral-800 border-neutral-700 text-white'
                              : isLightMode
                              ? 'bg-transparent border-transparent hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900'
                              : 'bg-transparent border-transparent hover:bg-neutral-850/40 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <div className="flex-1 min-w-0 pr-1">
                            <span className="text-xs font-bold font-sans truncate block">{p.name}</span>
                            <span className="text-[9px] font-mono text-neutral-550 block truncate">{p.description}</span>
                          </div>
                          
                          {/* Close Project Button */}
                          {projects.length > 1 && (
                            <button
                              onClick={(e) => handleDeleteProject(p.id, e)}
                              className="p-1 rounded text-neutral-500 hover:text-rose-500 hover:bg-rose-500/10/10"
                              title="Delete workspace project permanently"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Operations tab configurations */}
                <div className="space-y-2 border-t pt-4 border-neutral-500/10">
                  <span className={`text-[10px] font-mono uppercase tracking-widest font-extrabold flex items-center gap-1 ${
                    isLightMode ? 'text-neutral-500' : 'text-neutral-450'
                  }`}>
                    <Settings className="w-3.5 h-3.5 text-neutral-400" /> Administrative Tuning
                  </span>

                  <div className="grid grid-cols-3 gap-1 grid-flow-row">
                    <button
                      onClick={() => setCurrentAdminTab(currentAdminTab === 'phases' ? 'none' : 'phases')}
                      className={`p-1.5 py-2 text-[10px] font-mono rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
                        currentAdminTab === 'phases'
                          ? isLightMode ? 'bg-white border-neutral-300 shadow-sm text-neutral-950 font-bold' : 'bg-neutral-800 border-neutral-700 text-white font-bold'
                          : isLightMode ? 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:text-neutral-800' : 'bg-neutral-950 border-neutral-805 text-neutral-450 hover:text-neutral-200'
                      }`}
                    >
                      <Layers className="w-4 h-4 text-blue-500" />
                      <span>Phases</span>
                    </button>

                    <button
                      onClick={() => setCurrentAdminTab(currentAdminTab === 'team' ? 'none' : 'team')}
                      className={`p-1.5 py-2 text-[10px] font-mono rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
                        currentAdminTab === 'team'
                          ? isLightMode ? 'bg-white border-neutral-300 shadow-sm text-neutral-950 font-bold' : 'bg-neutral-800 border-neutral-700 text-white font-bold'
                          : isLightMode ? 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:text-neutral-800' : 'bg-neutral-950 border-neutral-805 text-neutral-450 hover:text-neutral-200'
                      }`}
                    >
                      <Users className="w-4 h-4 text-emerald-500" />
                      <span>Roster</span>
                    </button>

                    <button
                      onClick={() => setCurrentAdminTab(currentAdminTab === 'import-export' ? 'none' : 'import-export')}
                      className={`p-1.5 py-2 text-[10px] font-mono rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
                        currentAdminTab === 'import-export'
                          ? isLightMode ? 'bg-white border-neutral-300 shadow-sm text-neutral-950 font-bold' : 'bg-neutral-800 border-neutral-700 text-white font-bold'
                          : isLightMode ? 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:text-neutral-800' : 'bg-neutral-950 border-neutral-805 text-neutral-450 hover:text-neutral-200'
                      }`}
                    >
                      <Upload className="w-4 h-4 text-purple-555 text-purple-400" />
                      <span>Import</span>
                    </button>
                  </div>
                </div>

                {/* Admin active sheet drawer display */}
                <AnimatePresence mode="wait">
                  {currentAdminTab !== 'none' && (
                    <motion.div
                      key={currentAdminTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className={`p-4 rounded-2xl border space-y-3.5 ${
                        isLightMode ? 'bg-white border-neutral-200 shadow-xs' : 'bg-neutral-950/60 border-neutral-805'
                      }`}
                    >
                      {/* SUB SECTION: PHASES */}
                      {currentAdminTab === 'phases' && (
                        <div className="space-y-3">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase">Focus Phase Groups ({activeProject.categories.length})</span>
                            <span className="block text-[8px] italic text-neutral-400">Add or edit development focus milestones.</span>
                          </div>

                          <form onSubmit={handleAddPhase} className="space-y-2">
                            <input
                              type="text"
                              className={`w-full text-xs font-sans p-2 rounded-xl outline-none border focus:border-blue-500 ${
                                isLightMode ? 'bg-neutral-50 border-neutral-200 text-neutral-900' : 'bg-neutral-900 border-neutral-805 text-white'
                              }`}
                              placeholder="Phase Name (e.g., QA Staging)"
                              value={phaseName}
                              onChange={(e) => setPhaseName(e.target.value)}
                              required
                            />
                            <input
                              type="text"
                              className={`w-full text-xs font-sans p-2 rounded-xl outline-none border focus:border-blue-500 ${
                                isLightMode ? 'bg-neutral-50 border-neutral-200 text-neutral-900' : 'bg-neutral-900 border-neutral-805 text-white'
                              }`}
                              placeholder="Brief phase objective description"
                              value={phaseDesc}
                              onChange={(e) => setPhaseDesc(e.target.value)}
                            />

                            <div className="grid grid-cols-2 gap-2">
                              {/* Icon list dropdown selector */}
                              <select
                                className={`text-[10px] font-mono p-2 rounded-xl border cursor-pointer ${
                                  isLightMode ? 'bg-neutral-50 text-neutral-900' : 'bg-neutral-900 border-neutral-805 text-white'
                                }`}
                                value={phaseIcon}
                                onChange={(e) => setPhaseIcon(e.target.value)}
                              >
                                <option value="Shield">🛡️ Shield</option>
                                <option value="Server">⚙️ Server</option>
                                <option value="Code2">💻 Code2</option>
                                <option value="CheckSquare">✅ Checklist</option>
                                <option value="Database">🗄️ Database</option>
                                <option value="FileText">📝 Docs</option>
                              </select>

                              {/* Colors list selector */}
                              <select
                                className={`text-[10px] font-mono p-2 rounded-xl border cursor-pointer ${
                                  isLightMode ? 'bg-neutral-50 text-neutral-900' : 'bg-neutral-900 border-neutral-805 text-white'
                                }`}
                                value={phaseColor}
                                onChange={(e) => setPhaseColor(e.target.value)}
                              >
                                <option value="default">🔵 Classic Blue</option>
                                <option value="emerald">🟢 Security Emerald</option>
                                <option value="rose">🔴 Alert Crimson</option>
                                <option value="purple">🟣 Custom Indigo</option>
                                <option value="amber">🟡 Amber Warning</option>
                              </select>
                            </div>

                            <button
                              type="submit"
                              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition"
                            >
                              Deploy Focus Phase
                            </button>
                          </form>

                          {/* List of active project focus groups */}
                          <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1 scrollbar-thin border-t pt-2 border-neutral-500/10">
                            {activeProject.categories.map(c => (
                              <div key={c.id} className="text-[10px] flex items-center justify-between p-1.5 rounded-lg hover:bg-neutral-500/5">
                                <div className="truncate pr-1">
                                  <span className={`font-bold block text-neutral-300 truncate leading-none ${isLightMode ? 'text-neutral-800' : 'text-neutral-200'}`}>{c.name}</span>
                                  <span className="text-[8px] font-mono text-neutral-500 tracking-wider truncate uppercase">{c.id}</span>
                                </div>
                                <button
                                  onClick={() => handleDeletePhase(c.id)}
                                  className="text-[9px] text-neutral-500 hover:text-rose-500 p-1 shrink-0"
                                >
                                  Del
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* SUB SECTION: TEAM ROSTER */}
                      {currentAdminTab === 'team' && (
                        <div className="space-y-3">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase">Operational Work Crew ({activeProject.team.length})</span>
                            <span className="block text-[8px] italic text-neutral-400">Add teammates to delegate compliance standards list.</span>
                          </div>

                          <form onSubmit={handleAddTeammate} className="space-y-2">
                            <input
                              type="text"
                              className={`w-full text-xs font-sans p-2 rounded-xl outline-none border focus:border-blue-500 ${
                                isLightMode ? 'bg-neutral-50 border-neutral-200 text-neutral-900' : 'bg-neutral-900 border-neutral-805 text-white'
                              }`}
                              placeholder="Full Name (e.g. Marcus Vance)"
                              value={memberName}
                              onChange={(e) => setMemberName(e.target.value)}
                              required
                            />
                            <input
                              type="text"
                              className={`w-full text-xs font-sans p-2 rounded-xl outline-none border focus:border-blue-500 ${
                                isLightMode ? 'bg-neutral-50 border-neutral-200 text-neutral-900' : 'bg-neutral-900 border-neutral-805 text-white'
                              }`}
                              placeholder="Project Position (e.g. DevOps Senior)"
                              value={memberRole}
                              onChange={(e) => setMemberRole(e.target.value)}
                              required
                            />
                            <input
                              type="email"
                              className={`w-full text-xs font-sans p-2 rounded-xl outline-none border focus:border-blue-500 ${
                                isLightMode ? 'bg-neutral-50 border-neutral-200 text-neutral-900' : 'bg-neutral-900 border-neutral-805 text-white'
                              }`}
                              placeholder="Delegate email (optional)"
                              value={memberEmail}
                              onChange={(e) => setMemberEmail(e.target.value)}
                            />

                            {/* Avatar selector options */}
                            <select
                              className={`w-full text-[10px] font-mono p-2 rounded-xl border cursor-pointer ${
                                isLightMode ? 'bg-neutral-50 text-neutral-900' : 'bg-neutral-900 border-neutral-850 text-white'
                              }`}
                              value={memberAvatar}
                              onChange={(e) => setMemberAvatar(e.target.value)}
                            >
                              <option value="bg-blue-500">🔵 Sky Blue Accent</option>
                              <option value="bg-emerald-500">🟢 Emerald Security Accent</option>
                              <option value="bg-purple-500">🟣 Custom Royal Purple</option>
                              <option value="bg-rose-500">🔴 Crimson Danger</option>
                              <option value="bg-orange-500">🟠 CI Pipelines Amber</option>
                            </select>

                            <button
                              type="submit"
                              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition"
                            >
                              Register Collaborator
                            </button>
                          </form>

                          {/* Crew member listings list */}
                          <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1 scrollbar-thin border-t pt-2 border-neutral-500/10">
                            {activeProject.team.map(m => (
                              <div key={m.id} className="text-[10px] flex items-center justify-between p-1.5 rounded-lg hover:bg-neutral-500/5">
                                <div className="flex items-center gap-2 truncate">
                                  <div className={`w-5 h-5 rounded-full ${m.avatarColor} text-white font-mono flex items-center justify-center font-black text-[7px] shrink-0`}>
                                    {m.name.split(' ').map(n=>n[0]).join('')}
                                  </div>
                                  <div className="truncate pr-1">
                                    <span className={`font-bold block text-neutral-300 leading-none truncate ${isLightMode ? 'text-neutral-850' : 'text-neutral-200'}`}>{m.name}</span>
                                    <span className="text-[8px] font-mono text-neutral-500 leading-none block truncate">{m.role}</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeleteTeammate(m.id)}
                                  className="text-[9px] text-neutral-500 hover:text-rose-500 p-1 shrink-0"
                                >
                                  Del
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* SUB SECTION: EXPORT / IMPORT MATRICES */}
                      {currentAdminTab === 'import-export' && (
                        <div className="space-y-3">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase">JSON Checklist Porting</span>
                            <span className="block text-[8px] italic text-neutral-400">Import checklists from scratch or backup current settings.</span>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={copyTemplateJSON}
                              className={`flex-1 p-2 text-[9px] font-mono font-bold rounded-xl flex items-center justify-center gap-1 border cursor-pointer hover:bg-neutral-500/5 ${
                                isLightMode ? 'bg-neutral-50 border-neutral-200 text-neutral-600' : 'bg-neutral-900 border-neutral-850 text-neutral-400'
                              }`}
                            >
                              <Copy className="w-3.5 h-3.5" /> Template
                            </button>

                            <button
                              onClick={exportProjectToJSON}
                              className="flex-1 p-2 text-[9px] font-mono font-bold rounded-xl flex items-center justify-center gap-1 border cursor-pointer hover:bg-neutral-500/5 bg-blue-600 text-white border-blue-500"
                            >
                              <Download className="w-3.5 h-3.5" /> Export DB
                            </button>
                          </div>

                          {/* drag and drop file simulation container */}
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:border-blue-500 hover:bg-neutral-500/5 transition duration-150 ${
                              isLightMode ? 'bg-neutral-50 border-neutral-200 text-neutral-500' : 'bg-neutral-900 border-neutral-805 text-neutral-450'
                            }`}
                          >
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileUpload}
                              className="hidden"
                              accept=".json"
                            />
                            <Upload className="w-5 h-5 mx-auto mb-1.5 text-neutral-500" />
                            <span className="text-[10px] font-mono block font-bold">Select .json standards file</span>
                            <span className="text-[8px] block text-neutral-500 leading-none mt-1">Accepts project-preset schema file backups</span>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-[8px] font-mono text-neutral-500 uppercase block font-bold">Paste Raw JSON data standards</span>
                            <textarea
                              rows={4}
                              className={`w-full font-mono text-[9px] rounded-xl p-2 outline-none border focus:border-blue-500 resize-none ${
                                isLightMode ? 'bg-neutral-50 border-neutral-200 text-neutral-900' : 'bg-neutral-900/60 border-neutral-850 text-emerald-450 dark:text-emerald-400'
                              }`}
                              placeholder='{"name": "My project", "items": [{"title": "CSRF"}]}'
                              value={jsonImportText}
                              onChange={(e) => setJsonImportText(e.target.value)}
                            />
                          </div>

                          <button
                            onClick={() => handleJSONImportSubmit()}
                            className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition disabled:opacity-40"
                            disabled={!jsonImportText.trim()}
                          >
                            Execute Import Standard Checked
                          </button>
                        </div>
                      )}

                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 3. Team online sharing orchestration magic */}
                <div className="space-y-3.5 border-t pt-4 border-neutral-500/10">
                  <span className={`text-[10px] font-mono uppercase tracking-widest font-extrabold flex items-center gap-1 ${
                    isLightMode ? 'text-neutral-500' : 'text-neutral-450'
                  }`}>
                    <Share2 className="w-3.5 h-3.5 text-blue-500" /> Live Team Orchestration
                  </span>

                  <div className={`p-4 rounded-3xl border space-y-3.5 relative overflow-hidden ${
                    isLightMode 
                      ? 'bg-neutral-50 border-neutral-250' 
                      : 'bg-radial from-neutral-950/80 to-transparent border-neutral-805'
                  }`}>
                    <p className={`text-[10px] font-mono leading-normal italic ${
                      isLightMode ? 'text-neutral-550' : 'text-neutral-450'
                    }`}>
                      "Stupid simple link coordination." Compile active specifications, item completions, and assignment roster into a fully portable Magic Sync URL, immediately shareable over workspace networks or direct emails!
                    </p>

                    <div className="space-y-2">
                      <button
                        onClick={handleSendDynamicTeamInvitationEmail}
                        className={`w-full py-2.5 rounded-2xl text-[11px] font-bold tracking-tight text-white flex items-center justify-center gap-2 cursor-pointer shadow border border-rose-500/20 bg-rose-500 hover:scale-[1.01] transition duration-200`}
                      >
                        <Mail className="w-3.5 h-3.5 text-white" />
                        <span>Dispatch Roster Email</span>
                      </button>

                      <button
                        onClick={handleGenerateMagicShareLink}
                        className={`w-full py-2.5 rounded-2xl text-[11px] font-mono font-bold flex items-center justify-center gap-2 cursor-pointer border hover:scale-[1.01] transition duration-200 ${
                          copiedLink 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
                            : isLightMode 
                            ? 'bg-white hover:bg-neutral-50 border-neutral-250 text-neutral-700' 
                            : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-indigo-400'
                        }`}
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? "Link Placed in Clipboard!" : "Copy Live Magic Link"}</span>
                      </button>
                    </div>
                  </div>
                </div>

              </motion.aside>
            )}
          </AnimatePresence>

          {/* =========================================================================
              MAIN PORTFOLIO VELOCITY VIEWPORT PANEL
              ========================================================================= */}
          <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
            
            {/* Top Workspace Greetings Banner */}
            <div className={`p-6 rounded-3xl border relative overflow-hidden transition-all duration-300 ${
              isLightMode 
                ? 'bg-white border-neutral-200/90 shadow-sm shadow-neutral-100' 
                : 'bg-radial from-neutral-900/40 to-transparent border-neutral-900'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono uppercase bg-blue-500/10 border border-blue-500/20 text-blue-500 px-2 py-0.5 rounded-full font-extrabold animate-pulse">
                      Active Workspace specs
                    </span>
                    <span className={`text-[10px] font-mono block ${isLightMode ? 'text-neutral-450' : 'text-neutral-500'}`}>
                      Launched on: {activeProject.createdAt ? new Date(activeProject.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <h2 className={`text-xl md:text-2xl font-black tracking-tight mt-1 flex items-center gap-1.5 ${
                    isLightMode ? 'text-neutral-900' : 'text-white'
                  }`}>
                    {activeProject.name}
                  </h2>
                  <p className={`text-xs max-w-2xl mt-1.5 leading-normal ${
                    isLightMode ? 'text-neutral-600' : 'text-neutral-400'
                  }`}>
                    {activeProject.description}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Print Executive Report Action Button */}
                  <button
                    onClick={() => setIsReportOpen(true)}
                    className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition transform hover:scale-[1.01] cursor-pointer shadow-md text-white bg-blue-600 hover:bg-blue-550`}
                  >
                    <Printer className="w-4 h-4 shrink-0" />
                    <span>Executive Audit PDF Report</span>
                  </button>

                  {/* Active Outstanding risk counter badge */}
                  <div className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border ${
                    isLightMode 
                      ? 'bg-neutral-50 border-neutral-200' 
                      : 'bg-neutral-950 border-neutral-805'
                  }`}>
                    <div className="p-1 rounded-full bg-rose-500/15 text-rose-500">
                      <AlertTriangle className="w-4 h-4 animate-bounce" />
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] font-mono text-neutral-550 block uppercase font-black">Velocity risk cap</span>
                      <span className="text-xs font-black font-mono text-rose-500">{calculatedStats.highPriorityCount} High Blockers</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic notification inline helper */}
              <div className={`mt-4 pt-3.5 border-t text-[11px] font-mono flex items-start gap-1.5 ${
                isLightMode ? 'border-neutral-100 text-neutral-500' : 'border-neutral-850/40 text-neutral-500'
              }`}>
                <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Tip:</strong> Click on <span className="underline select-none">"Administrative Tuning" / Roster / Phases</span> inside the side configurations dashboard panel to inject custom team crews, focus groupings, or import standards from scratch!
                </span>
              </div>
            </div>

            {/* Overall progress dashboard section */}
            <StatsSection
              stats={calculatedStats}
              items={activeProject.items}
              categories={activeProject.categories}
              team={activeProject.team}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
              selectedCategory={selectedCategory}
              isLightMode={isLightMode}
              accent={accent}
            />

            {/* Filter and searching row */}
            <FilterSection
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedPriority={selectedPriority}
              setSelectedPriority={setSelectedPriority}
              onOpenAddModal={() => {
                setTaskToEdit(null);
                setIsAddModalOpen(true);
              }}
              onResetToDefaults={handleResetToDefaults}
              items={activeProject.items}
              categories={activeProject.categories}
              isLightMode={isLightMode}
              accent={accent}
            />

            {/* Main Interactive Kanban Workspace Grid Board */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className={`text-xs font-mono uppercase tracking-widest flex items-center gap-1.5 font-black ${
                  isLightMode ? 'text-neutral-500' : 'text-neutral-500'
                }`}>
                  <Hammer className="w-3.5 h-3.5 text-neutral-400" /> General Projects Matrix Board
                </h3>
                <span className={`text-[10px] font-mono ${isLightMode ? 'text-neutral-500' : 'text-neutral-500'}`}>
                  Isolating {filteredTasks.length} out of {activeProject.items.length} checklist requirements
                </span>
              </div>

              <TaskBoard
                tasks={filteredTasks}
                categories={activeProject.categories}
                team={activeProject.team}
                onEdit={(task) => {
                  setTaskToEdit(task);
                  setIsAddModalOpen(true);
                }}
                onDelete={handleDeleteTask}
                onMoveStatus={handleMoveStatus}
                isLightMode={isLightMode}
              />
            </div>

          </main>

        </div>

        {/* =========================================================================
            FOOTER SYSTEM NOTATIONS
            ========================================================================= */}
        <footer className={`w-full py-5 px-4 md:px-8 border-t select-none text-center ${
          isLightMode 
            ? 'bg-neutral-100 border-neutral-200 text-neutral-500 shadow-inner' 
            : 'bg-neutral-950 border-neutral-900 text-neutral-500'
        }`}>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[9px] md:text-[10px] font-mono">
            <div>
              &copy; 2026 Production Readiness Checklist Console - Apple Minimalist Staging Layout.
            </div>
            <div className="flex items-center gap-1.5">
              <Key className="w-3.fb h-3.5 text-blue-500" />
              Dynamic offline-first persistent multi-project sync engines.
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              Never share secret API credential keys with client-facing browser layers.
            </div>
          </div>
        </footer>

        {/* POPUP FORMS DIALOG */}
        <TaskModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setTaskToEdit(null);
          }}
          onSave={handleSaveTask}
          taskToEdit={taskToEdit}
          categories={activeProject.categories}
          team={activeProject.team}
          isLightMode={isLightMode}
        />

        {/* PRINT EXECUTIVE SUMMARY REPORT */}
        <ExecutiveReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          project={activeProject}
          isLightMode={isLightMode}
        />

        {/* SNACKBAR ALERTS */}
        <NotificationToast
          toast={toast}
          onClose={() => setToast(null)}
          isLightMode={isLightMode}
        />

      </motion.div>
    </div>
  );
}
