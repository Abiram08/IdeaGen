'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ExtractedIdea, IdeaState, Feature } from '@/types/idea';
import { Sparkles, ArrowLeft, ArrowRight, Zap, ExternalLink, Lightbulb } from 'lucide-react';

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
};

const sourceLabels: Record<string, string> = {
  reddit: 'Reddit',
  hackernews: 'Hacker News',
  devto: 'Dev.to',
  devpost: 'Devpost',
};

export default function PickPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<ExtractedIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
  }, [router]);

  const handleSelectIdea = (idea: ExtractedIdea) => {
    const ideaState: IdeaState = {
      title: idea.title,
      problem: idea.problem,
      concept: idea.concept,
      tech_stack: inferTechStack(idea.rough_tech),
      features: generateDefaultFeatures(),
      scope: 'solo-2weeks',
      removed: [],
      added: [],
    };

    sessionStorage.setItem('selectedIdea', JSON.stringify(ideaState));
    const ideaId = encodeURIComponent(idea.title.toLowerCase().replace(/\s+/g, '-').slice(0, 30));
    router.push(`/brainstorm/${ideaId}`);
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
            <span className="text-sm">New Search</span>
          </button>
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
              We found {ideas.length} project ideas based on your interests. Choose one to explore further.
            </p>
          </div>

          {/* Ideas Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {ideas.map((idea, index) => (
              <div
                key={index}
                className="fade-in-up glass-card rounded-2xl overflow-hidden flex flex-col"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Card Header with gradient */}
                <div className="p-6 pb-0">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <h3 className="text-xl font-bold text-white line-clamp-2">{idea.title}</h3>
                    <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${sourceBadgeColors[idea.source_platform]} text-white`}>
                      {sourceLabels[idea.source_platform]}
                    </span>
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
                        <span key={i} className="badge px-2.5 py-1 rounded-full text-xs text-gray-300">
                          {tech}
                        </span>
                      ))}
                      {idea.rough_tech.length > 4 && (
                        <span className="badge px-2.5 py-1 rounded-full text-xs text-gray-400">
                          +{idea.rough_tech.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Why Interesting */}
                  <div className="mt-auto mb-4">
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                      <Lightbulb className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-green-200">{idea.why_interesting}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto pt-4 border-t border-white/5 space-y-3">
                    {idea.source_url && idea.source_url !== '#' && (
                      <a
                        href={idea.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-400 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>View source</span>
                      </a>
                    )}

                    <button
                      onClick={() => handleSelectIdea(idea)}
                      className="w-full glow-button flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-medium group"
                    >
                      <span>Explore This Idea</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
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
