'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IdeaState, UserProfile, ProjectRoadmap } from '@/types/idea';
import { RoadmapCard } from '@/components/generator/RoadmapCard';
import { Sparkles, ArrowLeft, User, Clock, Users, ChevronDown, Zap, Download, RotateCcw } from 'lucide-react';

type ProfileStep = 'form' | 'loading' | 'complete';

export default function RoadmapPage() {
  const router = useRouter();
  const [finalIdea, setFinalIdea] = useState<IdeaState | null>(null);
  const [roadmap, setRoadmap] = useState<ProjectRoadmap | null>(null);
  const [step, setStep] = useState<ProfileStep>('form');
  const [error, setError] = useState('');
  
  // User profile state
  const [skillLevel, setSkillLevel] = useState<UserProfile['skill_level']>('intermediate');
  const [timeAvailable, setTimeAvailable] = useState<UserProfile['time_available']>('2 weeks');
  const [teamSize, setTeamSize] = useState<UserProfile['team_size']>('solo');

  useEffect(() => {
    const storedIdea = sessionStorage.getItem('finalIdea');
    
    if (storedIdea) {
      try {
        const parsed = JSON.parse(storedIdea);
        setFinalIdea(parsed);
      } catch {
        router.push('/pick');
      }
    } else {
      router.push('/pick');
    }
  }, [router]);

  const handleGenerateRoadmap = async (e: FormEvent) => {
    e.preventDefault();
    if (!finalIdea) return;

    setStep('loading');
    setError('');

    const userProfile: UserProfile = {
      skill_level: skillLevel,
      time_available: timeAvailable,
      team_size: teamSize,
    };

    try {
      const response = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ finalIdea, userProfile }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate roadmap');
      }

      const data: { roadmap: ProjectRoadmap } = await response.json();
      setRoadmap(data.roadmap);
      setStep('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setStep('form');
    }
  };

  if (!finalIdea) {
    return (
      <div className="min-h-screen bg-[#08080c] flex items-center justify-center">
        <div className="w-8 h-8 spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#08080c]">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex-shrink-0 px-6 py-4 border-b border-white/5 bg-[#0a0a10]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">IdeaGen</span>
            </Link>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">/</span>
              <span className="flex items-center gap-2 px-3 py-1 rounded-full glass text-green-400 text-xs">
                <Zap className="w-3 h-3" />
                Step 4 of 4
              </span>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-full glass text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Brainstorm</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* User Profile Form */}
          {step === 'form' && (
            <div className="max-w-xl mx-auto animate-fadeInUp">
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  Almost There!
                </h1>
                <p className="text-gray-400">
                  Tell us about yourself so we can customize your roadmap.
                </p>
              </div>

              <div className="glass-card rounded-2xl p-6 mb-6">
                <h3 className="font-medium text-white mb-2 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                  Selected Idea
                </h3>
                <p className="text-white font-semibold text-lg">
                  {finalIdea.title}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {finalIdea.concept}
                </p>
              </div>

              <form onSubmit={handleGenerateRoadmap} className="space-y-5">
                {/* Skill Level */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <User className="w-4 h-4 text-green-400" />
                    Skill Level
                  </label>
                  <div className="relative">
                    <select
                      value={skillLevel}
                      onChange={(e) => setSkillLevel(e.target.value as UserProfile['skill_level'])}
                      className="input-dark w-full appearance-none cursor-pointer pr-10"
                    >
                      <option value="beginner">Beginner - Still learning fundamentals</option>
                      <option value="intermediate">Intermediate - Comfortable with basics</option>
                      <option value="advanced">Advanced - Experienced developer</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                {/* Time Available */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <Clock className="w-4 h-4 text-green-400" />
                    Time Available
                  </label>
                  <div className="relative">
                    <select
                      value={timeAvailable}
                      onChange={(e) => setTimeAvailable(e.target.value as UserProfile['time_available'])}
                      className="input-dark w-full appearance-none cursor-pointer pr-10"
                    >
                      <option value="1 day">1 day - Weekend sprint</option>
                      <option value="1 week">1 week - Short project</option>
                      <option value="2 weeks">2 weeks - Standard sprint</option>
                      <option value="1 month">1 month - Comprehensive build</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                {/* Team Size */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <Users className="w-4 h-4 text-green-400" />
                    Team Size
                  </label>
                  <div className="relative">
                    <select
                      value={teamSize}
                      onChange={(e) => setTeamSize(e.target.value as UserProfile['team_size'])}
                      className="input-dark w-full appearance-none cursor-pointer pr-10"
                    >
                      <option value="solo">Solo - Just me</option>
                      <option value="2 people">2 people - Pair project</option>
                      <option value="3-4 people">3-4 people - Small team</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 glass rounded-xl border border-red-500/30 bg-red-500/10">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full glow-button flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-white font-semibold"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Generate My Roadmap</span>
                </button>
              </form>
            </div>
          )}

          {/* Loading State */}
          {step === 'loading' && (
            <div className="text-center py-20 animate-fadeInUp">
              <div className="w-16 h-16 mx-auto mb-6 relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 animate-pulse" />
                <div className="absolute inset-2 rounded-xl bg-[#08080c] flex items-center justify-center">
                  <div className="w-6 h-6 spinner" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Building Your Roadmap
              </h2>
              <p className="text-gray-400">
                Claude is analyzing your idea and creating a detailed project plan...
              </p>
            </div>
          )}

          {/* Roadmap Display */}
          {step === 'complete' && roadmap && (
            <div className="animate-fadeInUp">
              <RoadmapCard roadmap={roadmap} />
            </div>
          )}
        </div>
      </main>

      {/* Footer Actions */}
      {step === 'complete' && (
        <footer className="relative z-10 flex-shrink-0 px-6 py-4 border-t border-white/5 bg-[#0a0a10]/80 backdrop-blur-xl">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button
              onClick={() => router.push('/generate')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full glass text-gray-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Generate New Ideas</span>
            </button>
            <button
              onClick={() => window.print()}
              className="glow-button flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium"
            >
              <Download className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
