import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client setup
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface ArxivPaper {
  id: string;
  arxivId: string;
  title: string;
  summary: string;
  authors: string[];
  published: string;
  updated?: string;
  primaryCategory: string;
  categories: string[];
  pdfUrl: string;
  doi?: string;
}

// Robust XML parser for ArXiv Atom feeds
function parseArxivAtomXml(xmlText: string): ArxivPaper[] {
  const papers: ArxivPaper[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
  let entryMatch: RegExpExecArray | null;

  while ((entryMatch = entryRegex.exec(xmlText)) !== null) {
    const entry = entryMatch[1];

    // Extract ID
    const idMatch = /<id>([\s\S]*?)<\/id>/i.exec(entry);
    const rawId = idMatch ? idMatch[1].trim() : '';
    const arxivIdMatch = /(?:abs|pdf)\/([0-9]+\.[0-9]+(?:v[0-9]+)?|[a-zA-Z-]+\/[0-9]+)/i.exec(rawId);
    const arxivId = arxivIdMatch ? arxivIdMatch[1] : rawId.split('/').pop() || 'unknown';

    // Extract Title
    const titleMatch = /<title>([\s\S]*?)<\/title>/i.exec(entry);
    const title = titleMatch
      ? titleMatch[1].replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim()
      : 'Untitled Paper';

    // Extract Summary / Abstract
    const summaryMatch = /<summary>([\s\S]*?)<\/summary>/i.exec(entry);
    const summary = summaryMatch
      ? summaryMatch[1].replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim()
      : '';

    // Extract Authors
    const authors: string[] = [];
    const authorRegex = /<author>[\s\S]*?<name>([\s\S]*?)<\/name>[\s\S]*?<\/author>/gi;
    let authorMatch: RegExpExecArray | null;
    while ((authorMatch = authorRegex.exec(entry)) !== null) {
      authors.push(authorMatch[1].trim());
    }

    // Published date
    const pubMatch = /<published>([\s\S]*?)<\/published>/i.exec(entry);
    const published = pubMatch ? pubMatch[1].trim() : '';

    // Primary category
    const primCatMatch = /<arxiv:primary_category[\s\S]*?term="([^"]+)"/i.exec(entry);
    const primaryCategory = primCatMatch ? primCatMatch[1] : 'cs.AI';

    // All categories
    const categories: string[] = [];
    const catRegex = /<category[\s\S]*?term="([^"]+)"/gi;
    let catMatch: RegExpExecArray | null;
    while ((catMatch = catRegex.exec(entry)) !== null) {
      if (!categories.includes(catMatch[1])) {
        categories.push(catMatch[1]);
      }
    }

    // PDF URL
    const pdfMatch = /<link[\s\S]*?title="pdf"[\s\S]*?href="([^"]+)"/i.exec(entry);
    let pdfUrl = pdfMatch ? pdfMatch[1] : '';
    if (!pdfUrl && arxivId) {
      pdfUrl = `https://arxiv.org/pdf/${arxivId}.pdf`;
    }

    // DOI if available
    const doiMatch = /<arxiv:doi[\s\S]*?>([\s\S]*?)<\/arxiv:doi>/i.exec(entry);
    const doi = doiMatch ? doiMatch[1].trim() : undefined;

    papers.push({
      id: rawId,
      arxivId,
      title,
      summary,
      authors: authors.length > 0 ? authors : ['Anonymous Researcher'],
      published,
      primaryCategory,
      categories: categories.length > 0 ? categories : [primaryCategory],
      pdfUrl,
      doi,
    });
  }

  return papers;
}

