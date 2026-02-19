import { RoadmapWeek } from '@/types/idea';

export function WeekTimeline({ weeks }: { weeks: RoadmapWeek[] }) {
  return (
    <div className="relative space-y-0">
      {weeks.map((week, i) => (
        <div key={i} className="relative flex gap-4">
          {/* Vertical line */}
          {i < weeks.length - 1 && (
            <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-[#07D160]/20" />
          )}

          {/* Week circle */}
          <div className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-[#07D160]/20 border border-[#07D160]/40 flex items-center justify-center">
            <span className="text-xs font-bold text-[#07D160]">{week.week}</span>
          </div>

          {/* Content */}
          <div className="pb-8 flex-1">
            <h4 className="text-sm font-semibold text-white">{week.milestone}</h4>
            <p className="text-xs text-[#07D160]/70 mt-0.5 mb-2">{week.deliverable}</p>
            <ul className="space-y-1">
              {week.tasks.map((task, j) => (
                <li key={j} className="text-xs text-zinc-400 flex items-start gap-1.5">
                  <span className="text-[#07D160] mt-0.5">•</span>
                  {task}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
