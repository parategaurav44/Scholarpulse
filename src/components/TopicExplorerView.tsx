import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, ArrowRight, BookOpen, Layers, Check, Copy, ExternalLink, Loader2 } from 'lucide-react';
import { ResearchTopic, TopicExplorationResponse, TargetResearchWork } from '../types';
import { RESEARCH_DOMAINS } from '../data/presets';

interface TopicExplorerViewProps {
  onTransferToSimilarity: (targetWork: TargetResearchWork, seedQuery?: string) => void;
  onSearchArxiv: (query: string, category?: string) => void;
}

export const TopicExplorerView: React.FC<TopicExplorerViewProps> = ({
  onTransferToSimilarity,
  onSearchArxiv,
}) => {
  const [domainQuery, setDomainQuery] = useState('Sparse Mixture-of-Experts & Modular Neural Architectures');
  const [selectedCategory, setSelectedCategory] = useState('cs.LG');
  const [intent, setIntent] = useState('Discover High-Impact Gaps & Unsolved Bottlenecks');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [data, setData] = useState<TopicExplorationResponse | null>(null);

  // Initial explore on mount if empty
  useEffect(() => {
    handleExplore();
  }, []);

  const handleExplore = async (overrideQuery?: string) => {
    const q = overrideQuery || domainQuery;
    if (!q.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/topics/explore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: q,
          intent,
          existingInterests: selectedCategory !== 'all' ? selectedCategory : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate research topics');
      }

      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error('Topic exploration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyBrief = (topic: ResearchTopic) => {
    const brief = `TITLE: ${topic.title}
DOMAIN: ${topic.domain} (Target: ${topic.targetVenues})

SIGNIFICANCE:
${topic.significance}

PROPOSED METHODOLOGY:
${topic.proposedMethodology}

OPEN CHALLENGES:
${topic.openChallenges.map(c => `- ${c}`).join('\n')}

KEYWORDS: ${topic.suggestedKeywords.join(', ')}
SEED ARXIV QUERY: ${topic.seedArxivQuery}`;

    navigator.clipboard.writeText(brief);
    setCopiedId(topic.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleRunPriorArt = (topic: ResearchTopic) => {
    onTransferToSimilarity(
      {
        title: topic.title,
        abstract: `${topic.significance} ${topic.proposedMethodology}`,
        methodology: topic.proposedMethodology,
        domain: topic.domain,
        keywords: topic.suggestedKeywords,
      },
      topic.seedArxivQuery
    );
  };

  return (
    <div className="space-y-8">
      {/* Search & Configuration Bar */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs">
        <div className="max-w-3xl">
          <h2 className="font-editorial text-2xl font-bold text-stone-900 tracking-tight">
            Formulate High-Impact Research Topics & Uncover Open Gaps
          </h2>
          <p className="text-sm text-stone-600 mt-1">
            Specify a research domain, emerging paradigm, or hypothesis. Gemini evaluates theoretical bottlenecks, empirical frontiers, and proposes technically rigorous paper topics with direct prior-art retrieval queries.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6">
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Research Field or Inquiry
            </label>
            <input
              type="text"
              value={domainQuery}
              onChange={e => setDomainQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleExplore()}
              placeholder="e.g. Test-time compute scaling in LLM reasoning..."
              className="w-full text-sm border border-stone-300 rounded-lg px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-sans"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Primary ArXiv Category
            </label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full text-sm border border-stone-300 rounded-lg px-3 py-2 bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {RESEARCH_DOMAINS.map(d => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Formulation Intent
            </label>
            <select
              value={intent}
              onChange={e => setIntent(e.target.value)}
              className="w-full text-sm border border-stone-300 rounded-lg px-3 py-2 bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="Discover High-Impact Gaps & Unsolved Bottlenecks">
                Unsolved Gaps & Bottlenecks
              </option>
              <option value="Methodological Innovation & Novel Architecture">
                Methodological / Architectural
              </option>
              <option value="Cross-Disciplinary Translation">
                Cross-Disciplinary Synthesis
              </option>
              <option value="Empirical Benchmark & Disconfirmation Study">
                Empirical Benchmark & Critique
              </option>
            </select>
          </div>
        </div>

        {/* Quick query presets */}
        <div className="mt-3 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-stone-400 font-medium">Quick suggestions:</span>
            {[
              'Test-Time Compute Scaling',
              'KV Cache Compression for 1M Context',
              'Mechanistic Interpretability in Sparse Autoencoders',
              'Self-Supervised Biological Representation',
            ].map(preset => (
              <button
                key={preset}
                onClick={() => {
                  setDomainQuery(preset);
                  handleExplore(preset);
                }}
                className="text-stone-600 hover:text-stone-900 underline decoration-stone-300 hover:decoration-stone-700 transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleExplore()}
            disabled={isLoading || !domainQuery.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold bg-stone-900 text-amber-300 hover:bg-stone-800 transition-all shadow-xs disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Formulating Topics...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Explore Topics & Gaps</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Domain Overview & Emerging Paradigms */}
      {data?.domainOverview && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 text-amber-900 font-serif font-bold text-sm">
              §
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-950">
                Frontier Landscape & Current Consensus
              </h3>
              <p className="text-sm text-stone-800 leading-relaxed font-sans">
                {data.domainOverview}
              </p>

              {data.keyEmergingParadigms && data.keyEmergingParadigms.length > 0 && (
                <div className="pt-2 flex items-center gap-3 flex-wrap text-xs text-amber-900">
                  <span className="font-semibold text-stone-800">Key Paradigm Shifts:</span>
                  {data.keyEmergingParadigms.map((paradigm, idx) => (
                    <span key={idx} className="text-stone-700">
                      <span className="font-mono text-amber-800 mr-1">0{idx + 1}.</span>
                      {paradigm}
                      {idx < (data.keyEmergingParadigms?.length || 0) - 1 && (
                        <span className="text-amber-300 ml-2" aria-hidden="true">·</span>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Topics List */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-editorial text-2xl font-bold text-stone-900">
            Formulated Research Proposals ({data?.topics?.length || 0})
          </h3>
          <span className="text-xs text-stone-500">
            Click &ldquo;Run Prior Art Check&rdquo; to benchmark similarity against live ArXiv papers
          </span>
        </div>

        {isLoading && !data ? (
          <div className="p-12 text-center bg-white border border-stone-200 rounded-xl">
            <Loader2 className="w-7 h-7 animate-spin mx-auto text-stone-400 mb-3" />
            <p className="text-sm font-medium text-stone-700">Formulating research hypotheses and evaluating literature boundaries...</p>
            <p className="text-xs text-stone-400 mt-1">Cross-referencing technical architectures and open challenges</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {data?.topics?.map((topic, index) => (
              <div
                key={topic.id || index}
                className="bg-white border border-stone-200 rounded-xl p-6 transition-all hover:border-stone-400 shadow-xs group"
              >
                {/* Quiet unboxed metadata header */}
                <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-stone-400">0{index + 1}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-stone-700">{topic.domain}</span>
                    <span aria-hidden="true">·</span>
                    <span>Target: {topic.targetVenues}</span>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-stone-600">
                    <span>Novelty: <strong className="text-stone-900">{topic.noveltyRating}/10</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>Feasibility: <strong className="text-stone-900">{topic.feasibilityRating}/10</strong></span>
                  </div>
                </div>

                {/* Primary Paper Title */}
                <h4 className="font-editorial text-2xl font-bold text-stone-950 leading-snug group-hover:text-amber-900 transition-colors">
                  {topic.title}
                </h4>

                {/* Significance / Motivation */}
                <div className="mt-3 text-sm text-stone-700 leading-relaxed">
                  <strong className="font-medium text-stone-900">Significance & Problem: </strong>
                  {topic.significance}
                </div>

                {/* Proposed Methodology */}
                <div className="mt-2 text-sm text-stone-700 leading-relaxed bg-stone-50 p-3 rounded-lg border border-stone-100">
                  <strong className="font-medium text-stone-900">Proposed Methodological Angle: </strong>
                  {topic.proposedMethodology}
                </div>

                {/* Open Challenges */}
                {topic.openChallenges && topic.openChallenges.length > 0 && (
                  <div className="mt-3">
                    <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                      Key Technical Bottlenecks to Address:
                    </span>
                    <ul className="mt-1 space-y-1 text-xs text-stone-600 list-disc list-inside">
                      {topic.openChallenges.map((challenge, cIdx) => (
                        <li key={cIdx}>{challenge}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Keywords (clean unboxed text per zero-pill rule) */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 flex-wrap">
                    <span className="font-medium text-stone-600">Keywords:</span>
                    {topic.suggestedKeywords?.map((kw, kwIdx) => (
                      <React.Fragment key={kwIdx}>
                        <span>{kw}</span>
                        {kwIdx < topic.suggestedKeywords.length - 1 && (
                          <span className="text-stone-300" aria-hidden="true">·</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Functional Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyBrief(topic)}
                      className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors flex items-center gap-1"
                      title="Copy structured research proposal summary"
                    >
                      {copiedId === topic.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Brief</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onSearchArxiv(topic.seedArxivQuery)}
                      className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors flex items-center gap-1"
                      title="Search ArXiv directly for existing papers on this topic"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Search ArXiv</span>
                    </button>

                    <button
                      onClick={() => handleRunPriorArt(topic)}
                      className="px-3.5 py-1.5 text-xs font-medium bg-stone-900 hover:bg-stone-800 text-amber-300 rounded-md transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Run Prior Art Check</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
