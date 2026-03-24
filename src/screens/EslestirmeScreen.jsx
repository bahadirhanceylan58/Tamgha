import { useState, useEffect, useRef, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { TAMGALAR, MITOLOJI, HAYVANLAR, BOLGELER, YADA_TASI } from '../data/tamgalar';
import { useAudio } from '../hooks/useAudio';

const TW = 44;
const TH = 55;
const GAP = 3;
const LOX = 5;
const LOY = 7;
const MAX_TEPSI = 4;

const MJ_GOKT_HARFLER = [
  '\u{10C00}','\u{10C09}','\u{10C1A}','\u{10C2D}','\u{10C03}',
  '\u{10C3A}','\u{10C23}','\u{10C43}','\u{10C32}','\u{10C0B}',
  '\u{10C1E}','\u{10C16}','\u{10C11}','\u{10C34}','\u{10C06}',
];
const ESLESTI_MS = 520;
const MAX_CAN = 3;

const SAMAN_SOZLERI = {
  mit_tengri: '⚡ TENGRİ! Gökyüzü gürlüyor!',
  mit_umay:   '🕊 UMAY ANA! Tepsi temizlendi!',
  mit_erlik:  '💀 ERLİK! Karanlık el süpürdü!',
  mit_ulgen:  '⭐ ÜLGEN IŞIĞI! +30 saniye!',
  mit_ak_ana: '🌟 AK ANA! Can geri döndü!',
  mit_kayra:  '📜 KAYRA HAN! +500 puan!',
  mit_mergen: '🎯 MERGEN! Çift otomatik eşleşti!',
};

// Gizli kelime havuzu (Göktürk harfleri)
const GK_KELIMELER = [
  { latin: 'AT',  harfler: ['\u{10C00}', '\u{10C43}'] },
  { latin: 'ER',  harfler: ['\u{10C00}', '\u{10C3C}'] },
  { latin: 'EL',  harfler: ['\u{10C00}', '\u{10C20}'] },
  { latin: 'SU',  harfler: ['\u{10C3D}', '\u{10C06}'] },
  { latin: 'KÜN', harfler: ['\u{10C1A}', '\u{10C07}', '\u{10C24}'] },
  { latin: 'KUT', harfler: ['\u{10C34}', '\u{10C06}', '\u{10C43}'] },
  { latin: 'BEG', harfler: ['\u{10C0B}', '\u{10C0F}'] },
  { latin: 'ÖD',  harfler: ['\u{10C07}', '\u{10C13}'] },
  { latin: 'YER', harfler: ['\u{10C18}', '\u{10C3C}'] },
];

// Bölüm 1-5: 90sn | 6-10: 110sn | 11-20: 130sn | 21-30: 120sn | 31-40: 105sn | 41-50: 90sn
// 12taş→95s | 16taş→110s | 22taş→130s | 26taş→140s | 30taş→150s | 36taş→150s
function bolumSuresi(bolum) {
  if (bolum <= 3)  return 120;  // 20 taş
  if (bolum <= 7)  return 150;  // 28 taş
  if (bolum <= 12) return 180;  // 36 taş
  if (bolum <= 20) return 210;  // 44 taş
  if (bolum <= 35) return 240;  // 52 taş
  return 270;                   // 60 taş
}
const OYUN_SURESI = 270; // fallback (sure barı için)
const TOPLAM_BOLUM = 50;

// Katmanlı düzenler — artan taş sayısı, Vita tarzı derinlik
// Her layout'ta l=0 taban, l=1 orta, l=2+ tepe katmanları var
const PIRAMIT_DUZENLER = [
  // 0: bolum 1-3 → 20 taş (10 çift), 2 katman
  [
    {r:0,c:0,l:0},{r:0,c:1,l:0},{r:0,c:2,l:0},{r:0,c:3,l:0},
    {r:1,c:0,l:0},{r:1,c:1,l:0},{r:1,c:2,l:0},{r:1,c:3,l:0},
    {r:2,c:0,l:0},{r:2,c:1,l:0},{r:2,c:2,l:0},{r:2,c:3,l:0},
    {r:3,c:0,l:0},{r:3,c:1,l:0},{r:3,c:2,l:0},{r:3,c:3,l:0},
    {r:1,c:1,l:1},{r:1,c:2,l:1},
    {r:2,c:1,l:1},{r:2,c:2,l:1},
  ],
  // 1: bolum 4-7 → 28 taş (14 çift), 3 katman
  [
    {r:0,c:0,l:0},{r:0,c:1,l:0},{r:0,c:2,l:0},{r:0,c:3,l:0},{r:0,c:4,l:0},
    {r:1,c:0,l:0},{r:1,c:1,l:0},{r:1,c:2,l:0},{r:1,c:3,l:0},{r:1,c:4,l:0},
    {r:2,c:0,l:0},{r:2,c:1,l:0},{r:2,c:2,l:0},{r:2,c:3,l:0},{r:2,c:4,l:0},
    {r:3,c:0,l:0},{r:3,c:1,l:0},{r:3,c:2,l:0},{r:3,c:3,l:0},{r:3,c:4,l:0},
    {r:0,c:2,l:1},{r:0,c:3,l:1},
    {r:1,c:2,l:1},{r:1,c:3,l:1},
    {r:2,c:2,l:1},{r:2,c:3,l:1},
    {r:3,c:2,l:1},{r:3,c:3,l:1},
  ],
  // 2: bolum 8-12 → 36 taş (18 çift), 3 katman
  [
    {r:0,c:0,l:0},{r:0,c:1,l:0},{r:0,c:2,l:0},{r:0,c:3,l:0},{r:0,c:4,l:0},
    {r:1,c:0,l:0},{r:1,c:1,l:0},{r:1,c:2,l:0},{r:1,c:3,l:0},{r:1,c:4,l:0},
    {r:2,c:0,l:0},{r:2,c:1,l:0},{r:2,c:2,l:0},{r:2,c:3,l:0},{r:2,c:4,l:0},
    {r:3,c:0,l:0},{r:3,c:1,l:0},{r:3,c:2,l:0},{r:3,c:3,l:0},{r:3,c:4,l:0},
    {r:0,c:1,l:1},{r:0,c:2,l:1},{r:0,c:3,l:1},
    {r:1,c:1,l:1},{r:1,c:2,l:1},{r:1,c:3,l:1},
    {r:2,c:1,l:1},{r:2,c:2,l:1},{r:2,c:3,l:1},
    {r:3,c:1,l:1},{r:3,c:2,l:1},{r:3,c:3,l:1},
    {r:1,c:2,l:2},{r:1,c:3,l:2},
    {r:2,c:2,l:2},{r:2,c:3,l:2},
  ],
  // 3: bolum 13-20 → 44 taş (22 çift), 3 katman
  [
    {r:0,c:0,l:0},{r:0,c:1,l:0},{r:0,c:2,l:0},{r:0,c:3,l:0},{r:0,c:4,l:0},{r:0,c:5,l:0},
    {r:1,c:0,l:0},{r:1,c:1,l:0},{r:1,c:2,l:0},{r:1,c:3,l:0},{r:1,c:4,l:0},{r:1,c:5,l:0},
    {r:2,c:0,l:0},{r:2,c:1,l:0},{r:2,c:2,l:0},{r:2,c:3,l:0},{r:2,c:4,l:0},{r:2,c:5,l:0},
    {r:3,c:0,l:0},{r:3,c:1,l:0},{r:3,c:2,l:0},{r:3,c:3,l:0},{r:3,c:4,l:0},{r:3,c:5,l:0},
    {r:0,c:1,l:1},{r:0,c:2,l:1},{r:0,c:3,l:1},{r:0,c:4,l:1},
    {r:1,c:1,l:1},{r:1,c:2,l:1},{r:1,c:3,l:1},{r:1,c:4,l:1},
    {r:2,c:1,l:1},{r:2,c:2,l:1},{r:2,c:3,l:1},{r:2,c:4,l:1},
    {r:3,c:1,l:1},{r:3,c:2,l:1},{r:3,c:3,l:1},{r:3,c:4,l:1},
    {r:1,c:2,l:2},{r:1,c:3,l:2},
    {r:2,c:2,l:2},{r:2,c:3,l:2},
  ],
  // 4: bolum 21-35 → 52 taş (26 çift), 3 katman
  [
    {r:0,c:0,l:0},{r:0,c:1,l:0},{r:0,c:2,l:0},{r:0,c:3,l:0},{r:0,c:4,l:0},{r:0,c:5,l:0},
    {r:1,c:0,l:0},{r:1,c:1,l:0},{r:1,c:2,l:0},{r:1,c:3,l:0},{r:1,c:4,l:0},{r:1,c:5,l:0},
    {r:2,c:0,l:0},{r:2,c:1,l:0},{r:2,c:2,l:0},{r:2,c:3,l:0},{r:2,c:4,l:0},{r:2,c:5,l:0},
    {r:3,c:0,l:0},{r:3,c:1,l:0},{r:3,c:2,l:0},{r:3,c:3,l:0},{r:3,c:4,l:0},{r:3,c:5,l:0},
    {r:4,c:0,l:0},{r:4,c:1,l:0},{r:4,c:2,l:0},{r:4,c:3,l:0},{r:4,c:4,l:0},{r:4,c:5,l:0},
    {r:0,c:1,l:1},{r:0,c:2,l:1},{r:0,c:3,l:1},{r:0,c:4,l:1},
    {r:1,c:1,l:1},{r:1,c:2,l:1},{r:1,c:3,l:1},{r:1,c:4,l:1},
    {r:2,c:1,l:1},{r:2,c:2,l:1},{r:2,c:3,l:1},{r:2,c:4,l:1},
    {r:3,c:1,l:1},{r:3,c:2,l:1},{r:3,c:3,l:1},{r:3,c:4,l:1},
    {r:1,c:2,l:2},{r:1,c:3,l:2},
    {r:2,c:2,l:2},{r:2,c:3,l:2},
    {r:3,c:2,l:2},{r:3,c:3,l:2},
  ],
  // 5: bolum 36-50 → 60 taş (30 çift), 3 katman
  [
    {r:0,c:0,l:0},{r:0,c:1,l:0},{r:0,c:2,l:0},{r:0,c:3,l:0},{r:0,c:4,l:0},{r:0,c:5,l:0},
    {r:1,c:0,l:0},{r:1,c:1,l:0},{r:1,c:2,l:0},{r:1,c:3,l:0},{r:1,c:4,l:0},{r:1,c:5,l:0},
    {r:2,c:0,l:0},{r:2,c:1,l:0},{r:2,c:2,l:0},{r:2,c:3,l:0},{r:2,c:4,l:0},{r:2,c:5,l:0},
    {r:3,c:0,l:0},{r:3,c:1,l:0},{r:3,c:2,l:0},{r:3,c:3,l:0},{r:3,c:4,l:0},{r:3,c:5,l:0},
    {r:4,c:0,l:0},{r:4,c:1,l:0},{r:4,c:2,l:0},{r:4,c:3,l:0},{r:4,c:4,l:0},{r:4,c:5,l:0},
    {r:0,c:0,l:1},{r:0,c:1,l:1},{r:0,c:2,l:1},{r:0,c:3,l:1},{r:0,c:4,l:1},{r:0,c:5,l:1},
    {r:1,c:0,l:1},{r:1,c:1,l:1},{r:1,c:2,l:1},{r:1,c:3,l:1},{r:1,c:4,l:1},{r:1,c:5,l:1},
    {r:2,c:0,l:1},{r:2,c:1,l:1},{r:2,c:2,l:1},{r:2,c:3,l:1},{r:2,c:4,l:1},{r:2,c:5,l:1},
    {r:3,c:0,l:1},{r:3,c:1,l:1},{r:3,c:2,l:1},{r:3,c:3,l:1},{r:3,c:4,l:1},{r:3,c:5,l:1},
    {r:1,c:2,l:2},{r:1,c:3,l:2},
    {r:2,c:2,l:2},{r:2,c:3,l:2},
    {r:3,c:2,l:2},{r:3,c:3,l:2},
  ],
];

// Bölge-seviye bazlı düzenler (10 layout, artan zorluk)
// Orhun: 0-4, Selenga: 2-6, Altay: 5-9, Tengri: 6-9
const BOLGE_DUZENLER = [
  // 0: 20 taş (Orhun Lv1-3)
  PIRAMIT_DUZENLER[0],
  // 1: 28 taş (Orhun Lv4-6)
  PIRAMIT_DUZENLER[1],
  // 2: 28 taş (Orhun Lv7-9 / Selenga Lv1-3)
  PIRAMIT_DUZENLER[1],
  // 3: 36 taş (Orhun Lv10-12 / Selenga Lv4-6)
  PIRAMIT_DUZENLER[2],
  // 4: 36 taş (Orhun Lv13-15 / Selenga Lv7-9)
  PIRAMIT_DUZENLER[2],
  // 5: 44 taş (Selenga Lv10-12 / Altay Lv1-3)
  PIRAMIT_DUZENLER[3],
  // 6: 52 taş (Selenga Lv13-15 / Altay Lv4-6 / Tengri Lv1-3)
  PIRAMIT_DUZENLER[4],
  // 7: 48 taş (Altay Lv7-9 / Tengri Lv4-6)
  [
    {r:0,c:0,l:0},{r:0,c:1,l:0},{r:0,c:2,l:0},{r:0,c:3,l:0},{r:0,c:4,l:0},{r:0,c:5,l:0},
    {r:1,c:0,l:0},{r:1,c:1,l:0},{r:1,c:2,l:0},{r:1,c:3,l:0},{r:1,c:4,l:0},{r:1,c:5,l:0},
    {r:2,c:0,l:0},{r:2,c:1,l:0},{r:2,c:2,l:0},{r:2,c:3,l:0},{r:2,c:4,l:0},{r:2,c:5,l:0},
    {r:3,c:0,l:0},{r:3,c:1,l:0},{r:3,c:2,l:0},{r:3,c:3,l:0},{r:3,c:4,l:0},{r:3,c:5,l:0},
    {r:0,c:1,l:1},{r:0,c:2,l:1},{r:0,c:3,l:1},{r:0,c:4,l:1},
    {r:1,c:1,l:1},{r:1,c:2,l:1},{r:1,c:3,l:1},{r:1,c:4,l:1},
    {r:2,c:1,l:1},{r:2,c:2,l:1},{r:2,c:3,l:1},{r:2,c:4,l:1},
    {r:3,c:1,l:1},{r:3,c:2,l:1},{r:3,c:3,l:1},{r:3,c:4,l:1},
    {r:1,c:2,l:2},{r:1,c:3,l:2},
    {r:2,c:2,l:2},{r:2,c:3,l:2},
    {r:3,c:2,l:2},{r:3,c:3,l:2},
    {r:0,c:2,l:2},{r:0,c:3,l:2},
  ],
  // 8: 60 taş (Altay Lv10-12 / Tengri Lv7-9)
  PIRAMIT_DUZENLER[5],
  // 9: 56 taş (Altay Lv13-15 / Tengri Lv10-15)
  [
    {r:0,c:0,l:0},{r:0,c:1,l:0},{r:0,c:2,l:0},{r:0,c:3,l:0},{r:0,c:4,l:0},{r:0,c:5,l:0},
    {r:1,c:0,l:0},{r:1,c:1,l:0},{r:1,c:2,l:0},{r:1,c:3,l:0},{r:1,c:4,l:0},{r:1,c:5,l:0},
    {r:2,c:0,l:0},{r:2,c:1,l:0},{r:2,c:2,l:0},{r:2,c:3,l:0},{r:2,c:4,l:0},{r:2,c:5,l:0},
    {r:3,c:0,l:0},{r:3,c:1,l:0},{r:3,c:2,l:0},{r:3,c:3,l:0},{r:3,c:4,l:0},{r:3,c:5,l:0},
    {r:4,c:0,l:0},{r:4,c:1,l:0},{r:4,c:2,l:0},{r:4,c:3,l:0},{r:4,c:4,l:0},{r:4,c:5,l:0},
    {r:0,c:1,l:1},{r:0,c:2,l:1},{r:0,c:3,l:1},{r:0,c:4,l:1},
    {r:1,c:1,l:1},{r:1,c:2,l:1},{r:1,c:3,l:1},{r:1,c:4,l:1},
    {r:2,c:1,l:1},{r:2,c:2,l:1},{r:2,c:3,l:1},{r:2,c:4,l:1},
    {r:3,c:1,l:1},{r:3,c:2,l:1},{r:3,c:3,l:1},{r:3,c:4,l:1},
    {r:4,c:1,l:1},{r:4,c:2,l:1},{r:4,c:3,l:1},{r:4,c:4,l:1},
    {r:1,c:2,l:2},{r:1,c:3,l:2},
    {r:2,c:2,l:2},{r:2,c:3,l:2},
    {r:3,c:2,l:2},{r:3,c:3,l:2},
  ],
];

const BOLGE_LAYOUT_OFFSET = { orhun: 0, selenga: 2, altay: 5, tengri_yurdu: 6 };

function getLayoutForBolgeSeviye(bolgeId, seviye) {
  const base = BOLGE_LAYOUT_OFFSET[bolgeId] ?? 0;
  const step = Math.min(4, Math.floor((seviye * 5) / 15)); // 0-4 for seviye 0-14
  return BOLGE_DUZENLER[Math.min(BOLGE_DUZENLER.length - 1, base + step)];
}

function getSureBolgeSeviye(bolgeId, seviye) {
  const base = BOLGE_LAYOUT_OFFSET[bolgeId] ?? 0;
  const step = Math.min(4, Math.floor((seviye * 5) / 15));
  const idx = Math.min(BOLGE_DUZENLER.length - 1, base + step);
  const tileCounts = [20, 28, 28, 36, 36, 44, 52, 48, 60, 56];
  const tc = tileCounts[idx] || 20;
  if (tc <= 28) return 150;
  if (tc <= 36) return 180;
  if (tc <= 44) return 210;
  if (tc <= 52) return 240;
  return 270;
}

function getLayout(bolum) {
  if (bolum <= 3)  return PIRAMIT_DUZENLER[0]; // 20 taş
  if (bolum <= 7)  return PIRAMIT_DUZENLER[1]; // 28 taş
  if (bolum <= 12) return PIRAMIT_DUZENLER[2]; // 36 taş
  if (bolum <= 20) return PIRAMIT_DUZENLER[3]; // 44 taş
  if (bolum <= 35) return PIRAMIT_DUZENLER[4]; // 52 taş
  return PIRAMIT_DUZENLER[5];                  // 60 taş
}

function getBoardDims(layout) {
  const maxC = Math.max(...layout.map(p => p.c ?? p.col));
  const maxR = Math.max(...layout.map(p => p.r ?? p.row));
  const maxL = Math.max(...layout.map(p => p.l ?? 0));
  return {
    w: (maxC + 2) * (TW + GAP) + 20,
    h: (maxR + 1) * (TH + GAP) + maxL * LOY + 20,
    maxL,
  };
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

// Latin display kaldırıldı — tüm taşlar Göktürkçe

// Mitoloji taşları için Latin kısa ad (Göktürk değil)
const MIT_MONO = {
  mit_tengri:  'TGR',
  mit_umay:    'UMY',
  mit_erlik:   'ERL',
  mit_ulgen:   'ÜLG',
  mit_ak_ana:  'ANA',
  mit_kayra:   'KHN',
  mit_mergen:  'MRG',
  yada_tasi:   'YDA',
};

// Hayvan taşları için Latin kısaltma — tepsi küçük gösterim
const HAY_ABV = {
  hay_sican:'SIC', hay_ud:'UD', hay_bars:'BAR', hay_tavissgan:'TAV',
  hay_lu:'LU', hay_yilan:'YIL', hay_yund:'YND', hay_koy:'KOY',
  hay_bicin:'BIC', hay_takagu:'TAK', hay_it:'IT', hay_tonguz:'TON',
};

// Hayvan ikonik damgaları — her hayvanın en belirgin özelliği abartılmış
const HAY_ICON = {
  hay_sican: (   // Fare: büyük yuvarlak kulak + oval gövde + uzun kıvrık kuyruk
    <svg viewBox="0 0 28 28" fill="currentColor">
      <ellipse cx="16" cy="20" rx="10" ry="6.5"/>
      <circle cx="7" cy="10" r="6.5"/>
      <path d="M26 19 C28 13 29 7 26 3 C25 1 22 2 23 5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  hay_ud: (      // Öküz: geniş lir şeklinde U-boynuzlar
    <svg viewBox="0 0 28 28" fill="currentColor">
      <ellipse cx="14" cy="23" rx="8.5" ry="5"/>
      <path d="M7 20 Q1 10 4.5 2.5 Q7 0 9.5 5.5 Q11 11 10.5 19Z"/>
      <path d="M21 20 Q27 10 23.5 2.5 Q21 0 18.5 5.5 Q17 11 17.5 19Z"/>
    </svg>
  ),
  hay_bars: (    // Pars: oval gövde + üçgen kulaklar + belirgin çizgiler
    <svg viewBox="0 0 28 28" fill="currentColor">
      <ellipse cx="14" cy="18" rx="12" ry="9"/>
      <polygon points="5,12 9,2 14,12"/>
      <polygon points="14,12 19,2 23,12"/>
      <rect x="9" y="13" width="3" height="10" rx="1.5" fill="#000" opacity="0.38"/>
      <rect x="15" y="12" width="3" height="11" rx="1.5" fill="#000" opacity="0.38"/>
    </svg>
  ),
  hay_tavissgan: ( // Tavışgan: çok uzun iki kulak (gövdenin 3 katı)
    <svg viewBox="0 0 28 28" fill="currentColor">
      <ellipse cx="14" cy="24" rx="8" ry="4.5"/>
      <ellipse cx="10" cy="10" rx="3.5" ry="10.5"/>
      <ellipse cx="18" cy="10" rx="3.5" ry="10.5"/>
    </svg>
  ),
  hay_lu: (      // Lu (ejder): kalın S-gövde + belirgin başlık + boynuzlar
    <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 27 C5 21 10 19 13 15 C16 11 15 7 11 6 C8 5 7 8 10 11 C13 14 18 12 18 8 C18 5 16 2 19 1" strokeWidth="5.5"/>
      <polygon points="19,0 15,5 23,5" fill="currentColor" stroke="none"/>
      <polygon points="24,3 22,7 27,6" fill="currentColor" stroke="none"/>
    </svg>
  ),
  hay_yilan: (   // Yılan: sıkı spiral halka + çatal dil
    <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeLinecap="round">
      <path d="M14 25 C7 24 4 18 6 12 C8 7 13 5 17 9 C20 12 18 17 14 18 C10 20 7 16 9 12 C10 9 13 8 15 10" strokeWidth="4.5"/>
      <path d="M15 10 L12 6" strokeWidth="2" strokeLinecap="round"/>
      <path d="M15 10 L18 6" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  hay_yund: (    // Yund (at): baş profili + kabarık yele
    <svg viewBox="0 0 28 28" fill="currentColor">
      <path d="M4 26 Q4 18 9 14 Q15 10 21 13 Q26 16 25 22 Q24 26 18 27 Q10 28 4 26Z"/>
      <path d="M9 14 Q9 7 12 5 Q14 3 14 8 Q13 11 11 14Z"/>
      <path d="M13 13 Q14 6 17 4 Q19 2 18 8 Q17 11 15 13Z"/>
      <path d="M17 12 Q19 7 22 5 Q24 3 22 9 Q21 11 19 12Z"/>
    </svg>
  ),
  hay_koy: (     // Koyun: büyük kıvrık koç boynuzları belirgin
    <svg viewBox="0 0 28 28" fill="currentColor">
      <circle cx="14" cy="20" r="6.5"/>
      <circle cx="9" cy="17" r="4.5"/>
      <circle cx="19" cy="17" r="4.5"/>
      <circle cx="14" cy="13" r="3.5"/>
      <path d="M10 11 Q5 7 6 3 Q8 0 11 5 Q12 8 11 11Z"/>
      <path d="M18 11 Q23 7 22 3 Q20 0 17 5 Q16 8 17 11Z"/>
    </svg>
  ),
  hay_bicin: (   // Biçin (maymun): büyük yuvarlak kulaklar + yüz
    <svg viewBox="0 0 28 28" fill="currentColor">
      <circle cx="14" cy="16" r="9"/>
      <circle cx="4" cy="13.5" r="5.5"/>
      <circle cx="24" cy="13.5" r="5.5"/>
      <ellipse cx="14" cy="20" rx="5.5" ry="3.5" opacity="0.5"/>
    </svg>
  ),
  hay_takagu: (  // Takagu (horoz): sivri ibik + oval gövde + yelpaze kuyruk
    <svg viewBox="0 0 28 28" fill="currentColor">
      <ellipse cx="10" cy="20" rx="7" ry="5.5"/>
      <circle cx="19" cy="13" r="5.5"/>
      <path d="M14 10 L15 4 L18 9 L21 3 L23 8 L24 4 L24 11Z"/>
      <path d="M3 18 L0 15 L3 11 L1 8 L5 11 L4 8 L7 12 L7 20Z"/>
    </svg>
  ),
  hay_it: (      // İt (köpek): yuvarlak kafa + SARKAN sarkık kulaklar (kedi değil!)
    <svg viewBox="0 0 28 28" fill="currentColor">
      <circle cx="14" cy="13" r="9"/>
      <ellipse cx="4.5" cy="19.5" rx="4" ry="6.5"/>
      <ellipse cx="23.5" cy="19.5" rx="4" ry="6.5"/>
      <ellipse cx="14" cy="17.5" rx="5.5" ry="3.5" opacity="0.4"/>
    </svg>
  ),
  hay_tonguz: (  // Tonguz (domuz): öne çıkan burun + yukarı kıvrık dişler
    <svg viewBox="0 0 28 28" fill="currentColor">
      <ellipse cx="17" cy="19" rx="9.5" ry="7"/>
      <ellipse cx="5.5" cy="18" rx="4.5" ry="3.5"/>
      <path d="M2.5 15.5 Q0 9 5 7" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M4 19.5 Q1 18 2 14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      <path d="M14 12 L13 6 M18 11 L18 5 M22 12 L22 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.75"/>
    </svg>
  ),
};

// Mitoloji taşları için benzersiz semboller
const MIT_SEMBOL = {
  mit_tengri:  '⚡',
  mit_umay:    '✦',
  mit_erlik:   '☠',
  mit_ulgen:   '☀',
  mit_ak_ana:  '✿',
  mit_kayra:   '✤',
  mit_mergen:  '➤',
  yada_tasi:   '◈',
};

function kartHavuzu(bolum) {
  const havuz = [...TAMGALAR];
  if (bolum >= 5) havuz.push(...MITOLOJI);
  if (bolum >= 11) havuz.push(...HAYVANLAR);
  if (bolum >= 30) havuz.push(YADA_TASI); // nadir — yüksek bölümlerde çıkar
  return havuz;
}

function createBoard(bolgeId, bolum = 1, layoutOverride = null) {
  const layout = layoutOverride || getLayout(bolum);
  const pairCount = Math.floor(layout.length / 2);
  const pool = shuffle(kartHavuzu(bolum));
  let selectedPool = [];
  
  // Kelime Avcısı için en az 3 kelimenin harflerini garantilemeye çalış
  const hedefKelimeler = shuffle([...GK_KELIMELER]).slice(0, 3);
  const garantiHarfler = new Set();
  hedefKelimeler.forEach(gk => gk.harfler.forEach(h => garantiHarfler.add(h)));
  
  const garantiKartlar = [];
  garantiHarfler.forEach(h => {
    const kart = pool.find(k => k.tamga === h);
    if (kart) garantiKartlar.push(kart);
  });
  
  selectedPool.push(...garantiKartlar.slice(0, Math.max(0, pairCount - 2))); // Birkaç tanesini rastgeleliğe bırak
  
  // Kalan slotları rastgele doldur
  for (const aday of pool) {
    if (selectedPool.length >= pairCount) break;
    if (!selectedPool.some(k => k.id === aday.id)) {
      selectedPool.push(aday);
    }
  }
  const doubled = shuffle([
    ...selectedPool.map(k => ({ ...k, displayMode: 'tamga' })),
    ...selectedPool.map(k => ({ ...k, displayMode: 'tamga' }))
  ]);
  const tiles = shuffle([...layout]).map((pos, i) => ({
    id: i, row: pos.r, col: pos.c, layer: pos.l,
    kart: doubled[i], removed: false, inTray: false,
    isBomb: false, isFrozen: false,
  }));

  // Aynı kartların tam olarak üst üste (aynı r, c farklı l) gelmesini engelle
  let conflict = true;
  let attempts = 0;
  while (conflict && attempts < 20) {
    conflict = false;
    for (let i = 0; i < tiles.length; i++) {
        for (let j = i + 1; j < tiles.length; j++) {
            const t1 = tiles[i];
            const t2 = tiles[j];
            if (t1.kart.id === t2.kart.id && t1.row === t2.row && t1.col === t2.col) {
                conflict = true;
                const rIdx = Math.floor(Math.random() * tiles.length);
                const temp = tiles[j].kart;
                tiles[j].kart = tiles[rIdx].kart;
                tiles[rIdx].kart = temp;
            }
        }
    }
    attempts++;
  }

  // Special tiles based on difficulty
  const frozenRate = bolum < 8 ? 0 : bolum < 15 ? 0.12 : bolum < 25 ? 0.18 : 0.22;
  tiles.forEach(tile => {
    if (tile.kart.kategori === 'mitoloji' || tile.kart.kategori === 'hayvan') return;
    // Donmuş taş sadece her iki yanında komşusu olan taşlara yerleştirilir
    const solVar = tiles.some(t => t.layer === tile.layer && t.row === tile.row && t.col === tile.col - 1);
    const sagVar = tiles.some(t => t.layer === tile.layer && t.row === tile.row && t.col === tile.col + 1);
    if (Math.random() < frozenRate && solVar && sagVar) {
      tile.isFrozen = true;
    }
  });
  return tiles;
}

function createYada() {
  return {
    id: 'yada_tasi', tamga: '💎', ses: 'YADA', fonetik: 'jada',
    kategori: 'mitoloji', nadirlik: 'yada', bolge: 'tengri',
  };
}

function isFree(tile, all) {
  const alive = all.filter(t => !t.removed && !t.inTray && t.id !== tile.id);
  if (alive.some(t => t.layer === tile.layer + 1 && t.row === tile.row && t.col === tile.col)) return false;
  const hasL = alive.some(t => t.layer === tile.layer && t.row === tile.row && t.col === tile.col - 1);
  const hasR = alive.some(t => t.layer === tile.layer && t.row === tile.row && t.col === tile.col + 1);
  return !hasL || !hasR;
}

function tilePos(col, row, layer, topOffset = 0) {
  const offsetCol = col + 1;
  return {
    left: offsetCol * (TW + GAP) - layer * LOX,
    top: row * (TH + GAP) - layer * LOY + topOffset,
    zIndex: layer * 100 + row * 10 + col,
  };
}


// === Latin -> Göktürk mini dönüşüm (özet) ===
const LIGATURLER = [
  { l: 'ng', t: '\u{10C2D}' }, { l: 'nç', t: '\u{10C28}' }, { l: 'nt', t: '\u{10C26}' },
  { l: 'nd', t: '\u{10C26}' }, { l: 'lt', t: '\u{10C21}' }, { l: 'ld', t: '\u{10C21}' },
  { l: 'ny', t: '\u{10C2A}' }, { l: 'ok', t: '\u{10C38}' }, { l: 'uk', t: '\u{10C38}' },
  { l: 'ko', t: '\u{10C38}' }, { l: 'ku', t: '\u{10C38}' }, { l: 'ök', t: '\u{10C1C}' },
  { l: 'ük', t: '\u{10C1C}' }, { l: 'kö', t: '\u{10C1C}' }, { l: 'kü', t: '\u{10C1C}' },
  { l: 'ik', t: '\u{10C36}' }, { l: 'ki', t: '\u{10C36}' }, { l: 'ık', t: '\u{10C36}' },
  { l: 'kı', t: '\u{10C36}' }, { l: 'uç', t: '\u{10C30}' }, { l: 'oç', t: '\u{10C30}' },
  { l: 'iç', t: '\u{10C31}' },
];

const SESLER = {
  a: { back: '\u{10C00}', front: '\u{10C00}' }, e: { back: '\u{10C00}', front: '\u{10C00}' },
  ı: { back: '\u{10C03}', front: '\u{10C03}' }, i: { back: '\u{10C03}', front: '\u{10C03}' },
  o: { back: '\u{10C06}', front: '\u{10C06}' }, u: { back: '\u{10C06}', front: '\u{10C06}' },
  ö: { back: '\u{10C07}', front: '\u{10C07}' }, ü: { back: '\u{10C07}', front: '\u{10C07}' },
  b: { back: '\u{10C09}', front: '\u{10C0B}' }, k: { back: '\u{10C34}', front: '\u{10C1A}' },
  t: { back: '\u{10C43}', front: '\u{10C45}' }, n: { back: '\u{10C23}', front: '\u{10C24}' },
  r: { back: '\u{10C3A}', front: '\u{10C3C}' }, g: { back: '\u{10C0D}', front: '\u{10C0F}' },
  ğ: { back: '\u{10C0D}', front: '\u{10C0F}' }, d: { back: '\u{10C11}', front: '\u{10C13}' },
  y: { back: '\u{10C16}', front: '\u{10C18}' }, l: { back: '\u{10C1E}', front: '\u{10C20}' },
  m: { back: '\u{10C22}', front: '\u{10C22}' }, s: { back: '\u{10C3D}', front: '\u{10C3E}' },
  z: { back: '\u{10C14}', front: '\u{10C14}' }, ç: { back: '\u{10C32}', front: '\u{10C32}' },
  ş: { back: '\u{10C41}', front: '\u{10C41}' }, p: { back: '\u{10C2F}', front: '\u{10C2F}' },
  h: { back: '\u{10C34}', front: '\u{10C1A}' }, f: { back: '\u{10C2F}', front: '\u{10C2F}' },
  v: { back: '\u{10C09}', front: '\u{10C0B}' }, c: { back: '\u{10C32}', front: '\u{10C32}' },
  j: { back: '\u{10C32}', front: '\u{10C32}' }, w: { back: '\u{10C09}', front: '\u{10C0B}' },
  x: { back: '\u{10C34}', front: '\u{10C1A}' }, q: { back: '\u{10C34}', front: '\u{10C1A}' },
};

const VOWEL_HARMONY = new Map([
  ['a', 'back'], ['ı', 'back'], ['o', 'back'], ['u', 'back'],
  ['e', 'front'], ['i', 'front'], ['ö', 'front'], ['ü', 'front'],
]);
const DUZ_UNLU = new Set(['a', 'e', 'ı', 'i']);

function temizYazi(s) {
  if (!s) return s;
  const map = {
    'Ã¶': 'ö', 'Ã–': 'Ö', 'Ã¼': 'ü', 'Ãœ': 'Ü',
    'Ã§': 'ç', 'Ã‡': 'Ç', 'ÄŸ': 'ğ', 'Äž': 'Ğ',
    'ÅŸ': 'ş', 'Åž': 'Ş', 'Ä±': 'ı', 'Ä°': 'İ',
    'Ã¢': 'a', 'Ã¢': 'a', 'Ã®': 'i', 'Ã»': 'u',
    'â€˜': "'", 'â€™': "'", 'â€œ': '"', 'â€�': '"',
    'â€”': '-', 'â€“': '-', 'Â': ''
  };
  let out = s;
  for (const k of Object.keys(map)) {
    out = out.split(k).join(map[k]);
  }
  out = out.replace(/[âîûÂÎÛ]/g, (m) => ({ 'â': 'a', 'î': 'i', 'û': 'u', 'Â': 'A', 'Î': 'I', 'Û': 'U' }[m]));
  return out;
}

function getCharHarmony(lower, pos) {
  let bestDist = Infinity;
  let bestHarmony = 'back';
  for (let j = 0; j < lower.length; j++) {
    const h = VOWEL_HARMONY.get(lower[j]);
    if (h !== undefined) {
      const dist = Math.abs(j - pos);
      if (dist < bestDist || (dist === bestDist && j > pos)) {
        bestDist = dist;
        bestHarmony = h;
      }
    }
  }
  return bestHarmony;
}

function cevirKelime(kelime) {
  const harfler = [];
  let i = 0;
  const lower = kelime.toLowerCase();
  const son = lower.length - 1;
  while (i < lower.length) {
    if (i < son) {
      const iki = lower.slice(i, i + 2);
      const lig = LIGATURLER.find((l) => l.l === iki);
      if (lig) {
        harfler.push(lig.t);
        i += 2;
        continue;
      }
    }
    const ch = lower[i];
    const ses = SESLER[ch];
    if (ses) {
      if (DUZ_UNLU.has(ch) && i > 0 && i < son) { i++; continue; }
      const uyum = getCharHarmony(lower, i);
      harfler.push(ses[uyum]);
    }
    i++;
  }
  return harfler.join('');
}

function gokturkMonogram(kart) {
  const raw = temizYazi(kart.ses || '').replace(/[^A-Za-zÇĞİÖŞÜçğıöşü\s]/g, '').trim();
  if (!raw) return '#';
  const kelime = raw.split(/\s+/)[0];
  const tamga = cevirKelime(kelime);
  return tamga.slice(0, 2) || '#';
}

function MjGoktArka() {
  const parcalar = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    id: i,
    harf: MJ_GOKT_HARFLER[i % MJ_GOKT_HARFLER.length],
    left: Math.round((i / 18) * 94 + Math.sin(i * 2.1) * 3),
    delay: +(i * 0.55 + Math.sin(i * 1.3) * 0.4).toFixed(2),
    duration: +(6 + (i % 6) * 1.2).toFixed(1),
    size: +(0.65 + (i % 5) * 0.2).toFixed(2),
    opacity: +(0.07 + (i % 4) * 0.04).toFixed(3),
  })), []);

  return (
    <div className="mj-gokt-arka" aria-hidden="true">
      {parcalar.map(p => (
        <span key={p.id} className="mj-gokt-arka-harf" style={{
          left: `${p.left}%`,
          animationDelay: `${p.delay}s`,
          animationDuration: `${p.duration}s`,
          fontSize: `${p.size}rem`,
          opacity: p.opacity,
        }}>{p.harf}</span>
      ))}
    </div>
  );
}

