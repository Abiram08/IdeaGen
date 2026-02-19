// Local storage utilities for bookmarks and usage tracking

import { SavedIdea, UsageData, ExtractedIdea, Domain, SkillLevel } from '@/types/idea';

const SAVED_KEY = 'ideagen_saved';
const USAGE_KEY = 'ideagen_usage';
const MAX_SAVED = 50;
const FREE_PER_WEEK = 5;

// Get start of current week (Monday midnight)
function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0, 0);
  return monday.toISOString();
}

function isPastMonday(weekStart: string): boolean {
  const currentMonday = new Date(getWeekStart()).getTime();
  const storedMonday = new Date(weekStart).getTime();
  return storedMonday < currentMonday;
}

// ============ USAGE TRACKING ============

function getUsageData(): UsageData {
  if (typeof window === 'undefined') {
    return { count: 0, weekStart: getWeekStart(), isPremium: false };
  }

  try {
    const stored = localStorage.getItem(USAGE_KEY);
    if (!stored) {
      const fresh: UsageData = { count: 0, weekStart: getWeekStart(), isPremium: false };
      localStorage.setItem(USAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }

    const data: UsageData = JSON.parse(stored);

    // Reset if new week
    if (isPastMonday(data.weekStart)) {
      const reset: UsageData = { count: 0, weekStart: getWeekStart(), isPremium: data.isPremium };
      localStorage.setItem(USAGE_KEY, JSON.stringify(reset));
      return reset;
    }

    return data;
  } catch {
    return { count: 0, weekStart: getWeekStart(), isPremium: false };
  }
}

export function canGenerate(): boolean {
  const data = getUsageData();
  if (data.isPremium) return true;
  return data.count < FREE_PER_WEEK;
}

export function incrementUsage(): void {
  const data = getUsageData();
  data.count += 1;
  localStorage.setItem(USAGE_KEY, JSON.stringify(data));
}

export function getRemainingGenerations(): number {
  const data = getUsageData();
  if (data.isPremium) return Infinity;
  return Math.max(0, FREE_PER_WEEK - data.count);
}

// ============ SAVED IDEAS ============

/** Composite key that works for both community (source_url) and AI-generated (title+origin) ideas */
export function getIdeaKey(idea: { source_url: string; title: string; origin: string }): string {
  if (idea.source_url && idea.source_url !== '' && idea.source_url !== '#') {
    return idea.source_url;
  }
  return `${idea.origin}::${idea.title}`;
}

export function getSavedIdeas(): SavedIdea[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(SAVED_KEY);
    const ideas: SavedIdea[] = stored ? JSON.parse(stored) : [];
    return ideas.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
  } catch {
    return [];
  }
}

export function saveIdea(idea: ExtractedIdea, domain: Domain, skillLevel: SkillLevel): void {
  const savedIdeas = getSavedIdeas();

  // Dedupe by composite key (handles AI-generated ideas with empty source_url)
  const key = getIdeaKey(idea);
  if (savedIdeas.some((s) => getIdeaKey(s) === key)) return;

  const saved: SavedIdea = {
    ...idea,
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
    domain,
    skillLevel,
  };

  savedIdeas.unshift(saved);

  // Cap at MAX_SAVED
  const capped = savedIdeas.slice(0, MAX_SAVED);
  localStorage.setItem(SAVED_KEY, JSON.stringify(capped));
}

export function deleteIdea(id: string): void {
  const savedIdeas = getSavedIdeas();
  const filtered = savedIdeas.filter((idea) => idea.id !== id);
  localStorage.setItem(SAVED_KEY, JSON.stringify(filtered));
}

export function isIdeaSaved(idea: { source_url: string; title: string; origin: string }): boolean {
  const savedIdeas = getSavedIdeas();
  const key = getIdeaKey(idea);
  return savedIdeas.some((saved) => getIdeaKey(saved) === key);
}

// ============ ASYNC WRAPPERS (Firestore when uid, localStorage fallback) ============

import {
  canGenerateFirestore,
  incrementUsageFirestore,
  getRemainingGenerationsFirestore,
  getSavedIdeasFirestore,
  saveIdeaFirestore,
  deleteIdeaFirestore,
} from './firebase/firestore';

export async function canGenerateAsync(uid: string | null): Promise<boolean> {
  if (uid) return canGenerateFirestore(uid);
  return canGenerate();
}

export async function incrementUsageAsync(uid: string | null): Promise<void> {
  if (uid) return incrementUsageFirestore(uid);
  incrementUsage();
}

export async function getRemainingAsync(uid: string | null): Promise<number> {
  if (uid) return getRemainingGenerationsFirestore(uid);
  return getRemainingGenerations();
}

export async function getSavedIdeasAsync(uid: string | null): Promise<SavedIdea[]> {
  if (uid) return getSavedIdeasFirestore(uid);
  return getSavedIdeas();
}

export async function saveIdeaAsync(
  uid: string | null,
  idea: ExtractedIdea,
  domain: Domain,
  skillLevel: SkillLevel
): Promise<void> {
  if (uid) return saveIdeaFirestore(uid, idea, domain, skillLevel);
  saveIdea(idea, domain, skillLevel);
}

export async function deleteIdeaAsync(uid: string | null, docId: string): Promise<void> {
  if (uid) return deleteIdeaFirestore(uid, docId);
  deleteIdea(docId);
}