// Fallback benchmark papers in case arXiv is slow or down
const FALLBACK_BENCHMARK_PAPERS: ArxivPaper[] = [
  {
    id: 'http://arxiv.org/abs/1706.03762',
    arxivId: '1706.03762',
    title: 'Attention Is All You Need',
    summary:
      'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.',
    authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit', 'Llion Jones', 'Aidan N. Gomez', 'Lukasz Kaiser', 'Illia Polosukhin'],
    published: '2017-06-12T00:00:00Z',
    primaryCategory: 'cs.CL',
    categories: ['cs.CL', 'cs.LG'],
    pdfUrl: 'https://arxiv.org/pdf/1706.03762.pdf',
  },
  {
    id: 'http://arxiv.org/abs/2106.09685',
    arxivId: '2106.09685',
    title: 'LoRA: Low-Rank Adaptation of Large Language Models',
    summary:
      'An important paradigm of natural language processing centers on large-scale pre-training on general domain data and adaptation to particular tasks or domains. As we pre-train larger models, full fine-tuning, which retrains all model parameters, becomes less feasible. We propose Low-Rank Adaptation, or LoRA, which freezes the pre-trained model weights and injects trainable rank decomposition matrices into each layer of the Transformer architecture, greatly reducing the number of trainable parameters for downstream tasks.',
    authors: ['Edward J. Hu', 'Yelong Shen', 'Phillip Wallis', 'Zeyuan Allen-Zhu', 'Yuanzhi Li', 'Shean Wang', 'Lu Wang', 'Weizhu Chen'],
    published: '2021-06-17T00:00:00Z',
    primaryCategory: 'cs.CL',
    categories: ['cs.CL', 'cs.AI', 'cs.LG'],
    pdfUrl: 'https://arxiv.org/pdf/2106.09685.pdf',
  },
  {
    id: 'http://arxiv.org/abs/2005.14165',
    arxivId: '2005.14165',
    title: 'Language Models are Few-Shot Learners',
    summary:
      'Recent work has demonstrated substantial gains on many NLP tasks and benchmarks by pre-training on a large corpus of text followed by fine-tuning on a specific task. While typically task-agnostic in architecture, this method still requires task-specific fine-tuning datasets of thousands or tens of thousands of examples. Here we show that scaling up language models greatly improves task-agnostic, few-shot performance, sometimes even reaching competitiveness with prior state-of-the-art fine-tuning approaches.',
    authors: ['Tom B. Brown', 'Benjamin Mann', 'Nick Ryder', 'Melanie Subbiah', 'Jared Kaplan', 'Prafulla Dhariwal', 'Arvind Neelakantan', 'Pranav Shyam', 'Girish Sastry', 'Amanda Askell'],
    published: '2020-05-28T00:00:00Z',
    primaryCategory: 'cs.CL',
    categories: ['cs.CL', 'cs.AI', 'cs.LG'],
    pdfUrl: 'https://arxiv.org/pdf/2005.14165.pdf',
  },
  {
    id: 'http://arxiv.org/abs/2205.14135',
    arxivId: '2205.14135',
    title: 'FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness',
    summary:
      'Transformers are slow and memory-hungry on long sequences, since the time and memory complexity of self-attention are quadratic in sequence length. Approximate attention methods have attempted to address this problem by trading off model quality to reduce the compute complexity, but often do not achieve wall-clock speedup. We propose FlashAttention, an IO-aware exact attention algorithm that uses tiling to reduce the number of memory reads/writes between GPU high bandwidth memory (HBM) and GPU on-chip SRAM.',
    authors: ['Tri Dao', 'Daniel Y. Fu', 'Stefano Ermon', 'Atri Rudra', 'Christopher Ré'],
    published: '2022-05-27T00:00:00Z',
    primaryCategory: 'cs.LG',
    categories: ['cs.LG', 'cs.AI'],
    pdfUrl: 'https://arxiv.org/pdf/2205.14135.pdf',
  },
  {
    id: 'http://arxiv.org/abs/2307.09288',
    arxivId: '2307.09288',
    title: 'Llama 2: Open Foundation and Fine-Tuned Chat Models',
    summary:
      'In this work, we develop and release Llama 2, a collection of pretrained and fine-tuned large language models (LLMs) ranging in scale from 7 billion to 70 billion parameters. Our fine-tuned LLMs, called Llama 2-Chat, are optimized for dialogue use cases. Our models outperform open-source chat models on most benchmarks we tested, and based on our human evaluations for helpfulness and safety, may be a suitable substitute for closed-source models.',
    authors: ['Hugo Touvron', 'Louis Martin', 'Kevin Stone', 'Peter Albert', 'Amjad Almahairi', 'Yasmine Babaei', 'Nikolay Bashlykov', 'Soumya Batra'],
    published: '2023-07-18T00:00:00Z',
    primaryCategory: 'cs.CL',
    categories: ['cs.CL', 'cs.AI', 'cs.LG'],
    pdfUrl: 'https://arxiv.org/pdf/2307.09288.pdf',
  },
  {
    id: 'http://arxiv.org/abs/2401.04088',
    arxivId: '2401.04088',
    title: 'Mixtral of Experts',
    summary:
      'We introduce Mixtral 8x7B, a Sparse Mixture of Experts (SMoE) language model. Mixtral has the same architecture as Mistral 7B, with the difference that each layer is composed of 8 feedforward blocks (i.e. experts). For every token, at each layer, a router network selects two experts to process the current state and combine their outputs. Mixtral outperforms Llama 2 70B on most benchmarks with 6x faster inference.',
    authors: ['Albert Q. Jiang', 'Alexandre Sablayrolles', 'Antoine Roux', 'Arthur Mensch', 'Blanche Savary', 'Chris Bamford', 'Devendra Singh Chaplot'],
    published: '2024-01-08T00:00:00Z',
    primaryCategory: 'cs.LG',
    categories: ['cs.LG', 'cs.AI', 'cs.CL'],
    pdfUrl: 'https://arxiv.org/pdf/2401.04088.pdf',
  },
];

