'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getSharedRoadmap } from '@/lib/firebase/firestore';
import { RoadmapCard } from '@/components/generator/RoadmapCard';
import { ProjectRoadmap } from '@/types/idea';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function SharedRoadmapPage() {
  const params = useParams();
  const shareId = params.id as string;
  const [roadmap, setRoadmap] = useState<ProjectRoadmap | null>(null);
  const [ideaTitle, setIdeaTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getSharedRoadmap(shareId);
        if (data) {
          setRoadmap(data.roadmap);
          setIdeaTitle(data.ideaTitle);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080c] flex items-center justify-center">
        <div className="w-8 h-8 spinner" />
      </div>
    );
  }

  if (notFound || !roadmap) {
    return (
      <div className="min-h-screen bg-[#08080c] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Roadmap Not Found</h1>
          <p className="text-gray-400 mb-6">This shared roadmap doesn&apos;t exist or has been removed.</p>
          <Link
            href="/generate"
            className="glow-button px-6 py-3 rounded-xl text-white font-medium inline-flex items-center gap-2"
          >
            Generate Your Own
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080c] relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-600/10 rounded-full blur-[120px]" />
      </div>

      <header className="relative z-10 px-6 py-4 border-b border-white/5 bg-[#0a0a10]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">IdeaGen</span>
          </Link>
          <Link
            href="/generate"
            className="glow-button px-5 py-2.5 rounded-full font-medium text-sm flex items-center gap-2"
          >
            Generate Your Own
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <main className="relative z-10 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Shared Roadmap</span>
          </div>
          <RoadmapCard roadmap={roadmap} />
        </div>
      </main>
    </div>
  );
}
