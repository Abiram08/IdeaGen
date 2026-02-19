'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Users, Clock, User, Loader2 } from 'lucide-react';
import { IdeaVaultIdea, UserProfile } from '@/types/idea';

interface RoadmapKanban {
  title: string;
  summary: string;
  tech_stack: string[];
  day: Array<{ title: string; items: string[] }>;
  week: Array<{ title: string; items: string[] }>;
  month: Array<{ title: string; items: string[] }>;
}

type ViewMode = 'day' | 'week' | 'month';

type PageState = 'loading' | 'form' | 'generating' | 'complete' | 'error';

export default function RoadmapCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ideaId = searchParams.get('ideaId');
  const source = searchParams.get('source');

  const [idea, setIdea] = useState<IdeaVaultIdea | null>(null);
  const [state, setState] = useState<PageState>('loading');
  const [error, setError] = useState('');
  const [roadmap, setRoadmap] = useState<RoadmapKanban | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [activeTask, setActiveTask] = useState<{
    columnTitle: string;
    task: string;
    memberIndex: number;
    view: ViewMode;
  } | null>(null);

  const [skillLevel, setSkillLevel] = useState<UserProfile['skill_level']>('intermediate');
  const [timeAvailable, setTimeAvailable] = useState<UserProfile['time_available']>('2 weeks');
  const [memberCount, setMemberCount] = useState(1);
  const [timeUnit, setTimeUnit] = useState<'days' | 'weeks' | 'months'>('weeks');
  const [timeValue, setTimeValue] = useState(2);

  const skillOptions: Array<UserProfile['skill_level']> = ['beginner', 'intermediate', 'advanced'];

  const isStartup = source === 'startups';
  const timeRanges: Record<'days' | 'weeks' | 'months', { min: number; max: number }> = {
    days: { min: 1, max: isStartup ? 30 : 30 },
    weeks: { min: 1, max: isStartup ? 12 : 8 },
    months: { min: 1, max: isStartup ? 12 : 6 },
  };

  const timeLabel = timeValue === 1 ? timeUnit.slice(0, -1) : timeUnit;

  const dataUrl = useMemo(() => {
    if (source === 'startups') return '/data/yc_problems.json';
    return '/data/codecrafters_problems.json';
  }, [source]);

  useEffect(() => {
    if (!ideaId) {
      setError('Missing idea id.');
      setState('error');
      return;
    }

    const loadIdea = async () => {
      try {
        const res = await fetch(dataUrl);
        const data = await res.json();
        const found = data.ideas?.find((item: IdeaVaultIdea) => item.id === ideaId) || null;

        if (!found) {
          setError('Idea not found.');
          setState('error');
          return;
        }

        setIdea(found);
        setState('form');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load idea.');
        setState('error');
      }
    };

    loadIdea();
  }, [ideaId, dataUrl]);

  useEffect(() => {
    const range = timeRanges[timeUnit];
    if (timeValue < range.min || timeValue > range.max) {
      setTimeValue(Math.min(Math.max(timeValue, range.min), range.max));
    }
    setTimeAvailable(`${timeValue} ${timeLabel}`);
  }, [timeUnit, timeValue, timeLabel]);

  const handleGenerate = async (event?: { preventDefault?: () => void }) => {
    event?.preventDefault?.();
    if (!idea) return;

    setState('generating');
    setError('');

    const userProfile: UserProfile = {
      skill_level: skillLevel,
      time_available: timeAvailable,
      team_size: memberCount === 1 ? 'solo' : `${memberCount} people`,
    };

    try {
      const response = await fetch('/api/roadmap-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: {
            ...idea,
            source,
          },
          userProfile,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate roadmap');
      }

      const data: { roadmap: RoadmapKanban } = await response.json();
      setRoadmap(data.roadmap);
      setState('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate roadmap');
      setState('error');
    }
  };

  const buildColumnsForView = () => {
    if (!roadmap) return [] as Array<{ title: string; items: string[] }>;

    const baseColumns = roadmap[viewMode] || [];
    const flatItems = baseColumns.flatMap((column) => column.items || []);

    const targetCount = (() => {
      if (viewMode === 'day' && timeUnit === 'days') return timeValue;
      if (viewMode === 'week' && timeUnit === 'weeks') return timeValue;
      if (viewMode === 'month' && timeUnit === 'months') return timeValue;
      return baseColumns.length || 1;
    })();

    const count = Math.max(1, Math.min(targetCount, 12));
    const unitLabel = viewMode === 'day' ? 'Day' : viewMode === 'week' ? 'Week' : 'Month';

    if (count === baseColumns.length) {
      return baseColumns.map((column, idx) => ({
        title: column.title || `${unitLabel} ${idx + 1}`,
        items: column.items || [],
      }));
    }

    const generated = Array.from({ length: count }, (_, idx) => ({
      title: `${unitLabel} ${idx + 1}`,
      items: [] as string[],
    }));

    flatItems.forEach((item, index) => {
      generated[index % count].items.push(item);
    });

    return generated;
  };

  const activeColumns = buildColumnsForView();
  const safeMemberCount = Math.max(1, Math.min(memberCount, 10));
  const taskTechStack = roadmap?.tech_stack.length ? roadmap.tech_stack : idea?.rough_tech || [];
  const fallbackTasks = [
    'Review work and share feedback',
    'QA checks and bug sweep',
    'Write quick notes or docs',
    'Pair with another member',
    'Check integration points',
    'Polish UI/UX details',
    'Prep demo or walkthrough',
    'Monitor progress and unblock',
    'Verify acceptance criteria',
    'Refactor or clean up code',
  ];

  const splitTasks = (items: string[], members: number, columnTitle: string) => {
    const buckets = Array.from({ length: members }, () => [] as string[]);
    items.forEach((item, index) => {
      buckets[index % members].push(item);
    });

    buckets.forEach((bucket, index) => {
      if (bucket.length === 0) {
        const fallback = fallbackTasks[index % fallbackTasks.length];
        bucket.push(`${fallback} (${columnTitle})`);
      }
    });

    return buckets;
  };

  const buildTaskDetails = (task: string, techStack: string[]) => {
    const stackHint = techStack.slice(0, 4).join(', ');
    return [
      `Focus: ${task}`,
      stackHint ? `Suggested stack: ${stackHint}` : 'Suggested stack: define tech choices first',
      'Output: a working change you can demo or test',
    ];
  };

  return (
    <div className="min-h-screen bg-[#08080c] relative overflow-hidden">
      <div className="orb orb-green w-[500px] h-[500px] -top-[200px] -left-[200px] opacity-20" />
      <div className="orb orb-green-light w-[400px] h-[400px] top-[50%] -right-[150px] opacity-15" style={{ animationDelay: '-5s' }} />

      <header className="relative z-10 px-6 py-5 border-b border-green-500/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/ideavault"
              className="p-2 hover:bg-green-500/10 rounded-lg transition-colors"
              title="Back to IdeaVault"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Roadmap Builder</span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 px-6 py-10">
        <div className="max-w-6xl mx-auto space-y-8">
          {state === 'loading' && (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
            </div>
          )}

          {state === 'error' && (
            <div className="glass-card rounded-2xl p-6 text-center">
              <p className="text-red-400 mb-4">{error || 'Something went wrong.'}</p>
              <button
                onClick={() => router.push('/ideavault')}
                className="px-4 py-2 bg-green-500/20 text-green-300 border border-green-500/50 rounded-lg"
              >
                Back to IdeaVault
              </button>
            </div>
          )}

          {idea && (state === 'form' || state === 'generating') && (
            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <p className="text-sm text-green-400 mb-2">Roadmap Builder</p>
                    <h1 className="text-3xl md:text-4xl font-bold text-white">{idea.title}</h1>
                    <p className="text-gray-400 mt-2 max-w-2xl">
                      {idea.problem || idea.description || idea.concept}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {idea.rough_tech?.slice(0, 6).map((tech, idx) => (
                      <span key={idx} className="px-3 py-1 bg-yellow-500/10 text-yellow-300 text-xs rounded border border-yellow-500/30">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
                <div className="glass-card rounded-2xl p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Project setup</h2>
                    <p className="text-sm text-gray-400">Pick a few quick details so the AI can tailor your roadmap.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 flex items-center gap-2 mb-2">
                        <User className="w-4 h-4" /> Experience level
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {skillOptions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setSkillLevel(option)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                              skillLevel === option
                                ? 'bg-green-500/20 text-green-300 border-green-500/50'
                                : 'bg-[#0c0c14] text-gray-300 border-gray-500/20 hover:border-green-500/30'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4" /> Time available
                      </label>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(['days', 'weeks', 'months'] as const).map((unit) => (
                          <button
                            key={unit}
                            type="button"
                            onClick={() => setTimeUnit(unit)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                              timeUnit === unit
                                ? 'bg-green-500/20 text-green-300 border-green-500/50'
                                : 'bg-[#0c0c14] text-gray-300 border-gray-500/20 hover:border-green-500/30'
                            }`}
                          >
                            {unit}
                          </button>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <input
                          type="range"
                          min={timeRanges[timeUnit].min}
                          max={timeRanges[timeUnit].max}
                          value={timeValue}
                          onChange={(event) => setTimeValue(Number(event.target.value))}
                          className="w-full accent-green-400"
                        />
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <span>{timeRanges[timeUnit].min}</span>
                          <span className="text-green-300 font-semibold">
                            {timeValue} {timeLabel}
                          </span>
                          <span>{timeRanges[timeUnit].max}</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {isStartup ? 'Startups support up to 12 months.' : 'Students can pick shorter timelines.'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4" /> Team members
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={memberCount}
                          onChange={(event) => setMemberCount(Math.max(1, Math.min(10, Number(event.target.value) || 1)))}
                          className="w-24 bg-[#0c0c14] border border-green-500/20 rounded-lg px-3 py-2 text-white"
                        />
                        <p className="text-sm text-gray-400">Enter team size (1-10)</p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={state === 'generating'}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500/20 text-green-300 border border-green-500/50 rounded-lg font-semibold hover:bg-green-500/30 transition-colors disabled:opacity-60"
                  >
                    {state === 'generating' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Generating roadmap...
                      </>
                    ) : (
                      'Generate Roadmap'
                    )}
                  </button>
                </div>

                <div className="glass-card rounded-2xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-white">Project snapshot</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between text-gray-400">
                      <span>Idea ID</span>
                      <span className="text-gray-200">{idea.id}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-400">
                      <span>Skill level</span>
                      <span className="text-gray-200 capitalize">{skillLevel}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-400">
                      <span>Time available</span>
                      <span className="text-gray-200">{timeAvailable}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-400">
                      <span>Team members</span>
                      <span className="text-gray-200">{memberCount}</span>
                    </div>
                  </div>
                  <div className="border-t border-gray-800 pt-4">
                    <p className="text-xs text-gray-500">Tip: adjust the inputs to get a roadmap tailored to your timeline.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {roadmap && state === 'complete' && (
            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{roadmap.title}</h2>
                    <p className="text-gray-400 max-w-2xl">{roadmap.summary}</p>
                  </div>
                  {roadmap.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {roadmap.tech_stack.slice(0, 6).map((tech, idx) => (
                        <span key={idx} className="px-3 py-1 bg-yellow-500/10 text-yellow-300 text-xs rounded border border-yellow-500/30">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="glass-card rounded-2xl p-4 flex flex-wrap items-center gap-3">
                <span className="text-sm text-gray-400">View:</span>
                {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                      viewMode === mode
                        ? 'bg-green-500/20 text-green-300 border-green-500/50'
                        : 'bg-[#0c0c14] text-gray-300 border-gray-500/20 hover:border-green-500/30'
                    }`}
                  >
                    {mode === 'day' ? 'Day-wise' : mode === 'week' ? 'Week-wise' : 'Month-wise'}
                  </button>
                ))}
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2">
                {activeColumns.map((column, idx) => (
                  <div key={idx} className="glass-card rounded-2xl p-4 min-w-[260px] max-w-[320px] w-full">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white">{column.title}</h3>
                      <span className="text-xs text-gray-500">{column.items.length} tasks</span>
                    </div>
                    <div className="space-y-3">
                      {splitTasks(column.items, safeMemberCount, column.title).map((items, memberIdx) => (
                        <div key={memberIdx} className="space-y-2">
                          <div className="text-xs uppercase tracking-wide text-green-400/70">
                            Member {memberIdx + 1}
                          </div>
                          {items.map((item, itemIdx) => (
                            <button
                              key={itemIdx}
                              type="button"
                              onClick={() => setActiveTask({
                                columnTitle: column.title,
                                task: item,
                                memberIndex: memberIdx,
                                view: viewMode,
                              })}
                              className="w-full text-left bg-[#0c0c14] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 hover:border-green-500/40 hover:bg-green-500/5 transition-colors"
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {activeTask && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0c0c14] border border-green-500/30 rounded-2xl max-w-xl w-full">
            <div className="px-6 py-5 border-b border-green-500/20 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-green-400 uppercase tracking-wide">{activeTask.view} plan</p>
                <h3 className="text-xl font-semibold text-white">{activeTask.columnTitle}</h3>
                <p className="text-sm text-gray-400">Member {activeTask.memberIndex + 1}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTask(null)}
                className="p-2 hover:bg-green-500/10 rounded-lg transition-colors"
              >
                <span className="text-gray-400">Close</span>
              </button>
            </div>
            <div className="px-6 py-5">
              <p className="text-gray-200 font-medium mb-4">{activeTask.task}</p>
              <div className="space-y-3">
                {buildTaskDetails(activeTask.task, taskTechStack).map((line, idx) => (
                  <div key={idx} className="bg-[#0c0c14] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-300">
                    {line}
                  </div>
                ))}
              </div>
              {taskTechStack.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Project tech stack</p>
                  <div className="flex flex-wrap gap-2">
                    {taskTechStack.map((tech, idx) => (
                      <span key={idx} className="px-3 py-1 bg-yellow-500/10 text-yellow-300 text-xs rounded border border-yellow-500/30">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
