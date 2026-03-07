import { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { TAMGALAR, MITOLOJI, HAYVANLAR } from '../data/tamgalar';

const TW = 52;
const TH = 64;
const GAP = 2;
const LOX = 5;
const LOY = 6;
const COLS = 6;
const ROWS = 4;
const MAX_BIRIKME = 5;
const OYUN_SURESI = 180;
const CARPISMA_MS = 960;

const LAYOUT = [
  ...Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => ({ r, c, l: 0 }))
  ).flat(),
  ...Array.from({ length: 2 }, (_, ri) =>
    Array.from({ length: 4 }, (_, ci) => ({ r: ri + 1, c: ci + 1, l: 1 }))
  ).flat(),
  ...Array.from({ length: 2 }, (_, ri) =>
    Array.from({ length: 2 }, (_, ci) => ({ r: ri + 1, c: ci + 2, l: 2 }))
  ).flat(),
];

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function createBoard() {
  const pool    = shuffle([...TAMGALAR, ...MITOLOJI, ...HAYVANLAR]).slice(0, 18);
  const doubled = shuffle([...pool, ...pool]);
  return shuffle([...LAYOUT]).map((pos, i) => ({
    id: i, row: pos.r, col: pos.c, layer: pos.l,
    kart: doubled[i], removed: false, inTray: false,
  }));
}

function isFree(tile, all) {
  const alive = all.filter(t => !t.removed && !t.inTray && t.id !== tile.id);
  if (alive.some(t => t.layer === tile.layer + 1 && t.row === tile.row && t.col === tile.col)) return false;
  const hasL = alive.some(t => t.layer === tile.layer && t.row === tile.row && t.col === tile.col - 1);
  const hasR = alive.some(t => t.layer === tile.layer && t.row === tile.row && t.col === tile.col + 1);
  return !hasL || !hasR;
}

function tilePos(col, row, layer) {
  return {
    left:   col * (TW + GAP) - layer * LOX,
    top:    row * (TH + GAP) - layer * LOY,
    zIndex: layer * 100 + row * 10 + col,
  };
}

function display(kart) {
  const isMit = kart.kategori === 'mitoloji';
  const isHay = kart.kategori === 'hayvan';
  if (!isMit && !isHay) return { isGokt: true,  main: kart.tamga, sub: kart.ses, isMit: false, isHay: false };
  if (isHay)            return { isGokt: false, main: kart.tamga, sub: kart.ses, isMit: false, isHay: true  };
  const safe = { '💀': '☽', '🤍': '◈' };
  return { isGokt: false, main: safe[kart.tamga] ?? kart.tamga, sub: kart.ses, isMit: true, isHay: false };
}

const BOARD_W = COLS * (TW + GAP) - GAP + 8;
const BOARD_H = ROWS * (TH + GAP) - GAP + 8;

function TasIcerik({ kart, buyuk = false }) {
  const d = display(kart);
  return (
    <>
      <span className={buyuk
        ? (d.isGokt ? 'cp-tamga' : 'cp-emoji')
        : (d.isGokt ? 'mj-ana mj-ana-gokt' : 'mj-ana mj-ana-emoji')
      }>{d.main}</span>
      <span className={buyuk ? 'cp-ses' : 'mj-ses'}>{d.sub}</span>
      {!buyuk && (d.isMit || d.isHay) && <span className="mj-ozel-bant" />}
    </>
  );
}

