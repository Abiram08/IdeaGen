'use client';

import { useEffect, useState } from 'react';
import { ExtractedIdea, PROJECT_TYPE_CONFIG, ProjectType } from '@/types/idea';
import { TechBadge } from './TechBadge';
import { Bookmark, BookmarkCheck, ArrowRight, ExternalLink, Lightbulb } from 'lucide-react';

const sourceBadgeColors: Record<string, string> = {
  reddit: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  hackernews: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  devto: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  devpost: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const sourceLabels: Record<string, string> = {
  reddit: 'Reddit',
  hackernews: 'Hacker News',
  devto: 'Dev.to',
  devpost: 'Devpost',
};

interface IdeaPickCardProps {
  idea: ExtractedIdea;
  index: number;
  onSelect: () => void;
  onBookmark: () => void;
  isBookmarked: boolean;
}

export function IdeaPickCard({ idea, index, onSelect, onBookmark, isBookmarked }: IdeaPickCardProps) {
  const [projectType, setProjectType] = useState<ProjectType | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('ideagenProjectType') as ProjectType | null;
    if (stored && stored in PROJECT_TYPE_CONFIG) setProjectType(stored);
  }, []);

  return (
    <div className="glass-card-interactive rounded-2xl overflow-hidden flex flex-col fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="flex items-start justify-between gap-3 mb-1">
          <span className="text-xs font-mono text-zinc-500">#{index + 1}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onBookmark(); }}
              className={`p-1.5 rounded-lg transition-all ${
                isBookmarked
                  ? 'bg-[#07D160]/20 text-[#07D160]'
                  : 'bg-white/5 text-zinc-400 hover:text-[#07D160] hover:bg-[#07D160]/10'
              }`}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark idea'}
            >
              {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${sourceBadgeColors[idea.source_platform] || 'bg-purple-500/20 text-purple-400 border-purple-500/30'}`}>
              {sourceLabels[idea.source_platform] || idea.source_platform}
            </span>
            {idea.origin === 'community' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                From Community
              </span>
            )}
            {idea.origin === 'ai-generated' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                AI Generated
              </span>
            )}
            {projectType && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 border border-green-500/40">
                {PROJECT_TYPE_CONFIG[projectType].icon} {PROJECT_TYPE_CONFIG[projectType].label}
              </span>
            )}
          </div>
        </div>
        <h3 className="text-lg font-bold text-white mt-2">{idea.title}</h3>
      </div>

      {/* Body */}
      <div className="p-6 pt-4 flex-1 flex flex-col">
        <div className="mb-3">
          <span className="text-xs font-medium text-[#07D160] uppercase tracking-wider">Problem</span>
          <p className="text-sm text-zinc-300 mt-1 line-clamp-3">{idea.problem}</p>
        </div>

        <div className="mb-3">
          <span className="text-xs font-medium text-[#07D160] uppercase tracking-wider">Concept</span>
          <p className="text-sm text-zinc-300 mt-1 line-clamp-2">{idea.concept}</p>
        </div>

        <div className="mb-3">
          <span className="text-xs font-medium text-[#07D160] uppercase tracking-wider block mb-1.5">Tech</span>
          <div className="flex flex-wrap gap-1.5">
            {idea.rough_tech.slice(0, 5).map((tech, i) => (
              <TechBadge key={i} label={tech} />
            ))}
          </div>
        </div>

        {idea.suggested_features?.length > 0 && (
          <div className="mb-3">
            <span className="text-xs font-medium text-[#07D160] uppercase tracking-wider block mb-1.5">Features</span>
            <ul className="space-y-1">
              {idea.suggested_features.slice(0, 5).map((f, i) => (
                <li key={i} className="text-xs text-zinc-400 flex items-center gap-1.5">
                  <span className="text-[#07D160]">+</span> {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Why interesting */}
        <div className="mt-auto mb-4">
          <div className="flex items-start gap-2 p-3 rounded-xl bg-[#07D160]/10 border border-[#07D160]/20">
            <Lightbulb className="w-4 h-4 text-[#07D160] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-green-200">{idea.why_interesting}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto pt-4 border-t border-white/5 space-y-3">
          {idea.origin === 'community' && idea.source_url && idea.source_url !== '#' && (
            <a
              href={idea.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-[#07D160] transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>View original ↗</span>
            </a>
          )}
          <button
            onClick={onSelect}
            className="w-full glow-button flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium group"
          >
            <span>Explore This Idea</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
