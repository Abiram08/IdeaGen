'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SavedIdea, IdeaState, Feature } from '@/types/idea';
import { getSavedIdeasAsync, deleteIdeaAsync } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { UserMenu } from '@/components/auth/UserMenu';
import { Sparkles, ArrowLeft, Trash2, ExternalLink, Lightbulb, ArrowRight, Bookmark } from 'lucide-react';
import { TechBadge } from '@/components/generator/TechBadge';

function inferTechStack(roughTech: string[]): IdeaState['tech_stack'] {
  const techLower = roughTech.map(t => t.toLowerCase());
  
  let frontend = 'React';
  if (techLower.some(t => t.includes('vue'))) frontend = 'Vue';
  if (techLower.some(t => t.includes('angular'))) frontend = 'Angular';
  if (techLower.some(t => t.includes('svelte'))) frontend = 'Svelte';
  if (techLower.some(t => t.includes('next'))) frontend = 'Next.js';
  
  let backend = 'Node.js';
  if (techLower.some(t => t.includes('python') || t.includes('django') || t.includes('flask'))) backend = 'Python/FastAPI';
  if (techLower.some(t => t.includes('go') || t.includes('golang'))) backend = 'Go';
  if (techLower.some(t => t.includes('rust'))) backend = 'Rust';
  if (techLower.some(t => t.includes('java') || t.includes('spring'))) backend = 'Java/Spring';
  
  let database = 'PostgreSQL';
  if (techLower.some(t => t.includes('mongo'))) database = 'MongoDB';
  if (techLower.some(t => t.includes('mysql'))) database = 'MySQL';
  if (techLower.some(t => t.includes('redis'))) database = 'Redis';
  if (techLower.some(t => t.includes('firebase'))) database = 'Firebase';
  if (techLower.some(t => t.includes('supabase'))) database = 'Supabase';
  
  const extras: string[] = [];
  if (techLower.some(t => t.includes('docker'))) extras.push('Docker');
  if (techLower.some(t => t.includes('kubernetes') || t.includes('k8s'))) extras.push('Kubernetes');
  if (techLower.some(t => t.includes('graphql'))) extras.push('GraphQL');
  if (techLower.some(t => t.includes('websocket'))) extras.push('WebSockets');
  if (techLower.some(t => t.includes('ai') || t.includes('ml') || t.includes('openai'))) extras.push('AI/ML');
  
  return { frontend, backend, database, extra: extras };
}

function generateDefaultFeatures(): Feature[] {
  return [
    { name: 'User authentication', included: true },
    { name: 'Dashboard/Home view', included: true },
    { name: 'Data visualization', included: true },
    { name: 'API integration', included: true },
    { name: 'Responsive design', included: true },
  ];
}

const sourceBadgeColors: Record<string, string> = {
  reddit: 'from-orange-500 to-red-500',
  hackernews: 'from-orange-400 to-amber-500',
  devto: 'from-blue-500 to-indigo-500',
  devpost: 'from-teal-500 to-cyan-500',
  'ai-generated': 'from-purple-500 to-pink-500',
};

const sourceLabels: Record<string, string> = {
  reddit: 'Reddit',
  hackernews: 'Hacker News',
  devto: 'Dev.to',
  devpost: 'Devpost',
  'ai-generated': 'AI Generated',
};

