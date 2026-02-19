'use client';

import { ExtractedIdea } from '@/types/idea';
import { TechBadgeList } from './TechBadge';
import { ExternalLink, Lightbulb, ArrowRight } from 'lucide-react';

interface IdeaPickCardProps {
  idea: ExtractedIdea;
  onSelect: (idea: ExtractedIdea) => void;
}

const sourceBadgeColors: Record<string, string> = {
  reddit: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  hackernews: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  devto: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
  devpost: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
};

const sourceLabels: Record<string, string> = {
  reddit: 'Reddit',
  hackernews: 'Hacker News',
  devto: 'Dev.to',
  devpost: 'Devpost',
};

export function IdeaPickCard({ idea, onSelect }: IdeaPickCardProps) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white line-clamp-2">
            {idea.title}
          </h3>
          <span
            className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${
              sourceBadgeColors[idea.source_platform] || sourceBadgeColors.hackernews
            }`}
          >
            {sourceLabels[idea.source_platform] || idea.source_platform}
          </span>
        </div>

        {/* Problem Statement */}
        <div className="mb-4">
          <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Problem
          </h4>
          <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3">
            {idea.problem}
          </p>
        </div>

        {/* Concept */}
        <div className="mb-4">
          <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Solution Concept
          </h4>
          <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
            {idea.concept}
          </p>
        </div>

        {/* Tech Stack */}
        <div className="mb-4">
          <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Suggested Tech
          </h4>
          <TechBadgeList techs={idea.rough_tech} maxDisplay={4} />
        </div>

        {/* Why Interesting */}
        <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            {idea.why_interesting}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto p-6 pt-0 space-y-3">
        {idea.source_url && idea.source_url !== '#' && (
          <a
            href={idea.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            <span>View source</span>
          </a>
        )}

        <button
          onClick={() => onSelect(idea)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <span>Explore This Idea</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
