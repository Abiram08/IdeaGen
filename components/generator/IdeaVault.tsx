'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';

interface Idea {
  id: string;
  title: string;
  description: string;
  tags?: string[];
  difficulty?: string;
  category?: string;
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
  const [selectedSource, setSelectedSource] = useState<'all' | 'codecrafters' | 'yc'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);

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
          ...codecraftersData.ideas.map(idea => ({ ...idea, source: 'codecrafters' })),
          ...ycData.ideas.map(idea => ({ ...idea, source: 'yc' })),
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
        idea.description.toLowerCase().includes(query) ||
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
            {['all', 'codecrafters', 'yc'].map(source => (
              <button
                key={source}
                onClick={() => setSelectedSource(source as 'all' | 'codecrafters' | 'yc')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedSource === source
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                    : 'bg-[#0c0c14] text-gray-300 border border-gray-500/20 hover:border-green-500/30'
                }`}
              >
                {source === 'all' ? 'All Ideas' : source === 'codecrafters' ? 'CodeCrafters' : 'Y Combinator'}
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
              className="glass-card rounded-xl p-6 hover:border-green-500/30 transition-all hover:shadow-lg hover:shadow-green-500/10"
            >
              <div className="space-y-3">
                {/* Header with Source Badge */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{idea.title}</h3>
                    <p className="text-gray-400 line-clamp-2">{idea.description}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      idea.source === 'codecrafters'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    }`}
                  >
                    {idea.source === 'codecrafters' ? 'CodeCrafters' : 'YC'}
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

                {/* Tags */}
                {idea.tags && idea.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {idea.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 bg-green-500/10 text-green-400 text-xs rounded border border-green-500/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
