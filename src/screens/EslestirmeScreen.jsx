import { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { TAMGALAR, MITOLOJI, HAYVANLAR, BOLGELER } from '../data/tamgalar';
import { useAudio } from '../hooks/useAudio';

const TW = 44;
const TH = 55;
const GAP = 2;
const LOX = 4;
const LOY = 6;
const MAX_TEPSI = 4;
const ESLESTI_MS = 520;

// Bölüm 1-10: 240sn | 11-20: 210sn | 21-30: 180sn | 31-40: 150sn | 41-50: 120sn
function bolumSuresi(bolum) {
  if (bolum <= 10) return 240;
  if (bolum <= 20) return 210;
  if (bolum <= 30) return 180;
  if (bolum <= 40) return 150;
  return 120;
}
const OYUN_SURESI = 240; // fallback (sure barı için)
const TOPLAM_BOLUM = 50;

// Piramit düzenleri: seviye 1'de az taş, seviye arttıkça büyür
const PIRAMIT_DUZENLER = [
  // Seviye 1: 8 taş (4 çift) â€” mini piramit
  [{r:0,c:2,l:0},{r:1,c:1,l:0},{r:1,c:2,l:0},{r:1,c:3,l:0},
   {r:2,c:1,l:0},{r:2,c:2,l:0},{r:2,c:3,l:0},{r:3,c:2,l:0}],
  // Seviye 2: 12 taş (6 çift) â€” orta piramit
  [{r:0,c:2,l:0},{r:1,c:1,l:0},{r:1,c:2,l:0},{r:1,c:3,l:0},
   {r:2,c:0,l:0},{r:2,c:1,l:0},{r:2,c:2,l:0},{r:2,c:3,l:0},{r:2,c:4,l:0},
   {r:3,c:1,l:0},{r:3,c:2,l:0},{r:3,c:3,l:0}],
  // Seviye 3: 16 taş (8 çift) â€” piramit + 1 üst katman
  [{r:0,c:2,l:0},{r:1,c:1,l:0},{r:1,c:2,l:0},{r:1,c:3,l:0},
   {r:2,c:0,l:0},{r:2,c:1,l:0},{r:2,c:2,l:0},{r:2,c:3,l:0},{r:2,c:4,l:0},
   {r:3,c:1,l:0},{r:3,c:2,l:0},{r:3,c:3,l:0},{r:4,c:2,l:0},
   {r:1,c:2,l:1},{r:2,c:2,l:1},{r:3,c:2,l:1}],
  // Seviye 4: 20 taş (10 çift) â€” geniş piramit
  [{r:0,c:3,l:0},{r:0,c:4,l:0},
   {r:1,c:2,l:0},{r:1,c:3,l:0},{r:1,c:4,l:0},{r:1,c:5,l:0},
   {r:2,c:1,l:0},{r:2,c:2,l:0},{r:2,c:3,l:0},{r:2,c:4,l:0},{r:2,c:5,l:0},{r:2,c:6,l:0},
   {r:3,c:2,l:0},{r:3,c:3,l:0},{r:3,c:4,l:0},{r:3,c:5,l:0},
   {r:4,c:3,l:0},{r:4,c:4,l:0},
   {r:1,c:3,l:1},{r:2,c:3,l:1}],
  // Seviye 5: 24 taş (12 çift) â€” tam piramit 2 katman
  [{r:0,c:3,l:0},{r:0,c:4,l:0},
   {r:1,c:2,l:0},{r:1,c:3,l:0},{r:1,c:4,l:0},{r:1,c:5,l:0},
   {r:2,c:1,l:0},{r:2,c:2,l:0},{r:2,c:3,l:0},{r:2,c:4,l:0},{r:2,c:5,l:0},{r:2,c:6,l:0},
   {r:3,c:2,l:0},{r:3,c:3,l:0},{r:3,c:4,l:0},{r:3,c:5,l:0},
   {r:4,c:3,l:0},{r:4,c:4,l:0},
   {r:1,c:3,l:1},{r:1,c:4,l:1},{r:2,c:3,l:1},{r:2,c:4,l:1},{r:3,c:3,l:1},{r:3,c:4,l:1}],
  // Seviye 6+: 28 taş (14 çift) â€” dev piramit
  [{r:0,c:3,l:0},{r:0,c:4,l:0},{r:0,c:5,l:0},{r:0,c:6,l:0},
   {r:1,c:2,l:0},{r:1,c:3,l:0},{r:1,c:4,l:0},{r:1,c:5,l:0},{r:1,c:6,l:0},
   {r:2,c:1,l:0},{r:2,c:2,l:0},{r:2,c:3,l:0},{r:2,c:4,l:0},{r:2,c:5,l:0},{r:2,c:6,l:0},{r:2,c:7,l:0},
   {r:3,c:2,l:0},{r:3,c:3,l:0},{r:3,c:4,l:0},{r:3,c:5,l:0},{r:3,c:6,l:0},
   {r:4,c:3,l:0},{r:4,c:4,l:0},{r:4,c:5,l:0},
   {r:1,c:4,l:1},{r:2,c:3,l:1},{r:2,c:4,l:1},{r:3,c:4,l:1}],
];

// bolum 1-50 → piramit düzeni
function getLayout(bolum) {
  if (bolum <= 4)  return PIRAMIT_DUZENLER[0]; // 8 taş
  if (bolum <= 9)  return PIRAMIT_DUZENLER[1]; // 12 taş
  if (bolum <= 14) return PIRAMIT_DUZENLER[2]; // 16 taş
  if (bolum <= 19) return PIRAMIT_DUZENLER[3]; // 20 taş
  if (bolum <= 24) return PIRAMIT_DUZENLER[4]; // 24 taş
  return PIRAMIT_DUZENLER[5];                  // 28 taş (bölüm 25-50)
}

function getBoardDims(layout) {
  const maxC = Math.max(...layout.map(p => p.c ?? p.col));
  const maxR = Math.max(...layout.map(p => p.r ?? p.row));
  return {
    w: (maxC + 2) * (TW + GAP) + 20,
    h: (maxR + 1) * (TH + GAP) + 20,
  };
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

// Latin harfler: 15. bÃ¶lÃ¼mden sonra her 5 bÃ¶lÃ¼mde +5 harf
function latinHarfSayisi(bolum) {
  if (bolum < 15) return 0;
  const adim = Math.floor((bolum - 15) / 5) + 1;
  return Math.min(TAMGALAR.length, adim * 5);
}

function aktifHarfIdleri(bolum) {
  const sayi = latinHarfSayisi(bolum);
  return new Set(TAMGALAR.slice(0, sayi).map((t) => t.id));
}

function kartHavuzu(bolum) {
  const havuz = [...TAMGALAR];
  if (bolum >= 5) havuz.push(...MITOLOJI);
  if (bolum >= 11) havuz.push(...HAYVANLAR);
  return havuz;
}

function createBoard(bolgeId, bolum = 1) {
  const layout = getLayout(bolum);
  const pairCount = layout.length / 2;
  const pool = shuffle(kartHavuzu(bolum));
  let selectedPool = [];
  for (let i = 0; i < pairCount; i++) {
    selectedPool.push(pool[i % pool.length]);
  }
  const latinSet = aktifHarfIdleri(bolum);
  const latinAcik = bolum >= 15;
  const doubled = shuffle([
    ...selectedPool.map(k => ({ ...k, displayMode: 'tamga' })),
    ...selectedPool.map(k => ({
      ...k,
      displayMode: (latinAcik && k.kategori !== 'mitoloji' && k.kategori !== 'hayvan' && latinSet.has(k.id)) ? 'latin' : 'tamga'
    }))
  ]);
  return shuffle([...layout]).map((pos, i) => ({
    id: i, row: pos.r, col: pos.c, layer: pos.l,
    kart: doubled[i], removed: false, inTray: false,
  }));
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

function tilePos(col, row, layer) {
  const offsetCol = col + 1;
  return {
    left: offsetCol * (TW + GAP) - layer * LOX,
    top: row * (TH + GAP) - layer * LOY,
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

function display(kart) {
  const isMit = kart.kategori === 'mitoloji';
  const isHay = kart.kategori === 'hayvan';
  if (kart.displayMode === 'latin' && !isMit && !isHay) {
    return { isGokt: false, main: temizYazi(kart.ses).split(' ')[0], sub: temizYazi(kart.fonetik), isMit: false, isHay: false, isLatin: true, isOzel: false };
  }
  if (!isMit && !isHay) return { isGokt: true, main: kart.tamga, sub: temizYazi(kart.ses), isMit: false, isHay: false, isLatin: false, isOzel: false };
  const mono = gokturkMonogram(kart);
  return { isGokt: false, main: mono, sub: temizYazi(kart.ses), isMit, isHay, isLatin: false, isOzel: true };
}

function TasIcerik({ kart, buyuk = false, tepsi = false }) {
  const d = display(kart);
  const anaClass = tepsi
    ? (d.isGokt ? 'mj-tepsi-gokt' : 'mj-tepsi-ana')
    : buyuk
      ? (d.isGokt ? 'cp-tamga' : 'cp-ozel')
      : (d.isGokt ? 'mj-ana mj-ana-gokt' : (d.isLatin ? 'mj-ana mj-ana-latin' : 'mj-ana mj-ana-ozel'));
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
  const aktifSeviye = state.sefer?.aktif ? state.sefer.seviye : 0;
  const bolum = Math.min(state.eslestirmeBolum || 1, TOPLAM_BOLUM);
  // startBolum: mount anındaki bölüm — ESLESTIRME_TAMAMLA sonrası bolum değişse bile doğru sonraki bölümü hesaplar
  const [startBolum] = useState(bolum);
  const [tiles, setTiles] = useState(() => createBoard(state.seciliBolge, bolum));
  const boardDims = getBoardDims(getLayout(bolum));
  const [tepsi, setTepsi] = useState([]);   // [{id, kart, tileId, eslesti}]
  const [carpisma, setCarpisma] = useState(null);
  const maxSure = bolumSuresi(startBolum);
  const [sure, setSure] = useState(maxSure);
  const [skor, setSkor] = useState(0);
  const [hamle, setHamle] = useState(0);
  const [bitti, setBitti] = useState(false);
  const [efektMesaj, setEfektMesaj] = useState(null);
  const blocked = useRef(false);

  useEffect(() => {
    unlockAudio();
    playBgm();
    return () => stopBgm();
  }, [unlockAudio, playBgm, stopBgm]);

  useEffect(() => {
    if (bitti) stopBgm();
  }, [bitti, stopBgm]);

  useEffect(() => {
    if (bitti) return;
    if (sure <= 0) { setBitti(true); return; }
    const t = setTimeout(() => setSure(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [sure, bitti]);

  // Kazanma kontrolÃ¼
  useEffect(() => {
    if (bitti) return;
    const onTahtaCount = tiles.filter(t => !t.removed && !t.inTray).length;
    if (onTahtaCount === 0 && tiles.every(t => t.removed)) {
      setBitti(true);
      const finalSkor = skor + sure * 5;
      dispatch({
        type: 'ESLESTIRME_TAMAMLA',
        bolgeId: state.seciliBolge || 'orhun',
        seviye: aktifSeviye,
        puan: finalSkor,
        kazandi: true
      });
    }
  }, [tiles, bitti]);

  function showMsg(msg, dur = 1500) {
    setEfektMesaj(msg);
    setTimeout(() => setEfektMesaj(null), dur);
  }

  function applyPower(kart) {
    if (!kart.guc) return;
    switch (kart.guc.id) {
      case 'ulgen_isik': setSure(s => Math.min(s + 30, maxSure + 60)); showMsg('Ulgen — +30 saniye!'); break;
      case 'sure_uzat': setSure(s => Math.min(s + 20, maxSure + 60)); showMsg(`${kart.ses} — +20 saniye!`); break;
      default: showMsg(`${kart.ses} ruhu serbest kaldi!`, 1200); break;
    }
  }

  function tasTikla(tileId) {
    unlockAudio();
    if (bitti || blocked.current || carpisma) return;
    const tile = tiles.find(t => t.id === tileId);
    if (!tile || tile.removed || tile.inTray || !isFree(tile, tiles)) return;
    if (tepsi.find(t => t.tileId === tileId)) return;

    playTas();
    playClick();
    setHamle(m => m + 1);

    const yeniEleman = { id: Date.now() + Math.random(), kart: tile.kart, tileId, eslesti: false };
    const yeniTepsi = [...tepsi, yeniEleman];
    setTiles(prev => prev.map(t => t.id === tileId ? { ...t, inTray: true } : t));

    // Tepside çift ara (yeni eklenenle eÅŸleÅŸen)
    let pairIdx = -1;
    for (let i = 0; i < yeniTepsi.length - 1; i++) {
      if (yeniTepsi[i].kart.tamga === yeniTepsi[yeniTepsi.length - 1].kart.tamga) {
        pairIdx = i; break;
      }
    }

    if (pairIdx >= 0) {
      const a = yeniTepsi[pairIdx];
      const b = yeniTepsi[yeniTepsi.length - 1];
      blocked.current = true;

      const isCombo = ['t_back', 'oe_ue', 'r_back', 'k_back'].includes(tile.kart.id) || tile.kart.kategori === 'mitoloji';
      const tabanPuan = 100 + Math.floor(sure / 5);
      const puan = isCombo ? tabanPuan * 3 : tabanPuan;
      if (isCombo) { playCombo(); showMsg('MUKEMMEL ESLEME!'); }
      else { playMatch(); }
      setSkor(s => s + puan);

      // Esleseni parlat
      setTepsi(yeniTepsi.map((t, idx) =>
        t.tileId === a.tileId || t.tileId === b.tileId ? { ...t, eslesti: true } : t
      ));
      setCarpisma({ kart1: a.kart, kart2: b.kart, isCombo });

      setTimeout(() => {
        setCarpisma(null);
        setTiles(prev => prev.map(t =>
          t.id === a.tileId || t.id === b.tileId
            ? { ...t, removed: true, inTray: false } : t
        ));
        setTepsi(prev => prev.filter(t => t.tileId !== a.tileId && t.tileId !== b.tileId));
        blocked.current = false;
        applyPower(tile.kart);
      }, ESLESTI_MS);
    } else {
      setTepsi(yeniTepsi);
      if (yeniTepsi.length >= MAX_TEPSI) {
        showMsg('Tepsi doldu! Oyun bitti.', 1000);
        setTimeout(() => setBitti(true), 1200);
      }
    }
  }

  function geriAl() {
    if (tepsi.length === 0 || blocked.current || carpisma) return;
    const last = tepsi[tepsi.length - 1];
    setTiles(prev => prev.map(t => t.id === last.tileId ? { ...t, inTray: false } : t));
    setTepsi(prev => prev.slice(0, -1));
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
    return (
      <div className="screen mj-screen">
        <div className="mj-bitis">
          <div className="mj-bitis-ikon">{kazandi ? '\u{1F3C6}' : eslendi >= toplamCift * 0.7 ? '\u{2B50}' : '\u{23F1}'}</div>
          <h2 className="mj-baslik">{kazandi ? 'TEMIZLEDIN!' : tepsi.length >= MAX_TEPSI ? 'TEPSI DOLDU' : 'SURE DOLDU'}</h2>
          <div className="mj-bitis-skor">{finalSkor}</div>
          <p style={{ opacity: 0.6, fontSize: '0.82rem', marginTop: '-0.2rem' }}>puan</p>
          <div className="mj-bitis-istatlar">
            <div className="mj-stat"><span className="mj-stat-sayi">{eslendi}</span><span className="mj-stat-etiket">/{toplamCift} eslesme</span></div>
            <div className="mj-stat"><span className="mj-stat-sayi">{hamle}</span><span className="mj-stat-etiket">hamle</span></div>
            <div className="mj-stat"><span className="mj-stat-sayi">{sure}s</span><span className="mj-stat-etiket">kalan</span></div>
          </div>
          {kazandi ? (
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
        <div className="mj-skor-badge">
          <span style={{ fontSize: '0.65rem', opacity: 0.7, display: 'block', lineHeight: 1 }}>B{bolum}/50</span>
          {skor} &#10022;
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

      {efektMesaj && <div className="mj-efekt-mesaj">{efektMesaj}</div>}

      {/* CarpÄ±sma sahnesi */}
      {carpisma && (
        <div className={`cp-overlay ${carpisma.isCombo ? 'cp-combo' : ''}`}>
          <div className="cp-sahne">
            <div className={`cp-kart cp-sol ${carpisma.kart1.kategori === 'mitoloji' ? 'cp-mit' : ''} ${carpisma.kart1.kategori === 'hayvan' ? 'cp-hay' : ''}`}>
              <TasIcerik kart={carpisma.kart1} buyuk />
            </div>
            <div className={`cp-kart cp-sag ${carpisma.kart2.kategori === 'mitoloji' ? 'cp-mit' : ''} ${carpisma.kart2.kategori === 'hayvan' ? 'cp-hay' : ''}`}>
              <TasIcerik kart={carpisma.kart2} buyuk />
            </div>
          </div>
        </div>
      )}

      {/* Tahta */}
      <div className="mj-tahta-kap">
        <div className="mj-tahta" style={{ width: boardDims.w, height: boardDims.h }}>
          {onTahta.map(tile => {
            const free = isFree(tile, tiles);
            const d = display(tile.kart);
            const pos = tilePos(tile.col, tile.row, tile.layer);
            return (
              <div
                key={tile.id}
                className={[
                  'mj-tas',
                  free ? 'mj-tas-serbest' : 'mj-tas-kapali',
                  d.isMit ? 'mj-tas-mit' : '',
                  d.isHay ? 'mj-tas-hay' : '',
                ].filter(Boolean).join(' ')}
                style={{ left: pos.left, top: pos.top, zIndex: pos.zIndex }}
                onClick={() => tasTikla(tile.id)}
              >
                <TasIcerik kart={tile.kart} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Alt butonlar */}
      <div className="mj-guc-butonlar">
        <button
          className="mj-guc-btn"
          onClick={geriAl}
          disabled={tepsi.length === 0 || !!carpisma}
        >
          <span className="mj-guc-ikon">&#8617;</span>
          <span className="mj-guc-yazi">Geri Al</span>
        </button>
      </div>
    </div>
  );
}

