import React, { useState } from 'react';
import { FileText, Sparkles, X, Loader2, ArrowRight } from 'lucide-react';
import { TargetResearchWork } from '../types';

interface PaperExtractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExtracted: (work: TargetResearchWork) => void;
}

export const PaperExtractModal: React.FC<PaperExtractModalProps> = ({
  isOpen,
  onClose,
  onExtracted,
}) => {
  const [rawText, setRawText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExtract = async () => {
    if (!rawText.trim() || rawText.trim().length < 20) {
      setError('Please provide at least 2-3 sentences of your draft or paper excerpt.');
      return;
    }

    setIsExtracting(true);
    setError(null);

    try {
      const res = await fetch('/api/paper/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to extract paper anatomy.');
      }

      const data = await res.json();
      onExtracted({
        title: data.title || 'Untitled Proposal',
        abstract: data.abstract || rawText,
        methodology: data.proposedMethod || '',
        domain: data.suggestedArxivCategory || 'cs.AI',
        keywords: data.primaryKeywords || [],
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error parsing paper draft.');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-stone-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-stone-700" />
            <h3 className="font-editorial text-xl font-bold text-stone-900">
              Extract Academic Anatomy from Draft
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-xs text-stone-600 mb-3">
            Paste raw text from your paper draft, introduction, grant pitch, or PDF export. Gemini will structure the working title, core abstract, problem statement, and search keywords automatically.
          </p>

          <textarea
            value={rawText}
            onChange={e => setRawText(e.target.value)}
            rows={8}
            placeholder="e.g. In this paper, we address the challenge of non-stationary routing collapse in Mixture-of-Experts models. We demonstrate that conventional load-balancing losses penalize specialized experts... We formulate an optimal transport framework..."
            className="w-full text-sm border border-stone-300 rounded-lg p-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-sans"
          />

          {error && (
            <p className="mt-2 text-xs text-rose-600 font-medium">
              {error}
            </p>
          )}

          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExtract}
              disabled={isExtracting || !rawText.trim()}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium bg-stone-900 hover:bg-stone-800 text-amber-300 rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing Anatomy...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Extract Paper Structure</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
