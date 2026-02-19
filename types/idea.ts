// Core type definitions for the Idea Generation application

export type Domain =
  | 'ai-ml' | 'saas' | 'fintech' | 'healthtech'
  | 'edtech' | 'gaming' | 'social-impact'
  | 'ecommerce' | 'iot' | 'devtools';

export type ProjectType = 'student-project' | 'hackathon' | 'startup';

export const PROJECT_TYPE_CONFIG: Record<ProjectType, { label: string; icon: string; description: string }> = {
  'student-project': { label: 'Student Project', icon: '🎓', description: 'Course project or portfolio piece' },
  'hackathon': { label: 'Hackathon', icon: '🏆', description: 'Quick prototype, wow-factor demo' },
  'startup': { label: 'Startup', icon: '🚀', description: 'Market-viable, scalable product' },
};

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export type ProjectScope =
  | 'solo-weekend'
  | 'solo-2weeks'
  | 'team-hackathon'
  | 'mvp-startup';

export type RawContent = {
  title: string;
  text: string;
  url: string;
  source: 'reddit' | 'hackernews' | 'devto' | 'devpost';
};

export type ExtractedIdea = {
  title: string;
  problem: string;
  concept: string;
  target_user: string;
  source_platform: 'reddit' | 'hackernews' | 'devto' | 'devpost' | 'ai-generated';
  source_url: string;
  rough_tech: string[];
  why_interesting: string;
  origin: 'community' | 'ai-generated';
  suggested_features: string[];
};

export type TechStack = {
  frontend: string;
  backend: string;
  database: string;
  extra: string[];
};

export type Feature = {
  name: string;
  included: boolean;
};

export type IdeaState = {
  title: string;
  problem: string;
  concept: string;
  tech_stack: TechStack;
  features: Feature[];
  scope: ProjectScope;
  removed: string[];
  added: string[];
};

export interface IdeaVaultIdea {
  id: string;
  title: string;
  problem?: string;
  concept?: string;
  description?: string;
  rough_tech?: string[];
  target_user?: string;
  tags?: string[];
  source?: string;
}

export type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type BrainstormRequest = {
  message: string;
  ideaState: IdeaState;
  conversationHistory: ConversationMessage[];
};

export type BrainstormResponse = {
  message: string;
  updatedIdeaState: IdeaState | null;
};

export interface UserProfile {
  skill_level: 'beginner' | 'intermediate' | 'advanced';
  time_available: string;
  team_size: string;
}

export type CoreFeature = {
  name: string;
  description: string;
  priority: 'must' | 'should' | 'nice';
  est_hours: number;
};

export type RoadmapWeek = {
  week: number;
  milestone: string;
  tasks: string[];
  deliverable: string;
};

export type ProjectRoadmap = {
  title: string;
  tagline: string;
  problem_statement: string;
  target_user: string;
  unique_angle: string;
  tech_stack: {
    frontend: string;
    backend: string;
    database: string;
    auth: string;
    hosting: string;
    extras: string[];
  };
  core_features: CoreFeature[];
  roadmap: RoadmapWeek[];
  technical_risks: string[];
  difficulty_score: number;
  estimated_total_hours: number;
  similar_products: string[];
  first_thing_to_build: string;
  competitive_analysis?: CompetitiveAnalysis;
  tech_recommendations?: TechRecommendation[];
  project_scaffold?: ProjectScaffold;
};

// ============ COMPETITIVE ANALYSIS ============

export type Competitor = {
  name: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  how_we_differ: string;
};

export type CompetitiveAnalysis = {
  competitors: Competitor[];
  market_gap: string;
  positioning_strategy: string;
};

// ============ TECH RECOMMENDATIONS ============

export type TechAlternative = {
  name: string;
  reason: string;
};

export type TechRecommendation = {
  category: string;
  recommended: string;
  pros: string[];
  cons: string[];
  alternatives: TechAlternative[];
};

// ============ PROJECT SCAFFOLD ============

