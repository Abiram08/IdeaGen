'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { IdeaState, ProjectScope } from '@/types/idea';
import { BrainstormChat } from '@/components/generator/BrainstormChat';
import { LiveIdeaPanel } from '@/components/generator/LiveIdeaPanel';
import { Sparkles, ArrowLeft, ArrowRight, RotateCcw, Zap } from 'lucide-react';

export default function BrainstormPage() {
  const router = useRouter();
  const params = useParams();
  const [ideaState, setIdeaState] = useState<IdeaState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedIdea = sessionStorage.getItem('selectedIdea');
    
    if (storedIdea) {
      try {
        const parsed = JSON.parse(storedIdea);
        setIdeaState(parsed);
      } catch {
        router.push('/pick');
      }
    } else {
      router.push('/pick');
    }
    
    setIsLoading(false);
  }, [router]);

  const handleIdeaUpdate = (newState: IdeaState) => {
    setIdeaState(newState);
    sessionStorage.setItem('selectedIdea', JSON.stringify(newState));
  };

  const handleFeatureToggle = (index: number) => {
    if (!ideaState) return;
    
    const newFeatures = [...ideaState.features];
    newFeatures[index] = {
      ...newFeatures[index],
      included: !newFeatures[index].included,
    };
    
    const featureName = newFeatures[index].name;
    const newRemoved = newFeatures[index].included
      ? ideaState.removed.filter(f => f !== featureName)
      : [...ideaState.removed, featureName];
    
    handleIdeaUpdate({
      ...ideaState,
      features: newFeatures,
      removed: newRemoved,
    });
  };

  const handleScopeChange = (scope: ProjectScope) => {
    if (!ideaState) return;
    handleIdeaUpdate({ ...ideaState, scope });
  };

  const handleProceedToRoadmap = () => {
    if (!ideaState) return;
    sessionStorage.setItem('finalIdea', JSON.stringify(ideaState));
    const ideaId = params.id as string;
    router.push(`/roadmap/${ideaId}`);
  };

  const handleStartOver = () => {
    router.push('/pick');
  };

  if (isLoading || !ideaState) {
    return (
      <div className="min-h-screen bg-[#08080c] flex items-center justify-center">
        <div className="w-8 h-8 spinner" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#08080c]">
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-4 border-b border-white/5 bg-[#0a0a10]">
        <div className="max-w-full flex items-center justify-between">
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
                Step 3 of 4
              </span>
            </div>
          </div>
          <button
            onClick={() => router.push('/pick')}
            className="flex items-center gap-2 px-4 py-2 rounded-full glass text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Ideas</span>
          </button>
        </div>
      </header>

      {/* Main Content - Two Panel Layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel - Chat (60%) */}
        <div className="w-3/5 border-r border-white/5 p-4 overflow-hidden flex flex-col">
          <BrainstormChat
            ideaState={ideaState}
            onIdeaUpdate={handleIdeaUpdate}
          />
        </div>

        {/* Right Panel - Live Idea (40%) */}
        <div className="w-2/5 p-4 overflow-hidden flex flex-col bg-[#0c0c12]">
          <LiveIdeaPanel
            ideaState={ideaState}
            onFeatureToggle={handleFeatureToggle}
            onScopeChange={handleScopeChange}
          />
        </div>
      </main>

      {/* Bottom Bar */}
      <footer className="flex-shrink-0 px-6 py-4 border-t border-white/5 bg-[#0a0a10]">
        <div className="flex items-center justify-between">
          <button
            onClick={handleStartOver}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full glass text-gray-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Start Over</span>
          </button>

          <button
            onClick={handleProceedToRoadmap}
            className="glow-button flex items-center gap-3 px-6 py-3 rounded-full text-white font-medium group"
          >
            <span>I&apos;m Happy — Build The Roadmap</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </footer>
    </div>
  );
}
