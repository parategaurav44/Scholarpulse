import React, { useState } from 'react';
import { TargetResearchWork, PaperSimilarityDetail, ArxivPaper } from '../types';

interface SemanticMapProps {
  targetWork: TargetResearchWork;
  paperComparisons: PaperSimilarityDetail[];
  candidatePapers: ArxivPaper[];
  onSelectPaper?: (paper: ArxivPaper) => void;
}

export const SemanticMap: React.FC<SemanticMapProps> = ({
  targetWork,
  paperComparisons,
  candidatePapers,
  onSelectPaper,
}) => {
  const [hoveredPaperId, setHoveredPaperId] = useState<string | null>(null);

  // Map width and height
  const width = 640;
  const height = 360;
  const padding = 50;

  // Coordinate scales
  // X: Methodology Score (0 to 100) -> [padding, width - padding]
  // Y: Problem Domain Score (0 to 100) -> [height - padding, padding] (inverted for SVG)
  const getX = (score: number) => padding + (score / 100) * (width - 2 * padding);
  const getY = (score: number) => height - padding - (score / 100) * (height - 2 * padding);

  const targetCoords = { x: getX(50), y: getY(50) };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High Overlap':
        return '#e11d48'; // Rose-600 (Prior art risk)
      case 'Moderate Overlap':
        return '#d97706'; // Amber-600
      case 'Low Overlap':
        return '#0284c7'; // Sky-600
      default:
        return '#059669'; // Emerald-600
    }
  };

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-editorial text-xl font-bold text-stone-900">
            Semantic Prior Art Space
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            2D projection mapping Methodological Overlap (X) vs. Problem Domain Overlap (Y) relative to Target Work
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-stone-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>High Overlap</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Direct Baseline</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span>Complementary</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-900 ring-2 ring-amber-400"></span>
            <span className="font-medium text-stone-900">Target Idea</span>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden border border-stone-100 rounded-md bg-stone-50/60">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none font-sans"
        >
          {/* Subtle Grid Lines */}
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={height - padding}
            stroke="#e7e5e4"
            strokeWidth="1"
          />
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="#e7e5e4"
            strokeWidth="1"
          />
          <line
            x1={width / 2}
            y1={padding}
            x2={width / 2}
            y2={height - padding}
            stroke="#f5f5f4"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <line
            x1={padding}
            y1={height / 2}
            x2={width - padding}
            y2={height / 2}
            stroke="#f5f5f4"
            strokeDasharray="4 4"
            strokeWidth="1"
          />

          {/* Quadrant Labels */}
          <text
            x={width - padding - 8}
            y={padding + 16}
            textAnchor="end"
            className="text-[10px] fill-stone-400 font-mono"
          >
            Direct Competitors / Saturated
          </text>
          <text
            x={padding + 8}
            y={padding + 16}
            textAnchor="start"
            className="text-[10px] fill-stone-400 font-mono"
          >
            Same Domain · Different Tech
          </text>
          <text
            x={width - padding - 8}
            y={height - padding - 10}
            textAnchor="end"
            className="text-[10px] fill-stone-400 font-mono"
          >
            Cross-Domain Method Transfer
          </text>
          <text
            x={padding + 8}
            y={height - padding - 10}
            textAnchor="start"
            className="text-[10px] fill-stone-400 font-mono"
          >
            Orthogonal Literature
          </text>

          {/* Axis Titles */}
          <text
            x={width / 2}
            y={height - 12}
            textAnchor="middle"
            className="text-xs fill-stone-600 font-medium"
          >
            Methodological & Algorithmic Overlap → (0% to 100%)
          </text>

          <text
            x={-(height / 2)}
            y={16}
            transform="rotate(-90)"
            textAnchor="middle"
            className="text-xs fill-stone-600 font-medium"
          >
            Problem Domain & Task Overlap → (0% to 100%)
          </text>

          {/* Lines connecting Candidate Papers to Target Work */}
          {paperComparisons.map(comp => {
            const mScore = comp.breakdown?.methodologyScore ?? comp.overallSimilarityScore;
            const pScore = comp.breakdown?.problemDomainScore ?? comp.overallSimilarityScore;
            const cx = getX(mScore);
            const cy = getY(pScore);
            const isHovered = hoveredPaperId === comp.paperId;

            return (
              <line
                key={`line-${comp.paperId}`}
                x1={cx}
                y1={cy}
                x2={targetCoords.x}
                y2={targetCoords.y}
                stroke={isHovered ? '#1c1917' : '#d6d3d1'}
                strokeWidth={isHovered ? 1.5 : 1}
                strokeDasharray={isHovered ? 'none' : '3 3'}
                opacity={isHovered ? 0.9 : 0.4}
              />
            );
          })}

          {/* Target Work Center Marker */}
          <g>
            <circle
              cx={targetCoords.x}
              cy={targetCoords.y}
              r={11}
              fill="#1c1917"
              stroke="#fbbf24"
              strokeWidth="2.5"
            />
            <text
              x={targetCoords.x}
              y={targetCoords.y + 4}
              textAnchor="middle"
              className="text-[10px] fill-white font-bold pointer-events-none"
            >
              ★
            </text>
            <text
              x={targetCoords.x}
              y={targetCoords.y - 16}
              textAnchor="middle"
              className="text-[11px] font-semibold fill-stone-900"
            >
              Target Work
            </text>
          </g>

          {/* Candidate Paper Nodes */}
          {paperComparisons.map(comp => {
            const paper = candidatePapers.find(p => p.arxivId === comp.paperId || p.id === comp.paperId);
            const mScore = comp.breakdown?.methodologyScore ?? comp.overallSimilarityScore;
            const pScore = comp.breakdown?.problemDomainScore ?? comp.overallSimilarityScore;
            const cx = getX(mScore);
            const cy = getY(pScore);
            const isHovered = hoveredPaperId === comp.paperId;
            const color = getRiskColor(comp.priorArtRisk);
            const radius = Math.max(7, Math.min(14, (comp.overallSimilarityScore / 100) * 12 + 6));

            return (
              <g
                key={comp.paperId}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredPaperId(comp.paperId)}
                onMouseLeave={() => setHoveredPaperId(null)}
                onClick={() => paper && onSelectPaper && onSelectPaper(paper)}
              >
                {/* Glow ring when hovered */}
                {isHovered && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={radius + 6}
                    fill={color}
                    opacity="0.25"
                  />
                )}

                <circle
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth="2"
                  opacity={isHovered ? 1 : 0.85}
                />

                <text
                  x={cx}
                  y={cy + 3}
                  textAnchor="middle"
                  className="text-[9px] fill-white font-mono font-bold pointer-events-none"
                >
                  {comp.overallSimilarityScore}%
                </text>

                {/* Short Paper Label */}
                <text
                  x={cx}
                  y={cy + radius + 11}
                  textAnchor="middle"
                  className={`text-[9px] pointer-events-none transition-colors ${
                    isHovered ? 'fill-stone-900 font-semibold' : 'fill-stone-500'
                  }`}
                >
                  {paper
                    ? paper.title.length > 20
                      ? `${paper.title.slice(0, 18)}...`
                      : paper.title
                    : comp.paperId}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Details Card (Bottom overlay) */}
        {hoveredPaperId && (
          <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-xs border border-stone-200 rounded p-2.5 shadow-sm text-xs flex items-center justify-between transition-all">
            {(() => {
              const comp = paperComparisons.find(c => c.paperId === hoveredPaperId);
              const paper = candidatePapers.find(p => p.arxivId === hoveredPaperId || p.id === hoveredPaperId);
              if (!comp) return null;

              return (
                <div className="flex items-center justify-between w-full gap-4">
                  <div className="truncate">
                    <span className="font-semibold text-stone-900 mr-2">
                      {paper?.title || comp.paperId}
                    </span>
                    <span className="text-stone-500 font-mono">
                      (Method: {comp.breakdown?.methodologyScore}% · Domain: {comp.breakdown?.problemDomainScore}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-stone-600 font-medium">Role: {comp.citationRole}</span>
                    <span
                      className="px-2 py-0.5 rounded text-[11px] font-medium"
                      style={{
                        backgroundColor: `${getRiskColor(comp.priorArtRisk)}15`,
                        color: getRiskColor(comp.priorArtRisk),
                      }}
                    >
                      {comp.priorArtRisk}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};
