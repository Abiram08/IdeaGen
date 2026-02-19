import Link from 'next/link';
import { ArrowLeft, Library } from 'lucide-react';
import { IdeaVault } from '@/components/generator/IdeaVault';

export default function IdeaVaultPage() {
  return (
    <div className="min-h-screen bg-[#08080c] relative overflow-hidden">
      {/* Subtle green gradient orbs */}
      <div className="orb orb-green w-[500px] h-[500px] -top-[200px] -left-[200px] opacity-20" />
      <div className="orb orb-green-light w-[400px] h-[400px] top-[50%] -right-[150px] opacity-15" style={{ animationDelay: '-5s' }} />

      {/* Header with Navigation */}
      <header className="relative z-10 px-6 py-5 border-b border-green-500/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 hover:bg-green-500/10 rounded-lg transition-colors"
              title="Back to home"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <Library className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">IdeaVault</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              IdeaVault <span className="text-green-400">Library</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl">
              Explore curated ideas from CodeCrafters challenges and Y Combinator startups. Filter by category and tags to find inspiration.
            </p>
          </div>

          {/* IdeaVault Component */}
          <IdeaVault />
        </div>
      </main>
    </div>
  );
}
