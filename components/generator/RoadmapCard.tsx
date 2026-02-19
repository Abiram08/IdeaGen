'use client';

import { ProjectRoadmap, CoreFeature } from '@/types/idea';
import { TechBadge, TechBadgeList } from './TechBadge';
import { WeekTimeline } from './WeekTimeline';
import {
  Target,
  Users,
  Sparkles,
  Code,
  AlertTriangle,
  Clock,
  Trophy,
  Rocket,
} from 'lucide-react';

interface RoadmapCardProps {
  roadmap: ProjectRoadmap;
}

const priorityColors: Record<CoreFeature['priority'], string> = {
  must: 'bg-red-500/20 text-red-300 border border-red-500/30',
  should: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  nice: 'bg-green-500/20 text-green-300 border border-green-500/30',
};

const priorityLabels: Record<CoreFeature['priority'], string> = {
  must: 'Must Have',
  should: 'Should Have',
  nice: 'Nice to Have',
};

export function RoadmapCard({ roadmap }: RoadmapCardProps) {
  const difficultyPercentage = (roadmap.difficulty_score / 10) * 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          {roadmap.title}
        </h1>
        <p className="text-lg text-gray-400 italic">
          {roadmap.tagline}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center mx-auto mb-2">
            <Clock className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {roadmap.estimated_total_hours}h
          </p>
          <p className="text-xs text-gray-500">Total Hours</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center mx-auto mb-2">
            <Trophy className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {roadmap.roadmap.length}
          </p>
          <p className="text-xs text-gray-500">Weeks</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center mx-auto mb-2">
            <Sparkles className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {roadmap.core_features.length}
          </p>
          <p className="text-xs text-gray-500">Features</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center mx-auto mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {roadmap.technical_risks.length}
          </p>
          <p className="text-xs text-gray-500">Risks</p>
        </div>
      </div>

      {/* Problem Statement */}
      <section className="glass-card rounded-2xl p-6">
        <h2 className="flex items-center gap-3 text-lg font-semibold text-white mb-3">
          <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
            <Target className="w-4 h-4 text-green-400" />
          </div>
          Problem Statement
        </h2>
        <p className="text-gray-300">{roadmap.problem_statement}</p>
      </section>

      {/* Target User & Unique Angle */}
      <div className="grid md:grid-cols-2 gap-4">
        <section className="glass-card rounded-2xl p-6">
          <h2 className="flex items-center gap-3 text-lg font-semibold text-white mb-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-green-400" />
            </div>
            Target User
          </h2>
          <p className="text-gray-300">{roadmap.target_user}</p>
        </section>
        <section className="glass-card rounded-2xl p-6">
          <h2 className="flex items-center gap-3 text-lg font-semibold text-white mb-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-green-400" />
            </div>
            Unique Angle
          </h2>
          <p className="text-gray-300">{roadmap.unique_angle}</p>
        </section>
      </div>

      {/* Tech Stack */}
      <section className="glass-card rounded-2xl p-6">
        <h2 className="flex items-center gap-3 text-lg font-semibold text-white mb-4">
          <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
            <Code className="w-4 h-4 text-green-400" />
          </div>
          Tech Stack
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Frontend
            </span>
            <div className="mt-2">
              <TechBadge tech={roadmap.tech_stack.frontend} variant="primary" />
            </div>
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Backend
            </span>
            <div className="mt-2">
              <TechBadge tech={roadmap.tech_stack.backend} variant="secondary" />
            </div>
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Database
            </span>
            <div className="mt-2">
              <TechBadge tech={roadmap.tech_stack.database} />
            </div>
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Auth
            </span>
            <div className="mt-2">
              <TechBadge tech={roadmap.tech_stack.auth} />
            </div>
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Hosting
            </span>
            <div className="mt-2">
              <TechBadge tech={roadmap.tech_stack.hosting} />
            </div>
          </div>
          {roadmap.tech_stack.extras.length > 0 && (
            <div className="col-span-2 md:col-span-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Extras
              </span>
              <div className="mt-2">
                <TechBadgeList techs={roadmap.tech_stack.extras} />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Core Features Table */}
      <section className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Core Features
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feature
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Est. Hours
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {roadmap.core_features.map((feature, index) => (
                <tr key={index} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4">
                    <p className="font-medium text-white">
                      {feature.name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {feature.description}
                    </p>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-lg text-xs font-medium ${
                        priorityColors[feature.priority]
                      }`}
                    >
                      {priorityLabels[feature.priority]}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-sm font-medium text-gray-300">
                      {feature.est_hours}h
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Weekly Roadmap */}
      <section className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-6">
          Week-by-Week Roadmap
        </h2>
        <WeekTimeline weeks={roadmap.roadmap} />
      </section>

      {/* Difficulty Score */}
      <section className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Difficulty Score
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                roadmap.difficulty_score <= 3
                  ? 'bg-gradient-to-r from-green-500 to-green-400'
                  : roadmap.difficulty_score <= 6
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-400'
                    : 'bg-gradient-to-r from-red-500 to-red-400'
              }`}
              style={{ width: `${difficultyPercentage}%` }}
            />
          </div>
          <span className="text-2xl font-bold text-white min-w-[3rem] text-right">
            {roadmap.difficulty_score}/10
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          {roadmap.difficulty_score <= 3 && 'Beginner-friendly project'}
          {roadmap.difficulty_score > 3 &&
            roadmap.difficulty_score <= 6 &&
            'Moderate complexity — some experience helpful'}
          {roadmap.difficulty_score > 6 && 'Advanced project — significant experience recommended'}
        </p>
      </section>

      {/* Technical Risks */}
      {roadmap.technical_risks.length > 0 && (
        <section className="glass rounded-2xl p-6 border border-orange-500/30 bg-orange-500/5">
          <h2 className="flex items-center gap-3 text-lg font-semibold text-orange-300 mb-4">
            <AlertTriangle className="w-5 h-5" />
            Technical Risks
          </h2>
          <ul className="space-y-2">
            {roadmap.technical_risks.map((risk, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-orange-200/80"
              >
                <span className="text-orange-400 mt-1">•</span>
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Similar Products */}
      {roadmap.similar_products.length > 0 && (
        <section className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Similar Products to Study
          </h2>
          <div className="flex flex-wrap gap-2">
            {roadmap.similar_products.map((product, index) => (
              <span
                key={index}
                className="px-4 py-2 glass rounded-xl text-sm text-gray-300"
              >
                {product}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* First Thing to Build - CTA */}
      <section className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-green-600 to-green-500">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10" />
        <div className="relative flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">First Thing to Build</h2>
            <p className="text-green-100">{roadmap.first_thing_to_build}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