function display(kart) {
  const isMit = kart.kategori === 'mitoloji';
  const isHay = kart.kategori === 'hayvan';
  if (!isMit && !isHay) return { isGokt: true, main: kart.tamga, sub: temizYazi(kart.ses), isMit: false, isHay: false, isLatin: false, isOzel: false };
  return { isGokt: false, main: kart.tamga, sub: temizYazi(kart.ses), isMit, isHay, isLatin: false, isOzel: true };
}

function TasIcerik({ kart, buyuk = false, tepsi = false }) {
  const d = display(kart);

  // Mitoloji — sembol + tam isim
  if (d.isMit && !tepsi && !buyuk) {
    const sembol = MIT_SEMBOL[kart.id] || '✦';
    return (
      <>
        <span className={`mj-mit-sembol mj-mit-${kart.id}`}>{sembol}</span>
        <span className="mj-mit-isim">{d.sub}</span>
        <span className="mj-ruh-bant-mit" />
      </>
    );
  }

  // Mitoloji buyuk (carpisma sahnesi)
  if (d.isMit && buyuk) {
    const mono = MIT_MONO[kart.id] || kart.ses.slice(0, 3).toUpperCase();
    return (
      <>
        <span className={`cp-mit-mono mj-mit-${kart.id}`}>{mono}</span>
        <span className="cp-ses">{d.sub}</span>
      </>
    );
  }

  // Hayvan — ikonik damga silüeti (board)
  if (d.isHay && !tepsi && !buyuk) {
    return (
      <>
        <span className="mj-hay-ikon">{HAY_ICON[kart.id]}</span>
        <span className="mj-hay-isim">{d.sub}</span>
        <span className="mj-ruh-bant-hay" />
      </>
    );
  }

  // Hayvan buyuk (çarpışma sahnesi)
  if (d.isHay && buyuk) {
    return (
      <>
        <span className="cp-hay-ikon">{HAY_ICON[kart.id]}</span>
        <span className="cp-ses">{d.sub}</span>
      </>
    );
  }

  // Tepsi: mitoloji monogram, hayvan emoji
  if ((d.isMit || d.isHay) && tepsi) {
    return (
      <>
        {d.isMit
          ? <span className={`mj-tepsi-mit-sembol mj-mit-${kart.id}`}>{MIT_SEMBOL[kart.id] || MIT_MONO[kart.id] || '✦'}</span>
          : <span className="mj-tepsi-hay-abv">{HAY_ABV[kart.id] || kart.ses.slice(0, 3)}</span>
        }
        <span className="mj-tepsi-ses">{d.sub}</span>
      </>
    );
  }

  const anaClass = tepsi
    ? (d.isGokt ? 'mj-tepsi-gokt' : 'mj-tepsi-ana')
    : buyuk
      ? (d.isGokt ? 'cp-tamga' : 'cp-ozel')
      : (d.isGokt ? 'mj-ana mj-ana-gokt' : 'mj-ana mj-ana-ozel');
  if (!tepsi && !buyuk && kart.gorsel) {
    return (
      <>
        <img src={kart.gorsel} alt={kart.ses} className="mj-tas-gorsel" />
        <span className="mj-ses mj-ses-gorsel">{d.sub}</span>
      </>
    );
  }
  return (
    <>
      <span className={anaClass}>{d.main}</span>
      <span className={tepsi ? 'mj-tepsi-ses' : buyuk ? 'cp-ses' : 'mj-ses'}>{d.sub}</span>
      {!buyuk && !tepsi && d.isOzel && <span className="mj-ozel-bant" />}
    </>
  );
}

