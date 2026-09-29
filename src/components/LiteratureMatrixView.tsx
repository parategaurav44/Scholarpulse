import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Copy,
  Check,
  Download,
  Sparkles,
  ExternalLink,
  Code,
  FileText,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { ArxivPaper, TargetResearchWork, LiteratureSynthesisResult, LiteratureMatrixRow } from '../types';

interface LiteratureMatrixViewProps {
  targetWork: TargetResearchWork;
  candidatePapers: ArxivPaper[];
  onSelectPaperForSearch: (query: string) => void;
}

export const LiteratureMatrixView: React.FC<LiteratureMatrixViewProps> = ({
  targetWork,
  candidatePapers,
  onSelectPaperForSearch,
}) => {
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisData, setSynthesisData] = useState<LiteratureSynthesisResult | null>(null);
  const [copiedBibtex, setCopiedBibtex] = useState(false);
  const [copiedNarrative, setCopiedNarrative] = useState(false);
  const [activeTab, setActiveTab] = useState<'matrix' | 'narrative' | 'bibtex'>('matrix');

  useEffect(() => {
    if (candidatePapers.length > 0 && !synthesisData) {
      handleSynthesize();
    }
  }, [candidatePapers]);

  const handleSynthesize = async () => {
    if (candidatePapers.length === 0) return;

    setIsSynthesizing(true);
    try {
      const res = await fetch('/api/literature/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetTopic: targetWork.title || 'Contemporary Machine Learning Research',
          papers: candidatePapers,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to synthesize literature matrix');
      }

      const data = await res.json();
      setSynthesisData(data);
    } catch (err) {
      console.error('Synthesis error:', err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleCopyAllBibtex = () => {
    if (!synthesisData?.matrix) return;
    const allBibtex = synthesisData.matrix.map(row => row.bibtex).join('\n\n');
    navigator.clipboard.writeText(allBibtex);
    setCopiedBibtex(true);
    setTimeout(() => setCopiedBibtex(false), 2500);
  };

  const handleCopyNarrative = () => {
    if (!synthesisData?.relatedWorkNarrative) return;
    navigator.clipboard.writeText(synthesisData.relatedWorkNarrative);
    setCopiedNarrative(true);
    setTimeout(() => setCopiedNarrative(false), 2500);
  };

  const handleExportCSV = () => {
    if (!synthesisData?.matrix) return;
    const headers = ['Paper Title', 'Citation Key', 'Methodology', 'Benchmarks', 'Identified Limitations', 'Relevance'];
    const rows = synthesisData.matrix.map(r => [
      `"${r.paperTitle.replace(/"/g, '""')}"`,
      `"${r.firstAuthorAndYear.replace(/"/g, '""')}"`,
      `"${r.methodology.replace(/"/g, '""')}"`,
      `"${r.benchmarksUsed.replace(/"/g, '""')}"`,
      `"${r.identifiedLimitations.replace(/"/g, '""')}"`,
      `"${r.relevanceToUserTopic.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Literature_Matrix_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Synthesis Controls */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
            <span>Bibliometric Synthesis</span>
            <span aria-hidden="true">·</span>
            <span>Comparative Literature Benchmarking</span>
          </div>
          <h2 className="font-editorial text-2xl font-bold text-stone-900">
            Literature Matrix & Related Work Generator
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Structured cross-examination of {candidatePapers.length} benchmark papers against &ldquo;{targetWork.title || 'Current Topic'}&rdquo;
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSynthesize}
            disabled={isSynthesizing || candidatePapers.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors border border-stone-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSynthesizing ? 'animate-spin' : ''}`} />
            <span>Regenerate Matrix</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={!synthesisData}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors border border-stone-200 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleCopyAllBibtex}
            disabled={!synthesisData}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-stone-900 hover:bg-stone-800 text-amber-300 rounded-lg transition-all shadow-xs disabled:opacity-50"
          >
            {copiedBibtex ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy All BibTeX</span>
          </button>
        </div>
      </div>

      {/* Sub-navigation Segmented Control */}
      <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg border border-stone-200 max-w-md text-xs font-medium">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex-1 py-1.5 px-3 rounded-md transition-all text-center ${
            activeTab === 'matrix' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Structured Matrix Table
        </button>
        <button
          onClick={() => setActiveTab('narrative')}
          className={`flex-1 py-1.5 px-3 rounded-md transition-all text-center ${
            activeTab === 'narrative' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Related Work Draft (Markdown)
        </button>
        <button
          onClick={() => setActiveTab('bibtex')}
          className={`flex-1 py-1.5 px-3 rounded-md transition-all text-center ${
            activeTab === 'bibtex' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          BibTeX Repository
        </button>
      </div>

      {/* Loading state */}
      {isSynthesizing && !synthesisData && (
        <div className="p-12 text-center bg-white border border-stone-200 rounded-xl">
          <Loader2 className="w-7 h-7 animate-spin mx-auto text-stone-400 mb-3" />
          <p className="text-sm font-medium text-stone-700">Synthesizing literature matrix and extracting technical contributions...</p>
          <p className="text-xs text-stone-400 mt-1">Structuring limitations, datasets, and BibTeX citations</p>
        </div>
      )}

      {/* TAB 1: Structured Matrix Table */}
      {activeTab === 'matrix' && synthesisData && (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/80 text-stone-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4 w-56">Paper & Citation</th>
                  <th className="py-3 px-4 w-64">Proposed Mechanism</th>
                  <th className="py-3 px-4 w-44">Benchmarks & Data</th>
                  <th className="py-3 px-4 w-60">Identified Limitations</th>
                  <th className="py-3 px-4">Relevance to Target Idea</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {synthesisData.matrix?.map((row, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-semibold text-stone-900 font-sans leading-snug">
                        {row.paperTitle}
                      </div>
                      <div className="text-[11px] text-stone-500 font-mono mt-1">
                        {row.firstAuthorAndYear}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 align-top text-stone-700 leading-relaxed">
                      {row.methodology}
                    </td>

                    <td className="py-3.5 px-4 align-top text-stone-600 font-mono text-[11px]">
                      {row.benchmarksUsed}
                    </td>

                    <td className="py-3.5 px-4 align-top text-stone-700 leading-relaxed bg-rose-50/30">
                      <span className="text-rose-900 font-medium">{row.identifiedLimitations}</span>
                    </td>

                    <td className="py-3.5 px-4 align-top text-stone-700 leading-relaxed bg-amber-50/20">
                      {row.relevanceToUserTopic}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Related Work Section Draft */}
      {activeTab === 'narrative' && synthesisData && (
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-editorial text-xl font-bold text-stone-900">
                Related Work Narrative Synthesis
              </h3>
              <p className="text-xs text-stone-500">
                Peer-review grade literature narrative situating your research against prior art
              </p>
            </div>

            <button
              onClick={handleCopyNarrative}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors border border-stone-200"
            >
              {copiedNarrative ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Markdown</span>
            </button>
          </div>

          <div className="prose prose-stone max-w-none text-sm text-stone-800 leading-relaxed font-sans space-y-4 pt-2">
            {synthesisData.relatedWorkNarrative.split('\n\n').map((paragraph, pIdx) => (
              <p key={pIdx} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BibTeX Repository */}
      {activeTab === 'bibtex' && synthesisData && (
        <div className="bg-stone-900 text-stone-100 rounded-xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-amber-400" />
              <span className="font-mono text-xs text-stone-300 font-semibold uppercase tracking-wider">
                citations.bib ({synthesisData.matrix.length} Entries)
              </span>
            </div>

            <button
              onClick={handleCopyAllBibtex}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono bg-stone-800 hover:bg-stone-700 text-amber-300 rounded transition-colors"
            >
              {copiedBibtex ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy BibTeX</span>
            </button>
          </div>

          <pre className="text-xs font-mono text-stone-300 overflow-x-auto p-3 bg-stone-950/80 rounded-lg max-h-[500px] leading-relaxed selection:bg-stone-700">
            {synthesisData.matrix.map(row => row.bibtex).join('\n\n')}
          </pre>
        </div>
      )}
    </div>
  );
};
