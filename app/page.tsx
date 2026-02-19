import Link from 'next/link';
import { Sparkles, ArrowRight, Globe, Brain, Zap, Rocket, ChevronRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#08080c] relative overflow-hidden">
      {/* Subtle green gradient orbs */}
      <div className="orb orb-green w-[500px] h-[500px] -top-[200px] -left-[200px] opacity-20" />
      <div className="orb orb-green-light w-[400px] h-[400px] top-[50%] -right-[150px] opacity-15" style={{ animationDelay: '-5s' }} />

      {/* Header */}
      <header className="relative z-10 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">IdeaGen</span>
          </div>
          <Link
            href="/generate"
            className="glow-button px-5 py-2.5 rounded-full font-medium text-sm flex items-center gap-2"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-20 pb-32">
        <div className="max-w-5xl mx-auto text-center">
          <div className="fade-in-up">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-green-400 mb-8">
              <Zap className="w-4 h-4" />
              Powered by Claude & Grok AI
            </span>
          </div>
          
          <h1 className="fade-in-up fade-in-up-delay-1 text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-white">Your smart</span>
            <br />
            <span className="gradient-text-animated">idea generator</span>
          </h1>
          
          <p className="fade-in-up fade-in-up-delay-2 text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            More than brainstorming – a new way to discover and plan your next project
          </p>
          
          <div className="fade-in-up fade-in-up-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/generate"
              className="glow-button px-8 py-4 rounded-full font-semibold text-lg flex items-center gap-3 group"
            >
              Start Generating Ideas
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#how-it-works"
              className="green-button px-8 py-4 rounded-full font-medium flex items-center gap-2"
            >
              How it works
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Preview */}
      <section className="relative z-10 px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="glass-card rounded-3xl p-1 fade-in-up fade-in-up-delay-4">
            <div className="bg-[#0c0c14] rounded-[22px] p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    You think it, <span className="text-green-400">IdeaGen</span> helps make it happen
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    Discover trending project ideas from Reddit, Hacker News, Dev.to, and Devpost. 
                    Refine them with AI-powered brainstorming, then get a complete roadmap to build.
                  </p>
                </div>
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-64 h-64 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center pulse-glow">
                      <div className="w-48 h-48 rounded-xl glass flex items-center justify-center">
                        <Brain className="w-20 h-20 text-green-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative z-10 px-6 py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              What IdeaGen can do for you
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              A seamless four-step journey from inspiration to action
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Globe,
                step: '01',
                title: 'Fetch Content',
                description: 'We scan Reddit, Hacker News, Dev.to, and Devpost for trending topics in your domain.',
                color: 'from-green-500 to-green-600'
              },
              {
                icon: Brain,
                step: '02', 
                title: 'Extract Ideas',
                description: "Claude AI analyzes the content and extracts 3 distinct, buildable project ideas.",
                color: 'from-green-400 to-green-500'
              },
              {
                icon: Zap,
                step: '03',
                title: 'Brainstorm',
                description: 'Chat with Grok to refine your idea – adjust tech stack, features, and scope in real-time.',
                color: 'from-emerald-500 to-emerald-600'
              },
              {
                icon: Rocket,
                step: '04',
                title: 'Get Roadmap',
                description: 'Receive a complete project blueprint with timeline, tasks, and technical guidance.',
                color: 'from-teal-500 to-teal-600'
              }
            ].map((item, index) => (
              <div
                key={index}
                className="glass-card rounded-2xl p-6 group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-mono text-green-400 mb-2 block">Step {item.step}</span>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sources Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-3xl p-8 md:p-12 text-center">
            <h3 className="text-2xl font-bold text-white mb-6">
              Powered by the best sources
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {['Reddit', 'Hacker News', 'Dev.to', 'Devpost'].map((source, index) => (
                <div key={index} className="flex items-center gap-2 text-gray-300">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="font-medium">{source}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to discover your next
            <br />
            <span className="gradient-text">project idea?</span>
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
            Join developers who are finding inspiration and building amazing projects with IdeaGen.
          </p>
          <Link
            href="/generate"
            className="glow-button px-10 py-5 rounded-full font-semibold text-lg inline-flex items-center gap-3"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white">IdeaGen</span>
          </div>
          <p className="text-sm text-gray-500">
            Built with Next.js, Claude AI, and Grok
          </p>
        </div>
      </footer>
    </div>
  );
}