export default function EslestirmeScreen() {
  const { dispatch } = useGame();
  const [tiles, setTiles]       = useState(() => createBoard());
  const [secili, setSecili]     = useState(null);    // { id, kart }
  const [birikme, setBirikme]   = useState([]);      // [{ id, kart }]  max 5
  const [carpisma, setCarpisma] = useState(null);    // { kart1, kart2 } | null
  const [sure, setSure]         = useState(OYUN_SURESI);
  const [skor, setSkor]         = useState(0);
  const [hamle, setHamle]       = useState(0);
  const [bitti, setBitti]       = useState(false);
  const [baslamadi, setBaslamadi] = useState(true);
  const [efektMesaj, setEfektMesaj] = useState(null);
  const [yanlisAnim, setYanlisAnim] = useState(false);
  const blocked = useRef(false);

  // Sayaç
  useEffect(() => {
    if (baslamadi || bitti) return;
    if (sure <= 0) { setBitti(true); return; }
    const t = setTimeout(() => setSure(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [sure, bitti, baslamadi]);

  // Kazanma
  useEffect(() => {
    if (!baslamadi && tiles.every(t => t.removed)) setBitti(true);
  }, [tiles, baslamadi]);

  function showMsg(msg, dur = 1800) {
    setEfektMesaj(msg);
    setTimeout(() => setEfektMesaj(null), dur);
  }

  function applyPower(kart) {
    if (!kart.guc) return;
    switch (kart.guc.id) {
      case 'ulgen_isik': setSure(s => Math.min(s + 30, OYUN_SURESI + 60)); showMsg('Ulgen — +30 saniye!'); break;
      case 'sure_uzat':  setSure(s => Math.min(s + 20, OYUN_SURESI + 60)); showMsg(`${kart.ses} — +20 saniye!`); break;
      default: showMsg(`${kart.ses} ruhu serbest kaldi!`, 1200); break;
    }
  }

  function tasTikla(tileId) {
    if (baslamadi || bitti || blocked.current || carpisma) return;
    const tile = tiles.find(t => t.id === tileId);
    if (!tile || tile.removed || tile.inTray || !isFree(tile, tiles)) return;

    setHamle(m => m + 1);

    if (!secili) {
      // Birinci kart → önizlemeye al
      setSecili({ id: tileId, kart: tile.kart });
      setTiles(prev => prev.map(t => t.id === tileId ? { ...t, inTray: true } : t));

    } else {
      // İkinci kart
      if (secili.kart.tamga === tile.kart.tamga && secili.id !== tileId) {
        // EŞLEŞME → çarpışma sahnesi
        blocked.current = true;
        const puan = 100 + Math.floor(sure / 5);
        setSkor(s => s + puan);
        setTiles(prev => prev.map(t => t.id === tileId ? { ...t, inTray: true } : t));

        const sid = secili.id;
        setCarpisma({ kart1: secili.kart, kart2: tile.kart });

        setTimeout(() => {
          setCarpisma(null);
          setTiles(prev => prev.map(t =>
            t.id === sid || t.id === tileId ? { ...t, removed: true, inTray: false } : t
          ));
          setSecili(null);
          blocked.current = false;
          applyPower(tile.kart);
        }, CARPISMA_MS);

      } else {
        // YANLIŞ → seçili salla, yeni kart birikme yığınına gider
        setYanlisAnim(true);
        setTimeout(() => setYanlisAnim(false), 420);

        const yeni = [...birikme, { id: tileId, kart: tile.kart }];
        setBirikme(yeni);
        setTiles(prev => prev.map(t => t.id === tileId ? { ...t, inTray: true } : t));

        if (yeni.length >= MAX_BIRIKME) {
          showMsg('Birikme doldu!', 900);
          setTimeout(() => setBitti(true), 1000);
        }
      }
    }
  }

  const onTahta  = tiles.filter(t => !t.removed && !t.inTray);
  const eslendi  = tiles.filter(t => t.removed).length / 2;
  const surePct  = Math.max(0, (sure / OYUN_SURESI) * 100);
  const sureRenk = sure > 60 ? '#4a9e6a' : sure > 20 ? '#c8820a' : '#c02020';

  // ── INTRO ──
  if (baslamadi) {
    return (
      <div className="screen mj-screen">
        <div className="mj-intro">
          <div className="mj-intro-ikon">&#128024;</div>
          <h2 className="mj-baslik">TAMGA AVI</h2>
          <p className="mj-intro-acik">
            Serbest tasa dokun — önizlemeye gelir. Ayni tamgayi seçersen
            ikisi çarpışıp kırılır! Yanlis seçersen birikme alanına gider.
            Birikme 5 dolunca oyun biter.
          </p>
          <div className="mj-kural">
            <div>&#128070; Serbest tasa dokun → önizleme</div>
            <div>&#10024; Esini seç → çarpışıp kırılır</div>
            <div>&#9888; Yanlis seçersen birikme dolar (max 5)</div>
          </div>
          <button className="btn btn-birincil" style={{ width: '100%', marginTop: '1.2rem' }}
            onClick={() => setBaslamadi(false)}>BASLAT</button>
          <button className="btn btn-ikincil" style={{ width: '100%', marginTop: '0.5rem' }}
            onClick={() => dispatch({ type: 'NAVIGATE', ekran: 'map' })}>Geri</button>
        </div>
      </div>
    );
  }

  // ── BİTTİ ──
  if (bitti) {
    const kazandi   = tiles.every(t => t.removed);
    const finalSkor = skor + (kazandi ? sure * 5 : 0);
    return (
      <div className="screen mj-screen">
        <div className="mj-bitis">
          <div className="mj-bitis-ikon">{kazandi ? '🏆' : eslendi >= 12 ? '⭐' : '⏱'}</div>
          <h2 className="mj-baslik">{kazandi ? 'TEMIZLEDIN!' : eslendi >= 12 ? 'BASARILI!' : birikme.length >= MAX_BIRIKME ? 'BİRİKME DOLDU' : 'SÜRE DOLDU'}</h2>
          <div className="mj-bitis-skor">{finalSkor}</div>
          <p style={{ opacity: 0.6, fontSize: '0.82rem', marginTop: '-0.2rem' }}>puan</p>
          <div className="mj-bitis-istatlar">
            <div className="mj-stat"><span className="mj-stat-sayi">{eslendi}</span><span className="mj-stat-etiket">/{18} eslesme</span></div>
            <div className="mj-stat"><span className="mj-stat-sayi">{hamle}</span><span className="mj-stat-etiket">hamle</span></div>
            <div className="mj-stat"><span className="mj-stat-sayi">{sure}s</span><span className="mj-stat-etiket">kalan</span></div>
          </div>
          <button className="btn btn-birincil" style={{ width: '100%' }} onClick={() => window.location.reload()}>Tekrar Oyna</button>
          <button className="btn btn-ikincil" style={{ width: '100%', marginTop: '0.5rem' }}
            onClick={() => dispatch({ type: 'NAVIGATE', ekran: 'map' })}>Haritaya Dön</button>
        </div>
      </div>
    );
  }

  // ── OYUN ──
  return (
    <div className="screen mj-screen" style={{ position: 'relative' }}>
      {/* Header */}
      <div className="mj-header">
        <button className="geri-btn" onClick={() => dispatch({ type: 'NAVIGATE', ekran: 'map' })}>&#8592;</button>
        <div className="mj-sure-wrap">
          <div className="mj-sure-bar">
            <div className="mj-sure-ic" style={{ width: `${surePct}%`, background: sureRenk }} />
          </div>
          <span className="mj-sure-sayi" style={{ color: sureRenk }}>{sure}s</span>
        </div>
        <div className="mj-skor-badge">{skor} &#10022;</div>
      </div>

      <div className="mj-durum-row">
        <span>{eslendi}/{18} eslesme</span>
        <span>{hamle} hamle</span>
      </div>

      {efektMesaj && <div className="mj-efekt-mesaj">{efektMesaj}</div>}

      {/* Çarpışma sahnesi */}
      {carpisma && (
        <div className="cp-overlay">
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
        <div className="mj-tahta" style={{ width: BOARD_W, height: BOARD_H }}>
          {onTahta.map(tile => {
            const free  = isFree(tile, tiles);
            const d     = display(tile.kart);
            const pos   = tilePos(tile.col, tile.row, tile.layer);
            return (
              <div
                key={tile.id}
                className={[
                  'mj-tas',
                  free         ? 'mj-tas-serbest' : 'mj-tas-kapali',
                  d.isMit      ? 'mj-tas-mit'     : '',
                  d.isHay      ? 'mj-tas-hay'     : '',
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

      {/* Alt alan: önizleme + birikme */}
      <div className="mj-alt-alan">
        {/* Seçili önizleme */}
        <div className="mj-secili-alan">
          {secili ? (
            <div className={[
              'mj-secili-kart',
              secili.kart.kategori === 'mitoloji' ? 'mj-tas-mit' : '',
              secili.kart.kategori === 'hayvan'   ? 'mj-tas-hay' : '',
              yanlisAnim ? 'mj-secili-yanlis' : '',
            ].filter(Boolean).join(' ')}>
              <TasIcerik kart={secili.kart} />
            </div>
          ) : (
            <div className="mj-secili-bos">?</div>
          )}
          <span className="mj-secili-etiket">Seçili</span>
        </div>

        {/* Birikme — kartlar üst üste yığılır */}
        <div className="mj-birikme-alan">
          <span className="mj-birikme-etiket">Birikme {birikme.length}/{MAX_BIRIKME}</span>
          <div className="mj-birikme-yigin" style={{ width: `${44 + (MAX_BIRIKME - 1) * 10}px` }}>
            {/* Boş slot göstergeleri */}
            {Array.from({ length: MAX_BIRIKME }, (_, i) => (
              <div key={`slot-${i}`} className="mj-birikme-slot"
                style={{ left: i * 10, zIndex: i }} />
            ))}
            {/* Yığılan kartlar */}
            {birikme.map((entry, i) => {
              const d = display(entry.kart);
              return (
                <div key={entry.id}
                  className={[
                    'mj-birikme-tas',
                    d.isMit ? 'mj-birikme-mit' : '',
                    d.isHay ? 'mj-birikme-hay' : '',
                  ].filter(Boolean).join(' ')}
                  style={{ left: i * 10, zIndex: i + 10 }}>
                  <span className={d.isGokt ? 'mj-birikme-gokt' : 'mj-birikme-emoji'}>{d.main}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
