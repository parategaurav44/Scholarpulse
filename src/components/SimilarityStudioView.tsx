import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  Search,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  Trash2,
  Plus,
  BookOpen,
  ArrowUpRight
} from 'lucide-react';
import { TargetResearchWork, ArxivPaper, SimilarityAnalysisResult, PaperSimilarityDetail } from '../types';
import { SemanticMap } from './SemanticMap';
import { PaperExtractModal } from './PaperExtractModal';

interface SimilarityStudioViewProps {
  targetWork: TargetResearchWork;
  setTargetWork: React.Dispatch<React.SetStateAction<TargetResearchWork>>;
  candidatePapers: ArxivPaper[];
  setCandidatePapers: React.Dispatch<React.SetStateAction<ArxivPaper[]>>;
  analysisResult: SimilarityAnalysisResult | null;
  setAnalysisResult: React.Dispatch<React.SetStateAction<SimilarityAnalysisResult | null>>;
  onSearchMorePapers: (query: string) => void;
  onSynthesizeMatrix: () => void;
}

export const SimilarityStudioView: React.FC<SimilarityStudioViewProps> = ({
  targetWork,
  setTargetWork,
  candidatePapers,
  setCandidatePapers,
  analysisResult,
  setAnalysisResult,
  onSearchMorePapers,
  onSynthesizeMatrix,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExtractModalOpen, setIsExtractModalOpen] = useState(false);
  const [expandedPaperId, setExpandedPaperId] = useState<string | null>(null);
  const [quickArxivQuery, setQuickArxivQuery] = useState('');
  const [isFetchingArxiv, setIsFetchingArxiv] = useState(false);

  const handleFetchRelevantArxiv = async () => {
    setIsFetchingArxiv(true);
    try {
      const q = quickArxivQuery || targetWork.keywords?.join(' ') || targetWork.title;
      const res = await fetch(`/api/arxiv/search?query=${encodeURIComponent(q)}&maxResults=6`);
      if (res.ok) {
        const data = await res.json();
        if (data.papers && data.papers.length > 0) {
          // Merge unique papers
          const existingIds = new Set(candidatePapers.map(p => p.arxivId || p.id));
          const newPapers = data.papers.filter((p: ArxivPaper) => !existingIds.has(p.arxivId || p.id));
          setCandidatePapers(prev => [...prev, ...newPapers].slice(0, 8));
        }
      }
    } catch (err) {
      console.error('Error fetching arXiv candidates:', err);
    } finally {
      setIsFetchingArxiv(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!targetWork.title.trim() || !targetWork.abstract.trim()) {
      alert('Please provide a paper title and abstract first.');
      return;
    }

    if (candidatePapers.length === 0) {
      alert('Please add at least one candidate paper to compare against.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/similarity/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetWork,
          candidatePapers,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Similarity analysis failed.');
      }

      const data = await res.json();
      setAnalysisResult(data);
    } catch (err: any) {
      console.error('Similarity analysis failed:', err);
      alert(`Analysis error: ${err?.message || 'Could not complete analysis.'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const removeCandidatePaper = (paperId: string) => {
    setCandidatePapers(prev => prev.filter(p => (p.arxivId || p.id) !== paperId));
  };

  const getRiskBadgeStyle = (risk: string) => {
    switch (risk) {
      case 'High Overlap':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'Moderate Overlap':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Low Overlap':
        return 'text-sky-700 bg-sky-50 border-sky-200';
      default:
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Split View: Target Idea Configuration + Candidate Corpus */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Target Research Work */}
        <div className="lg:col-span-6 bg-white border border-stone-200 rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-editorial text-2xl font-bold text-stone-900">
                Target Research Work
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                The hypothesis, paper draft, or proposal you want to analyze
              </p>
            </div>
            <button
              onClick={() => setIsExtractModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors border border-stone-200"
            >
              <FileText className="w-3.5 h-3.5 text-stone-600" />
              <span>Paste Raw Draft</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Working Paper Title
              </label>
              <input
                type="text"
                value={targetWork.title}
                onChange={e => setTargetWork(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Adaptive Entropy-Regularized Router for Sparse Mixture-of-Experts"
                className="w-full text-sm font-medium border border-stone-300 rounded-lg px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Abstract / Research Proposal
              </label>
              <textarea
                value={targetWork.abstract}
                onChange={e => setTargetWork(prev => ({ ...prev, abstract: e.target.value }))}
                rows={5}
                placeholder="Describe the primary problem formulation, proposed algorithm or architecture, and empirical findings..."
                className="w-full text-sm border border-stone-300 rounded-lg p-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Methodological Nuances (Optional)
              </label>
              <input
                type="text"
                value={targetWork.methodology || ''}
                onChange={e => setTargetWork(prev => ({ ...prev, methodology: e.target.value }))}
                placeholder="Specific loss formulations, hardware kernels, or baseline comparisons..."
                className="w-full text-xs border border-stone-300 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {targetWork.keywords && targetWork.keywords.length > 0 && (
              <div className="text-xs text-stone-500 flex items-center gap-1.5 flex-wrap">
                <span className="font-medium text-stone-700">Keywords:</span>
                {targetWork.keywords.map((kw, i) => (
                  <span key={i} className="text-stone-600">
                    {kw}
                    {i < targetWork.keywords!.length - 1 && <span className="ml-1 text-stone-300">·</span>}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Candidate Literature Corpus */}
        <div className="lg:col-span-6 bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-editorial text-2xl font-bold text-stone-900">
                  Candidate Literature Corpus ({candidatePapers.length})
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Peer-reviewed & preprint literature to benchmark technical similarity against
                </p>
              </div>

              <button
                onClick={handleFetchRelevantArxiv}
                disabled={isFetchingArxiv}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg transition-colors border border-stone-200"
                title="Automatically query ArXiv for papers matching this target abstract"
              >
                {isFetchingArxiv ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5 text-stone-600" />
                )}
                <span>Auto-Fetch ArXiv</span>
              </button>
            </div>

            {/* Quick search input to add papers */}
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={quickArxivQuery}
                onChange={e => setQuickArxivQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleFetchRelevantArxiv()}
                placeholder="Search ArXiv query (e.g. mixture of experts routing)..."
                className="grow text-xs border border-stone-300 rounded-md px-2.5 py-1.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                onClick={handleFetchRelevantArxiv}
                disabled={isFetchingArxiv}
                className="px-3 py-1.5 text-xs font-medium bg-stone-800 hover:bg-stone-900 text-white rounded-md transition-colors shrink-0"
              >
                Add
              </button>
            </div>

            {/* Paper chips/cards in corpus */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {candidatePapers.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-stone-200 rounded-lg text-stone-500 text-xs">
                  No candidate papers selected yet. Click &ldquo;Auto-Fetch ArXiv&rdquo; or load a preset above.
                </div>
              ) : (
                candidatePapers.map(paper => (
                  <div
                    key={paper.arxivId || paper.id}
                    className="p-3 bg-stone-50 border border-stone-200 rounded-lg flex items-start justify-between gap-3 text-xs hover:border-stone-300 transition-colors"
                  >
                    <div className="grow">
                      <div className="font-semibold text-stone-900 leading-snug">
                        {paper.title}
                      </div>
                      <div className="text-stone-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span>
                          {Array.isArray(paper.authors) ? paper.authors.slice(0, 2).join(', ') : paper.authors}
                          {paper.authors?.length > 2 && ' et al.'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-stone-400">{paper.arxivId || paper.id}</span>
                        <span aria-hidden="true">·</span>
                        <span>{paper.published?.slice(0, 4) || 'Recent'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {paper.pdfUrl && (
                        <a
                          href={paper.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-stone-400 hover:text-stone-800 transition-colors p-1"
                          title="Open PDF"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => removeCandidatePaper(paper.arxivId || paper.id)}
                        className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                        title="Remove from comparison pool"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Trigger Bar */}
          <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
            <span className="text-xs text-stone-500">
              {candidatePapers.length} papers ready for multi-dimensional similarity mapping
            </span>
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing || candidatePapers.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-amber-300 rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Computing Similarity Dimensions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Execute Similarity & Prior Art Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Results View */}
      {analysisResult && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Executive Novelty & Strategic Appraisal Card */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-5">
              <div>
                <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                  <span>Executive Literature Review</span>
                  <span aria-hidden="true">·</span>
                  <span>Peer Review Calibration</span>
                </div>
                <h3 className="font-editorial text-2xl font-bold text-stone-900">
                  Novelty Assessment & Prior Art Stance
                </h3>
              </div>

              {/* Novelty Score & Badge */}
              <div className="flex items-center gap-4 bg-stone-50 border border-stone-200 p-3 rounded-xl shrink-0">
                <div className="text-center px-2 border-r border-stone-200">
                  <div className="font-editorial text-3xl font-bold text-stone-900 leading-none">
                    {analysisResult.noveltyScore}
                    <span className="text-sm font-sans font-normal text-stone-400">/100</span>
                  </div>
                  <div className="text-[10px] uppercase font-mono tracking-wider text-stone-500 mt-1">
                    Novelty Index
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-stone-900">
                    {analysisResult.noveltyCategory}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    Compared against {candidatePapers.length} baseline papers
                  </div>
                </div>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="mt-5 text-sm text-stone-700 leading-relaxed font-sans">
              <strong className="font-semibold text-stone-900">Critical Synthesis: </strong>
              {analysisResult.executiveSummary}
            </div>

            {/* Strategic Columns: Critical Gaps vs Tactical Differentiation */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5 pt-5 border-t border-stone-100">
              {/* Critical Research Gaps */}
              <div className="bg-stone-50 rounded-lg p-4 border border-stone-200/80">
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-stone-900">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Unaddressed Gaps to Exploit</span>
                </div>
                <ul className="space-y-2 text-xs text-stone-700">
                  {analysisResult.criticalResearchGaps?.map((gap, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-mono text-stone-400 shrink-0">0{i + 1}.</span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tactical Differentiation Advice */}
              <div className="bg-amber-50/60 rounded-lg p-4 border border-amber-200/80">
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Tactical Reviewer Defense Advice</span>
                </div>
                <ul className="space-y-2 text-xs text-stone-700">
                  {analysisResult.tacticalDifferentiationAdvice?.map((advice, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-mono text-amber-800 shrink-0">§{i + 1}</span>
                      <span>{advice}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommended Baselines */}
            {analysisResult.recommendedBaselines && analysisResult.recommendedBaselines.length > 0 && (
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2 text-xs text-stone-600 flex-wrap">
                <strong className="font-semibold text-stone-800">Mandatory Empirical Baselines:</strong>
                {analysisResult.recommendedBaselines.map((baseline, i) => (
                  <span key={i} className="font-mono text-stone-700 bg-stone-100 px-2 py-0.5 rounded">
                    {baseline}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Interactive 2D Semantic Prior Art Space */}
          {analysisResult.paperComparisons && (
            <SemanticMap
              targetWork={targetWork}
              paperComparisons={analysisResult.paperComparisons}
              candidatePapers={candidatePapers}
              onSelectPaper={paper => setExpandedPaperId(paper.arxivId || paper.id)}
            />
          )}

          {/* Detailed Multi-Dimensional Paper Comparisons */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-editorial text-2xl font-bold text-stone-900">
                  Multi-Dimensional Similarity Breakdown
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Algorithmic, problem domain, mathematical, and dataset overlap metrics per paper
                </p>
              </div>

              <button
                onClick={onSynthesizeMatrix}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-stone-800 bg-white hover:bg-stone-50 border border-stone-300 rounded-lg shadow-xs transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-stone-600" />
                <span>Open Full Literature Matrix & BibTeX</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {analysisResult.paperComparisons?.map(comp => {
                const paper = candidatePapers.find(
                  p => p.arxivId === comp.paperId || p.id === comp.paperId
                );
                const isExpanded = expandedPaperId === comp.paperId;

                return (
                  <div
                    key={comp.paperId}
                    className="bg-white border border-stone-200 rounded-xl p-5 hover:border-stone-300 transition-all shadow-xs"
                  >
                    {/* Top Row: Paper details & Similarity Score */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="grow">
                        <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                          <span className="font-mono font-medium text-stone-700">
                            {paper?.arxivId || comp.paperId}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>
                            {Array.isArray(paper?.authors)
                              ? paper.authors.slice(0, 3).join(', ')
                              : paper?.authors || 'Researchers'}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{paper?.published?.slice(0, 4) || '2023'}</span>
                        </div>

                        <h4 className="font-editorial text-xl font-bold text-stone-950 leading-snug">
                          {paper?.title || comp.paperId}
                        </h4>

                        <div className="mt-2 flex items-center gap-3 text-xs">
                          <span className="text-stone-600">
                            Citation Stance: <strong className="text-stone-900">{comp.citationRole}</strong>
                          </span>
                          <span aria-hidden="true" className="text-stone-300">·</span>
                          <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${getRiskBadgeStyle(comp.priorArtRisk)}`}>
                            {comp.priorArtRisk}
                          </span>
                        </div>
                      </div>

                      {/* Overall Similarity Progress Meter */}
                      <div className="flex items-center gap-4 shrink-0 sm:self-center">
                        <div className="text-right">
                          <div className="font-editorial text-2xl font-bold text-stone-900 leading-none">
                            {comp.overallSimilarityScore}%
                          </div>
                          <div className="text-[10px] uppercase font-mono tracking-wider text-stone-400 mt-1">
                            Overall Overlap
                          </div>
                        </div>

                        <div className="w-16 h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                          <div
                            className={`h-full rounded-full ${
                              comp.overallSimilarityScore > 75
                                ? 'bg-rose-500'
                                : comp.overallSimilarityScore > 50
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${comp.overallSimilarityScore}%` }}
                          />
                        </div>

                        <button
                          onClick={() => setExpandedPaperId(isExpanded ? null : comp.paperId)}
                          className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* 4-Dimensional Metric Radar Bars */}
                    <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      {/* Methodology */}
                      <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                        <div className="flex items-center justify-between text-stone-600 mb-1">
                          <span className="font-medium">Methodology</span>
                          <span className="font-mono font-bold text-stone-900">
                            {comp.breakdown?.methodologyScore}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-stone-800 rounded-full"
                            style={{ width: `${comp.breakdown?.methodologyScore}%` }}
                          />
                        </div>
                      </div>

                      {/* Problem Domain */}
                      <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                        <div className="flex items-center justify-between text-stone-600 mb-1">
                          <span className="font-medium">Problem Domain</span>
                          <span className="font-mono font-bold text-stone-900">
                            {comp.breakdown?.problemDomainScore}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-stone-800 rounded-full"
                            style={{ width: `${comp.breakdown?.problemDomainScore}%` }}
                          />
                        </div>
                      </div>

                      {/* Theoretical */}
                      <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                        <div className="flex items-center justify-between text-stone-600 mb-1">
                          <span className="font-medium">Theoretical Math</span>
                          <span className="font-mono font-bold text-stone-900">
                            {comp.breakdown?.theoreticalScore}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-stone-800 rounded-full"
                            style={{ width: `${comp.breakdown?.theoreticalScore}%` }}
                          />
                        </div>
                      </div>

                      {/* Dataset & Benchmarks */}
                      <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                        <div className="flex items-center justify-between text-stone-600 mb-1">
                          <span className="font-medium">Dataset Setup</span>
                          <span className="font-mono font-bold text-stone-900">
                            {comp.breakdown?.datasetScore}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-stone-800 rounded-full"
                            style={{ width: `${comp.breakdown?.datasetScore}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Expandable Deep Breakdown */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-stone-100 space-y-3 text-xs animate-in fade-in duration-200">
                        {/* Rationales */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-stone-700">
                          <div>
                            <span className="font-semibold text-stone-900">Methodological Comparison: </span>
                            {comp.breakdown?.methodologyRationale}
                          </div>
                          <div>
                            <span className="font-semibold text-stone-900">Problem Domain Comparison: </span>
                            {comp.breakdown?.problemDomainRationale}
                          </div>
                        </div>

                        {/* Shared vs Divergent */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                          <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                            <span className="font-semibold text-emerald-950 uppercase tracking-wider text-[11px] block mb-1">
                              Shared Technical Ground:
                            </span>
                            <ul className="list-disc list-inside space-y-0.5 text-stone-700">
                              {comp.sharedConcepts?.map((concept, idx) => (
                                <li key={idx}>{concept}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                            <span className="font-semibold text-amber-950 uppercase tracking-wider text-[11px] block mb-1">
                              Target Work Divergence & Innovations:
                            </span>
                            <ul className="list-disc list-inside space-y-0.5 text-stone-700">
                              {comp.keyDifferences?.map((diff, idx) => (
                                <li key={idx}>{diff}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Candidate Abstract Snippet */}
                        {paper?.summary && (
                          <div className="mt-2 p-3 bg-stone-50 rounded-lg text-stone-600 border border-stone-100">
                            <strong className="text-stone-900 block mb-1">Original Abstract Excerpt:</strong>
                            <p className="line-clamp-3 leading-relaxed font-sans">{paper.summary}</p>
                            {paper.pdfUrl && (
                              <a
                                href={paper.pdfUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 mt-2 text-stone-800 hover:text-stone-950 underline font-medium"
                              >
                                Read Full PDF on ArXiv <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Extract anatomy modal */}
      <PaperExtractModal
        isOpen={isExtractModalOpen}
        onClose={() => setIsExtractModalOpen(false)}
        onExtracted={extracted => {
          setTargetWork(extracted);
          if (extracted.keywords && extracted.keywords.length > 0) {
            setQuickArxivQuery(extracted.keywords.slice(0, 3).join(' '));
          }
        }}
      />
    </div>
  );
};
