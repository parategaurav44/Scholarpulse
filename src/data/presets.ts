import { PresetResearchIdea } from '../types';

export const PRESET_RESEARCH_IDEAS: PresetResearchIdea[] = [
  {
    id: 'moe-routing',
    category: 'ML Systems & Architectures',
    title: 'Adaptive Entropy-Regularized Router for Sparse Mixture-of-Experts with Zero Token Dropping',
    abstract:
      'Current Sparse Mixture-of-Experts (MoE) architectures rely on top-k routing heuristics combined with auxiliary auxiliary load balancing loss functions to prevent representation collapse. However, under non-stationary task distributions, existing routers suffer from severe capacity bottlenecks, leading to token dropping and degraded multi-task reasoning. We propose an Adaptive Entropy-Regularized Router (AER-MoE) that dynamically modulates routing temperature based on token information content and local expert congestion gradients, achieving strict zero token-dropping without auxiliary loss hyperparameter tuning.',
    methodology:
      'Formulate expert allocation as an optimal transport problem with entropic regularization solved via fast iterative Sinkhorn steps during the forward pass. Implemented as a custom fused kernel in Triton.',
    keywords: ['Mixture-of-Experts', 'Routing Stability', 'Load Balancing', 'Kernel Optimization', 'Transformers'],
    seedQuery: 'mixture of experts routing load balancing',
  },
  {
    id: 'dynamic-lora',
    category: 'Efficient LLM Adaptation',
    title: 'DyLoRA-Rank: Dynamic Singular Value Allocation for Parameter-Efficient Multi-Task Fine-Tuning',
    abstract:
      'Low-Rank Adaptation (LoRA) typically assigns a uniform static rank across all Transformer weight matrices regardless of parameter sensitivity or domain divergence. This uniform budget results in over-parameterization of shallow layers and under-capacity in crucial cross-attention and projection projections. We present DyLoRA-Rank, an online rank reallocation framework that tracks empirical Fisher information during training to continuously prune and expand adapter ranks on the fly under a fixed aggregate parameter budget.',
    methodology:
      'Track gradient outer products across adapter singular vectors and periodically execute rank reallocation via randomized SVD truncation without restarting optimizer state.',
    keywords: ['Parameter-Efficient Fine-Tuning', 'LoRA', 'Dynamic Rank', 'Model Compression', 'NLP'],
    seedQuery: 'low rank adaptation dynamic rank LoRA',
  },
  {
    id: 'speculative-decoding',
    category: 'LLM Inference Acceleration',
    title: 'Tree-Structured Draft Verification with Speculative KV-Cache Recycling for Long-Context LLMs',
    abstract:
      'Speculative decoding accelerates autoregressive generation by using a lightweight draft model to speculate multiple candidate tokens, which are verified in parallel by a target LLM. However, in long-context generation, draft acceptance rates plummet due to context degradation in the small draft model. We introduce Tree-Structured Speculative Recycling (TSR), which constructs multi-branch draft hypotheses and leverages speculative KV-cache reuse with early-exit verification.',
    methodology:
      'Construct a candidate token tree using top-p draft sampling, evaluate verification likelihood with fused attention kernels, and asynchronously update target KV states.',
    keywords: ['Speculative Decoding', 'Inference Acceleration', 'KV Cache', 'Language Models'],
    seedQuery: 'speculative decoding LLM inference speedup',
  },
  {
    id: 'spatial-biology-diffusion',
    category: 'Biomedical AI & Imaging',
    title: 'Conditional Flow Matching for High-Resolution Single-Cell Spatial Transcriptomics Reconstruction',
    abstract:
      'Spatial transcriptomics provides spatially resolved gene expression profiles at tissue scale, but technological tradeoffs frequently force a compromise between spatial resolution and sequencing depth per cell. We introduce a conditional continuous normalizing flow architecture that reconstructs sub-cellular mRNA distributions from paired low-resolution spatial profiles and standard histology H&E images.',
    methodology:
      'Multi-modal encoder coupling vision transformers for tissue morphology with optimal-transport conditional flow matching over sparse gene count matrices.',
    keywords: ['Spatial Transcriptomics', 'Flow Matching', 'Generative Models', 'Single-Cell Biology'],
    seedQuery: 'spatial transcriptomics diffusion flow matching single cell',
  },
];

export const RESEARCH_DOMAINS = [
  { id: 'all', label: 'All Disciplines' },
  { id: 'cs.AI', label: 'Artificial Intelligence (cs.AI)' },
  { id: 'cs.LG', label: 'Machine Learning (cs.LG)' },
  { id: 'cs.CL', label: 'Computation & Language / NLP (cs.CL)' },
  { id: 'cs.CV', label: 'Computer Vision (cs.CV)' },
  { id: 'cs.CR', label: 'Cryptography & Security (cs.CR)' },
  { id: 'cs.RO', label: 'Robotics (cs.RO)' },
  { id: 'q-bio', label: 'Quantitative Biology' },
  { id: 'stat.ML', label: 'Statistical Machine Learning' },
];
