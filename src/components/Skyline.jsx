/*
  World Skyline in gold line art for Bharat Connect 2026.
  A grand panoramic horizon uniting Bharat, the Arab world, and global capitals:
  - Dubai: Burj Khalifa on the far left (Setback tiers to the spire)
  - New Delhi: Qutub Minar, Lotus Temple
  - Kyoto: Kiyomizu-dera (Pagoda & Timber Stage)
  - Singapore: Marina Bay Sands (Towers & SkyPark)
  - The Gulf: Burj Al Arab, Kingdom Centre Riyadh, Grand Mosque
  - London: London Tower Bridge (Twin Gothic towers, walkway & suspension cables)
  - Paris: Eiffel Tower (Parabolic base, platforms & lattice spire)
  - New York: Statue of Liberty (Star pedestal, robed figure, radiate crown & torch)
  - Toronto: CN Tower (Flared base, slender shaft, SkyPod radome & mast)
  - New Delhi: India Gate on the far right (lit up: climbing glow, level flashes, flame)

  Every path uses pathLength="1" for seamless CSS drawing animation (see .skyline in index.css).
*/

// Burj Khalifa: stepped setbacks narrowing to the spire, centred on x = 110 (far left)
const BURJ =
  'M70 400 V332 H77 V266 H84 V206 H90 V156 H95 V116 H99 V86 H103 V64 H106 L109.4 6 H110.6 ' +
  'L114 64 H117 V86 H121 V116 H125 V156 H130 V206 H136 V266 H143 V332 H150 V400 Z';

// India Gate: line drawing, plus a closed silhouette (arch cut out) for the light show; centred on x = 1790 (far right)
const GATE_LINES =
  'M1698 400 V235 H1882 V400 M1689 235 H1891 M1707 235 V210 H1873 V235 M1744 400 V299 A46 46 0 0 1 1836 299 V400 M1772 210 V195 H1808 V210';
const GATE =
  'M1698 400 V237 H1689 V233 H1707 V210 H1772 V195 H1808 V210 H1873 V233 H1891 V237 H1882 V400 H1836 V299 ' +
  'A46 46 0 0 0 1744 299 V400 Z';

// Gate levels, bottom to top, for the tier flashes: [x, top y, width]
const TIERS = [
  [1698, 299, 184],
  [1698, 237, 184],
  [1689, 233, 202],
  [1707, 210, 166],
  [1772, 195, 36],
];