// 1. ArXiv Live Search Endpoint
app.get('/api/arxiv/search', async (req, res) => {
  try {
    const query = (req.query.query as string || '').trim();
    const category = (req.query.category as string || '').trim();
    const maxResults = Math.min(parseInt((req.query.maxResults as string) || '10', 10), 30);
    const sortBy = (req.query.sortBy as string) || 'relevance';

    if (!query && !category) {
      return res.json({ papers: FALLBACK_BENCHMARK_PAPERS.slice(0, maxResults), total: FALLBACK_BENCHMARK_PAPERS.length });
    }

    let searchQuery = '';
    if (query && category && category !== 'all') {
      searchQuery = `all:${encodeURIComponent(query)}+AND+cat:${encodeURIComponent(category)}`;
    } else if (category && category !== 'all') {
      searchQuery = `cat:${encodeURIComponent(category)}`;
    } else {
      searchQuery = `all:${encodeURIComponent(query)}`;
    }

    const sortParam = sortBy === 'lastUpdatedDate' ? 'lastUpdatedDate' : sortBy === 'submittedDate' ? 'submittedDate' : 'relevance';
    const arxivUrl = `https://export.arxiv.org/api/query?search_query=${searchQuery}&start=0&max_results=${maxResults}&sortBy=${sortParam}&sortOrder=descending`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    const arxivRes = await fetch(arxivUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'ScholarPulse-Academic-Assistant/1.0',
      },
    });
    clearTimeout(timeout);

    if (!arxivRes.ok) {
      throw new Error(`ArXiv responded with status ${arxivRes.status}`);
    }

    const xml = await arxivRes.text();
    const papers = parseArxivAtomXml(xml);

    if (papers.length === 0) {
      // Filter fallback if available
      const filtered = FALLBACK_BENCHMARK_PAPERS.filter(p =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.summary.toLowerCase().includes(query.toLowerCase())
      );
      return res.json({ papers: filtered.length > 0 ? filtered : FALLBACK_BENCHMARK_PAPERS.slice(0, maxResults), isFallback: true });
    }

    return res.json({ papers, total: papers.length });
  } catch (err: any) {
    console.error('Error fetching from ArXiv:', err?.message || err);
    // Return relevant fallbacks
    const query = (req.query.query as string || '').toLowerCase();
    const filtered = FALLBACK_BENCHMARK_PAPERS.filter(p =>
      p.title.toLowerCase().includes(query) ||
      p.summary.toLowerCase().includes(query)
    );
    return res.json({
      papers: filtered.length > 0 ? filtered : FALLBACK_BENCHMARK_PAPERS,
      warning: 'Live ArXiv search temporarily unavailable; showing curated research benchmark corpus.',
      isFallback: true,
    });
  }
});

