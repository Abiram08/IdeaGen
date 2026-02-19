'use client';

import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';

interface Idea {
  id: string;
  title: string;
  description?: string;
  problem?: string;
  concept?: string;
  tags?: string[];
  difficulty?: string;
  category?: string;
  rough_tech?: string[];
  target_user?: string;
  [key: string]: any;
}

interface DataSource {
  meta: {
    section: string;
    total_ideas: number;
    tags_legend?: Record<string, string>;
  };
  ideas: Idea[];
}

export function IdeaVault() {
  const [allIdeas, setAllIdeas] = useState<Array<Idea & { source: string }>>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<Array<Idea & { source: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState<'all' | 'students' | 'startups'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<(Idea & { source: string }) | null>(null);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [codecraftersRes, ycRes] = await Promise.all([
          fetch('/data/codecrafters_problems.json'),
          fetch('/data/yc_problems.json'),
        ]);

        const codecraftersData: DataSource = await codecraftersRes.json();
        const ycData: DataSource = await ycRes.json();

        const combined = [
          ...codecraftersData.ideas.map(idea => ({ ...idea, source: 'students' })),
          ...ycData.ideas.map(idea => ({ ...idea, source: 'startups' })),
        ];

        setAllIdeas(combined);

        // Extract all unique tags
        const tags = new Set<string>();
        combined.forEach(idea => {
          if (idea.tags && Array.isArray(idea.tags)) {
            idea.tags.forEach(tag => tags.add(tag));
          }
        });
        setAvailableTags(Array.from(tags).sort());

        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter ideas
  useEffect(() => {
    let filtered = [...allIdeas];

    // Filter by source
    if (selectedSource !== 'all') {
      filtered = filtered.filter(idea => idea.source === selectedSource);
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(idea =>
        idea.tags && Array.isArray(idea.tags) && selectedTags.some(tag => (idea.tags as string[]).includes(tag))
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(idea =>
        idea.title.toLowerCase().includes(query) ||
        (idea.description && idea.description.toLowerCase().includes(query)) ||
        (idea.concept && idea.concept.toLowerCase().includes(query)) ||
        idea.id.toLowerCase().includes(query)
      );
    }

    setFilteredIdeas(filtered);
  }, [allIdeas, selectedSource, selectedTags, searchQuery]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">
          <div className="w-8 h-8 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Loading ideas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="glass-card rounded-2xl p-6 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by title, description, or ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#0c0c14] border border-green-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 transition-colors"
          />
        </div>

        {/* Source Filter */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-wrap">
          <span className="text-gray-300 font-medium">Source:</span>
          <div className="flex gap-2 flex-wrap">
            {['all', 'students', 'startups'].map(source => (
              <button
                key={source}
                onClick={() => setSelectedSource(source as 'all' | 'students' | 'startups')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedSource === source
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                    : 'bg-[#0c0c14] text-gray-300 border border-gray-500/20 hover:border-green-500/30'
                }`}
              >
                {source === 'all' ? 'All Ideas' : source === 'students' ? 'Students' : 'Startups'}
              </button>
            ))}
          </div>
        </div>

        {/* Tags Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-300 font-medium">Filter by Tags:</span>
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="text-sm text-green-400 hover:text-green-300 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-green-500/30 text-green-300 border border-green-500/50'
                    : 'bg-[#0c0c14] text-gray-400 border border-gray-500/20 hover:border-green-500/30'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Summary */}
        <div className="pt-4 border-t border-gray-500/20">
          <p className="text-sm text-gray-400">
            Showing <span className="text-green-400 font-semibold">{filteredIdeas.length}</span> of{' '}
            <span className="text-green-400 font-semibold">{allIdeas.length}</span> ideas
          </p>
        </div>
      </div>

      {/* Ideas Grid */}
      {filteredIdeas.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-gray-400 mb-2">No ideas found matching your filters.</p>
            <p className="text-gray-500 text-sm">Try adjusting your search or filter criteria.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredIdeas.map(idea => (
            <div
              key={idea.id}
              onClick={() => setSelectedIdea(idea)}
              className="glass-card rounded-xl p-6 hover:border-green-500/30 transition-all hover:shadow-lg hover:shadow-green-500/10 cursor-pointer"
            >
              <div className="space-y-3">
                {/* Header with Source Badge */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{idea.title}</h3>
                    <p className="text-gray-400 line-clamp-2">{idea.description || idea.problem || idea.concept}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      idea.source === 'students'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    }`}
                  >
                    {idea.source === 'students' ? 'Students' : 'Startups'}
                  </span>
                </div>

                {/* ID and Metadata */}
                <div className="flex flex-wrap gap-2 items-center text-xs">
                  <span className="text-gray-500">ID: <span className="text-gray-400 font-mono">{idea.id}</span></span>
                  {idea.difficulty && (
                    <span className="text-gray-500">
                      Difficulty: <span className="text-gray-400 capitalize">{idea.difficulty}</span>
                    </span>
                  )}
                  {idea.category && (
                    <span className="text-gray-500">
                      Category: <span className="text-gray-400">{idea.category}</span>
                    </span>
                  )}
                </div>

                {/* Tech Stack Preview */}
                {idea.rough_tech && idea.rough_tech.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2">
                    {idea.rough_tech.slice(0, 3).map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded border border-yellow-500/30"
                      >
                        {tech}
                      </span>
                    ))}
                    {idea.rough_tech.length > 3 && (
                      <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded border border-yellow-500/30">
                        +{idea.rough_tech.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Tags */}
                {idea.tags && idea.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {idea.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 bg-green-500/10 text-green-400 text-xs rounded border border-green-500/30"
                      >
                        {tag}
                      </span>
                    ))}
                    {idea.tags.length > 3 && (
                      <span className="px-2.5 py-1 bg-green-500/10 text-green-400 text-xs rounded border border-green-500/30">
                        +{idea.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Click hint */}
                <p className="text-xs text-green-400/60 pt-2">Click to view details</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedIdea && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0c0c14] border border-green-500/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#0c0c14] border-b border-green-500/20 px-8 py-6 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-white">{selectedIdea.title}</h2>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      selectedIdea.source === 'students'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    }`}
                  >
                    {selectedIdea.source === 'students' ? 'Students' : 'Startups'}
                  </span>
                </div>
                <p className="text-gray-400">{selectedIdea.id}</p>
              </div>
              <button
                onClick={() => setSelectedIdea(null)}
                className="p-2 hover:bg-green-500/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-8 py-6 space-y-6">
              {/* Problem */}
              {selectedIdea.problem && (
                <div>
                  <h3 className="text-lg font-semibold text-green-400 mb-2">The Problem</h3>
                  <p className="text-gray-300 leading-relaxed">{selectedIdea.problem}</p>
                </div>
              )}

              {/* Concept/Solution */}
              {selectedIdea.concept && (
                <div>
                  <h3 className="text-lg font-semibold text-green-400 mb-2">The Concept</h3>
                  <p className="text-gray-300 leading-relaxed">{selectedIdea.concept}</p>
                </div>
              )}

              {/* Description */}
              {selectedIdea.description && (
                <div>
                  <h3 className="text-lg font-semibold text-green-400 mb-2">Description</h3>
                  <p className="text-gray-300 leading-relaxed">{selectedIdea.description}</p>
                </div>
              )}

              {/* Target User */}
              {selectedIdea.target_user && (
                <div>
                  <h3 className="text-lg font-semibold text-green-400 mb-2">Target User</h3>
                  <p className="text-gray-300">{selectedIdea.target_user}</p>
                </div>
              )}

              {/* Tech Stack */}
              {selectedIdea.rough_tech && selectedIdea.rough_tech.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-green-400 mb-3">Tech Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedIdea.rough_tech.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-yellow-500/15 text-yellow-300 rounded-lg border border-yellow-500/40 font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {selectedIdea.tags && selectedIdea.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-green-400 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedIdea.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 bg-green-500/15 text-green-300 rounded-lg border border-green-500/40 text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Metadata */}
              <div className="border-t border-gray-700 pt-6 grid grid-cols-2 gap-4">
                {selectedIdea.skill_level && (
                  <div>
                    <p className="text-gray-500 text-sm">Skill Level</p>
                    <p className="text-white font-medium capitalize">{selectedIdea.skill_level}</p>
                  </div>
                )}
                {selectedIdea.time_to_build && (
                  <div>
                    <p className="text-gray-500 text-sm">Time to Build</p>
                    <p className="text-white font-medium capitalize">{selectedIdea.time_to_build.replace(/_/g, ' ')}</p>
                  </div>
                )}
                {selectedIdea.domain && (
                  <div>
                    <p className="text-gray-500 text-sm">Domain</p>
                    <p className="text-white font-medium capitalize">{selectedIdea.domain}</p>
                  </div>
                )}
                {selectedIdea.wow_factor && (
                  <div>
                    <p className="text-gray-500 text-sm">Wow Factor</p>
                    <p className="text-white font-medium">⭐ {selectedIdea.wow_factor}/5</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