const LANDMARKS = [
  // ── Baseline Ground & Low City Silhouette ──────────────────────────
  { d: 'M0 399.5 H1920', delay: 0, w: 1 },
  {
    d: 'M16 400 V374 H42 V386 M188 400 V378 H214 V390 M268 400 V372 H294 V384 M454 400 V376 H482 V366 M604 400 V380 H632 V370 M808 400 V374 H828 V386 M904 400 V380 H924 M1004 400 V370 H1028 V385 M1124 400 V376 H1144 M1322 400 V372 H1344 V386 M1448 400 V376 H1472 M1538 400 V370 H1562 V386 M1618 400 V366 H1646 V380 H1672 V400 M1900 400 V372 H1920',
    delay: 0.15,
    w: 1,
    faint: true,
  },

  // ── 1. Dubai: Burj Khalifa (Setback tiers to the spire) ────────────
  { d: BURJ, delay: 0.28 },

  // ── 2. New Delhi: Qutub Minar (fluted, tapering with balconies) ─────
  {
    d: 'M220 400 L232 150 H248 L260 400 Z M218 330 H262 M222 270 H258 M226 214 H254 M229 176 H251 M236 150 V138 H244 V150 M240 400 V150',
    delay: 0.38,
  },

  // ── 3. New Delhi: Lotus Temple (interlocking marble petal arches) ───
  {
    d: 'M300 400 H450 M310 400 Q342 330 375 300 Q408 330 440 400 M330 400 Q350 345 375 318 Q400 345 420 400 M350 400 Q362 360 375 340 Q388 360 400 400',
    delay: 0.48,
  },

  // ── 4. Kyoto: Kiyomizu-dera (Cliff Stage, 3-Tier Pagoda & Sorin) ────
  {
    d: 'M505 400 V340 M525 400 V340 M545 400 V340 M565 400 V340 M585 400 V340 M500 375 H590 M500 355 H590 M495 340 H595 M505 400 L525 375 M525 400 L505 375 M545 400 L565 375 M565 400 L545 375 M492 340 V332 H598 V340 M496 332 V326 H594 V332 M484 322 Q545 330 606 322 L596 310 Q545 315 494 310 Z M512 310 V275 H578 V310 M530 310 V285 H560 V310 M494 275 Q545 282 596 275 L586 264 Q545 269 504 264 Z M518 264 V232 H572 V264 M535 264 V242 H555 V264 M504 232 Q545 238 586 232 L576 220 Q545 225 514 220 Z M525 220 L545 200 L565 220 Z M545 200 V152 M541 193 H549 M541 187 H549 M541 181 H549 M541 175 H549 M541 169 H549 M541 163 H549 M545 152 A3 3 0 1 0 545 146 A3 3 0 1 0 545 152',
    delay: 0.58,
  },

  // ── 5. Singapore: Marina Bay Sands (3 Curved Towers & SkyPark Deck) ─
  {
    d: 'M652 400 L660 280 L663 200 M676 400 L673 280 L671 200 M660 400 L665 300 L670 400 M656 350 H672 M660 280 H673 M662 230 H672 M704 400 L709 280 L712 200 M728 400 L725 280 L722 200 M712 400 L716 300 L720 400 M707 350 H725 M710 280 H724 M712 230 H722 M754 400 L759 280 L762 200 M780 400 L775 280 L772 200 M762 400 L766 300 L770 400 M757 350 H777 M760 280 H774 M762 230 H772 M636 195 Q644 205 670 204 L775 204 Q795 204 806 198 M636 195 H806 M636 195 Q634 188 640 182 H802 Q806 188 806 198 M644 182 V177 H692 V182 M707 182 V177 H750 V182 M765 182 V175 H798 V182 M668 177 L665 171 M668 177 L671 171 M732 177 L729 171 M732 177 L735 171',
    delay: 0.68,
  },

  // ── 6. Dubai: Burj Al Arab (Sail of the Gulf) ───────────────────────
  {
    d: 'M835 400 V214 M835 226 Q930 290 902 400 M835 292 Q875 320 880 400 M828 214 H842',
    delay: 0.78,
  },

  // ── 7. Riyadh: Kingdom Centre (The soaring parabolic arch) ─────────
  {
    d: 'M930 400 L940 188 Q965 238 990 188 L1000 400 Z M953 240 H977',
    delay: 0.86,
  },

  // ── 8. Arab World: Grand Mosque (Dome, Crescent & Minaret) ─────────
  {
    d: 'M1035 400 V350 Q1035 312 1065 300 Q1095 312 1095 350 V400 M1065 300 V288 M1110 400 V252 M1120 400 V252 M1106 252 H1124 M1108 286 H1122 M1110 252 L1115 236 L1120 252',
    delay: 0.94,
  },

  // ── 9. London: Tower Bridge (Twin Gothic Towers, Walkways & Cables) ─
  {
    d: 'M1168 400 V365 H1207 V400 M1178 365 V342 A5 5 0 0 1 1197 342 V365 M1172 365 V280 H1203 V365 M1169 280 H1206 M1172 280 V240 H1203 V280 M1170 240 L1187.5 208 L1205 240 M1187.5 208 V195 M1170 240 V232 M1205 240 V232 M1182 262 H1193 M1182 254 H1193 M1248 400 V365 H1287 V400 M1258 365 V342 A5 5 0 0 1 1277 342 V365 M1252 365 V280 H1283 V365 M1249 280 H1286 M1252 280 V240 H1283 V280 M1250 240 L1267.5 208 L1285 240 M1267.5 208 V195 M1250 240 V232 M1285 240 V232 M1262 262 H1273 M1262 254 H1273 M1203 248 H1252 M1203 252 H1252 M1203 262 H1252 M1203 266 H1252 M1210 252 L1217 262 M1223 252 L1230 262 M1238 252 L1245 262 M1140 368 H1315 M1205 368 L1227.5 368 M1227.5 368 L1250 368 M1140 368 Q1155 330 1172 280 M1150 368 V346 M1161 368 V316 M1283 280 Q1300 330 1315 368 M1294 316 V368 M1305 346 V368',
    delay: 1.02,
  },

  // ── 10. Paris: Eiffel Tower (Parabolic arch base, platforms, spire) ─
  {
    d: 'M1350 400 Q1372 340 1382 305 M1372 400 Q1382 350 1388 305 M1406 305 Q1412 350 1422 400 M1412 305 Q1422 340 1444 400 M1372 400 Q1397 335 1422 400 M1376 400 Q1397 345 1418 400 M1360 380 L1380 340 M1369 340 L1377 380 M1434 380 L1414 340 M1425 340 L1417 380 M1376 305 H1418 M1374 298 H1420 M1376 305 V298 M1418 305 V298 M1384 298 L1391 218 M1410 298 L1403 218 M1386 280 L1408 250 M1408 280 L1386 250 M1385 265 H1409 M1389 218 H1405 M1387 212 H1407 M1389 218 V212 M1405 218 V212 M1392 212 L1396 85 M1402 212 L1398 85 M1393 180 H1401 M1394 155 H1400 M1395 130 H1399 M1395.5 105 H1398.5 M1395 85 H1399 V72 H1395 Z M1397 72 V48',
    delay: 1.12,
  },

  // ── 11. New York: Statue of Liberty (Pedestal, crown rays & torch) ──
  {
    d: 'M1478 400 L1483 388 H1527 L1532 400 M1485 388 V368 H1525 V388 M1488 368 V324 H1522 V368 M1486 324 H1524 M1487 348 H1523 M1493 348 V332 M1501 348 V332 M1509 348 V332 M1517 348 V332 M1490 324 V314 H1520 V324 M1486 314 H1524 M1497 314 L1496 270 Q1495 240 1501 226 L1505 212 L1509 226 Q1515 240 1514 270 L1513 314 M1501 270 Q1504 292 1503 314 M1507 252 Q1510 282 1509 314 M1509 235 L1517 248 V262 H1511 L1509 250 M1502 212 Q1505 205 1508 212 M1499 207 L1500 201 L1502 206 L1503 198 L1505 205 L1507 198 L1508 206 L1510 201 L1511 207 M1501 230 L1496 200 L1491 175 H1495 L1499 198 L1503 226 M1489 175 H1497 M1490 175 V170 H1496 V175 M1493 170 Q1488 162 1493 152 Q1498 162 1493 170 Z',
    delay: 1.22,
  },

  // ── 12. Toronto: CN Tower (Tripod base, SkyPod observation & mast) ──
  {
    d: 'M1572 400 L1584 230 M1608 400 L1596 230 M1587 400 V230 M1593 400 V230 M1576 350 H1604 M1580 290 H1600 M1585 230 V198 H1595 V230 M1585 198 L1573 186 V172 L1586 162 M1595 198 L1607 186 V172 L1594 162 M1573 179 H1607 M1574 175 H1606 M1587 162 V132 H1593 V162 M1585 132 L1581 126 V120 L1587 116 M1595 132 L1599 126 V120 L1593 116 M1581 123 H1599 M1588 116 V40 H1592 V116 M1590 40 V24 M1586 95 H1594 M1586 75 H1594 M1587 55 H1593',
    delay: 1.32,
  },

  // (13. New Delhi: India Gate is drawn with its light show below the landmarks)
];

