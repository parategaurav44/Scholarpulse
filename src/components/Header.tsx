import React from 'react';
import { Sparkles, Layers, BookOpen, Search, Compass, BookmarkCheck, ArrowRight } from 'lucide-react';
import { PRESET_RESEARCH_IDEAS } from '../data/presets';
import { PresetResearchIdea } from '../types';

interface HeaderProps {
  activeTab: 'topics' | 'similarity' | 'matrix' | 'arxiv';
  onTabChange: (tab: 'topics' | 'similarity' | 'matrix' | 'arxiv') => void;
  onSelectPreset: (preset: PresetResearchIdea) => void;
  currentPresetId?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onSelectPreset,
  currentPresetId,
}) => {
  return (
    <header className="border-b border-stone-200 bg-white/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-stone-900 text-amber-300 flex items-center justify-center font-editorial text-2xl font-bold shadow-sm">
              Ψ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-stone-900 text-lg tracking-tight">ScholarPulse</span>
                <span className="text-xs text-stone-400 font-mono tracking-wider uppercase">v2.4 · Academic Intelligence</span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">
                Research Topic Formulation, Literature Similarity & Prior Art Mapping
              </p>
            </div>
          </div>

          {/* Navigation Tabs - Segmented Button Controls (allowed per design spec) */}
          <nav className="flex items-center p-1 bg-stone-100 rounded-lg border border-stone-200 text-xs font-medium">
            <button
              onClick={() => onTabChange('topics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'topics'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Topic & Gap Finder</span>
            </button>
            <button
              onClick={() => onTabChange('similarity')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'similarity'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Similarity & Prior Art</span>
            </button>
            <button
              onClick={() => onTabChange('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'matrix'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Literature Matrix</span>
            </button>
            <button
              onClick={() => onTabChange('arxiv')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'arxiv'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>ArXiv Live Explorer</span>
            </button>
          </nav>
        </div>

        {/* Preset Selector Sub-bar */}
        <div className="py-2 border-t border-stone-100 flex items-center justify-between text-xs overflow-x-auto gap-4">
          <div className="flex items-center gap-2 shrink-0 text-stone-500">
            <span className="font-medium text-stone-700">Sample Research Topics:</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {PRESET_RESEARCH_IDEAS.map(preset => {
              const isSelected = currentPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => onSelectPreset(preset)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors shrink-0 ${
                    isSelected
                      ? 'bg-amber-100 text-stone-900 font-medium border border-amber-300'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200'
                  }`}
                  title={preset.title}
                >
                  <span className="text-stone-400 mr-1.5 font-mono">[{preset.category.split(' ')[0]}]</span>
                  {preset.title.length > 34 ? `${preset.title.slice(0, 34)}...` : preset.title}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