export default function EslestirmeScreen() {
  const { state, dispatch } = useGame();
  const { playTas, playClick, playMatch, playCombo, toggleMute, isMuted, unlockAudio, playBgm, stopBgm } = useAudio();
  const aktifSeviye = state.sefer?.aktif ? (state.sefer.seviye ?? 0) : 0;
  const ozelSeviye = state.sefer?.ozelSeviye || false;
  const bolum = Math.min(state.eslestirmeBolum || 1, TOPLAM_BOLUM);
  // startBolum: mount anındaki bölüm — ESLESTIRME_TAMAMLA sonrası bolum değişse bile doğru sonraki bölümü hesaplar
  const [startBolum] = useState(bolum);
  // Özel seviye modunda bölge+seviyeye göre layout seç (mount-time sabit)
  const [startLayout] = useState(() => ozelSeviye && state.seciliBolge
    ? getLayoutForBolgeSeviye(state.seciliBolge, aktifSeviye)
    : getLayout(bolum)
  );
  const [tiles, setTiles] = useState(() => createBoard(state.seciliBolge, bolum, ozelSeviye ? startLayout : null));
  const boardDims = getBoardDims(startLayout);
  const tahtaKapRef = useRef(null);
  const [boardScale, setBoardScale] = useState(1);
  const [tepsi, setTepsi] = useState(() => Array(MAX_TEPSI).fill(null));   // sabit slotlu: [kart|null, ...]
  const [carpisma, setCarpisma] = useState(null);
  const maxSure = ozelSeviye && state.seciliBolge
    ? getSureBolgeSeviye(state.seciliBolge, aktifSeviye)
    : bolumSuresi(startBolum);
  const [sure, setSure] = useState(maxSure);
  const [skor, setSkor] = useState(0);
  const [hamle, setHamle] = useState(0);
  const [bitti, setBitti] = useState(false);
  const [efektMesaj, setEfektMesaj] = useState(null);
  const [bozkurtCan, setBozkurtCan] = useState(MAX_CAN);
  const blocked = useRef(false);

  // Tahta scale: konteyner yüksekliğine sığacak şekilde küçült
  useEffect(() => {
    const el = tahtaKapRef.current;
    if (!el) return;
    const calc = () => {
      const avW = el.clientWidth - 10;
      const avH = el.clientHeight - 10;
      const scaleH = avH > 0 ? avH / boardDims.h : 1;
      const scaleW = avW > 0 ? avW / boardDims.w : 1;
      setBoardScale(Math.min(1, scaleH, scaleW));
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, [boardDims.h, boardDims.w]);

  // Combo sistemi
  const [combo, setCombo] = useState(0);
  const [comboMesaj, setComboMesaj] = useState(null);
  const sonEslesmeRef = useRef(0);
  const COMBO_SURESI = 4000; // ms — combo süresi
  function comboÇarpan(c) { return c <= 1 ? 1 : c <= 2 ? 2 : c <= 4 ? 3 : 5; }

  // Gizli kelimeler (sadece tahtada bulunan harflerden oluşanları seç)
  const gizliKelimeler = useMemo(() => {
    const boardLetters = new Set();
    tiles.forEach(t => { if (t.kart && t.kart.tamga) boardLetters.add(t.kart.tamga); });
    const yapilabilirler = GK_KELIMELER.filter(gk => gk.harfler.every(h => boardLetters.has(h)));
    return shuffle(yapilabilirler).slice(0, 3);
  }, []); // Sadece bölüm başında 1 kere çalışır
  const [acikHarfler, setAcikHarfler] = useState(new Set());
  const kelimeAvciRef = useRef(false);
  const [kelimeAvciGoster, setKelimeAvciGoster] = useState(false);

  // Liderlik Tablosu için skor kaydetme stateleri
  const [isimGiris, setIsimGiris] = useState(state.kullaniciAdi || '');
  const [skorKaydedildi, setSkorKaydedildi] = useState(false);
  const [skorKaydediliyor, setSkorKaydediliyor] = useState(false);

  async function skoruKaydet(finalSkor) {
    if (!isimGiris.trim() || skorKaydedildi) return;
    setSkorKaydediliyor(true);
    const zaman = setTimeout(() => {
      setSkorKaydediliyor(false);
      setSkorKaydedildi(true); // Timeout'ta da butonu kilitle (tekrar tıklanmasın)
      alert('Bağlantı zaman aşımı. Skor kaydedilemedi.');
    }, 6000);
    try {
      const { db } = await import('../firebase');
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      await addDoc(collection(db, 'liderlik'), {
        isim: isimGiris.trim(),
        puan: finalSkor,
        seviye: ozelSeviye ? (aktifSeviye + 1) : startBolum,
        tarih: serverTimestamp()
      });
      clearTimeout(zaman);
      setSkorKaydedildi(true);
    } catch (e) {
      clearTimeout(zaman);
      console.error("Skor kaydedilemedi", e);
      alert("Skor kaydedilemedi. İnternet bağlantısını kontrol et.");
    } finally {
      setSkorKaydediliyor(false);
    }
  }

  useEffect(() => {
    unlockAudio();
    playBgm();
    // Günlük hakları yenile
    const bugun = new Date().toDateString();
    if (state.gunlukHaklar?.tarih !== bugun) {
      dispatch({ type: 'GUNLUK_HAKLAR_YENILE', tarih: bugun });
    }
    return () => stopBgm();
  }, []);

  useEffect(() => {
    if (bitti) stopBgm();
  }, [bitti, stopBgm]);

  useEffect(() => {
    if (bitti) return;
    const interval = setInterval(() => {
      setSure(s => {
        if (s <= 1) {
          clearInterval(interval);
          setTimeout(() => setBitti(true), 0);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [bitti]);

  // Kazanma kontrolü
  useEffect(() => {
    if (bitti) return;
    const onTahtaCount = tiles.filter(t => !t.removed && !t.inTray).length;
    if (onTahtaCount === 0 && tepsi.every(t => t === null) && tiles.every(t => t.removed)) {
      setBitti(true);
      const finalSkor = skor + sure * 5;
      // Yıldız: kalan süreye göre (maxSure'un yüzdesi)
      const surePct = sure / maxSure;
      const yildiz = surePct >= 0.45 ? 3 : surePct >= 0.18 ? 2 : 1;
      dispatch({
        type: 'ESLESTIRME_TAMAMLA',
        bolgeId: state.seciliBolge || 'orhun',
        seviye: aktifSeviye,
        puan: finalSkor,
        kazandi: true,
        yildiz,
      });
    }
  }, [tiles, bitti, tepsi]);

  // Kaybetme durumunda ozelSeviye modunda 1 yıldız kaydet (bir sonraki seviye açılsın)
  useEffect(() => {
    if (!bitti) return;
    const kazandi = tiles.every(t => t.removed);
    if (!kazandi && ozelSeviye) {
      dispatch({
        type: 'ESLESTIRME_TAMAMLA',
        bolgeId: state.seciliBolge || 'orhun',
        seviye: aktifSeviye,
        puan: 0,
        kazandi: false,
        yildiz: 1,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bitti]);

  // Güvenlik ağı: orphan taş kalmışsa (güç hatası vb.) sessizce temizle
  useEffect(() => {
    if (bitti || blocked.current) return;
    const alive = tiles.filter(t => !t.removed);
    if (alive.length === 0) return;
    const sayac = {};
    alive.forEach(t => { sayac[t.kart.tamga] = (sayac[t.kart.tamga] || 0) + 1; });
    const orphanlar = alive.filter(t => sayac[t.kart.tamga] === 1);
    if (orphanlar.length > 0 && orphanlar.length === alive.length) {
      // Tüm kalan taşlar orphan — sessizce sil
      const orphanIds = new Set(orphanlar.map(t => t.id));
      setTiles(prev => prev.map(t => orphanIds.has(t.id) ? { ...t, removed: true, inTray: false } : t));
      setTepsi(Array(MAX_TEPSI).fill(null));
    }
  }, [tiles, bitti]);


  // Kelime avcısı: tüm gizli kelimeler açılınca bonus
  useEffect(() => {
    if (kelimeAvciRef.current || bitti || acikHarfler.size === 0 || gizliKelimeler.length === 0) return;
    const tumuBulundu = gizliKelimeler.every(gk =>
      gk.harfler.every(harf => acikHarfler.has(harf))
    );
    if (tumuBulundu) {
      kelimeAvciRef.current = true;
      setKelimeAvciGoster(true);
      setSkor(s => s + 300);
      setSure(s => Math.min(s + 15, maxSure + 60));
      showMsg('🔑 KELİME AVCISI! +300 +15s', 2500);
    }
  }, [acikHarfler, bitti]);

  function showMsg(msg, dur = 1500) {
    setEfektMesaj(msg);
    setTimeout(() => setEfektMesaj(null), dur);
  }

  function applyPower(kart) {
    if (!kart.guc) return;
    switch (kart.guc.id) {
      // ── MİTOLOJİ ──
      case 'tengri_gucu':
        setSure(s => Math.min(s + 45, maxSure + 90));
        break;
      case 'umay_koruma':
        blocked.current = true;
        setTimeout(() => {
          setTiles(prev => prev.map(t => ({ ...t, inTray: false })));
          setTepsi(Array(MAX_TEPSI).fill(null));
          blocked.current = false;
        }, 600);
        break;
      case 'erlik_gucu':
        setTiles(prev => {
          const tamgaSay = {};
          prev.filter(t => !t.removed && !t.inTray).forEach(t => {
            tamgaSay[t.kart.tamga] = (tamgaSay[t.kart.tamga] || []);
            tamgaSay[t.kart.tamga].push(t.id);
          });
          const ciftler = Object.values(tamgaSay).filter(g => g.length >= 2);
          if (!ciftler.length) return prev;
          const cift = ciftler[Math.floor(Math.random() * ciftler.length)];
          const silSet = new Set([cift[0], cift[1]]);
          setSkor(s => s + 200);
          return prev.map(t => silSet.has(t.id) ? { ...t, removed: true, inTray: false } : t);
        });
        break;
      case 'ulgen_isik':
        setSure(s => Math.min(s + 30, maxSure + 60));
        break;
      case 'ak_koruma':
        setBozkurtCan(c => Math.min(MAX_CAN, c + 1));
        break;
      case 'kayra_fermani':
        setSkor(s => s + 500);
        break;
      case 'mergen_hedef':
        setTiles(prev => {
          const alive = prev.filter(t => !t.removed && !t.inTray);
          const tamgaSay = {};
          alive.forEach(t => {
            if (!isFree(t, prev)) return;
            tamgaSay[t.kart.tamga] = (tamgaSay[t.kart.tamga] || []);
            tamgaSay[t.kart.tamga].push(t.id);
          });
          const ciftler = Object.values(tamgaSay).filter(g => g.length >= 2);
          if (!ciftler.length) return prev;
          const cift = ciftler[Math.floor(Math.random() * ciftler.length)];
          const silSet = new Set([cift[0], cift[1]]);
          setSkor(s => s + 300);
          return prev.map(t => silSet.has(t.id) ? { ...t, removed: true, inTray: false } : t);
        });
        break;
      // ── HAYVANLAR ──
      case 'sure_uzat':
        setSure(s => Math.min(s + 20, maxSure + 60));
        break;
      case 'streak_koru':
        setSure(s => Math.min(s + 15, maxSure + 60));
        break;
      case 'cift_puan':
        setSkor(s => s + 300);
        break;
      case 'yanlis_affet':
        blocked.current = true;
        setTimeout(() => {
          setTiles(prev => prev.map(t => ({ ...t, inTray: false })));
          setTepsi(Array(MAX_TEPSI).fill(null));
          blocked.current = false;
        }, 400);
        break;
      case 'kalkan':
        setBozkurtCan(c => Math.min(MAX_CAN, c + 1));
        break;
      case 'secim_sil':
        setTiles(prev => {
          const serbest = prev.filter(t => !t.removed && !t.inTray && isFree(t, prev));
          if (!serbest.length) return prev;
          const hedef = serbest[Math.floor(Math.random() * serbest.length)];
          // Hedef taşı ve çiftini birlikte sil (orphan oluşmasın)
          return prev.map(t => {
            if (t.id === hedef.id) return { ...t, removed: true };
            if (!t.removed && t.kart.tamga === hedef.kart.tamga) return { ...t, removed: true };
            return t;
          });
        });
        break;
      case 'bonus_kart':
        setSkor(s => s + 200);
        break;
      case 'ilk_bil':
        setSure(s => Math.min(s + 15, maxSure + 60));
        break;
      case 'cift_kart':
        setSkor(s => s + 250);
        break;
      case 'gunluk_2x':
        setSkor(s => s + 150);
        break;
      default:
        break;
    }
  }

  function tasTikla(tileId) {
    unlockAudio();
    if (bitti || blocked.current || carpisma) return;
    const tile = tiles.find(t => t.id === tileId);
    if (!tile || tile.removed || tile.inTray || !isFree(tile, tiles)) return;
    if (tile.isFrozen) { showMsg('❄️ Yanındaki taşı eşleştir!', 1200); return; }
    if (tepsi.find(t => t?.tileId === tileId)) return;

    playTas();
    setHamle(m => m + 1);

    const yeniEleman = { id: Date.now() + Math.random(), kart: tile.kart, tileId, eslesti: false };
    // Sabit slot: ilk boş slota yerleştir
    const emptySlotIdx = tepsi.findIndex(t => t === null);
    if (emptySlotIdx === -1) return;
    const yeniTepsi = [...tepsi];
    yeniTepsi[emptySlotIdx] = yeniEleman;
    setTiles(prev => prev.map(t => t.id === tileId ? { ...t, inTray: true } : t));

    // Tepside çift ara (yeni eklenenle eşleşen)
    let pairIdx = -1;
    for (let i = 0; i < MAX_TEPSI; i++) {
      if (i === emptySlotIdx || !yeniTepsi[i]) continue;
      if (yeniTepsi[i].kart.tamga === yeniEleman.kart.tamga) {
        pairIdx = i; break;
      }
    }

    if (pairIdx >= 0) {
      const a = yeniTepsi[pairIdx];
      const b = yeniEleman;
      blocked.current = true;

      const isMit = tile.kart.kategori === 'mitoloji';
      const isHay = tile.kart.kategori === 'hayvan';
      const isOzelTas = ['t_back', 'oe_ue', 'r_back', 'k_back'].includes(tile.kart.id) || isMit || isHay;

      // Combo hesapla
      const simdi = Date.now();
      const comboDahil = (simdi - sonEslesmeRef.current) < COMBO_SURESI;
      sonEslesmeRef.current = simdi;
      const yeniCombo = comboDahil ? combo + 1 : 1;
      setCombo(yeniCombo);
      const carpan = comboÇarpan(yeniCombo);

      const tabanPuan = 100 + Math.floor(sure / 5);
      const ozelCarpan = isOzelTas ? 3 : 1;
      const puan = tabanPuan * ozelCarpan * carpan;

      if (isOzelTas) {
        playCombo();
        if (isMit) showMsg(SAMAN_SOZLERI[tile.kart.id] || '🔥 ŞAMAN ESLEŞMESİ!', 2000);
        else if (isHay) showMsg(`🐺 ${temizYazi(tile.kart.ses).toUpperCase()} RUHU! Güç aktif!`, 1800);
        else showMsg('MÜKEMMEL EŞLEŞME!');
      } else { playMatch(); }

      // Combo mesajı
      if (yeniCombo >= 2) {
        const comboIsim = 'ULU ALTAY';
        setComboMesaj(`${comboIsim} ${carpan}x`);
        setTimeout(() => setComboMesaj(null), 1200);
      }

      setSkor(s => s + puan);

      // Günlük görev ilerlemesi
      dispatch({ type: 'GUNLUK_GOREV_ILERLE', gorevTip: 'eslestirme', miktar: 1 });
      if (isMit) dispatch({ type: 'GUNLUK_GOREV_ILERLE', gorevTip: 'mitoloji', miktar: 1 });
      if (isHay) dispatch({ type: 'GUNLUK_GOREV_ILERLE', gorevTip: 'hayvan', miktar: 1 });
      if (yeniCombo >= 2) dispatch({ type: 'GUNLUK_GOREV_ILERLE', gorevTip: 'combo', miktar: 1 });

      // Kelime avcısı — eşleşen tamgayı kaydet
      const matchedTamga = tile.kart.tamga;
      if (matchedTamga) {
        setAcikHarfler(prev => prev.has(matchedTamga) ? prev : new Set([...prev, matchedTamga]));
      }

      // Eşleşeni parlat (sabit slotta)
      setTepsi(yeniTepsi.map(t =>
        t === null ? null : (t.tileId === a.tileId || t.tileId === b.tileId ? { ...t, eslesti: true } : t)
      ));
      setCarpisma({ kart1: a.kart, kart2: b.kart, isCombo: yeniCombo >= 2 });

      // Capture positions before setTimeout for frozen unfreeze logic
      const tileAPoz = tiles.find(t => t.id === a.tileId);
      const tileBPoz = tile;

      const carpismaSure = (isMit || isHay) ? 1700 : 1300;
      setTimeout(() => {
        setCarpisma(null);
        setTiles(prev => {
          const next = prev.map(t =>
            t.id === a.tileId || t.id === b.tileId
              ? { ...t, removed: true, inTray: false } : t
          );
          // Unfreeze tiles adjacent to the removed pair
          const removedPozlar = [tileAPoz, tileBPoz].filter(Boolean);
          return next.map(t => {
            if (!t.isFrozen || t.removed) return t;
            const coz = removedPozlar.some(rp =>
              rp.layer === t.layer && rp.row === t.row && Math.abs(rp.col - t.col) === 1
            );
            return coz ? { ...t, isFrozen: false } : t;
          });
        });
        // Eşleşen slotları null yap (diğerleri yerinde kalır)
        setTepsi(prev => prev.map(t =>
          t?.tileId === a.tileId || t?.tileId === b.tileId ? null : t
        ));
        blocked.current = false;
        applyPower(tile.kart);
      }, carpismaSure);
    } else {
      setTepsi(yeniTepsi);
      if (!yeniTepsi.includes(null)) { // Tüm slotlar dolu, eşleşme yok
        if (bozkurtCan > 0) {
          setBozkurtCan(c => c - 1);
          showMsg('🐺 Bozkurt korudu! Can azaldı.', 1800);
          blocked.current = true;
          const trayIds = yeniTepsi.filter(Boolean).map(t => t.tileId);
          setTimeout(() => {
            setTiles(prev => prev.map(t => trayIds.includes(t.id) ? { ...t, inTray: false } : t));
            setTepsi(Array(MAX_TEPSI).fill(null));
            blocked.current = false;
          }, 1800);
        } else {
          showMsg('🐺 Can kalmadı! Oyun bitti.', 1000);
          setTimeout(() => setBitti(true), 1200);
        }
      }
    }
  }

  function geriAl() {
    if (!tepsi.some(Boolean) || blocked.current || carpisma) return;
    if (bozkurtCan <= 0) { showMsg('🐺 Can kalmadı! Geri alamazsın.', 1200); return; }
    setBozkurtCan(c => c - 1);
    // En son eklenen taşı bul (en büyük id = en son)
    const dolu = tepsi.map((t, i) => [t, i]).filter(([t]) => t !== null);
    const [last, lastIdx] = dolu.sort((a, b) => b[0].id - a[0].id)[0];
    setTiles(prev => prev.map(t => t.id === last.tileId ? { ...t, inTray: false } : t));
    setTepsi(prev => { const next = [...prev]; next[lastIdx] = null; return next; });
    showMsg('🐺 -1 Can', 900);
  }

  function karistir() {
    if (bitti || blocked.current || !!carpisma) return;
    const hakKalan = state.gunlukHaklar?.karistirKalan ?? 0;
    if (hakKalan > 0) {
      dispatch({ type: 'KARISTIR_HAKKI_KULLAN' });
      showMsg(`🌀 Karıştırıldı! (${hakKalan - 1} ücretsiz hak kaldı)`, 1800);
    } else {
      if (sure <= 30) { showMsg('⚠️ Yeterli süre yok!', 1200); return; }
      setSure(s => s - 30);
      showMsg('🌀 Taşlar Karıştırıldı! -30s', 1500);
    }
    setTiles(prev => {
      const alive = prev.filter(t => !t.removed && !t.inTray);
      const kartlar = shuffle(alive.map(t => t.kart));
      let idx = 0;
      return prev.map(t => t.removed || t.inTray ? t : { ...t, kart: kartlar[idx++] });
    });
  }

  const onTahta = tiles.filter(t => !t.removed && !t.inTray);
  const eslendi = tiles.filter(t => t.removed).length / 2;
  const toplamCift = tiles.length / 2;
  const surePct = Math.max(0, (sure / maxSure) * 100);
  const sureRenk = sure > 60 ? '#4a9e6a' : sure > 20 ? '#c8820a' : '#c02020';

  // â”€â”€ BİTTİ â”€â”€
  if (bitti) {
    const kazandi = tiles.every(t => t.removed);
    const finalSkor = skor + (kazandi ? sure * 5 : 0);
    const surePctBitis = sure / maxSure;
    const kazanilanYildiz = kazandi ? (surePctBitis >= 0.45 ? 3 : surePctBitis >= 0.18 ? 2 : 1) : 0;
    return (
      <div className="screen mj-screen">
        <div className="mj-bitis">
          <div className="mj-bitis-ikon">{kazandi ? '\u{1F3C6}' : eslendi >= toplamCift * 0.7 ? '\u{2B50}' : '\u{23F1}'}</div>
          <h2 className="mj-baslik">{kazandi ? 'TEMIZLEDIN!' : tepsi.every(t => t !== null) ? 'TEPSI DOLDU' : 'SURE DOLDU'}</h2>
          {kazandi && (
            <div className="mj-bitis-yildizlar">
              {[1,2,3].map(i => (
                <span key={i} className={`mj-bitis-yildiz ${i <= kazanilanYildiz ? 'mj-yildiz-dolu' : 'mj-yildiz-bos'}`}>★</span>
              ))}
            </div>
          )}
          <div className="mj-bitis-skor">{finalSkor}</div>
          <p style={{ opacity: 0.6, fontSize: '0.82rem', marginTop: '-0.2rem' }}>puan</p>
          <div className="mj-bitis-istatlar">
            <div className="mj-stat"><span className="mj-stat-sayi">{eslendi}</span><span className="mj-stat-etiket">/{toplamCift} eslesme</span></div>
            <div className="mj-stat"><span className="mj-stat-sayi">{hamle}</span><span className="mj-stat-etiket">hamle</span></div>
            <div className="mj-stat"><span className="mj-stat-sayi">{sure}s</span><span className="mj-stat-etiket">kalan</span></div>
          </div>

          {/* Liderlik Tablosuna Kaydet Modal Bölümü */}
          {finalSkor > 0 && kazandi && !ozelSeviye && (
             <div className="liderlik-kayit-alani" style={{ background: 'rgba(0,0,0,0.5)', padding: '15px', borderRadius: '10px', marginTop: '15px', marginBottom: '15px' }}>
               {skorKaydedildi ? (
                 <div style={{ color: '#4a9e6a', fontWeight: 'bold' }}>✓ Skor Liderlik Tablosuna Eklendi!</div>
               ) : (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                   <p style={{ margin: 0, fontSize: '0.9rem', color: '#ffd700' }}>Adını Tarihe Yazdır!</p>
                   <input 
                     type="text" 
                     placeholder="İsmin veya Unvanın" 
                     value={isimGiris} 
                     onChange={(e) => setIsimGiris(e.target.value)} 
                     style={{ padding: '10px', borderRadius: '5px', border: '1px solid #c8820a', background: 'rgba(0,0,0,0.8)', color: '#fff' }}
                   />
                   <button 
                     className="btn btn-altin" 
                     onClick={() => skoruKaydet(finalSkor)}
                     disabled={skorKaydediliyor || !isimGiris.trim()}
                   >
                     {skorKaydediliyor ? 'Kaydediliyor...' : 'Skoru Gönder 🏆'}
                   </button>
                 </div>
               )}
             </div>
          )}

          {kazandi ? (
            ozelSeviye ? (
              <button className="btn btn-birincil" style={{ width: '100%' }} onClick={() => {
                const bolgeId = state.sefer?.bolgeId || state.seciliBolge || 'orhun';
                const sonrakiSeviye = aktifSeviye + 1;
                if (sonrakiSeviye >= 15) {
                  dispatch({ type: 'NAVIGATE', ekran: 'map' });
                } else {
                  dispatch({ type: 'SEFER_BASLAT', bolgeId, seviye: sonrakiSeviye, guc: null, ozelSeviye: true });
                }
              }}>
                {aktifSeviye >= 14 ? 'Bölgeyi Tamamladın! ⭐' : 'Sonraki Seviye →'}
              </button>
            ) : (
              <button className="btn btn-birincil" style={{ width: '100%' }} onClick={() => {
                if (startBolum >= TOPLAM_BOLUM) {
                  dispatch({ type: 'NAVIGATE', ekran: 'map' });
                  return;
                }
                const sonraki = Math.min(startBolum + 1, TOPLAM_BOLUM);
                dispatch({ type: 'SEFER_BASLAT', bolgeId: 'orhun', seviye: 0, guc: null, bolum: sonraki });
              }}>
                {startBolum < TOPLAM_BOLUM ? 'Sonraki Bölüm' : 'Tamamlandı!'}
              </button>
            )
          ) : (
            <button className="btn btn-birincil" style={{ width: '100%' }} onClick={() => window.location.reload()}>Tekrar Oyna</button>
          )}
          <button className="btn btn-ikincil" style={{ width: '100%', marginTop: '0.5rem' }}
            onClick={() => dispatch({ type: 'NAVIGATE', ekran: 'map' })}>Haritaya Don</button>
        </div>
      </div>
    );
  }

  // â”€â”€ OYUN â”€â”€
  return (
    <div className="screen mj-screen" style={{ position: 'relative' }}>
      {/* Header */}
      <div className="mj-header">
        <button className="geri-btn" onClick={() => dispatch({ type: 'NAVIGATE', ekran: 'map' })}>&#8592;</button>
        <button className="geri-btn" style={{ marginLeft: '6px', fontSize: '1rem', padding: '0.4rem' }} onClick={toggleMute}>
          {isMuted ? '\u{1F507}' : '\u{1F50A}'}
        </button>
        <div className="mj-sure-wrap">
          <div className="mj-sure-bar">
            <div className="mj-sure-ic" style={{ width: `${surePct}%`, background: sureRenk }} />
          </div>
          <span className="mj-sure-sayi" style={{ color: sureRenk }}>{sure}s</span>
        </div>
        <div className="mj-can-alan">
          {Array.from({ length: MAX_CAN }).map((_, i) => (
            <span key={i} className={`mj-can-ikon ${i < bozkurtCan ? 'mj-can-dolu' : 'mj-can-bos'}`}>🐺</span>
          ))}
        </div>
        <div className="mj-skor-badge">
          <span style={{ fontSize: '0.65rem', opacity: 0.7, display: 'block', lineHeight: 1 }}>
            {ozelSeviye ? `Lv${aktifSeviye + 1}/15` : `B${bolum}/50`}
          </span>
          {skor} &#10022;
          {combo >= 2 && <span className="mj-combo-badge">{comboÇarpan(combo)}x</span>}
        </div>
      </div>

      {/* Tepsi â€” üst alan */}
      <div className="mj-tepsi-alan">
        <div className="mj-tepsi">
          {Array.from({ length: MAX_TEPSI }, (_, i) => {
            const t = tepsi[i];
            if (!t) return <div key={i} className="mj-tepsi-slot" />;
            const d = display(t.kart);
            return (
              <div key={i} className={[
                'mj-tepsi-tas',
                t.eslesti ? 'mj-tepsi-eslesti' : '',
                d.isMit ? 'mj-tepsi-mit' : '',
                d.isHay ? 'mj-tepsi-hay' : '',
              ].filter(Boolean).join(' ')}>
                <TasIcerik kart={t.kart} tepsi />
              </div>
            );
          })}
        </div>
      </div>

      <div className="mj-durum-row">
        <span>{eslendi}/{toplamCift} eslesme</span>
        <span>{hamle} hamle</span>
      </div>

      {/* Gizli Kelimeler */}
      {gizliKelimeler.length > 0 && (
        <div className="mj-kelime-panel">
          {gizliKelimeler.map((kelime, ki) => (
            <div key={ki} className="mj-kelime-grup">
              <div className="mj-kelime-slotlar">
                {kelime.harfler.map((harf, hi) => {
                  const acik = acikHarfler.has(harf);
                  return (
                    <div key={hi} className={`mj-kelime-slot ${acik ? 'mj-kelime-slot-acik' : 'mj-kelime-slot-buz'}`}>
                      <span className="mj-kelime-harf">{harf}</span>
                    </div>
                  );
                })}
              </div>
              <span className="mj-kelime-latin">{kelime.latin}</span>
            </div>
          ))}
          {kelimeAvciGoster && <span className="mj-kelime-avci">🔑</span>}
        </div>
      )}

      {efektMesaj && <div className="mj-efekt-mesaj">{efektMesaj}</div>}
      {comboMesaj && <div className="mj-combo-efekt">{comboMesaj}</div>}

      {/* Carpışma sahnesi */}
      {carpisma && (() => {
        const mitKart = carpisma.kart1.kategori === 'mitoloji' ? carpisma.kart1
          : carpisma.kart2.kategori === 'mitoloji' ? carpisma.kart2 : null;
        const hayKart = !mitKart && (carpisma.kart1.kategori === 'hayvan' ? carpisma.kart1
          : carpisma.kart2.kategori === 'hayvan' ? carpisma.kart2 : null);
        return (
          <div className={`cp-overlay ${carpisma.isCombo ? 'cp-combo' : ''}`}>
            <div className="cp-sahne">
              <div className={`cp-kart cp-sol ${carpisma.kart1.kategori === 'mitoloji' ? 'cp-mit' : ''} ${carpisma.kart1.kategori === 'hayvan' ? 'cp-hay' : ''}`}>
                <TasIcerik kart={carpisma.kart1} buyuk />
              </div>
              <div className={`cp-kart cp-sag ${carpisma.kart2.kategori === 'mitoloji' ? 'cp-mit' : ''} ${carpisma.kart2.kategori === 'hayvan' ? 'cp-hay' : ''}`}>
                <TasIcerik kart={carpisma.kart2} buyuk />
              </div>
            </div>
            {(mitKart || hayKart) && (
              <div className="cp-ruh-aciklama">
                {mitKart
                  ? <><span className="cp-ruh-guc-ikon">{mitKart.guc?.ikon}</span><span>{mitKart.guc?.adi}</span><span className="cp-ruh-aciklama-metin">{mitKart.guc?.aciklama}</span></>
                  : <><span className="cp-ruh-guc-ikon">{hayKart.guc?.ikon}</span><span>{hayKart.guc?.adi}</span><span className="cp-ruh-aciklama-metin">{hayKart.guc?.aciklama}</span></>
                }
              </div>
            )}
          </div>
        );
      })()}

      {/* Tahta */}
      <div className="mj-tahta-kap" ref={tahtaKapRef}>
        <MjGoktArka />
        <div style={{ width: boardDims.w * boardScale, height: boardDims.h * boardScale, overflow: 'hidden', flexShrink: 0 }}>
        <div className="mj-tahta" style={{ width: boardDims.w, height: boardDims.h, transform: boardScale < 1 ? `scale(${boardScale})` : undefined, transformOrigin: 'top left' }}>
          {onTahta.map(tile => {
            const free = isFree(tile, tiles);
            const d = display(tile.kart);
            const pos = tilePos(tile.col, tile.row, tile.layer, boardDims.maxL * LOY);
            return (
              <div
                key={tile.id}
                className={[
                  'mj-tas',
                  free ? 'mj-tas-serbest' : 'mj-tas-kapali',
                  d.isMit ? 'mj-tas-mit' : '',
                  d.isMit ? `mj-tas-${tile.kart.id}` : '',
                  d.isHay ? 'mj-tas-hay' : '',
                  tile.isFrozen ? 'mj-tas-donmus' : '',
                ].filter(Boolean).join(' ')}
                style={{ left: pos.left, top: pos.top, zIndex: pos.zIndex }}
                onClick={() => tasTikla(tile.id)}
              >
                <TasIcerik kart={tile.kart} />
                {tile.isFrozen && <span className="mj-donmus-overlay">❄</span>}
              </div>
            );
          })}
        </div>
        </div>
      </div>

      {/* Alt butonlar */}
      <div className="mj-guc-butonlar">
        <button
          className="mj-guc-btn"
          onClick={geriAl}
          disabled={!tepsi.some(Boolean) || !!carpisma || bozkurtCan <= 1}
        >
          <span className="mj-guc-ikon">&#8617;</span>
          <span className="mj-guc-yazi">Geri Al 🐺</span>
        </button>
        <button
          className="mj-guc-btn mj-karistir-btn"
          onClick={karistir}
          disabled={bitti || !!carpisma || ((state.gunlukHaklar?.karistirKalan ?? 0) <= 0 && sure <= 30)}
        >
          <span className="mj-guc-ikon">🌀</span>
          <span className="mj-guc-yazi">
            {(state.gunlukHaklar?.karistirKalan ?? 0) > 0
              ? `Karıştır ✦${state.gunlukHaklar.karistirKalan}`
              : 'Karıştır -30s'}
          </span>
        </button>
      </div>
    </div>
  );
}

