'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ExtractedIdea, IdeaState, Feature, Domain, SkillLevel } from '@/types/idea';
import { saveIdeaAsync, deleteIdeaAsync, getSavedIdeasAsync, getIdeaKey } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { UserMenu } from '@/components/auth/UserMenu';
import { IdeaPickCard } from '@/components/generator/IdeaPickCard';
import { Sparkles, ArrowLeft, Zap, Bookmark } from 'lucide-react';

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

export default function PickPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<ExtractedIdea[]>([]);
  const [bookmarkedKeys, setBookmarkedKeys] = useState<Set<string>>(new Set());
  const [domain, setDomain] = useState<Domain>('ai-ml');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('intermediate');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function load() {
      const saved = await getSavedIdeasAsync(user?.uid ?? null);
      setBookmarkedKeys(new Set(saved.map(s => getIdeaKey(s))));
    
    // Get domain and skillLevel from sessionStorage
    const storedDomain = sessionStorage.getItem('ideagenDomain') as Domain;
    const storedSkillLevel = sessionStorage.getItem('ideagenSkillLevel') as SkillLevel;
    if (storedDomain) setDomain(storedDomain);
    if (storedSkillLevel) setSkillLevel(storedSkillLevel);
    
    const storedIdeas = sessionStorage.getItem('generatedIdeas');
    
    if (storedIdeas) {
      try {
        const parsed = JSON.parse(storedIdeas);
        setIdeas(parsed);
      } catch {
        router.push('/generate');
      }
    } else {
      router.push('/generate');
    }
    
    setIsLoading(false);
    }
    load();
  }, [router, user]);

  const handleSelectIdea = (idea: ExtractedIdea) => {
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

  const handleToggleBookmark = async (idea: ExtractedIdea) => {
    const key = getIdeaKey(idea);
    if (bookmarkedKeys.has(key)) {
      const saved = await getSavedIdeasAsync(user?.uid ?? null);
      const toRemove = saved.find(s => getIdeaKey(s) === key);
      if (toRemove) {
        await deleteIdeaAsync(user?.uid ?? null, toRemove.id);
        setBookmarkedKeys(prev => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    } else {
      await saveIdeaAsync(user?.uid ?? null, idea, domain, skillLevel);
      setBookmarkedKeys(prev => new Set(prev).add(key));
    }
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
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/generate')}
              className="flex items-center gap-2 px-4 py-2 rounded-full glass text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">New Search</span>
            </button>
            <Link
              href="/saved"
              className="flex items-center gap-2 px-4 py-2 rounded-full glass text-gray-300 hover:text-green-400 transition-colors"
            >
              <Bookmark className="w-4 h-4" />
              <span className="text-sm">Saved</span>
            </Link>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-green-400 mb-6">
              <Zap className="w-4 h-4" />
              Step 2 of 4
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Pick your <span className="gradient-text">idea</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              We found {ideas.length} project ideas based on your domain. Choose one to explore further.
            </p>
          </div>

          {/* Ideas Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {ideas.map((idea, index) => (
              <IdeaPickCard
                key={index}
                idea={idea}
                index={index}
                onSelect={() => handleSelectIdea(idea)}
                onBookmark={() => handleToggleBookmark(idea)}
                isBookmarked={bookmarkedKeys.has(getIdeaKey(idea))}
              />
            ))}
          </div>

          {/* Empty State */}
          {ideas.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-gray-500" />
              </div>
              <p className="text-gray-400 mb-6">
                No ideas found. Try searching with different parameters.
              </p>
              <button
                onClick={() => router.push('/generate')}
                className="glow-button px-6 py-3 rounded-xl text-white font-medium"
              >
                Start New Search
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
