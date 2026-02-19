'use client';

import { IdeaState, ProjectScope } from '@/types/idea';
import { TechBadge, TechBadgeList } from './TechBadge';
import { FeatureList } from './FeatureList';
import { Target, Code, Layers, Clock, Sparkles } from 'lucide-react';

interface LiveIdeaPanelProps {
  ideaState: IdeaState;
  onFeatureToggle?: (index: number) => void;
  onScopeChange?: (scope: ProjectScope) => void;
}

const scopeLabels: Record<ProjectScope, { label: string; description: string }> = {
  'solo-weekend': { label: 'Weekend Project', description: '1-2 days' },
  'solo-2weeks': { label: '2 Week Sprint', description: 'Solo developer' },
  'team-hackathon': { label: 'Hackathon', description: '24-48 hours, team' },
  'mvp-startup': { label: 'Startup MVP', description: '4-8 weeks' },
};

export function LiveIdeaPanel({
  ideaState,
  onFeatureToggle,
  onScopeChange,
}: LiveIdeaPanelProps) {
  return (
    <div className="h-full glass-card rounded-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-5 py-4 border-b border-white/5 bg-gradient-to-r from-green-500/10 to-green-600/10">
        <h2 className="font-semibold text-white flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          Your Idea
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Live preview — updates as you chat
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Title */}
        <div>
          <h3 className="text-xl font-bold text-white">
            {ideaState.title}
          </h3>
        </div>

        {/* Problem */}
        <div>
          <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Target className="w-3 h-3 text-green-400" />
            Problem
          </h4>
          <p className="text-sm text-gray-300">
            {ideaState.problem}
          </p>
        </div>

        {/* Concept */}
        <div>
          <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Layers className="w-3 h-3 text-green-400" />
            Concept
          </h4>
          <p className="text-sm text-gray-300">
            {ideaState.concept}
          </p>
        </div>

        {/* Tech Stack */}
        <div>
          <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Code className="w-3 h-3 text-green-400" />
            Tech Stack
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-20">Frontend:</span>
              <TechBadge tech={ideaState.tech_stack.frontend} variant="primary" />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-20">Backend:</span>
              <TechBadge tech={ideaState.tech_stack.backend} variant="secondary" />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-20">Database:</span>
              <TechBadge tech={ideaState.tech_stack.database} />
            </div>
            {ideaState.tech_stack.extra.length > 0 && (
              <div className="flex items-start gap-3">
                <span className="text-xs text-gray-500 w-20 pt-1">Extras:</span>
                <TechBadgeList techs={ideaState.tech_stack.extra} maxDisplay={3} />
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div>
          <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
            Features
          </h4>
          <FeatureList
            features={ideaState.features}
            editable={!!onFeatureToggle}
            onToggle={onFeatureToggle}
          />
        </div>

        {/* Scope */}
        <div>
          <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Clock className="w-3 h-3 text-orange-400" />
            Project Scope
          </h4>
          {onScopeChange ? (
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(scopeLabels) as ProjectScope[]).map((scope) => (
                <button
                  key={scope}
                  onClick={() => onScopeChange(scope)}
                  className={`p-3 rounded-xl text-left transition-all duration-300 ${
                    ideaState.scope === scope
                      ? 'glass border border-green-500/50 shadow-[0_0_20px_rgba(7,209,96,0.2)]'
                      : 'glass border border-transparent hover:border-white/10'
                  }`}
                >
                  <span className={`text-xs font-medium block ${
                    ideaState.scope === scope ? 'text-green-400' : 'text-gray-300'
                  }`}>
                    {scopeLabels[scope].label}
                  </span>
                  <span className="text-xs text-gray-500">
                    {scopeLabels[scope].description}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-xl">
              <span className="text-sm font-medium text-green-400">
                {scopeLabels[ideaState.scope].label}
              </span>
              <span className="text-xs text-gray-500">
                ({scopeLabels[ideaState.scope].description})
              </span>
            </div>
          )}
        </div>

        {/* Modifications */}
        {(ideaState.added.length > 0 || ideaState.removed.length > 0) && (
          <div className="pt-4 border-t border-white/5">
            <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
              Modifications
            </h4>
            {ideaState.added.length > 0 && (
              <div className="mb-3">
                <span className="text-xs text-green-400">+ Added:</span>
                <p className="text-xs text-gray-400 mt-1">
                  {ideaState.added.join(', ')}
                </p>
              </div>
            )}
            {ideaState.removed.length > 0 && (
              <div>
                <span className="text-xs text-red-400">- Removed:</span>
                <p className="text-xs text-gray-400 mt-1">
                  {ideaState.removed.join(', ')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
