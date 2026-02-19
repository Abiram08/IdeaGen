import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, getDocs, query, orderBy, increment,
  serverTimestamp, limit as firestoreLimit,
} from 'firebase/firestore';
import { db } from './config';
import type { SavedIdea, ExtractedIdea, Domain, SkillLevel, ProjectRoadmap } from '@/types/idea';

const MAX_GENERATIONS = 3;

function getDb() {
  if (!db) throw new Error('Firestore not configured');
  return db;
}

// ============ USAGE TRACKING ============

export async function getGenerationCount(uid: string): Promise<number> {
  const snap = await getDoc(doc(getDb(), 'users', uid));
  return snap.exists() ? (snap.data().generationCount ?? 0) : 0;
}

export async function canGenerateFirestore(uid: string): Promise<boolean> {
  const snap = await getDoc(doc(getDb(), 'users', uid));
  if (!snap.exists()) return true; // new user
  if (snap.data().isPremium) return true;
  return (snap.data().generationCount ?? 0) < MAX_GENERATIONS;
}

export async function incrementUsageFirestore(uid: string): Promise<void> {
  const ref = doc(getDb(), 'users', uid);
  await updateDoc(ref, { generationCount: increment(1) });
}

export async function getRemainingGenerationsFirestore(uid: string): Promise<number> {
  const snap = await getDoc(doc(getDb(), 'users', uid));
  if (!snap.exists()) return MAX_GENERATIONS;
  if (snap.data().isPremium) return Infinity;
  return Math.max(0, MAX_GENERATIONS - (snap.data().generationCount ?? 0));
}

// ============ SAVED IDEAS ============

export async function getSavedIdeasFirestore(uid: string): Promise<SavedIdea[]> {
  const ref = collection(getDb(), 'users', uid, 'savedIdeas');
  const q = query(ref, orderBy('savedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), id: d.id } as SavedIdea));
}

export async function saveIdeaFirestore(
  uid: string,
  idea: ExtractedIdea,
  domain: Domain,
  skillLevel: SkillLevel
): Promise<void> {
  const id = crypto.randomUUID();
  const saved: SavedIdea = {
    ...idea,
    id,
    savedAt: new Date().toISOString(),
    domain,
    skillLevel,
  };
  await setDoc(doc(getDb(), 'users', uid, 'savedIdeas', id), saved);
}

export async function deleteIdeaFirestore(uid: string, docId: string): Promise<void> {
  await deleteDoc(doc(getDb(), 'users', uid, 'savedIdeas', docId));
}

// ============ SHARED ROADMAPS ============

export async function shareRoadmap(
  uid: string,
  roadmap: ProjectRoadmap,
  ideaTitle: string
): Promise<string> {
  const shareId = crypto.randomUUID().slice(0, 12);
  await setDoc(doc(getDb(), 'sharedRoadmaps', shareId), {
    roadmap,
    ideaTitle,
    createdBy: uid,
    createdAt: serverTimestamp(),
  });
  return shareId;
}

export async function getSharedRoadmap(
  shareId: string
): Promise<{ roadmap: ProjectRoadmap; ideaTitle: string } | null> {
  const snap = await getDoc(doc(getDb(), 'sharedRoadmaps', shareId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return { roadmap: data.roadmap as ProjectRoadmap, ideaTitle: data.ideaTitle };
}
