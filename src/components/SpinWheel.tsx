"use client";

import { useMemo } from "react";

type SpinWheelProps = {
  /** Formatted labels (e.g. "৳১০০") shown on each segment, clockwise from top. */
  labels: string[];
  /** Absolute rotation in degrees applied to the wheel. */
  rotation: number;
  /** Whether the wheel is currently spinning (drives the long easing transition). */
  spinning: boolean;
  /** Index of the winning segment — gets a celebratory highlight once landed. */
  winningIndex?: number | null;
  /** Index of the dazzling JACKPOT segment (radiant gold + star). */
  jackpotIndex?: number | null;
  /** Idle showcase mode — wheel slowly auto-rotates via CSS (ignores rotation). */
  idle?: boolean;
};

// Jewel-toned festival palette that cycles around the rim.
const SEGMENT_FILLS = [
  { base: "#4c1d95", glow: "#7c3aed" }, // royal violet
  { base: "#b4860f", glow: "#f5c542" }, // radiant gold
  { base: "#065f46", glow: "#10b981" }, // emerald
  { base: "#9f1239", glow: "#f43f5e" }, // ruby rose
];

const CX = 110;
const CY = 110;
const R = 104; // outer segment radius
const TEXT_R = 70; // radius at which labels sit

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180; // -90 so 0° points up
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function segmentPath(index: number, count: number) {
  const seg = 360 / count;
  const start = index * seg;
  const end = start + seg;
  const p1 = polar(CX, CY, R, start);
  const p2 = polar(CX, CY, R, end);
  const largeArc = seg > 180 ? 1 : 0;
  return `M ${CX} ${CY} L ${p1.x} ${p1.y} A ${R} ${R} 0 ${largeArc} 1 ${p2.x} ${p2.y} Z`;
}

export default function SpinWheel({
  labels,
  rotation,
  spinning,
  winningIndex,
  jackpotIndex,
  idle,
}: SpinWheelProps) {
  const count = Math.max(labels.length, 1);
  const seg = 360 / count;

  // Decorative rim bulbs, one per segment boundary.
  const bulbs = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const p = polar(CX, CY, R + 4.5, i * seg);
        return { x: p.x, y: p.y, key: i };
      }),
    [count, seg]
  );

  return (
    <div className="wheel-wrap">
      {/* Fixed pointer at the top */}
      <div className="wheel-pointer" aria-hidden="true" />

      <div
        className={`wheel-stage${spinning ? " is-spinning" : ""}${idle ? " is-idle" : ""}`}
        style={idle ? undefined : { transform: `rotate(${rotation}deg)` }}
      >
        <svg viewBox="-12 -12 244 244" className="wheel-svg" role="img" aria-label="ঈদ সালামি ভাগ্য চাকা">
          <defs>
            {SEGMENT_FILLS.map((f, i) => (
              <radialGradient key={i} id={`segGrad-${i}`} cx="50%" cy="42%" r="85%">
                <stop offset="0%" stopColor={f.glow} />
                <stop offset="100%" stopColor={f.base} />
              </radialGradient>
            ))}
            <radialGradient id="jackpotGrad" cx="50%" cy="38%" r="85%">
              <stop offset="0%" stopColor="#fff7d6" />
              <stop offset="45%" stopColor="#ffd24a" />
              <stop offset="100%" stopColor="#c8860a" />
            </radialGradient>
            <radialGradient id="gloss" cx="50%" cy="30%" r="62%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
              <stop offset="38%" stopColor="rgba(255,255,255,0.08)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
            <radialGradient id="rimGrad" cx="50%" cy="50%" r="50%">
              <stop offset="86%" stopColor="#1a0f33" />
              <stop offset="100%" stopColor="#3a1a52" />
            </radialGradient>
            <filter id="bulbGlow" x="-150%" y="-150%" width="400%" height="400%">
              <feGaussianBlur stdDeviation="1.6" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer decorative ring */}
          <circle cx={CX} cy={CY} r={R + 9} fill="url(#rimGrad)" stroke="#f5c542" strokeWidth="2.5" />
          <circle
            cx={CX}
            cy={CY}
            r={R + 9}
            fill="none"
            stroke="rgba(124,58,237,0.55)"
            strokeWidth="1"
          />

          {/* Segments */}
          {labels.map((label, i) => {
            const isWin = winningIndex === i && !spinning;
            const isJackpot = jackpotIndex === i;
            const mid = i * seg + seg / 2;
            const tp = polar(CX, CY, TEXT_R, mid);
            const starP = polar(CX, CY, TEXT_R - 17, mid);
            const fill = isJackpot
              ? "url(#jackpotGrad)"
              : `url(#segGrad-${i % SEGMENT_FILLS.length})`;
            const cls = [isWin ? "seg-win" : "", isJackpot ? "seg-jackpot" : ""]
              .filter(Boolean)
              .join(" ");
            return (
              <g key={i}>
                <path
                  d={segmentPath(i, count)}
                  fill={fill}
                  stroke={isJackpot ? "rgba(255,247,214,0.9)" : "rgba(255,255,255,0.25)"}
                  strokeWidth={isJackpot ? 1 : 0.6}
                  className={cls || undefined}
                />
                {isJackpot && (
                  <text
                    x={starP.x}
                    y={starP.y}
                    fontSize={9}
                    textAnchor="middle"
                    dominantBaseline="central"
                    transform={`rotate(${mid} ${starP.x} ${starP.y})`}
                    style={{ pointerEvents: "none" }}
                  >
                    ⭐
                  </text>
                )}
                <text
                  x={tp.x}
                  y={tp.y}
                  fill={isJackpot ? "#3b2400" : "#fff8e8"}
                  fontSize={isJackpot ? 11.5 : count > 10 ? 9 : 11}
                  fontWeight={isJackpot ? 900 : 700}
                  textAnchor="middle"
                  dominantBaseline="central"
                  transform={`rotate(${mid} ${tp.x} ${tp.y})`}
                  style={{
                    pointerEvents: "none",
                    textShadow: isJackpot
                      ? "0 1px 1px rgba(255,255,255,0.4)"
                      : "0 1px 3px rgba(0,0,0,0.65)",
                  }}
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Glossy light sweep */}
          <circle cx={CX} cy={CY} r={R} fill="url(#gloss)" style={{ pointerEvents: "none" }} />

          {/* Rim bulbs */}
          {bulbs.map((b, i) => (
            <circle
              key={b.key}
              cx={b.x}
              cy={b.y}
              r={2.7}
              fill="#fff7d6"
              filter="url(#bulbGlow)"
              className="wheel-bulb"
              style={{ animationDelay: `${(i % 6) * 0.18}s` }}
            />
          ))}
        </svg>
      </div>

      {/* Center hub — counter-rotates so the crescent stays upright */}
      <div
        className={`wheel-hub${idle ? " is-idle" : ""}`}
        style={idle ? undefined : { transform: `translate(-50%, -50%) rotate(${-rotation}deg)` }}
      >
        <span className="wheel-hub-moon">🌙</span>
        <span className="wheel-hub-text">Eid Salami</span>
      </div>
    </div>
  );
}