// 2. Topic Exploration & Formulation Endpoint
app.post('/api/topics/explore', async (req, res) => {
  try {
    const { domain, intent, existingInterests } = req.body;

    if (!domain) {
      return res.status(400).json({ error: 'Domain or research inquiry is required.' });
    }

    const prompt = `You are a world-class principal scientific investigator and senior academic advisor.
A researcher is formulating high-impact research topics in the area: "${domain}".
Intent/Focus: "${intent || 'Discover novel, publishable research topics with high citation potential'}".
Related keywords/interests: "${existingInterests || 'None specified'}".

Provide 5 innovative, technically grounded research topics/directions in this domain.
For each topic, provide:
- id: unique string slug (e.g., "dynamic-moe-routing-sparsity")
- title: clear, rigorous academic paper-style title
- domain: sub-field (e.g. "Distributed Systems / Machine Learning Systems")
- significance: 2-3 sentence statement explaining why this problem is critical and timely
- proposedMethodology: concrete technical methodology, architecture, or algorithmic angle (e.g. "Utilize contrastive representation alignment with adaptive temperature gating...")
- openChallenges: 2-3 specific technical bottlenecks or unsolved challenges
- suggestedKeywords: 4-6 search keywords for literature retrieval
- noveltyRating: number from 1 to 10
- feasibilityRating: number from 1 to 10
- seedArxivQuery: a concise search string optimized for querying ArXiv (e.g., "mixture of experts routing stability")
- targetVenues: 2-3 prestigious target conferences or journals (e.g., "NeurIPS, ICML, ICLR" or "CVPR, IEEE TPAMI")

Also provide:
- domainOverview: 2-3 sentence synthesis of where the state of the art currently stands in this field
- keyEmergingParadigms: array of 3 top paradigm shifts happening right now in this space

Format the output strictly as valid JSON without markdown wrapping.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const jsonText = response.text?.trim() || '{}';
    const parsed = JSON.parse(jsonText);
    res.json(parsed);
  } catch (err: any) {
    console.error('Error generating topics:', err);
    res.status(500).json({ error: err?.message || 'Failed to generate research topics.' });
  }
});

// 3. Deep Paper Similarity & Prior Art Analysis Endpoint
app.post('/api/similarity/analyze', async (req, res) => {
  try {
    const { targetWork, candidatePapers } = req.body;

    if (!targetWork || !targetWork.title || !targetWork.abstract) {
      return res.status(400).json({ error: 'Target paper title and abstract are required.' });
    }

    if (!candidatePapers || !Array.isArray(candidatePapers) || candidatePapers.length === 0) {
      return res.status(400).json({ error: 'At least one candidate paper must be provided for comparison.' });
    }

    // Limit to 8 papers to prevent token overflow and ensure fast latency
    const subsetPapers = candidatePapers.slice(0, 8);

    const prompt = `You are a senior peer reviewer and bibliometric analyst for top-tier scientific venues (NeurIPS, Nature, ACM, IEEE).
Analyze the similarity, technical overlap, and prior art relationship between the TARGET RESEARCH WORK and the CANDIDATE PAPERS.

TARGET RESEARCH WORK:
Title: ${targetWork.title}
Abstract / Description:
${targetWork.abstract}
${targetWork.methodology ? `Methodology Notes: ${targetWork.methodology}` : ''}

CANDIDATE PAPERS TO COMPARE AGAINST:
${subsetPapers
  .map(
    (p, i) => `
[Candidate ${i + 1}]
ArXiv ID: ${p.arxivId || p.id}
Title: ${p.title}
Authors: ${Array.isArray(p.authors) ? p.authors.slice(0, 4).join(', ') : p.authors} (${p.published?.slice(0, 4) || 'Recent'})
Abstract: ${p.summary}
`
  )
  .join('\n---\n')}

Perform a rigorous multi-dimensional similarity analysis:
For EACH candidate paper, compute:
- paperId: matches candidate's arxivId or id
- overallSimilarityScore: integer from 0 to 100
- breakdown:
  - methodologyScore: 0 to 100 (similarity of algorithms, architectures, techniques)
  - methodologyRationale: 1-2 sentences on how the methods compare
  - problemDomainScore: 0 to 100 (similarity of task, application domain, problem formulation)
  - problemDomainRationale: 1-2 sentences
  - theoreticalScore: 0 to 100 (underlying theoretical assumptions, math, formalisms)
  - theoreticalRationale: 1-2 sentences
  - datasetScore: 0 to 100 (datasets, benchmarks, evaluation setups)
  - datasetRationale: 1-2 sentences
- sharedConcepts: array of 3-5 specific technical concepts both works share
- keyDifferences: array of 3-5 distinct differentiators where Target Work diverges
- priorArtRisk: one of "High Overlap" (severe risk of scooped novelty), "Moderate Overlap" (direct baseline to compare against), "Low Overlap" (distinct domain/method), or "Complementary / Synergistic"
- citationRole: recommendation for how the Target Work should position this paper (e.g. "Primary baseline to outperform", "Foundational theory to cite in Related Work", "Alternative architecture for ablation study")

Also provide an EXECUTIVE SYNTHESIS:
- noveltyScore: integer from 0 to 100 (how novel the Target Work is relative to this literature corpus)
- noveltyCategory: one of "Substantially Novel", "Meaningful Incremental Advance", "Heavily Saturated / Close Prior Art", or "Novel Cross-Domain Synthesis"
- executiveSummary: 3-4 sentence comprehensive critique of the target idea's standing against existing literature
- criticalResearchGaps: array of 3-4 concrete open gaps that remain unaddressed in the literature that the target work could exploit
- tacticalDifferentiationAdvice: array of 3 actionable recommendations on how to strengthen experimental design and framing to avoid reviewer rejection
- recommendedBaselines: array of 2-3 specific papers or architectures that must be included in the empirical benchmark

Format the output strictly as valid JSON without markdown wrapping.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const jsonText = response.text?.trim() || '{}';
    const parsed = JSON.parse(jsonText);
    res.json(parsed);
  } catch (err: any) {
    console.error('Error analyzing paper similarity:', err);
    res.status(500).json({ error: err?.message || 'Failed to analyze paper similarity.' });
  }
});

