// Core type definitions for the Idea Generation application

export interface RawContent {
  title: string;
  text: string;
  url: string;
  source: 'hackernews' | 'reddit' | 'devto' | 'devpost';
}

export interface ExtractedIdea {
  title: string;
  problem: string;
  concept: string;
  source_platform: 'reddit' | 'hackernews' | 'devto' | 'devpost';
  source_url: string;
  rough_tech: string[];
  why_interesting: string;
}

export interface TechStack {
  frontend: string;
  backend: string;
  database: string;
  extra: string[];
}

export interface Feature {
  name: string;
  included: boolean;
}

export type ProjectScope = 'solo-weekend' | 'solo-2weeks' | 'team-hackathon' | 'mvp-startup';

export interface IdeaState {
  title: string;
  problem: string;
  concept: string;
  tech_stack: TechStack;
  features: Feature[];
  scope: ProjectScope;
  removed: string[];
  added: string[];
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface BrainstormRequest {
  message: string;
  ideaState: IdeaState;
  conversationHistory: ConversationMessage[];
}

export interface BrainstormResponse {
  message: string;
  updatedIdeaState: IdeaState | null;
}

export interface UserProfile {
  skill_level: 'beginner' | 'intermediate' | 'advanced';
  time_available: '1 day' | '1 week' | '2 weeks' | '1 month';
  team_size: 'solo' | '2 people' | '3-4 people';
}

export interface CoreFeature {
  name: string;
  description: string;
  priority: 'must' | 'should' | 'nice';
  est_hours: number;
}

export interface RoadmapWeek {
  week: number;
  milestone: string;
  tasks: string[];
  deliverable: string;
}

export interface ProjectRoadmap {
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
}

export type Domain = 
  | 'health' 
  | 'fintech' 
  | 'education' 
  | 'environment' 
  | 'productivity' 
  | 'social' 
  | 'gaming' 
  | 'logistics';

export const DOMAIN_OPTIONS: Domain[] = [
  'health',
  'fintech', 
  'education',
  'environment',
  'productivity',
  'social',
  'gaming',
  'logistics'
];

export const DOMAIN_TO_TAG: Record<Domain, string> = {
  health: 'healthtech',
  fintech: 'fintech',
  education: 'edtech',
  environment: 'sustainability',
  productivity: 'productivity',
  social: 'webdev',
  gaming: 'gamedev',
  logistics: 'devops'
};
