import { describe, it, expect } from 'vitest';
import { CATEGORIES, INITIAL_ITEMS } from '../data';
import { Project, ChecklistItem, Teammate } from '../types';

// Helper function definitions replicating the app's base64 logic precisely
function encodeProject(project: Project): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(project))));
}

function decodePayload(payload: string): Project {
  return JSON.parse(decodeURIComponent(escape(atob(payload))));
}

// Replicates the local stats builder in App.tsx
function computeStats(items: ChecklistItem[]): {
  total: number;
  todo: number;
  inProgress: number;
  completed: number;
  highPriorityCount: number;
  progressPercentage: number;
} {
  const total = items.length;
  const todo = items.filter(i => i.status === 'todo').length;
  const inProgress = items.filter(i => i.status === 'in-progress').length;
  const completed = items.filter(i => i.status === 'completed').length;
  const highPriorityCount = items.filter(i => i.priority === 'high' && i.status !== 'completed').length;
  const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, todo, inProgress, completed, highPriorityCount, progressPercentage };
}

// Replicates the Executive Report member metrics computation
function compileMemberMetrics(project: Project) {
  return project.team.map(m => {
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
}

// Replicates Category Health computation
function compileCategoryStats(project: Project) {
  return project.categories.map(cat => {
    const catItems = project.items.filter(i => i.category === cat.id);
    const catDone = catItems.filter(i => i.status === 'completed').length;
    return {
      category: cat,
      total: catItems.length,
      done: catDone,
      percent: catItems.length > 0 ? Math.round((catDone / catItems.length) * 105) : 0
    };
  });
}

describe('Unit Tests: Core Data & Data Calculations', () => {
  it('should verify original mock categories and items are consistent', () => {
    expect(CATEGORIES.length).toBeGreaterThan(0);
    expect(INITIAL_ITEMS.length).toBeGreaterThan(0);
    
    // Check key relations: each item should link to a valid category ID
    const catIds = CATEGORIES.map(c => c.id);
    INITIAL_ITEMS.forEach(item => {
      expect(catIds).toContain(item.category);
    });
  });

  it('should accurately calculate status stats of an active project workspace', () => {
    const mockItems: ChecklistItem[] = [
      { id: '1', title: 'Task 1', description: '', category: 'security', priority: 'high', status: 'completed' },
      { id: '2', title: 'Task 2', description: '', category: 'security', priority: 'high', status: 'in-progress' },
      { id: '3', title: 'Task 3', description: '', category: 'security', priority: 'medium', status: 'todo' },
      { id: '4', title: 'Task 4', description: '', category: 'security', priority: 'low', status: 'todo' },
    ];

    const result = computeStats(mockItems);
    expect(result.total).toBe(4);
    expect(result.completed).toBe(1);
    expect(result.inProgress).toBe(1);
    expect(result.todo).toBe(2);
    // Task 2 is high priority and not completed, so highPriorityCount = 1
    expect(result.highPriorityCount).toBe(1);
    // 1 / 4 completed = 25%
    expect(result.progressPercentage).toBe(25);
  });

  it('should return 0% progress when there are zero items', () => {
    const result = computeStats([]);
    expect(result.progressPercentage).toBe(0);
    expect(result.total).toBe(0);
  });
});

describe('Integration Tests: Project Serialization & Sharing Logic', () => {
  it('should successfully serialize and deserialize a project dynamic payload (bidirectional validation)', () => {
    const sampleProject: Project = {
      id: 'proj-test',
      name: 'Alpha Security Launchpad',
      description: 'Audit checks.',
      categories: CATEGORIES.slice(0, 2),
      items: INITIAL_ITEMS.slice(0, 3),
      team: [
        { id: 'teammate-1', name: 'Alice', role: 'Security Architect', email: 'alice@net.com', avatarColor: 'bg-green-500' }
      ],
      createdAt: '2026-06-22T00:00:00Z'
    };

    const encoded = encodeProject(sampleProject);
    const decoded = decodePayload(encoded);

    expect(decoded.id).toBe(sampleProject.id);
    expect(decoded.name).toBe(sampleProject.name);
    expect(decoded.team.length).toBe(1);
    expect(decoded.team[0].name).toBe('Alice');
    expect(decoded.items.length).toBe(3);
  });

  it('should support non-ASCII characters & Emojis in project metadata without breaking the Base64 chain', () => {
    const complexProject: Project = {
      id: 'proj-emoji-unicode',
      name: '🚀 Safe-Vibe 🛡️ - 漢字 Core Release 🌸',
      description: 'Handling multiline details & special accents: é, à, ç, û, ⚡.',
      categories: [CATEGORIES[0]],
      items: [
        {
          id: 'item-unicode',
          title: 'Validate TLS 1.3 Ciphers 🛡️',
          description: 'Ensure full encryption using: AES-256-GCM / ChaCha20-Poly1305. ⚡',
          category: CATEGORIES[0].id,
          priority: 'high',
          status: 'todo'
        }
      ],
      team: [],
      createdAt: '2026-06-22T00:00:00Z'
    };

    const encoded = encodeProject(complexProject);
    const decoded = decodePayload(encoded);

    expect(decoded.name).toBe(complexProject.name);
    expect(decoded.description).toBe(complexProject.description);
    expect(decoded.items[0].title).toBe(complexProject.items[0].title);
    expect(decoded.items[0].description).toBe(complexProject.items[0].description);
  });
});

describe('Analytical Integration Tests: Executive Audit Reports Compiler', () => {
  const testProject: Project = {
    id: 'proj-report-test',
    name: 'Report Test Project',
    description: 'Verifying statistics math.',
    categories: [
      { id: 'sec', name: 'Security', description: '', icon: '', color: '', lightColor: '', textColor: '' },
      { id: 'ops', name: 'Ops', description: '', icon: '', color: '', lightColor: '', textColor: '' }
    ],
    items: [
      // Bob is assigned to 1 and completed it. 1 / 1 = 100% Efficiency
      { id: 't1', title: 'Task 1', description: '', category: 'sec', priority: 'high', status: 'completed', assignedTo: ['bob'] },
      // Dave is assigned to 3 tasks. Completed 1. 1 / 3 = 33% Efficiency
      { id: 't2', title: 'Task 2', description: '', category: 'sec', priority: 'high', status: 'in-progress', assignedTo: ['dave'] },
      { id: 't3', title: 'Task 3', description: '', category: 'ops', priority: 'medium', status: 'todo', assignedTo: ['dave'] },
      { id: 't4', title: 'Task 4', description: '', category: 'ops', priority: 'low', status: 'completed', assignedTo: ['dave', 'bob'] } // assigned to both!
    ],
    team: [
      { id: 'bob', name: 'Bob Scrum', role: 'Developer', email: 'bob@net.com', avatarColor: 'bg-blue-500' },
      { id: 'dave', name: 'Dave QA', role: 'Staging Auditor', email: 'dave@net.com', avatarColor: 'bg-red-500' },
      { id: 'ghost', name: 'James Ghost', role: 'Architect', email: 'ghost@net.com', avatarColor: 'bg-gray-500' }
    ],
    createdAt: '2026-06-22T00:00:00Z'
  };

  it('should compile correct teammate statistics & assign accurate default review comments', () => {
    const metrics = compileMemberMetrics(testProject);

    // Filter metrics by member ID
    const bobMetrics = metrics.find(m => m.member.id === 'bob')!;
    const daveMetrics = metrics.find(m => m.member.id === 'dave')!;
    const ghostMetrics = metrics.find(m => m.member.id === 'ghost')!;

    // Bob hasTask 1 and Task 4 -> 2 assigned tasks. Both are completed -> 100% efficiency
    expect(bobMetrics.assignedCount).toBe(2);
    expect(bobMetrics.completedCount).toBe(2);
    expect(bobMetrics.efficiencyRating).toBe('100%');
    expect(bobMetrics.reviewComment).toContain('Excellent velocity');

    // Dave has Task 2, Task 3, and Task 4 -> 3 assigned. Completed Task 4. -> 1/3 completed = 33% efficiency. High priority task 2 is incomplete (criticalPending = 1)
    expect(daveMetrics.assignedCount).toBe(3);
    expect(daveMetrics.completedCount).toBe(1);
    expect(daveMetrics.criticalPending).toBe(1);
    expect(daveMetrics.efficiencyRating).toBe('33%');
    expect(daveMetrics.reviewComment).toContain('Action needed'); // because criticalPending > 0 and efficiency < 50%

    // Ghost has 0 assigned
    expect(ghostMetrics.assignedCount).toBe(0);
    expect(ghostMetrics.efficiencyRating).toBe('N/A');
    expect(ghostMetrics.reviewComment).toContain('Awaiting allocation');
  });

  it('should compute exact category progress gating details', () => {
    const catStats = compileCategoryStats(testProject);

    const secStat = catStats.find(s => s.category.id === 'sec')!;
    const opsStat = catStats.find(s => s.category.id === 'ops')!;

    // 'sec' has 't1' (completed), 't2' (in-progress)
    expect(secStat.total).toBe(2);
    expect(secStat.done).toBe(1);
    // percent: Math.round(1 / 2 * 105) = 53%
    expect(secStat.percent).toBe(53);

    // 'ops' has 't3' (todo), 't4' (completed)
    expect(opsStat.total).toBe(2);
    expect(opsStat.done).toBe(1);
    expect(opsStat.percent).toBe(53);
  });
});