export default function SavedPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<SavedIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function load() {
      const saved = await getSavedIdeasAsync(user?.uid ?? null);
      setIdeas(saved.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()));
      setIsLoading(false);
    }
    load();
  }, [user]);

  const handleRemove = async (id: string) => {
    await deleteIdeaAsync(user?.uid ?? null, id);
    setIdeas(prev => prev.filter(idea => idea.id !== id));
  };

  const handleSelectIdea = (idea: SavedIdea) => {
    const ideaState: IdeaState = {
      title: idea.title,
      problem: idea.problem,
      concept: idea.concept,
      tech_stack: inferTechStack(idea.rough_tech),
      features: idea.suggested_features?.length > 0
        ? idea.suggested_features.map(f => ({ name: f, included: true }))
        : generateDefaultFeatures(),
      scope: 'solo-2weeks',
      removed: [],
      added: [],
    };

    sessionStorage.setItem('selectedIdea', JSON.stringify(ideaState));
    const ideaId = encodeURIComponent(idea.title.toLowerCase().replace(/\s+/g, '-').slice(0, 30));
    router.push(`/brainstorm/${ideaId}`);
  };

  const formatDate = (savedAt: string) => {
    return new Date(savedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#08080c] flex items-center justify-center">
        <div className="w-8 h-8 spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080c] relative overflow-hidden">
      {/* Subtle green orbs */}
      <div className="orb orb-green w-[600px] h-[600px] top-[20%] -left-[200px] opacity-20" />
      <div className="orb orb-green-light w-[500px] h-[500px] bottom-[10%] -right-[150px] opacity-15" style={{ animationDelay: '-5s' }} />

      {/* Header */}
      <header className="relative z-10 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">IdeaGen</span>
          </Link>
          <button
            onClick={() => router.push('/generate')}
            className="flex items-center gap-2 px-4 py-2 rounded-full glass text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Generate New</span>
          </button>
          <UserMenu />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-green-400 mb-6">
              <Bookmark className="w-4 h-4" />
              Your Collection
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Saved <span className="gradient-text">Ideas</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {ideas.length > 0 
                ? `You have ${ideas.length} saved idea${ideas.length === 1 ? '' : 's'}. Click on any idea to continue developing it.`
                : 'No ideas saved yet. Start generating and bookmark your favorites!'
              }
            </p>
          </div>

          {/* Ideas Grid */}
          {ideas.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {ideas.map((idea, index) => (
                <div
                  key={idea.id}
                  className="fade-in-up glass-card rounded-2xl overflow-hidden flex flex-col"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Card Header */}
                  <div className="p-6 pb-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="text-xs text-gray-500">Saved {formatDate(idea.savedAt)}</span>
                      <button
                        onClick={() => handleRemove(idea.id)}
                        className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Remove from saved"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white line-clamp-2">{idea.title}</h3>
                      <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${sourceBadgeColors[idea.source_platform] || 'from-purple-500 to-pink-500'} text-white`}>
                        {sourceLabels[idea.source_platform] || idea.source_platform}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                        {idea.domain}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                        {idea.skillLevel}
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
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 pt-0 flex-1 flex flex-col">
                    {/* Problem */}
                    <div className="mb-4">
                      <span className="text-xs font-medium text-green-400 uppercase tracking-wider">Problem</span>
                      <p className="text-sm text-gray-300 mt-1 line-clamp-3">{idea.problem}</p>
                    </div>

                    {/* Concept */}
                    <div className="mb-4">
                      <span className="text-xs font-medium text-green-400 uppercase tracking-wider">Solution</span>
                      <p className="text-sm text-gray-300 mt-1 line-clamp-2">{idea.concept}</p>
                    </div>

                    {/* Tech Stack */}
                    <div className="mb-4">
                      <span className="text-xs font-medium text-green-400 uppercase tracking-wider mb-2 block">Tech Stack</span>
                      <div className="flex flex-wrap gap-1.5">
                        {idea.rough_tech.slice(0, 4).map((tech, i) => (
                          <TechBadge key={i} label={tech} />
                        ))}
                        {idea.rough_tech.length > 4 && (
                          <span className="badge px-2.5 py-1 rounded-full text-xs text-gray-400">
                            +{idea.rough_tech.length - 4}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Suggested Features */}
                    {idea.suggested_features?.length > 0 && (
                      <div className="mb-4">
                        <span className="text-xs font-medium text-green-400 uppercase tracking-wider mb-1.5 block">Features</span>
                        <ul className="space-y-1">
                          {idea.suggested_features.slice(0, 5).map((f, i) => (
                            <li key={i} className="text-xs text-zinc-400 flex items-center gap-1.5">
                              <span className="text-[#07D160]">+</span> {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Why Interesting */}
                    <div className="mt-auto mb-4">
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                        <Lightbulb className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
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
                          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-400 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View original ↗</span>
                        </a>
                      )}

                      <button
                        onClick={() => handleSelectIdea(idea)}
                        className="w-full glow-button flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-medium group"
                      >
                        <span>Continue with Idea</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center mx-auto mb-6">
                <Bookmark className="w-10 h-10 text-gray-500" />
              </div>
              <p className="text-gray-400 mb-6">
                You haven&apos;t saved any ideas yet.<br />
                Generate ideas and click the bookmark icon to save them.
              </p>
              <button
                onClick={() => router.push('/generate')}
                className="glow-button px-6 py-3 rounded-xl text-white font-medium"
              >
                Generate Ideas
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