// 4. Literature Matrix & Synthesis Endpoint
app.post('/api/literature/synthesize', async (req, res) => {
  try {
    const { targetTopic, papers } = req.body;

    if (!papers || !Array.isArray(papers) || papers.length === 0) {
      return res.status(400).json({ error: 'Papers are required to synthesize literature matrix.' });
    }

    const prompt = `You are a distinguished research scientist.
Generate a structured Literature Matrix and synthesis for research on: "${targetTopic || 'Contemporary Machine Learning Research'}".

Papers provided:
${papers
  .slice(0, 10)
  .map(
    (p, i) => `
[Paper ${i + 1}]
Title: ${p.title}
Authors: ${Array.isArray(p.authors) ? p.authors.join(', ') : p.authors}
Year: ${p.published ? p.published.slice(0, 4) : '2023'}
ArXiv ID: ${p.arxivId || 'unknown'}
Abstract: ${p.summary}
`
  )
  .join('\n---\n')}

Generate a comprehensive academic synthesis with:
1. "matrix": array of structured rows for each paper:
   - paperTitle
   - firstAuthorAndYear (e.g. "Vaswani et al. (2017)")
   - coreContribution: 1-2 sentence crisp technical contribution
   - methodology: primary technique or mechanism
   - benchmarksUsed: datasets/benchmarks evaluated on
   - identifiedLimitations: primary limitation or unaddressed flaw
   - relevanceToUserTopic: how this relates to "${targetTopic}"
   - bibtex: valid BibTeX entry (e.g., @article{...})
2. "relatedWorkNarrative": 3 well-written academic paragraphs in Markdown format summarizing the literature evolution, current consensus, and remaining tension, citing the papers using citation keys like [Vaswani et al., 2017].
3. "literatureTaxonomy": array of 2-4 sub-categories grouping these papers with their main philosophical approach.

Format the output strictly as valid JSON without markdown wrapping.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    const jsonText = response.text?.trim() || '{}';
    const parsed = JSON.parse(jsonText);
    res.json(parsed);
  } catch (err: any) {
    console.error('Error synthesizing literature:', err);
    res.status(500).json({ error: err?.message || 'Failed to synthesize literature matrix.' });
  }
});

// 5. Paper Parsing & Abstract Structuring Helper
app.post('/api/paper/extract', async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText || rawText.trim().length < 20) {
      return res.status(400).json({ error: 'Text content is too short to analyze.' });
    }

    const prompt = `Analyze this academic text snippet (which could be a draft proposal, an abstract, an introduction, or raw paper text) and extract its academic anatomy:
"""
${rawText.slice(0, 6000)}
"""

Extract into JSON:
- title: extracted or synthesized rigorous paper title
- abstract: clean, structured 1-paragraph summary
- problemStatement: 1-2 sentences defining the exact problem
- proposedMethod: 1-2 sentences summarizing the core proposed methodology
- primaryKeywords: array of 4-6 academic keywords
- suggestedArxivCategory: e.g. "cs.LG", "cs.CL", "cs.CV", "cs.AI", "stat.ML"
- searchQueries: array of 3 targeted search queries to find related prior art on ArXiv

Format strictly as JSON without markdown formatting.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const jsonText = response.text?.trim() || '{}';
    const parsed = JSON.parse(jsonText);
    res.json(parsed);
  } catch (err: any) {
    console.error('Error extracting paper info:', err);
    res.status(500).json({ error: err?.message || 'Failed to extract paper structure.' });
  }
});

// Production static serving vs Dev Vite middleware
async function setupServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`ScholarPulse server listening on http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch(err => {
  console.error('Fatal server boot error:', err);
});
