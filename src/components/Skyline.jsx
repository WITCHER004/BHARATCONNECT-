/*
  Twin skyline in gold line art: New Delhi on the left, the Gulf on the right, led by the Burj Khalifa.
  When `play` turns true the outlines draw in, then the Burj's facade light show starts:
  a band of gold and coral light climbs the tower and its setbacks flash in turn, like the New Year display.
  Every path uses pathLength="1" so the draw-in is pure CSS (see .skyline in index.css).
*/

// Burj Khalifa: stepped setbacks narrowing to the spire, centred on x = 1340
const BURJ =
  'M1300 400 V332 H1307 V266 H1314 V206 H1320 V156 H1325 V116 H1329 V86 H1333 V64 H1336 L1339.4 6 H1340.6 ' +
  'L1344 64 H1347 V86 H1351 V116 H1355 V156 H1360 V206 H1366 V266 H1373 V332 H1380 V400 Z';

// setback levels, bottom to top, for the tier flashes
const TIERS = [
  [1300, 332, 80], [1307, 266, 66], [1314, 206, 52], [1320, 156, 40],
  [1325, 116, 30], [1329, 86, 22], [1333, 64, 14],
];

const LANDMARKS = [
  // ground and low city blocks
  { d: 'M0 399.5 H1440', delay: 0, w: 1 },
  { d: 'M20 400 V372 H60 V384 H96 V366 H112 V400 M262 400 V378 H296 V388 M366 400 V370 H402 V384 H420 M610 400 V376 H652 V364 H690 V386 H730 V372 H770 V400 M790 400 V380 H836 V368 H880 V388 M1236 400 V370 H1262 V384 H1290 M1392 400 V366 H1420 V380 H1440', delay: 0.2, w: 1, faint: true },

  // New Delhi: India Gate
  { d: 'M120 400 V292 H240 V400 M114 292 H246 M126 292 V276 H234 V292 M150 400 V334 A30 30 0 0 1 210 334 V400 M168 276 V266 H192 V276', delay: 0.35 },
  // Qutub Minar: fluted, tapering, ringed with balconies
  { d: 'M310 400 L322 150 H338 L350 400 Z M308 330 H352 M312 270 H348 M316 214 H344 M319 176 H341 M326 150 V138 H334 V150 M330 400 V150', delay: 0.5 },
  // Lotus Temple: three rings of petals
  { d: 'M420 400 H600 M430 400 Q470 330 510 300 Q550 330 590 400 M455 400 Q480 345 510 318 Q540 345 565 400 M480 400 Q495 360 510 340 Q525 360 540 400', delay: 0.65 },

  // The Gulf: Burj Al Arab, the sail
  { d: 'M905 400 V214 M905 226 Q1000 290 972 400 M905 292 Q945 320 950 400 M898 214 H912', delay: 0.6 },
  // Kingdom Centre, Riyadh: the tower with the open arch
  { d: 'M1020 400 L1030 188 Q1055 238 1080 188 L1090 400 Z M1043 240 H1067', delay: 0.72 },
  // A mosque: dome and minaret
  { d: 'M1130 400 V350 Q1130 312 1160 300 Q1190 312 1190 350 V400 M1160 300 V288 M1205 400 V252 M1215 400 V252 M1201 252 H1219 M1203 286 H1217 M1205 252 L1210 236 L1215 252', delay: 0.84 },
];

export default function Skyline({ play = false, className = '' }) {
  return (
    <svg
      className={`skyline ${play ? 'is-playing' : ''} ${className}`}
      viewBox="0 0 1440 400"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
    >
      <defs>
        <clipPath id="burj-clip">
          <path d={BURJ} />
        </clipPath>
        <linearGradient id="burj-band" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#FF6F5E" stopOpacity="0" />
          <stop offset="0.35" stopColor="#FF6F5E" stopOpacity="0.85" />
          <stop offset="0.6" stopColor="#F3D48F" stopOpacity="1" />
          <stop offset="1" stopColor="#F3D48F" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="burj-body" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#D9B36A" stopOpacity="0.22" />
          <stop offset="1" stopColor="#D9B36A" stopOpacity="0.04" />
        </linearGradient>
      </defs>

      {LANDMARKS.map((l, i) => (
        <path
          key={i}
          className={`sky-draw ${l.faint ? 'sky-faint' : ''}`}
          d={l.d}
          pathLength="1"
          style={{ '--d': `${l.delay}s` }}
        />
      ))}

      {/* Burj Khalifa: body, light show, outline */}
      <g className="burj">
        <path className="burj-body" d={BURJ} fill="url(#burj-body)" />
        <g clipPath="url(#burj-clip)">
          <rect className="burj-band" x="1296" y="400" width="88" height="170" fill="url(#burj-band)" />
          {TIERS.map(([x, y, w], i) => (
            <rect
              key={y}
              className="burj-tier"
              x={x}
              y={y}
              width={w}
              height={i === 0 ? 68 : TIERS[i - 1][1] - y}
              fill="#F3D48F"
              style={{ '--i': i }}
            />
          ))}
        </g>
        <path className="sky-draw burj-line" d={BURJ} pathLength="1" style={{ '--d': '0.95s' }} />
        <circle className="burj-beacon" cx="1340" cy="6" r="3" fill="#FF6F5E" />
      </g>
    </svg>
  );
}
