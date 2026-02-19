import { ProjectRoadmap } from '@/types/idea';
import { TechBadge } from './TechBadge';
import { FeatureList } from './FeatureList';
import { WeekTimeline } from './WeekTimeline';
import { Printer, AlertTriangle, Zap, Target, Lightbulb, ChevronDown, ChevronUp, Swords, Cpu } from 'lucide-react';
import { useState } from 'react';

function CompetitorCard({ competitor }: { competitor: { name: string; description: string; strengths: string[]; weaknesses: string[]; how_we_differ: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass rounded-xl p-4">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between text-left">
        <div>
          <h4 className="text-sm font-semibold text-white">{competitor.name}</h4>
          <p className="text-xs text-zinc-400 mt-0.5">{competitor.description}</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-zinc-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-zinc-500 flex-shrink-0" />}
      </button>
      {open && (
        <div className="mt-3 space-y-3 border-t border-white/5 pt-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-xs font-medium text-green-400 uppercase tracking-wider">Strengths</span>
              <ul className="mt-1 space-y-1">
                {competitor.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-zinc-300 flex items-start gap-1.5">
                    <span className="text-green-400 mt-0.5">+</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="text-xs font-medium text-red-400 uppercase tracking-wider">Weaknesses</span>
              <ul className="mt-1 space-y-1">
                {competitor.weaknesses.map((w, i) => (
                  <li key={i} className="text-xs text-zinc-300 flex items-start gap-1.5">
                    <span className="text-red-400 mt-0.5">-</span>{w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div>
            <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">How We Differ</span>
            <p className="text-xs text-zinc-300 mt-1">{competitor.how_we_differ}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function TechRecCard({ rec }: { rec: { category: string; recommended: string; pros: string[]; cons: string[]; alternatives: { name: string; reason: string }[] } }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass rounded-xl p-4">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between text-left">
        <div>
          <span className="text-xs text-zinc-500">{rec.category}</span>
          <p className="text-sm font-semibold text-white">{rec.recommended}</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-zinc-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-zinc-500 flex-shrink-0" />}
      </button>
      {open && (
        <div className="mt-3 space-y-3 border-t border-white/5 pt-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-xs font-medium text-green-400 uppercase tracking-wider">Pros</span>
              <ul className="mt-1 space-y-1">
                {rec.pros.map((p, i) => (
                  <li key={i} className="text-xs text-zinc-300 flex items-start gap-1.5">
                    <span className="text-green-400 mt-0.5">+</span>{p}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="text-xs font-medium text-red-400 uppercase tracking-wider">Cons</span>
              <ul className="mt-1 space-y-1">
                {rec.cons.map((c, i) => (
                  <li key={i} className="text-xs text-zinc-300 flex items-start gap-1.5">
                    <span className="text-red-400 mt-0.5">-</span>{c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {rec.alternatives.length > 0 && (
            <div>
              <span className="text-xs font-medium text-purple-400 uppercase tracking-wider">Alternatives</span>
              <div className="mt-1 space-y-1">
                {rec.alternatives.map((a, i) => (
                  <div key={i} className="text-xs text-zinc-300">
                    <span className="text-purple-300 font-medium">{a.name}</span>
                    <span className="text-zinc-500"> — {a.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function RoadmapCard({ roadmap }: { roadmap: ProjectRoadmap }) {
  return (
    <div className="space-y-8 print:space-y-4" id="roadmap-print">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">{roadmap.title}</h1>
        <p className="text-lg text-zinc-400 mt-1">{roadmap.tagline}</p>
      </div>

      {/* First thing to build — highlighted CTA */}
      <div className="p-6 rounded-2xl bg-[#07D160]/10 border border-[#07D160]/30">
        <div className="flex items-start gap-3">
          <Zap className="w-6 h-6 text-[#07D160] flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-[#07D160] uppercase tracking-wider mb-1">
              First Thing to Build
            </h3>
            <p className="text-white font-medium">{roadmap.first_thing_to_build}</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {[
          { label: 'Difficulty', value: `${roadmap.difficulty_score}/10` },
          { label: 'Est. Hours', value: `${roadmap.estimated_total_hours}h` },
          { label: 'Features', value: `${roadmap.core_features.length}` },
          { label: 'Weeks', value: `${roadmap.roadmap.length}` },
        ].map((stat, i) => (
          <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full glass text-sm">
            <span className="text-zinc-500">{stat.label}:</span>
            <span className="text-white font-semibold">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Problem + Target */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-[#07D160]" />
            <h3 className="text-sm font-semibold text-white">Problem Statement</h3>
          </div>
          <p className="text-sm text-zinc-300">{roadmap.problem_statement}</p>
          <p className="text-xs text-zinc-500 mt-2">
            Target user: <span className="text-zinc-300">{roadmap.target_user}</span>
          </p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-[#07D160]" />
            <h3 className="text-sm font-semibold text-white">Unique Angle</h3>
          </div>
          <p className="text-sm text-zinc-300">{roadmap.unique_angle}</p>
        </div>
      </div>

      {/* Tech Stack Grid */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Tech Stack</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          {[
            { label: 'Frontend', value: roadmap.tech_stack.frontend },
            { label: 'Backend', value: roadmap.tech_stack.backend },
            { label: 'Database', value: roadmap.tech_stack.database },
            { label: 'Auth', value: roadmap.tech_stack.auth },
            { label: 'Hosting', value: roadmap.tech_stack.hosting },
          ].map((item, i) => (
            <div key={i}>
              <span className="text-xs text-zinc-500">{item.label}</span>
              <p className="text-zinc-200 font-medium">{item.value}</p>
            </div>
          ))}
          {roadmap.tech_stack.extras.length > 0 && (
            <div>
              <span className="text-xs text-zinc-500">Extras</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {roadmap.tech_stack.extras.map((e, i) => (
                  <TechBadge key={i} label={e} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Difficulty + Hours */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Difficulty</h3>
          <span className="text-sm text-zinc-400">
            ~{roadmap.estimated_total_hours} total hours
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#07D160] to-[#07D160]/60"
              style={{ width: `${roadmap.difficulty_score * 10}%` }}
            />
          </div>
          <span className="text-sm font-bold text-white">{roadmap.difficulty_score}/10</span>
        </div>
      </div>

      {/* Core Features */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Core Features</h3>
        <FeatureList features={roadmap.core_features} />
      </div>

      {/* Week Timeline */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Weekly Roadmap</h3>
        <WeekTimeline weeks={roadmap.roadmap} />
      </div>

      {/* Risks */}
      {roadmap.technical_risks.length > 0 && (
        <div className="rounded-xl p-5 bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-amber-300">Technical Risks</h3>
          </div>
          <ul className="space-y-1.5">
            {roadmap.technical_risks.map((risk, i) => (
              <li key={i} className="text-sm text-amber-200/80 flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                {risk}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Similar Products */}
      {roadmap.similar_products.length > 0 && !roadmap.competitive_analysis && (
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Similar Products</h3>
          <div className="flex flex-wrap gap-2">
            {roadmap.similar_products.map((p, i) => (
              <TechBadge key={i} label={p} />
            ))}
          </div>
        </div>
      )}

      {/* Competitive Analysis */}
      {roadmap.competitive_analysis && (
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Swords className="w-4 h-4 text-[#07D160]" />
            <h3 className="text-sm font-semibold text-white">Competitive Analysis</h3>
          </div>
          <div className="space-y-3 mb-4">
            {roadmap.competitive_analysis.competitors.map((c, i) => (
              <CompetitorCard key={i} competitor={c} />
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="glass rounded-xl p-4">
              <span className="text-xs font-medium text-green-400 uppercase tracking-wider">Market Gap</span>
              <p className="text-sm text-zinc-300 mt-1">{roadmap.competitive_analysis.market_gap}</p>
            </div>
            <div className="glass rounded-xl p-4">
              <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">Positioning Strategy</span>
              <p className="text-sm text-zinc-300 mt-1">{roadmap.competitive_analysis.positioning_strategy}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tech Recommendations */}
      {roadmap.tech_recommendations && roadmap.tech_recommendations.length > 0 && (
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-4 h-4 text-[#07D160]" />
            <h3 className="text-sm font-semibold text-white">Tech Recommendations</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {roadmap.tech_recommendations.map((r, i) => (
              <TechRecCard key={i} rec={r} />
            ))}
          </div>
        </div>
      )}

      {/* Print */}
      <div className="flex justify-center print:hidden">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print / Save as PDF
        </button>
      </div>
    </div>
  );
}
