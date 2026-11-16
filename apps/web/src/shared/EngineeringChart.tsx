import { useMemo, useState } from 'react';

export interface ChartSeries {
  id: string;
  label: string;
  color: string;
  dashed?: string;
  points: { x: number; y: number }[];
}

interface EngineeringChartProps {
  title: string;
  xLabel: string;
  yLabel: string;
  series: ChartSeries[];
  height?: number;
  equalAspect?: boolean;
}

export function EngineeringChart({
  title,
  xLabel,
  yLabel,
  series,
  height = 240,
  equalAspect = false,
}: EngineeringChartProps) {
  const [hoverX, setHoverX] = useState<number | null>(null);
  const width = 560;
  const padL = 56;
  const padR = 18;
  const padT = 20;
  const padB = 36;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const bounds = useMemo(() => {
    const allPts = series.flatMap((s) => s.points).filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
    if (allPts.length === 0) {
      return { minX: 0, maxX: 1, minY: 0, maxY: 1 };
    }
    let minX = Math.min(...allPts.map((p) => p.x));
    let maxX = Math.max(...allPts.map((p) => p.x));
    let minY = Math.min(...allPts.map((p) => p.y));
    let maxY = Math.max(...allPts.map((p) => p.y));
    if (Math.abs(maxX - minX) < 1e-6) {
      minX -= 1;
      maxX += 1;
    }
    if (Math.abs(maxY - minY) < 1e-6) {
      minY -= 1;
      maxY += 1;
    }
    const dy = (maxY - minY) * 0.08;
    minY -= dy;
    maxY += dy;

    if (equalAspect) {
      const spanX = maxX - minX;
      const spanY = maxY - minY;
      const targetAspect = plotW / plotH;
      if (spanX / spanY < targetAspect) {
        const cx = 0.5 * (minX + maxX);
        const half = 0.5 * spanY * targetAspect;
        minX = cx - half;
        maxX = cx + half;
      } else {
        const cy = 0.5 * (minY + maxY);
        const half = (0.5 * spanX) / targetAspect;
        minY = cy - half;
        maxY = cy + half;
      }
    }
    return { minX, maxX, minY, maxY };
  }, [series, equalAspect, plotW, plotH]);

  const mapX = (x: number) => padL + ((x - bounds.minX) / (bounds.maxX - bounds.minX)) * plotW;
  const mapY = (y: number) => padT + plotH - ((y - bounds.minY) / (bounds.maxY - bounds.minY)) * plotH;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => bounds.minY + t * (bounds.maxY - bounds.minY));
  const xTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => bounds.minX + t * (bounds.maxX - bounds.minX));

  return (
    <div className="kin-panel" style={{ overflow: 'hidden' }}>
      <div className="kin-panel-header" style={{ padding: '0.55rem 0.85rem' }}>
        <h4 className="kin-panel-title" style={{ fontSize: '0.78rem' }}>
          {title}
        </h4>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {series.map((s) => (
            <span
              key={s.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.72rem',
                color: 'var(--text-secondary)',
              }}
            >
              <span
                style={{
                  width: 12,
                  height: 3,
                  background: s.color,
                  display: 'inline-block',
                  borderRadius: 2,
                }}
              />
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <div style={{ padding: '0.35rem 0.5rem 0.5rem' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = ((e.clientX - rect.left) / rect.width) * width;
            if (relX >= padL && relX <= width - padR) {
              const dataX = bounds.minX + ((relX - padL) / plotW) * (bounds.maxX - bounds.minX);
              setHoverX(dataX);
            } else {
              setHoverX(null);
            }
          }}
          onMouseLeave={() => setHoverX(null)}
        >
          {/* Grid */}
          {yTicks.map((val, i) => {
            const py = mapY(val);
            return (
              <g key={`yt-${i}`}>
                <line x1={padL} y1={py} x2={width - padR} y2={py} stroke="#1f2735" strokeWidth="1" />
                <text
                  x={padL - 6}
                  y={py + 3}
                  textAnchor="end"
                  fill="#7b879b"
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                >
                  {Math.abs(val) >= 1000 ? val.toFixed(0) : Math.abs(val) >= 10 ? val.toFixed(1) : val.toFixed(2)}
                </text>
              </g>
            );
          })}
          {xTicks.map((val, i) => {
            const px = mapX(val);
            return (
              <g key={`xt-${i}`}>
                <line x1={px} y1={padT} x2={px} y2={padT + plotH} stroke="#1f2735" strokeWidth="1" />
                <text
                  x={px}
                  y={height - 14}
                  textAnchor="middle"
                  fill="#7b879b"
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                >
                  {Math.abs(val) >= 100 ? val.toFixed(0) : val.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Axes border */}
          <rect
            x={padL}
            y={padT}
            width={plotW}
            height={plotH}
            fill="none"
            stroke="#2f3b4e"
            strokeWidth="1"
          />

          {/* Zero line */}
          {bounds.minY < 0 && bounds.maxY > 0 && (
            <line
              x1={padL}
              y1={mapY(0)}
              x2={width - padR}
              y2={mapY(0)}
              stroke="#3b495f"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
          )}

          {/* Series paths */}
          {series.map((s) => {
            const valid = s.points.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
            if (valid.length === 0) return null;
            const d = valid
              .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${mapX(p.x).toFixed(2)} ${mapY(p.y).toFixed(2)}`)
              .join(' ');
            return (
              <path
                key={s.id}
                d={d}
                fill="none"
                stroke={s.color}
                strokeWidth="2.1"
                strokeDasharray={s.dashed}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            );
          })}

          {/* Hover cursor */}
          {hoverX !== null && (
            <line
              x1={mapX(hoverX)}
              y1={padT}
              x2={mapX(hoverX)}
              y2={padT + plotH}
              stroke="rgba(0,229,255,0.45)"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
          )}

          {/* Axis Labels */}
          <text x={padL + plotW / 2} y={height - 2} textAnchor="middle" fill="#a8b3c5" fontSize="10">
            {xLabel}
          </text>
          <text
            x={13}
            y={padT + plotH / 2}
            textAnchor="middle"
            fill="#a8b3c5"
            fontSize="10"
            transform={`rotate(-90 13 ${padT + plotH / 2})`}
          >
            {yLabel}
          </text>
        </svg>
      </div>
    </div>
  );
}
