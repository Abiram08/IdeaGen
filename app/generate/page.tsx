'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Domain, DOMAIN_OPTIONS, ExtractedIdea, RawContent } from '@/types/idea';
import { Sparkles, Loader2, Search, ChevronDown, ArrowLeft, Zap, Globe, MessageSquare, FileCode } from 'lucide-react';

const domainIcons: Record<Domain, string> = {
  health: '🏥',
  fintech: '💰',
  education: '📚',
  environment: '🌱',
  productivity: '⚡',
  social: '👥',
  gaming: '🎮',
  logistics: '📦',
};

export default function GeneratePage() {
  const router = useRouter();
  const [domain, setDomain] = useState<Domain>('productivity');
  const [interest, setInterest] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!domain || !interest.trim()) return;

    setIsLoading(true);
    setError('');
    setLoadingStage('Fetching content from sources...');

    try {
      const fetchResponse = await fetch('/api/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, interest: interest.trim() }),
      });

      if (!fetchResponse.ok) {
        const errorData = await fetchResponse.json();
        throw new Error(errorData.error || 'Failed to fetch content');
      }

      const fetchData: { content: RawContent[]; sources: Record<string, number> } = 
        await fetchResponse.json();

      if (fetchData.content.length === 0) {
        throw new Error('No content found. Try a different interest keyword.');
      }

      setLoadingStage('Extracting project ideas with AI...');

      const extractResponse = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, content: fetchData.content }),
      });

      if (!extractResponse.ok) {
        const errorData = await extractResponse.json();
        throw new Error(errorData.error || 'Failed to extract ideas');
      }

      const extractData: { ideas: ExtractedIdea[] } = await extractResponse.json();

      if (!extractData.ideas || extractData.ideas.length === 0) {
        throw new Error('No ideas could be extracted. Try different keywords.');
      }

      sessionStorage.setItem('generatedIdeas', JSON.stringify(extractData.ideas));
      sessionStorage.setItem('searchParams', JSON.stringify({ domain, interest }));
      
      router.push('/pick');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
      setLoadingStage('');
    }
  };

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
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-full glass text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Link>
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
              Tell us your domain and interest, we&apos;ll find trending project ideas
            </p>
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
                    disabled={isLoading}
                    className="w-full px-4 py-4 input-dark rounded-xl appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed pr-12"
                  >
                    {DOMAIN_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {domainIcons[option]} {option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
              </div>

              {/* Interest Input */}
              <div>
                <label 
                  htmlFor="interest" 
                  className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3"
                >
                  <MessageSquare className="w-4 h-4 text-green-400" />
                  Interest Keyword
                </label>
                <input
                  type="text"
                  id="interest"
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  placeholder="e.g., remote work, mental health, crypto"
                  disabled={isLoading}
                  className="w-full px-4 py-4 input-dark rounded-xl disabled:opacity-50"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Enter a topic or keyword you&apos;re interested in
                </p>
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
                disabled={isLoading || !interest.trim()}
                className="w-full glow-button flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 spinner" />
                    <span>{loadingStage}</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Find Project Ideas</span>
                  </>
                )}
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
                { name: 'Reddit', color: 'from-orange-500 to-red-500' },
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

          {/* Process Preview */}
          <div className="mt-12 grid grid-cols-3 gap-4">
            {[
              { icon: Globe, label: 'Fetch', active: isLoading && loadingStage.includes('Fetching') },
              { icon: Sparkles, label: 'Extract', active: isLoading && loadingStage.includes('Extracting') },
              { icon: FileCode, label: 'Ideas', active: false },
            ].map((step, index) => (
              <div
                key={index}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                  step.active ? 'glass pulse-glow' : 'opacity-40'
                }`}
              >
                <step.icon className={`w-6 h-6 ${step.active ? 'text-green-400' : 'text-gray-500'}`} />
                <span className={`text-xs ${step.active ? 'text-white' : 'text-gray-500'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
