import { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { TAMGALAR, MITOLOJI, HAYVANLAR, getBolgeTamgalari, BOLGELER } from '../data/tamgalar';
import { useAudio } from '../hooks/useAudio';

const TW = 44;
const TH = 55;
const GAP = 2;
const LOX = 4;
const LOY = 6;
const ROWS = 6;
const MAX_TEPSI = 4;
const OYUN_SURESI = 300;
const ESLESTI_MS = 520;

function generateProgressiveLayout(seviye) {
  const pairCount = Math.min(30, 4 + seviye);
  const totalTiles = pairCount * 2;
  const layout = [];
  let tilesPlaced = 0;
  const layers = [
    { l: 0, rows: 6, cols: 8, rOffset: 0, cOffset: 0 },
    { l: 1, rows: 4, cols: 6, rOffset: 1, cOffset: 1 },
    { l: 2, rows: 4, cols: 4, rOffset: 1, cOffset: 2 },
    { l: 3, rows: 2, cols: 4, rOffset: 2, cOffset: 2 },
    { l: 4, rows: 2, cols: 2, rOffset: 2, cOffset: 3 },
  ];
  for (const layer of layers) {
    if (tilesPlaced >= totalTiles) break;
    for (let r = 0; r < layer.rows; r++) {
      for (let c = 0; c < layer.cols; c++) {
        if (tilesPlaced >= totalTiles) break;
        layout.push({ r: r + layer.rOffset, c: c + layer.cOffset, l: layer.l });
        tilesPlaced++;
      }
    }
  }
  if (layout.length % 2 !== 0) layout.pop();
  return layout;
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function createBoard(bolgeId, seviye = 1) {
  const layout = generateProgressiveLayout(seviye);
  const pairCount = layout.length / 2;
  let pool = [];
  if (bolgeId) {
    const bolgeT = getBolgeTamgalari(bolgeId);
    const digerleri = shuffle([...TAMGALAR, ...MITOLOJI, ...HAYVANLAR, createYada()]).filter(k => !bolgeT.find(t => t.id === k.id));
    pool = shuffle([...bolgeT, ...digerleri]);
  } else {
    pool = shuffle([...TAMGALAR, ...MITOLOJI, ...HAYVANLAR, createYada()]);
  }
  let selectedPool = [];
  for (let i = 0; i < pairCount; i++) {
    selectedPool.push(pool[i % pool.length]);
  }
  const isHardMode = seviye > 2;
  const doubled = shuffle([
    ...selectedPool.map(k => ({ ...k, displayMode: 'tamga' })),
    ...selectedPool.map(k => ({ ...k, displayMode: isHardMode ? 'latin' : 'tamga' }))
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

const BOARD_W = 8 * (TW + GAP) + TW + 15;
const BOARD_H = ROWS * (TH + GAP) + 15;

function display(kart) {
  const isMit = kart.kategori === 'mitoloji';
  const isHay = kart.kategori === 'hayvan';
  if (kart.displayMode === 'latin' && !isMit && !isHay) {
    return { isGokt: false, main: kart.ses.split(' ')[0], sub: kart.fonetik, isMit: false, isHay: false, isLatin: true };
  }
  if (!isMit && !isHay) return { isGokt: true, main: kart.tamga, sub: kart.ses, isMit: false, isHay: false, isLatin: false };
  if (isHay) return { isGokt: false, main: kart.tamga, sub: kart.ses, isMit: false, isHay: true, isLatin: false };
  const safe = { '☀': '☉', '🌙': '☽', '💀': '✠', '✦': '✦', '🤍': '◈', '👑': '♛', '💎': '◈' };
  return { isGokt: false, main: safe[kart.tamga] ?? kart.tamga, sub: kart.ses, isMit: true, isHay: false, isLatin: false };
}

function TasIcerik({ kart, buyuk = false, tepsi = false }) {
  const d = display(kart);
  const anaClass = tepsi
    ? (d.isGokt ? 'mj-tepsi-gokt' : 'mj-tepsi-ana')
    : buyuk
      ? (d.isGokt ? 'cp-tamga' : 'cp-emoji')
      : (d.isGokt ? 'mj-ana mj-ana-gokt' : (d.isLatin ? 'mj-ana mj-ana-latin' : 'mj-ana mj-ana-emoji'));
  return (
    <>
      <span className={anaClass}>{d.main}</span>
      <span className={tepsi ? 'mj-tepsi-ses' : buyuk ? 'cp-ses' : 'mj-ses'}>{d.sub}</span>
      {!buyuk && !tepsi && (d.isMit || d.isHay) && <span className="mj-ozel-bant" />}
    </>
  );
}

export default function EslestirmeScreen() {
  const { state, dispatch } = useGame();
  const { playClick, playMatch, playCombo, toggleMute, isMuted, unlockAudio } = useAudio();
  const aktifSeviye = state.sefer?.aktif ? state.sefer.seviye : 1;
  const [tiles, setTiles] = useState(() => createBoard(state.seciliBolge, aktifSeviye));
  const [tepsi, setTepsi] = useState([]);   // [{id, kart, tileId, eslesti}]
  const [carpisma, setCarpisma] = useState(null);
  const [sure, setSure] = useState(OYUN_SURESI);
  const [skor, setSkor] = useState(0);
  const [hamle, setHamle] = useState(0);
  const [bitti, setBitti] = useState(false);
  const [efektMesaj, setEfektMesaj] = useState(null);
  const blocked = useRef(false);

  useEffect(() => {
    if (bitti) return;
    if (sure <= 0) { setBitti(true); return; }
    const t = setTimeout(() => setSure(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [sure, bitti]);

  // Kazanma kontrolü
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
      case 'ulgen_isik': setSure(s => Math.min(s + 30, OYUN_SURESI + 60)); showMsg('Ulgen — +30 saniye!'); break;
      case 'sure_uzat': setSure(s => Math.min(s + 20, OYUN_SURESI + 60)); showMsg(`${kart.ses} — +20 saniye!`); break;
      default: showMsg(`${kart.ses} ruhu serbest kaldi!`, 1200); break;
    }
  }

  function tasTikla(tileId) {
    unlockAudio();
    if (bitti || blocked.current || carpisma) return;
    const tile = tiles.find(t => t.id === tileId);
    if (!tile || tile.removed || tile.inTray || !isFree(tile, tiles)) return;
    if (tepsi.find(t => t.tileId === tileId)) return;

    playClick();
    setHamle(m => m + 1);

    const yeniEleman = { id: Date.now() + Math.random(), kart: tile.kart, tileId, eslesti: false };
    const yeniTepsi = [...tepsi, yeniEleman];
    setTiles(prev => prev.map(t => t.id === tileId ? { ...t, inTray: true } : t));

    // Tepside çift ara (yeni eklenenle eşleşen)
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
  const surePct = Math.max(0, (sure / OYUN_SURESI) * 100);
  const sureRenk = sure > 60 ? '#4a9e6a' : sure > 20 ? '#c8820a' : '#c02020';

  // ── BİTTİ ──
  if (bitti) {
    const kazandi = tiles.every(t => t.removed);
    const finalSkor = skor + (kazandi ? sure * 5 : 0);
    return (
      <div className="screen mj-screen">
        <div className="mj-bitis">
          <div className="mj-bitis-ikon">{kazandi ? '🏆' : eslendi >= toplamCift * 0.7 ? '⭐' : '⏱'}</div>
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
              const bolge = BOLGELER.find(b => b.id === (state.seciliBolge || 'orhun'));
              if (bolge && aktifSeviye < bolge.seviyeSayisi - 1) {
                dispatch({ type: 'SEFER_BASLAT', bolgeId: bolge.id, seviye: aktifSeviye + 1 });
              } else {
                dispatch({ type: 'NAVIGATE', ekran: 'map' });
              }
            }}>
              {(BOLGELER.find(b => b.id === (state.seciliBolge || 'orhun'))?.seviyeSayisi - 1 > aktifSeviye)
                ? 'Sonraki Bolum' : 'Bolge Tamamlandi!'}
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

  // ── OYUN ──
  return (
    <div className="screen mj-screen" style={{ position: 'relative' }}>
      {/* Header */}
      <div className="mj-header">
        <button className="geri-btn" onClick={() => dispatch({ type: 'NAVIGATE', ekran: 'map' })}>&#8592;</button>
        <button className="geri-btn" style={{ marginLeft: '6px', fontSize: '1rem', padding: '0.4rem' }} onClick={toggleMute}>
          {isMuted ? '🔇' : '🔊'}
        </button>
        <div className="mj-sure-wrap">
          <div className="mj-sure-bar">
            <div className="mj-sure-ic" style={{ width: `${surePct}%`, background: sureRenk }} />
          </div>
          <span className="mj-sure-sayi" style={{ color: sureRenk }}>{sure}s</span>
        </div>
        <div className="mj-skor-badge">{skor} &#10022;</div>
      </div>

      {/* Tray — Vita Mahjong tarzı üst alan */}
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

      {/* Carpısma sahnesi */}
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
        <div className="mj-tahta" style={{ width: BOARD_W, height: BOARD_H }}>
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

      {/* Alt butonlar — Vita Mahjong tarzı */}
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
