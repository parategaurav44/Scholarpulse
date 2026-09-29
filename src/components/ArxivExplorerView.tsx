import React, { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  ArrowUpRight,
  Plus,
  Layers,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  FileText,
  AlertCircle
} from 'lucide-react';
import { ArxivPaper, TargetResearchWork } from '../types';
import { RESEARCH_DOMAINS } from '../data/presets';

interface ArxivExplorerViewProps {
  initialQuery?: string;
  initialCategory?: string;
  onSetAsTarget: (paper: ArxivPaper) => void;
  onAddToBenchmark: (paper: ArxivPaper) => void;
  candidateIds: Set<string>;
}

export const ArxivExplorerView: React.FC<ArxivExplorerViewProps> = ({
  initialQuery = 'mixture of experts routing',
  initialCategory = 'cs.LG',
  onSetAsTarget,
  onAddToBenchmark,
  candidateIds,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('relevance');
  const [maxResults, setMaxResults] = useState('12');
  const [isLoading, setIsLoading] = useState(false);
  const [papers, setPapers] = useState<ArxivPaper[]>([]);
  const [warning, setWarning] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async (overrideQ?: string) => {
    const q = overrideQ !== undefined ? overrideQ : query;
    setIsLoading(true);
    setWarning(null);

    try {
      const params = new URLSearchParams({
        query: q,
        category: category !== 'all' ? category : '',
        sortBy,
        maxResults,
      });

      const res = await fetch(`/api/arxiv/search?${params.toString()}`);
      if (!res.ok) {
        throw new Error('ArXiv search failed.');
      }

      const data = await res.json();
      setPapers(data.papers || []);
      if (data.warning) {
        setWarning(data.warning);
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setWarning('Network latency fetching live ArXiv feed. Showing fallback academic index.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPaper = (paper: ArxivPaper) => {
    onAddToBenchmark(paper);
    setAddedIds(prev => new Set(prev).add(paper.arxivId || paper.id));
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs">
        <div className="max-w-2xl mb-4">
          <h2 className="font-editorial text-2xl font-bold text-stone-900">
            ArXiv Live Literature Explorer
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Query preprints and peer-reviewed works directly via the official ArXiv metadata engine
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5">
            <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Search Terms / Author / Topic
            </label>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="e.g. contrastive learning, flash attention..."
                className="w-full text-xs border border-stone-300 rounded-lg pl-8 pr-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full text-xs border border-stone-300 rounded-lg px-2.5 py-2 bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {RESEARCH_DOMAINS.map(d => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full text-xs border border-stone-300 rounded-lg px-2.5 py-2 bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="relevance">Relevance</option>
              <option value="submittedDate">Submission Date</option>
              <option value="lastUpdatedDate">Last Updated</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              onClick={() => handleSearch()}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-amber-300 rounded-lg shadow-xs transition-all disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Search ArXiv</span>
            </button>
          </div>
        </div>

        {warning && (
          <div className="mt-3 flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{warning}</span>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-editorial text-2xl font-bold text-stone-900">
          Search Results ({papers.length})
        </h3>
        <span className="text-xs text-stone-500">
          Direct ArXiv Atom Feed Integration
        </span>
      </div>

      {/* Results List */}
      {isLoading ? (
        <div className="p-12 text-center bg-white border border-stone-200 rounded-xl">
          <Loader2 className="w-7 h-7 animate-spin mx-auto text-stone-400 mb-3" />
          <p className="text-sm font-medium text-stone-700">Fetching papers from ArXiv API...</p>
        </div>
      ) : papers.length === 0 ? (
        <div className="p-12 text-center bg-white border border-dashed border-stone-200 rounded-xl text-stone-500 text-sm">
          No papers found for this query. Try broadening your search terms or selecting &ldquo;All Disciplines&rdquo;.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {papers.map(paper => {
            const id = paper.arxivId || paper.id;
            const isAdded = candidateIds.has(id) || addedIds.has(id);
            const isExpanded = expandedId === id;

            return (
              <div
                key={id}
                className="bg-white border border-stone-200 rounded-xl p-5 hover:border-stone-300 transition-all shadow-xs"
              >
                {/* Quiet unboxed metadata */}
                <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-stone-700">arXiv:{id}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-stone-600">{paper.primaryCategory}</span>
                    <span aria-hidden="true">·</span>
                    <span>{paper.published?.slice(0, 10) || 'Recent'}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <a
                      href={paper.id.startsWith('http') ? paper.id : `https://arxiv.org/abs/${id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-stone-500 hover:text-stone-900 flex items-center gap-1 transition-colors"
                    >
                      <span>ArXiv Abstract</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                    {paper.pdfUrl && (
                      <a
                        href={paper.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-stone-700 hover:text-stone-950 font-medium flex items-center gap-1 transition-colors"
                      >
                        <span>PDF</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h4 className="font-editorial text-xl font-bold text-stone-950 leading-snug">
                  {paper.title}
                </h4>

                {/* Authors */}
                <div className="text-xs text-stone-600 mt-1">
                  {Array.isArray(paper.authors) ? paper.authors.join(', ') : paper.authors}
                </div>

                {/* Abstract Preview */}
                <div className="mt-2 text-xs text-stone-700 leading-relaxed font-sans">
                  <p className={isExpanded ? '' : 'line-clamp-2'}>
                    {paper.summary}
                  </p>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : id)}
                    className="text-stone-500 hover:text-stone-900 mt-1 font-medium inline-flex items-center gap-1"
                  >
                    {isExpanded ? (
                      <>
                        <span>Show less</span>
                        <ChevronUp className="w-3 h-3" />
                      </>
                    ) : (
                      <>
                        <span>Show full abstract</span>
                        <ChevronDown className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>

                {/* Card Action Controls */}
                <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => onSetAsTarget(paper)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors border border-stone-200"
                    title="Set this paper as the Target Work to analyze against other papers"
                  >
                    <FileText className="w-3.5 h-3.5 text-stone-600" />
                    <span>Set as Target Work</span>
                  </button>

                  <button
                    onClick={() => handleAddPaper(paper)}
                    disabled={isAdded}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
                      isAdded
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default'
                        : 'bg-stone-900 hover:bg-stone-800 text-amber-300 border-transparent shadow-xs'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>In Benchmark Pool</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Similarity Benchmark</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
