import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TopicExplorerView } from './components/TopicExplorerView';
import { SimilarityStudioView } from './components/SimilarityStudioView';
import { LiteratureMatrixView } from './components/LiteratureMatrixView';
import { ArxivExplorerView } from './components/ArxivExplorerView';
import { PRESET_RESEARCH_IDEAS } from './data/presets';
import { TargetResearchWork, ArxivPaper, SimilarityAnalysisResult, PresetResearchIdea } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'topics' | 'similarity' | 'matrix' | 'arxiv'>('topics');
  const [currentPresetId, setCurrentPresetId] = useState<string>(PRESET_RESEARCH_IDEAS[0].id);

  // Target Research Work
  const [targetWork, setTargetWork] = useState<TargetResearchWork>({
    title: PRESET_RESEARCH_IDEAS[0].title,
    abstract: PRESET_RESEARCH_IDEAS[0].abstract,
    methodology: PRESET_RESEARCH_IDEAS[0].methodology,
    domain: 'cs.LG',
    keywords: PRESET_RESEARCH_IDEAS[0].keywords,
  });

  // Candidate Papers Pool
  const [candidatePapers, setCandidatePapers] = useState<ArxivPaper[]>([]);
  const [analysisResult, setAnalysisResult] = useState<SimilarityAnalysisResult | null>(null);

  // ArXiv Explorer search query state
  const [arxivSearchQuery, setArxivSearchQuery] = useState(PRESET_RESEARCH_IDEAS[0].seedQuery);

  // Load initial candidate papers for preset on mount
  useEffect(() => {
    fetchInitialBenchmarkPapers(PRESET_RESEARCH_IDEAS[0].seedQuery);
  }, []);

  const fetchInitialBenchmarkPapers = async (queryStr: string) => {
    try {
      const res = await fetch(`/api/arxiv/search?query=${encodeURIComponent(queryStr)}&maxResults=5`);
      if (res.ok) {
        const data = await res.json();
        if (data.papers && data.papers.length > 0) {
          setCandidatePapers(data.papers);
        }
      }
    } catch (err) {
      console.error('Error fetching initial benchmark papers:', err);
    }
  };

  const handleSelectPreset = (preset: PresetResearchIdea) => {
    setCurrentPresetId(preset.id);
    setTargetWork({
      title: preset.title,
      abstract: preset.abstract,
      methodology: preset.methodology,
      domain: preset.category,
      keywords: preset.keywords,
    });
    setAnalysisResult(null);
    setArxivSearchQuery(preset.seedQuery);
    fetchInitialBenchmarkPapers(preset.seedQuery);
  };

  const handleTransferToSimilarity = (work: TargetResearchWork, seedQuery?: string) => {
    setTargetWork(work);
    setAnalysisResult(null);
    if (seedQuery) {
      setArxivSearchQuery(seedQuery);
      fetchInitialBenchmarkPapers(seedQuery);
    }
    setActiveTab('similarity');
  };

  const handleSearchArxiv = (queryStr: string, category?: string) => {
    setArxivSearchQuery(queryStr);
    setActiveTab('arxiv');
  };

  const handleSetAsTarget = (paper: ArxivPaper) => {
    setTargetWork({
      title: paper.title,
      abstract: paper.summary,
      domain: paper.primaryCategory,
      keywords: paper.categories,
    });
    setAnalysisResult(null);
    setActiveTab('similarity');
  };

  const handleAddToBenchmark = (paper: ArxivPaper) => {
    const id = paper.arxivId || paper.id;
    setCandidatePapers(prev => {
      const exists = prev.some(p => (p.arxivId || p.id) === id);
      if (exists) return prev;
      return [...prev, paper];
    });
  };

  const candidateIds = new Set(candidatePapers.map(p => p.arxivId || p.id));

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col selection:bg-amber-100 selection:text-stone-900">
      {/* Top Navigation & Presets Bar */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSelectPreset={handleSelectPreset}
        currentPresetId={currentPresetId}
      />

      {/* Main Content Workspace */}
      <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'topics' && (
          <TopicExplorerView
            onTransferToSimilarity={handleTransferToSimilarity}
            onSearchArxiv={handleSearchArxiv}
          />
        )}

        {activeTab === 'similarity' && (
          <SimilarityStudioView
            targetWork={targetWork}
            setTargetWork={setTargetWork}
            candidatePapers={candidatePapers}
            setCandidatePapers={setCandidatePapers}
            analysisResult={analysisResult}
            setAnalysisResult={setAnalysisResult}
            onSearchMorePapers={handleSearchArxiv}
            onSynthesizeMatrix={() => setActiveTab('matrix')}
          />
        )}

        {activeTab === 'matrix' && (
          <LiteratureMatrixView
            targetWork={targetWork}
            candidatePapers={candidatePapers}
            onSelectPaperForSearch={handleSearchArxiv}
          />
        )}

        {activeTab === 'arxiv' && (
          <ArxivExplorerView
            initialQuery={arxivSearchQuery}
            onSetAsTarget={handleSetAsTarget}
            onAddToBenchmark={handleAddToBenchmark}
            candidateIds={candidateIds}
          />
        )}
      </main>

      {/* Academic Editorial Footer */}
      <footer className="border-t border-stone-200 bg-white mt-16 py-6 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-900">ScholarPulse</span>
            <span aria-hidden="true">·</span>
            <span>Authored by <strong className="text-stone-800 font-medium">Gaurav Parate</strong></span>
            <span aria-hidden="true">·</span>
            <span>Literature Grounded via arXiv.org e-Print Archive</span>
          </div>

          <div className="flex items-center gap-4 text-stone-500">
            <span>Powered by Gemini 3.8 Flash Semantic Intelligence</span>
            <span aria-hidden="true">·</span>
            <a
              href="mailto:gauravparate746@gmail.com"
              className="text-stone-700 hover:text-stone-950 font-medium transition-colors"
            >
              Contact Author
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
