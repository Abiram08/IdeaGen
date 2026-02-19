'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Domain, DOMAIN_OPTIONS, DOMAIN_LABELS, ExtractedIdea, RawContent, SkillLevel, SKILL_LEVELS, SKILL_LEVEL_CONFIG, TechPreference, TECH_PREFERENCE_LABELS, TimelinePreference, ProjectType, PROJECT_TYPE_CONFIG } from '@/types/idea';
import { canGenerateAsync, incrementUsageAsync, getRemainingAsync } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { UserMenu } from '@/components/auth/UserMenu';
import { Sparkles, Search, ChevronDown, ArrowLeft, Zap, Globe, FileCode, GraduationCap, Bookmark, Crown, Code, Clock, Target } from 'lucide-react';

const MAX_GENERATIONS = 3;

const domainIcons: Record<Domain, string> = {
  'ai-ml': '🤖',
  'saas': '☁️',
  'fintech': '💰',
  'healthtech': '🏥',
  'edtech': '📚',
  'gaming': '🎮',
  'social-impact': '🌍',
  'ecommerce': '🛒',
  'iot': '📡',
  'devtools': '🔧',
};

export default function GeneratePage() {
  const router = useRouter();
  const [domain, setDomain] = useState<Domain>('ai-ml');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('intermediate');
  const [techPreference, setTechPreference] = useState<TechPreference>('no-preference');
  const [timeline, setTimeline] = useState<TimelinePreference>('2 weeks');
  const [projectType, setProjectType] = useState<ProjectType>('hackathon');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<'fetching' | 'extracting' | 'generating' | 'merging' | ''>('');
  const [error, setError] = useState('');
  const [remaining, setRemaining] = useState<number>(MAX_GENERATIONS);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    getRemainingAsync(user?.uid ?? null).then(setRemaining);
  }, [user]);

  const sourceIndicators = [
    { label: "Hacker News", icon: "🟠", delay: "0ms" },
    { label: "Dev.to", icon: "🟣", delay: "300ms" },
    { label: "Devpost", icon: "🔵", delay: "600ms" },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!domain) return;

    // Auth gate — must be signed in to generate
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // Check usage limit
    const allowed = await canGenerateAsync(user.uid);
    if (!allowed) {
      setShowUpgradeModal(true);
      return;
    }

    setIsLoading(true);
    setError('');
    setLoadingStage('fetching');

    try {
      const fetchResponse = await fetch('/api/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });

      if (!fetchResponse.ok) {
        const errorData = await fetchResponse.json();
        throw new Error(errorData.error || 'Failed to fetch content');
      }

      const fetchData: { content: RawContent[]; sources: string[]; errors: string[] } =
        await fetchResponse.json();

      if (fetchData.content.length === 0) {
        throw new Error('No content found. Try a different domain.');
      }

      setLoadingStage('extracting');

      const extractResponse = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, skillLevel, techPreference, timeline, projectType, content: fetchData.content }),
      });

      if (!extractResponse.ok) {
        const errorData = await extractResponse.json();
        throw new Error(errorData.error || 'Failed to extract ideas');
      }

      const extractData: { ideas: ExtractedIdea[] } = await extractResponse.json();

      if (!extractData.ideas || extractData.ideas.length === 0) {
        throw new Error('No ideas could be extracted. Try a different domain.');
      }

      // Track usage after successful generation
      await incrementUsageAsync(user.uid);
      const r = await getRemainingAsync(user.uid);
      setRemaining(r);

      sessionStorage.setItem('generatedIdeas', JSON.stringify(extractData.ideas));
      sessionStorage.setItem('ideagenDomain', domain);
      sessionStorage.setItem('ideagenSkillLevel', skillLevel);
      sessionStorage.setItem('ideagenProjectType', projectType);
      sessionStorage.setItem('searchParams', JSON.stringify({ domain, skillLevel }));
      
      router.push('/pick');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
      setLoadingStage('');
    }
  };

  // Loading State UI
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#08080c] relative overflow-hidden flex items-center justify-center">
        {/* Subtle green orbs */}
        <div className="orb orb-green w-[500px] h-[500px] -top-[150px] -right-[150px] opacity-20" />
        <div className="orb orb-green-light w-[400px] h-[400px] bottom-[10%] -left-[100px] opacity-15" />
        
        <div className="flex flex-col items-center gap-6 text-center z-10">
          <div className="text-5xl animate-pulse">⚡</div>
          <p className="text-[#07D160] font-mono text-lg font-semibold">
            {loadingStage === 'fetching' && 'Scanning sources...'}
            {loadingStage === 'extracting' && 'Analyzing & generating ideas...'}
          </p>
          
          {loadingStage === 'fetching' && (
            <div className="space-y-3 text-sm font-mono">
              {sourceIndicators.map((s) => (
                <div 
                  key={s.label}
                  className="flex items-center gap-3 text-zinc-400 animate-pulse"
                  style={{ animationDelay: s.delay }}
                >
                  <span className="text-lg">{s.icon}</span>
                  <span className="w-28 text-left">{s.label}</span>
                  <span className="text-[#07D160]">scanning...</span>
                </div>
              ))}
            </div>
          )}

          {loadingStage === 'extracting' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 spinner" />
              <div className="space-y-2 text-sm font-mono">
                <p className="text-zinc-400 animate-pulse">✨ Gemini analyzing community content...</p>
                <p className="text-zinc-400 animate-pulse" style={{ animationDelay: '500ms' }}>🤖 Groq generating creative ideas...</p>
                <p className="text-zinc-400 animate-pulse" style={{ animationDelay: '1000ms' }}>🔀 Combining best ideas from both...</p>
              </div>
            </div>
          )}

          <p className="text-zinc-500 text-xs mt-4 max-w-sm">
            Scoring real community posts + generating creative AI ideas
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080c] relative overflow-hidden">
      {/* Subtle green orbs */}
      <div className="orb orb-green w-[500px] h-[500px] -top-[150px] -right-[150px] opacity-20" />
      <div className="orb orb-green-light w-[400px] h-[400px] bottom-[10%] -left-[100px] opacity-15" style={{ animationDelay: '-7s' }} />

      {/* Header */}
      <header className="relative z-10 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">IdeaGen</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/saved"
              className="flex items-center gap-2 px-4 py-2 rounded-full glass text-gray-300 hover:text-white transition-colors"
            >
              <Bookmark className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Saved</span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-full glass text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </Link>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center px-6 py-12 min-h-[calc(100vh-88px)]">
        <div className="w-full max-w-xl fade-in-up">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-green-400 mb-6">
              <Zap className="w-4 h-4" />
              Step 1 of 4
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Generate <span className="gradient-text">Ideas</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Pick a domain and project type — we&apos;ll find trending project ideas
            </p>
            
            {/* Usage Counter */}
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <span className="text-xs text-gray-400">
                {remaining === Infinity ? (
                  <span className="flex items-center gap-1 text-green-400">
                    <Crown className="w-3 h-3" /> Premium — Unlimited
                  </span>
                ) : (
                  <>
                    <span className={remaining <= 1 ? 'text-amber-400' : 'text-green-400'}>{remaining}</span>
                    <span className="text-gray-500"> / {MAX_GENERATIONS} total generations</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Form Card */}
          <div className="glass-card rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Domain Select */}
              <div>
                <label 
                  htmlFor="domain" 
                  className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3"
                >
                  <Globe className="w-4 h-4 text-green-400" />
                  Domain
                </label>
                <div className="relative">
                  <select
                    id="domain"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value as Domain)}
                    className="w-full px-4 py-4 input-dark rounded-xl appearance-none cursor-pointer pr-12"
                  >
                    {DOMAIN_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {domainIcons[option]} {DOMAIN_LABELS[option]}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
              </div>

              {/* Skill Level Select */}
              <div>
                <label 
                  htmlFor="skillLevel" 
                  className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3"
                >
                  <GraduationCap className="w-4 h-4 text-green-400" />
                  Skill Level
                </label>
                <div className="relative">
                  <select
                    id="skillLevel"
                    value={skillLevel}
                    onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}
                    className="w-full px-4 py-4 input-dark rounded-xl appearance-none cursor-pointer pr-12"
                  >
                    {SKILL_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {SKILL_LEVEL_CONFIG[level].icon} {SKILL_LEVEL_CONFIG[level].label} — {SKILL_LEVEL_CONFIG[level].description}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
              </div>

              {/* Tech Preference */}
              <div>
                <label
                  className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3"
                >
                  <Code className="w-4 h-4 text-green-400" />
                  Tech Stack
                  <span className="text-xs text-gray-500 font-normal ml-1">Ideas built around this stack</span>
                </label>
                <div className="relative">
                  <select
                    value={techPreference}
                    onChange={(e) => setTechPreference(e.target.value as TechPreference)}
                    className="w-full px-4 py-4 input-dark rounded-xl appearance-none cursor-pointer pr-12"
                  >
                    {(Object.keys(TECH_PREFERENCE_LABELS) as TechPreference[]).map((key) => (
                      <option key={key} value={key}>
                        {TECH_PREFERENCE_LABELS[key]}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
              </div>

              {/* Timeline */}
              <div>
                <label
                  className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3"
                >
                  <Clock className="w-4 h-4 text-green-400" />
                  Time to Build
                  <span className="text-xs text-gray-500 font-normal ml-1">Ideas scoped to fit this timeline</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { value: '1 week' as TimelinePreference, label: '1 Week', sub: 'Quick Hack' },
                    { value: '2 weeks' as TimelinePreference, label: '2 Weeks', sub: 'Solid MVP' },
                    { value: '1 month' as TimelinePreference, label: '1 Month', sub: 'Full Product' },
                    { value: '3 months' as TimelinePreference, label: '3 Months', sub: 'Serious Build' },
                  ]).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTimeline(opt.value)}
                      className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border transition-all ${
                        timeline === opt.value
                          ? 'border-[#07D160] text-[#07D160] bg-[#07D160]/5'
                          : 'border-zinc-800 text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      <span className="text-sm font-semibold">{opt.label}</span>
                      <span className="text-xs opacity-70">{opt.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Project Type */}
              <div>
                <label
                  className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3"
                >
                  <Target className="w-4 h-4 text-green-400" />
                  Project Type
                  <span className="text-xs text-gray-500 font-normal ml-1">What are you building for?</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(Object.keys(PROJECT_TYPE_CONFIG) as ProjectType[]).map((type) => {
                    const config = PROJECT_TYPE_CONFIG[type];
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setProjectType(type)}
                        className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border transition-all ${
                          projectType === type
                            ? 'border-[#07D160] text-[#07D160] bg-[#07D160]/5'
                            : 'border-zinc-800 text-zinc-400 hover:border-zinc-600'
                        }`}
                      >
                        <span className="text-lg">{config.icon}</span>
                        <span className="text-xs font-semibold">{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full glow-button flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-white font-semibold"
              >
                <Search className="w-5 h-5" />
                <span>Find Project Ideas</span>
              </button>
            </form>
          </div>

          {/* Source Info */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 mb-4">
              We search across these platforms:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                { name: 'Hacker News', color: 'from-orange-400 to-amber-500' },
                { name: 'Dev.to', color: 'from-blue-500 to-indigo-500' },
                { name: 'Devpost', color: 'from-teal-500 to-cyan-500' },
              ].map((source, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-gray-400"
                >
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${source.color}`} />
                  {source.name}
                </div>
              ))}
            </div>
          </div>

          {/* Process Steps Preview */}
          <div className="mt-12 grid grid-cols-3 gap-4">
            {[
              { icon: Globe, label: 'Fetch', desc: 'Scan 3 sources' },
              { icon: Sparkles, label: 'Extract', desc: 'AI analysis' },
              { icon: FileCode, label: 'Ideas', desc: '3 unique ideas' },
            ].map((step, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-2 p-4 rounded-xl glass opacity-60"
              >
                <step.icon className="w-6 h-6 text-gray-500" />
                <span className="text-xs text-white">{step.label}</span>
                <span className="text-xs text-gray-500">{step.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-8 max-w-md w-full animate-fadeInUp">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-6">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Generation Limit Reached
              </h2>
              <p className="text-gray-400 mb-6">
                You&apos;ve used all {MAX_GENERATIONS} total generations. 
                Upgrade to Premium for unlimited ideas!
              </p>
              
              <div className="glass rounded-xl p-4 mb-6 text-left">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  Premium Benefits
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span> Unlimited idea generations
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span> Detailed project blueprints
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span> Priority AI processing
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span> Export to Notion/GitHub
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    // TODO: Implement payment flow
                    alert('Payment integration coming soon!');
                  }}
                  className="w-full glow-button flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-white font-semibold"
                >
                  <Crown className="w-5 h-5" />
                  Upgrade to Premium — $9/month
                </button>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-full px-6 py-3 rounded-xl glass text-gray-400 hover:text-white transition-colors"
                >
                  Maybe Later
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                This is a lifetime limit per account
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
