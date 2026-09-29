# ScholarPulse — Research Paper Topic & Similarity Finder

An academic research intelligence workstation engineered to help scientific investigators, graduate students, and independent researchers formulate cutting-edge research topics, discover unaddressed literature gaps, and rigorously benchmark paper similarity across methodology and problem domains.

**Author:** Gaurav Parate  
**Contact:** [gauravparate746@gmail.com](mailto:gauravparate746@gmail.com)  
**Version:** 1.0.0  

---

## 🔬 Overview & Motivation

With thousands of preprints published each week across ArXiv, discovering genuinely novel research directions and detecting subtle prior-art overlap has become a bottleneck in academic research. Traditional keyword search misses methodological nuances and structural overlaps.

**ScholarPulse** bridges this gap by combining:
1. **Live ArXiv Literature Retrieval** across Computer Science, Machine Learning, Computational Linguistics, Computer Vision, Physics, and Quantitative Biology.
2. **Multi-Dimensional Semantic Analysis** evaluating methodological similarity, problem domain overlap, theoretical frameworks, and dataset benchmarks.
3. **Interactive 2D Semantic Prior Art Space** mapping proximity between candidate works and user hypotheses.
4. **Automated Literature Synthesis & BibTeX Repository** generating structured comparison tables, limitation audits, and Related Work drafts.

---

## ✨ Key Features

### 1. Topic Formulation & Research Gap Discovery
- **High-Impact Hypotheses**: Generate publishable, technically rigorous paper directions with clear motivations and target venues (NeurIPS, ICML, CVPR, ICLR).
- **Frontier Landscape Analysis**: Synthesizes the current academic consensus and top paradigm shifts in any specified sub-field.
- **Open Technical Bottlenecks**: Explicitly highlights unsolved engineering and theoretical obstacles to tackle.
- **One-Click Prior Art Transfer**: Immediately send formulated topics to the similarity workbench with pre-seeded literature queries.

### 2. Paper Similarity & Prior Art Studio
- **Multi-Dimensional Breakdown**:
  - **Methodological & Algorithmic Similarity (0–100%)**: Examines algorithmic mechanisms, loss functions, routing policies, and architectures.
  - **Problem Domain & Task Similarity (0–100%)**: Evaluates shared target tasks, objectives, and application boundaries.
  - **Theoretical & Mathematical Overlap (0–100%)**: Compares underlying formalisms, proofs, and optimization assumptions.
  - **Dataset & Benchmark Overlap (0–100%)**: Audits evaluation pipelines and baseline suites.
- **Novelty Index & Scoop Risk**: Classifies novelty (*Substantially Novel*, *Meaningful Incremental Advance*, *Heavily Saturated*) with tactical reviewer defense guidance.
- **Shared Ground vs. Divergence**: Granular side-by-side lists of shared concepts vs. your unique technical innovations.
- **Citation Stance Recommendations**: Suggests how to position each paper in your manuscript (e.g., *Primary baseline to outperform*, *Foundational theory to cite in Related Work*, *Orthogonal comparison*).

### 3. Interactive 2D Semantic Prior Art Space
- Visualizes the research space using a 2D projection:
  - **X-Axis**: Methodological & Algorithmic Overlap (0% to 100%)
  - **Y-Axis**: Problem Domain Overlap (0% to 100%)
- Real-time quadrant categorization (*Direct Competitors*, *Cross-Domain Method Transfer*, *Same Domain / Different Tech*, *Orthogonal Literature*).
- Interactive hover cards detailing proximity metrics, citation stance, and direct PDF links.

### 4. Literature Matrix & Synthesis Studio
- **Structured Matrix Table**: Cross-examines all papers across Core Mechanisms, Datasets, Identified Limitations, and Relevance.
- **Automated Related Work Draft**: Peer-review grade narrative synthesis written in Markdown with in-text citation keys (`[Author et al., Year]`).
- **BibTeX Repository**: Ready-to-copy `.bib` file containing complete citation records for all analyzed papers.
- **CSV Data Export**: Export the full literature matrix for spreadsheet analysis.

### 5. ArXiv Live Explorer
- Real-time search against the official ArXiv Atom API (`export.arxiv.org/api/query`).
- Filter by primary categories (`cs.AI`, `cs.LG`, `cs.CL`, `cs.CV`, `cs.RO`, `q-bio`, `stat.ML`).
- Direct access to official ArXiv abstracts and full PDF downloads.
- Seamlessly set any paper as your "Target Work" or add it to the comparison benchmark pool.

### 6. Draft Anatomy Extractor
- Paste raw draft paragraphs, introduction sections, grant pitches, or PDF text excerpts.
- Automatically parses and structures the working title, core abstract, problem statement, and targeted search keywords.

---

## 🛠 Tech Stack & Architecture

- **Frontend**:
  - React 19 (Hooks, Functional Architecture)
  - TypeScript (Strict typing for academic entities)
  - Tailwind CSS v4 (Domain-native academic typography and design discipline)
  - Lucide React (Clean icon set)
- **Backend & Middleware**:
  - Node.js & Express
  - Vite dev server middleware integration
  - Robust XML feed parser for ArXiv Atom feeds
- **AI & Semantic Intelligence**:
  - `@google/genai` TypeScript SDK (Server-side architecture)
  - Model: `gemini-3.8-flash` for multi-dimensional similarity computation, topic formulation, and narrative synthesis
  - Strict JSON schemas for consistent bibliometric representations

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- `GEMINI_API_KEY` (configured in your environment or `.env` file)

### Installation

```bash
# Clone or navigate to the project directory
cd scholarpulse-research-paper-finder

# Install dependencies
npm install
```

### Environment Configuration

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY="your_gemini_api_key_here"
PORT=3000
```

### Running Locally

```bash
# Start the full-stack Express development server with Vite middleware
npm run dev

# Open your browser at http://localhost:3000
```

### Production Build

```bash
# Build production client bundle
npm run build

# Start production server
npm run start
```

---

## 📡 API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/arxiv/search` | `GET` | Queries the live ArXiv Atom API by keywords, category, and sort order. |
| `/api/topics/explore` | `POST` | Proposes 5 structured research topics and analyzes current frontier paradigms. |
| `/api/similarity/analyze` | `POST` | Computes 4D similarity scores, novelty index, research gaps, and defense advice. |
| `/api/literature/synthesize` | `POST` | Generates a structured comparison matrix, BibTeX entries, and Related Work narrative. |
| `/api/paper/extract` | `POST` | Extracts academic anatomy (title, abstract, keywords) from raw text. |

---

## 👤 Author

**Gaurav Parate**  
- Email: [gauravparate746@gmail.com](mailto:gauravparate746@gmail.com)  
- Project: ScholarPulse — Research Paper Topic & Similarity Finder  

---

## 📄 License

Apache-2.0 License. Designed for academic and research workflows.