export default function Skyline({ play = true, className = '' }) {
  return (
    <svg
      className={`skyline ${play ? 'is-playing' : ''} ${className}`}
      viewBox="0 0 1920 400"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
    >
      <defs>
        <clipPath id="gate-clip">
          <path d={GATE} />
        </clipPath>
        <linearGradient id="gate-band" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#FF6F5E" stopOpacity="0" />
          <stop offset="0.35" stopColor="#FF6F5E" stopOpacity="0.85" />
          <stop offset="0.6" stopColor="#F3D48F" stopOpacity="1" />
          <stop offset="1" stopColor="#F3D48F" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="gate-body" x1="0" y1="1" x2="0" y2="0">
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

      {/* ── 13. New Delhi: India Gate (Body, Climb Light Show, Flame) ─── */}
      <g className="lit">
        <path className="lit-body" d={GATE} fill="url(#gate-body)" />
        <g clipPath="url(#gate-clip)">
          <rect className="lit-band" x="1685" y="400" width="210" height="110" fill="url(#gate-band)" />
          {TIERS.map(([x, y, w], i) => (
            <rect
              key={y}
              className="lit-tier"
              x={x}
              y={y}
              width={w}
              height={(i === 0 ? 400 : TIERS[i - 1][1]) - y}
              fill="#F3D48F"
              style={{ '--i': i }}
            />
          ))}
        </g>
        <path className="sky-draw lit-line" d={GATE_LINES} pathLength="1" style={{ '--d': '1.42s' }} />
        <circle className="lit-beacon" cx="1790" cy="192" r="3" fill="#FF6F5E" />
      </g>
    </svg>
  );
}
