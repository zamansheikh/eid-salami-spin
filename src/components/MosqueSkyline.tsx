/**
 * A decorative golden mosque skyline silhouette — domes, minarets and ball
 * finials — drawn as inline SVG so it captures cleanly in downloaded cards.
 */

/** Onion-dome path: bulges out from the base then tapers to a point. */
function onion(cx: number, baseY: number, r: number, h: number) {
  return (
    `M${cx - r},${baseY} ` +
    `C${cx - r},${baseY - h * 0.45} ${cx - r * 0.7},${baseY - h * 0.98} ${cx},${baseY - h} ` +
    `C${cx + r * 0.7},${baseY - h * 0.98} ${cx + r},${baseY - h * 0.45} ${cx + r},${baseY} Z`
  );
}

export default function MosqueSkyline({ className }: { className?: string }) {
  const B = 92; // baseline

  return (
    <svg
      viewBox="0 0 480 96"
      className={className}
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="mosqueGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe79b" />
          <stop offset="55%" stopColor="#f5c542" />
          <stop offset="100%" stopColor="#a9760c" />
        </linearGradient>
      </defs>

      <g fill="url(#mosqueGold)">
        {/* ground */}
        <rect x="0" y={B - 2} width="480" height="8" />

        {/* left minaret */}
        <rect x="47" y="38" width="9" height={B - 38} />
        <rect x="43" y="50" width="17" height="3" />
        <rect x="43" y="68" width="17" height="3" />
        <path d={onion(51.5, 38, 7, 15)} />
        <rect x="50.5" y="16" width="2" height="9" />
        <circle cx="51.5" cy="14" r="3" />

        {/* right minaret (mirror) */}
        <rect x="424" y="38" width="9" height={B - 38} />
        <rect x="420" y="50" width="17" height="3" />
        <rect x="420" y="68" width="17" height="3" />
        <path d={onion(428.5, 38, 7, 15)} />
        <rect x="427.5" y="16" width="2" height="9" />
        <circle cx="428.5" cy="14" r="3" />

        {/* flanking buildings + domes */}
        <rect x="110" y="64" width="64" height={B - 64} />
        <path d={onion(142, 64, 17, 20)} />
        <rect x="306" y="64" width="64" height={B - 64} />
        <path d={onion(338, 64, 17, 20)} />

        {/* central grand mosque */}
        <rect x="186" y="54" width="108" height={B - 54} />
        {/* small flanking domes */}
        <path d={onion(206, 54, 13, 17)} />
        <path d={onion(274, 54, 13, 17)} />
        {/* great central dome */}
        <path d={onion(240, 54, 33, 40)} />
        {/* central spire + finial */}
        <rect x="238" y="6" width="4" height="10" />
        <circle cx="240" cy="5" r="3.4" />

        {/* arched gateway (cut as a darker notch via opacity) */}
        <path
          d="M232,92 L232,74 C232,66 248,66 248,74 L248,92 Z"
          fill="#3a1a52"
          fillOpacity="0.55"
        />
      </g>
    </svg>
  );
}
