'use client';

import { IdeaState } from '@/types/idea';
import { TechBadge } from './TechBadge';
import { Check, X, Plus, Minus, Cpu, Database, Globe, Layers } from 'lucide-react';

const scopeLabels: Record<string, string> = {
  'solo-weekend': 'Solo Weekend',
  'solo-2weeks': 'Solo 2 Weeks',
  'team-hackathon': 'Team Hackathon',
  'mvp-startup': 'MVP Startup',
};

export function LiveIdeaPanel({ idea }: { idea: IdeaState }) {
  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white">{idea.title}</h2>
        <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-[#07D160]/20 text-[#07D160] border border-[#07D160]/30">
          {scopeLabels[idea.scope] || idea.scope}
        </span>
      </div>

      {/* Problem */}
      <div>
        <h3 className="text-xs font-medium text-[#07D160] uppercase tracking-wider mb-1">Problem</h3>
        <p className="text-sm text-zinc-300">{idea.problem}</p>
      </div>

      {/* Concept */}
      <div>
        <h3 className="text-xs font-medium text-[#07D160] uppercase tracking-wider mb-1">Concept</h3>
        <p className="text-sm text-zinc-300">{idea.concept}</p>
      </div>

      {/* Tech Stack */}
      <div>
        <h3 className="text-xs font-medium text-[#07D160] uppercase tracking-wider mb-2">Tech Stack</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-zinc-300">
            <Globe className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-zinc-500">Frontend:</span>
            <span>{idea.tech_stack.frontend}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-300">
            <Cpu className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-zinc-500">Backend:</span>
            <span>{idea.tech_stack.backend}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-300">
            <Database className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-zinc-500">Database:</span>
            <span>{idea.tech_stack.database}</span>
          </div>
          {idea.tech_stack.extra.length > 0 && (
            <div className="flex items-start gap-2 text-sm">
              <Layers className="w-3.5 h-3.5 text-zinc-500 mt-0.5" />
              <span className="text-zinc-500">Extras:</span>
              <div className="flex flex-wrap gap-1">
                {idea.tech_stack.extra.map((e, i) => (
                  <TechBadge key={i} label={e} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features */}
      <div>
        <h3 className="text-xs font-medium text-[#07D160] uppercase tracking-wider mb-2">Features</h3>
        <ul className="space-y-1.5">
          {idea.features.map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              {f.included ? (
                <Check className="w-3.5 h-3.5 text-[#07D160]" />
              ) : (
                <X className="w-3.5 h-3.5 text-zinc-500" />
              )}
              <span className={f.included ? 'text-zinc-300' : 'text-zinc-500 line-through'}>
                {f.name}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Added */}
      {idea.added.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-[#07D160] uppercase tracking-wider mb-2">Added</h3>
          <ul className="space-y-1">
            {idea.added.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-green-400">
                <Plus className="w-3.5 h-3.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Removed */}
      {idea.removed.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-red-400 uppercase tracking-wider mb-2">Removed</h3>
          <ul className="space-y-1">
            {idea.removed.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-red-400">
                <Minus className="w-3.5 h-3.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