export type ScaffoldFile = {
  path: string;
  description: string;
  content: string;
};

export type ProjectScaffold = {
  files: ScaffoldFile[];
  setup_commands: string[];
  readme_content: string;
};

export type SavedIdea = ExtractedIdea & {
  id: string;
  savedAt: string;
  domain: Domain;
  skillLevel: SkillLevel;
};

export type UsageData = {
  count: number;
  weekStart: string;
  isPremium: boolean;
};

export const DOMAIN_OPTIONS: Domain[] = [
  'ai-ml',
  'saas',
  'fintech',
  'healthtech',
  'edtech',
  'gaming',
  'social-impact',
  'ecommerce',
  'iot',
  'devtools',
];

export const DOMAIN_TO_TAG: Record<Domain, string> = {
  'ai-ml': 'machinelearning',
  'saas': 'saas',
  'fintech': 'fintech',
  'healthtech': 'healthtech',
  'edtech': 'edtech',
  'gaming': 'gamedev',
  'social-impact': 'opensource',
  'ecommerce': 'ecommerce',
  'iot': 'iot',
  'devtools': 'devtools',
};

export const DOMAIN_SEARCH_TERMS: Record<Domain, string> = {
  'ai-ml': 'artificial intelligence machine learning',
  'saas': 'SaaS software as a service',
  'fintech': 'fintech payments banking',
  'healthtech': 'health tech medical',
  'edtech': 'education technology learning',
  'gaming': 'game development indie',
  'social-impact': 'social impact nonprofit',
  'ecommerce': 'e-commerce online store',
  'iot': 'internet of things sensors',
  'devtools': 'developer tools CLI',
};

export const DOMAIN_LABELS: Record<Domain, string> = {
  'ai-ml': 'AI / ML',
  'saas': 'SaaS',
  'fintech': 'FinTech',
  'healthtech': 'HealthTech',
  'edtech': 'EdTech',
  'gaming': 'Gaming',
  'social-impact': 'Social Impact',
  'ecommerce': 'E-Commerce',
  'iot': 'IoT',
  'devtools': 'Dev Tools',
};

export type TechPreference =
  | 'no-preference' | 'react-nextjs' | 'vue-nuxt'
  | 'python-fastapi' | 'nodejs-express'
  | 'react-native' | 'nextjs-supabase';

export type TimelinePreference =
  | '1 week' | '2 weeks' | '1 month' | '3 months';

export type GenerationParams = {
  domain: Domain;
  skillLevel: SkillLevel;
  techPreference: TechPreference;
  timeline: TimelinePreference;
  projectType: ProjectType;
};

export const TECH_PREFERENCE_LABELS: Record<TechPreference, string> = {
  'no-preference': 'No Preference — AI Decides',
  'react-nextjs': 'React / Next.js',
  'vue-nuxt': 'Vue / Nuxt',
  'python-fastapi': 'Python / FastAPI',
  'nodejs-express': 'Node.js / Express',
  'react-native': 'Mobile — React Native',
  'nextjs-supabase': 'Full-stack — Next.js + Supabase',
};

export const TIMELINE_LABELS: Record<TimelinePreference, string> = {
  '1 week': '1 Week',
  '2 weeks': '2 Weeks',
  '1 month': '1 Month',
  '3 months': '3 Months',
};

export const SKILL_LEVELS: SkillLevel[] = ['beginner', 'intermediate', 'advanced'];

export const SKILL_LEVEL_CONFIG: Record<SkillLevel, { label: string; description: string; icon: string }> = {
  beginner: {
    label: 'Beginner',
    description: 'Learning fundamentals, simple projects',
    icon: '🌱',
  },
  intermediate: {
    label: 'Intermediate',
    description: 'Comfortable with basics, ready for complexity',
    icon: '🌿',
  },
  advanced: {
    label: 'Advanced',
    description: 'Experienced dev, complex architectures',
    icon: '🌳',
  },
};
