'use client';

import { RoadmapWeek } from '@/types/idea';
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react';

interface WeekTimelineProps {
  weeks: RoadmapWeek[];
}

export function WeekTimeline({ weeks }: WeekTimelineProps) {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500 to-green-600 opacity-30" />

      {/* Weeks */}
      <div className="space-y-6">
        {weeks.map((week, index) => (
          <div key={week.week} className="relative pl-12">
            {/* Timeline dot */}
            <div
              className={`absolute left-2 top-1 w-5 h-5 rounded-lg flex items-center justify-center ${
                index === 0
                  ? 'bg-gradient-to-br from-green-500 to-green-600 text-white'
                  : 'glass border border-white/20'
              }`}
            >
              {index === 0 ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : (
                <Circle className="w-2 h-2 text-gray-500" />
              )}
            </div>

            {/* Week content */}
            <div className="glass rounded-xl p-4 hover:bg-white/5 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-green-400 uppercase tracking-wider">
                  Week {week.week}
                </span>
                <span className="text-xs text-gray-500">
                  {week.tasks.length} tasks
                </span>
              </div>

              <h4 className="font-semibold text-white mb-3">
                {week.milestone}
              </h4>

              {/* Tasks */}
              <ul className="space-y-2 mb-4">
                {week.tasks.map((task, taskIndex) => (
                  <li
                    key={taskIndex}
                    className="flex items-start gap-2 text-sm text-gray-400"
                  >
                    <ChevronRight className="w-4 h-4 text-green-500/50 flex-shrink-0 mt-0.5" />
                    <span>{task}</span>
                  </li>
                ))}
              </ul>

              {/* Deliverable */}
              <div className="pt-3 border-t border-white/10">
                <span className="text-xs font-medium text-gray-500">
                  Deliverable:
                </span>
                <p className="text-sm text-gray-300 mt-1">
                  {week.deliverable}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
