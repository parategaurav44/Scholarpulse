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

export interface TargetResearchWork {
  title: string;
  abstract: string;
  methodology?: string;
  domain?: string;
  keywords?: string[];
}

export interface ResearchTopic {
  id: string;
  title: string;
  domain: string;
  significance: string;
  proposedMethodology: string;
  openChallenges: string[];
  suggestedKeywords: string[];
  noveltyRating: number; // 1-10
  feasibilityRating: number; // 1-10
  seedArxivQuery: string;
  targetVenues: string;
}

export interface TopicExplorationResponse {
  domainOverview?: string;
  keyEmergingParadigms?: string[];
  topics?: ResearchTopic[];
  // Fallback if returned directly as array or under different key
  [key: string]: any;
}

export interface DimensionBreakdown {
  methodologyScore: number;
  methodologyRationale: string;
  problemDomainScore: number;
  problemDomainRationale: string;
  theoreticalScore: number;
  theoreticalRationale: string;
  datasetScore: number;
  datasetRationale: string;
}

export interface PaperSimilarityDetail {
  paperId: string;
  overallSimilarityScore: number; // 0-100
  breakdown: DimensionBreakdown;
  sharedConcepts: string[];
  keyDifferences: string[];
  priorArtRisk: 'High Overlap' | 'Moderate Overlap' | 'Low Overlap' | 'Complementary / Synergistic';
  citationRole: string;
}

export interface SimilarityAnalysisResult {
  paperComparisons: PaperSimilarityDetail[];
  noveltyScore: number; // 0-100
  noveltyCategory: 'Substantially Novel' | 'Meaningful Incremental Advance' | 'Heavily Saturated / Close Prior Art' | 'Novel Cross-Domain Synthesis';
  executiveSummary: string;
  criticalResearchGaps: string[];
  tacticalDifferentiationAdvice: string[];
  recommendedBaselines: string[];
}

export interface LiteratureMatrixRow {
  paperTitle: string;
  firstAuthorAndYear: string;
  coreContribution: string;
  methodology: string;
  benchmarksUsed: string;
  identifiedLimitations: string;
  relevanceToUserTopic: string;
  bibtex: string;
}

export interface LiteratureSynthesisResult {
  matrix: LiteratureMatrixRow[];
  relatedWorkNarrative: string;
  literatureTaxonomy?: Array<{
    categoryName: string;
    description: string;
    paperTitles: string[];
  }>;
}

export interface PresetResearchIdea {
  id: string;
  category: string;
  title: string;
  abstract: string;
  methodology: string;
  keywords: string[];
  seedQuery: string;
}
