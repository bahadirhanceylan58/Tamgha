import { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { TAMGALAR, MITOLOJI, HAYVANLAR, getBolgeTamgalari, BOLGELER } from '../data/tamgalar';
import { useAudio } from '../hooks/useAudio';

const TW = 46;
const TH = 58;
const GAP = 2;
const LOX = 4;
const LOY = 6;
const COLS = 8;
const ROWS = 6;
const MAX_BIRIKME = 5;
const OYUN_SURESI = 300; // Artan tahtadan dolayı 5 dakika
const CARPISMA_MS = 1200;

// Dinamik Kademeli Dizilim Oluşturucu
function generateProgressiveLayout(seviye) {
  // Başlangıç çift sayısı: Seviye 1 = 5 çift (10 taş), her seviyede +1 çift (2 taş) ekle.
  // Maksimum 30 çift (60 taş) ile sınırlayalım.
  const pairCount = Math.min(30, 4 + seviye);
  const totalTiles = pairCount * 2;

  const layout = [];
  let tilesPlaced = 0;

  // Katman kapasiteleri (genişletilmiş merkez piramit)
  // L0: 6x8 = 48
  // L1: 4x6 = 24
  // L2: 4x4 = 16
  // L3: 2x4 = 8
  // L4: 2x2 = 4
  const layers = [
    { l: 0, rows: 6, cols: 8, rOffset: 0, cOffset: 0 },
    { l: 1, rows: 4, cols: 6, rOffset: 1, cOffset: 1 },
    { l: 2, rows: 4, cols: 4, rOffset: 1, cOffset: 2 },
    { l: 3, rows: 2, cols: 4, rOffset: 2, cOffset: 2 },
    { l: 4, rows: 2, cols: 2, rOffset: 2, cOffset: 3 },
  ];

  // Taşı yerleştir
  for (const layer of layers) {
    if (tilesPlaced >= totalTiles) break;

    // Her katmandaki pozisyonları merkeze doğru sırayla doldur
    for (let r = 0; r < layer.rows; r++) {
      for (let c = 0; c < layer.cols; c++) {
        if (tilesPlaced >= totalTiles) break;
        layout.push({ r: r + layer.rOffset, c: c + layer.cOffset, l: layer.l });
        tilesPlaced++;
      }
    }
  }

  // Taş sayısını cift sayiya tamamla (olası kesinti durumuna karşı)
  if (layout.length % 2 !== 0) {
    layout.pop();
  }

  return layout;
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function createBoard(bolgeId, seviye = 1) {
  // Seçilen bölge ve seviyeye göre dinamik dizilim oluştur
  const layout = generateProgressiveLayout(seviye);
  const pairCount = layout.length / 2;

  // Bolge taşlarını ve diğer taşları birleştir
  let pool = [];
  if (bolgeId) {
    const bolgeT = getBolgeTamgalari(bolgeId);
    const digerleri = shuffle([...TAMGALAR, ...MITOLOJI, ...HAYVANLAR, createYada()]).filter(k => !bolgeT.find(t => t.id === k.id));
    pool = shuffle([...bolgeT, ...digerleri]);
  } else {
    pool = shuffle([...TAMGALAR, ...MITOLOJI, ...HAYVANLAR, createYada()]);
  }

  // Sadece gereken çift sayısı kadar taş al (Havuz yetmezse başa sar)
  let selectedPool = [];
  for (let i = 0; i < pairCount; i++) {
    selectedPool.push(pool[i % pool.length]);
  }

  // Eğitim Zorluk Modu: Sebebini seviye > 2 ise öğrenme modu aktif olur
  // Orijinalinde taş ikiziyle aynıdır. Zor modda ikizlerden biri "latin" okunuşunu gösterir.
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
  // Sol kollardan (negatif colonlar) kaynaklanan offseti düzelt (en az c: -2 var)
  const offsetCol = col + 2;
  return {
    left: offsetCol * (TW + GAP) - layer * LOX,
    top: row * (TH + GAP) - layer * LOY,
    zIndex: layer * 100 + row * 10 + col,
  };
}

function display(kart) {
  const isMit = kart.kategori === 'mitoloji';
  const isHay = kart.kategori === 'hayvan';

  // Hard Mode için latin harfini gösterme mantığı
  if (kart.displayMode === 'latin' && !isMit && !isHay) {
    // Latin görünümünde ana harf olarak 'ses' (veya fonetik okunuşu) kullan
    return { isGokt: false, main: kart.ses.split(' ')[0], sub: kart.fonetik, isMit: false, isHay: false, isLatin: true };
  }

  if (!isMit && !isHay) return { isGokt: true, main: kart.tamga, sub: kart.ses, isMit: false, isHay: false, isLatin: false };
  if (isHay) return { isGokt: false, main: kart.tamga, sub: kart.ses, isMit: false, isHay: true, isLatin: false };
  const safe = { '💀': '☽', '🤍': '◈' };
  return { isGokt: false, main: safe[kart.tamga] ?? kart.tamga, sub: kart.ses, isMit: true, isHay: false, isLatin: false };
}

// Tahta genişliği 11 sütun (8 ana + sol 2 + sağ 1) x (TW + GAP)
const BOARD_W = 11 * (TW + GAP) + 10;
const BOARD_H = ROWS * (TH + GAP) + 10;

function TasIcerik({ kart, buyuk = false }) {
  const d = display(kart);
  // Eğer özel latin görünümündeyse (Hard Mode) farklı bir class ile gösterilebilir
  const anaClass = buyuk
    ? (d.isGokt ? 'cp-tamga' : 'cp-emoji')
    : (d.isGokt ? 'mj-ana mj-ana-gokt' : (d.isLatin ? 'mj-ana mj-ana-latin' : 'mj-ana mj-ana-emoji'));

  return (
    <>
      <span className={anaClass}>{d.main}</span>
      <span className={buyuk ? 'cp-ses' : 'mj-ses'}>{d.sub}</span>
      {!buyuk && (d.isMit || d.isHay) && <span className="mj-ozel-bant" />}
    </>
  );
}

export default function EslestirmeScreen() {
  const { state, dispatch } = useGame();
  const { playClick, playMatch, playCombo, toggleMute, isMuted, unlockAudio } = useAudio();
  const aktifSeviye = state.sefer.aktif ? state.sefer.seviye : 1;
  const [tiles, setTiles] = useState(() => createBoard(state.seciliBolge, aktifSeviye));
  const [secili, setSecili] = useState(null);    // { id, kart }
  const [birikme, setBirikme] = useState([]);      // [{ id, kart }]  max 5
  const [carpisma, setCarpisma] = useState(null);    // { kart1, kart2, isCombo } | null
  const [sure, setSure] = useState(OYUN_SURESI);
  const [skor, setSkor] = useState(0);
  const [hamle, setHamle] = useState(0);
  const [bitti, setBitti] = useState(false);
  const [efektMesaj, setEfektMesaj] = useState(null);
  const [yanlisAnim, setYanlisAnim] = useState(false);
  const blocked = useRef(false);

  // Sayaç
  useEffect(() => {
    if (bitti) return;
    if (sure <= 0) { setBitti(true); return; }
    const t = setTimeout(() => setSure(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [sure, bitti]);

  // Kazanma ve Deadlock (Hamle kalmadı) kontrolü
  useEffect(() => {
    if (bitti || tiles.length === 0) return;

    const onTahtaCount = tiles.filter(t => !t.removed && !t.inTray).length;
    if (onTahtaCount === 0) {
      if (tiles.every(t => t.removed)) {
        setBitti(true);
        // Kazanma anında puan ve ilerlemeyi kaydet
        if (!bitti) {
          const finalSkor = skor + sure * 5;
          dispatch({
            type: 'ESLESTIRME_TAMAMLA',
            bolgeId: state.seciliBolge || 'orhun',
            seviye: aktifSeviye,
            puan: finalSkor,
            kazandi: true
          });
        }
      }
      return;
    }

    // Sadece tahtada oynanabilir durumdaysa deadlock kontrolü yap
    if (!carpisma && !yanlisAnim) {
      const freeTiles = tiles.filter(t => !t.removed && !t.inTray && isFree(t, tiles));
      let possible = false;

      if (secili) {
        possible = freeTiles.some(t => t.kart.tamga === secili.kart.tamga);
      } else {
        for (let i = 0; i < freeTiles.length; i++) {
          for (let j = i + 1; j < freeTiles.length; j++) {
            if (freeTiles[i].kart.tamga === freeTiles[j].kart.tamga) {
              possible = true; break;
            }
          }
          if (possible) break;
        }
      }

      if (!possible && freeTiles.length > 0) {
        showMsg('Hamle kalmadı! Kartlar karıştırılıyor...', 2000);
        const t2 = setTimeout(() => {
          setTiles(prev => {
            const alive = prev.filter(t => !t.removed && !t.inTray);
            const aliveKarts = shuffle(alive.map(t => t.kart));
            let k = 0;
            return prev.map(t => {
              if (!t.removed && !t.inTray) {
                return { ...t, kart: aliveKarts[k++] };
              }
              return t;
            });
          });
        }, 1800);
        return () => clearTimeout(t2);
      }
    }
  }, [tiles, bitti, secili, carpisma, yanlisAnim]);

  function showMsg(msg, dur = 1800) {
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
    unlockAudio(); // Müziği başlatmayı dener (otomatik başlamadıysa)

    if (bitti || blocked.current || carpisma) return;
    const tile = tiles.find(t => t.id === tileId);
    if (!tile || tile.removed || tile.inTray || !isFree(tile, tiles)) return;

    playClick();
    setHamle(m => m + 1);

    if (!secili) {
      // Birinci kart → önizlemeye al
      setSecili({ id: tileId, kart: tile.kart });
      setTiles(prev => prev.map(t => t.id === tileId ? { ...t, inTray: true } : t));

    } else {
      // İkinci kart
      if (secili.kart.tamga === tile.kart.tamga && secili.id !== tileId) {
        // EŞLEŞME
        blocked.current = true;

        // Candy Crush mantığı: "TÜRK" tamgalarından biri veya mitoloji ise kombo yapar
        const isCombo = ['t_back', 'oe_ue', 'r_back', 'k_back'].includes(tile.kart.id) || tile.kart.kategori === 'mitoloji';

        const tabanPuan = 100 + Math.floor(sure / 5);
        const puan = isCombo ? tabanPuan * 3 : tabanPuan; // Combo 3 katı puan!

        if (isCombo) {
          playCombo();
          showMsg('✨ MÜKEMMEL EŞLEŞME! ✨', 1500);
        } else {
          playMatch();
        }

        setSkor(s => s + puan);
        setTiles(prev => prev.map(t => t.id === tileId ? { ...t, inTray: true } : t));

        const sid = secili.id;
        setCarpisma({ kart1: secili.kart, kart2: tile.kart, isCombo });

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
        // YANLIŞ → seçili salla, yeni kart anlık InTray olur, sonra ikisi de tahtaya döner
        setYanlisAnim(true);
        blocked.current = true;
        setTiles(prev => prev.map(t => t.id === tileId ? { ...t, inTray: true } : t));

        setTimeout(() => {
          setYanlisAnim(false);
          // İkisini de tahtaya geri koy
          setTiles(prev => prev.map(t =>
            t.id === secili.id || t.id === tileId ? { ...t, inTray: false } : t
          ));
          setSecili(null);

          const yeni = [...birikme, { id: Date.now(), kart: tile.kart }];
          setBirikme(yeni);
          blocked.current = false;

          if (yeni.length >= MAX_BIRIKME) {
            showMsg('Hata Sınırı Doldu!', 900);
            setTimeout(() => setBitti(true), 1000);
          }
        }, 600);
      }
    }
  }

  const onTahta = tiles.filter(t => !t.removed && !t.inTray);
  const eslendi = tiles.filter(t => t.removed).length / 2;
  const toplamCift = tiles.length / 2; // Dinamik toplam çift
  const surePct = Math.max(0, (sure / OYUN_SURESI) * 100);
  const sureRenk = sure > 60 ? '#4a9e6a' : sure > 20 ? '#c8820a' : '#c02020';


  // ── BİTTİ ──
  if (bitti) {
    const kazandi = tiles.every(t => t.removed);
    const finalSkor = skor + (kazandi ? sure * 5 : 0);
    return (
      <div className="screen mj-screen">
        <div className="mj-bitis">
          <div className="mj-bitis-ikon">{kazandi ? '🏆' : eslendi >= 12 ? '⭐' : '⏱'}</div>
          <h2 className="mj-baslik">{kazandi ? 'TEMIZLEDIN!' : eslendi >= 12 ? 'BASARILI!' : birikme.length >= MAX_BIRIKME ? 'BİRİKME DOLDU' : 'SÜRE DOLDU'}</h2>
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
                // Sonraki seviyeye geç
                dispatch({ type: 'SEFER_BASLAT', bolgeId: bolge.id, seviye: aktifSeviye + 1 });
              } else {
                // Bölge bitti, haritaya dön
                dispatch({ type: 'NAVIGATE', ekran: 'map' });
              }
            }}>
              {(BOLGELER.find(b => b.id === (state.seciliBolge || 'orhun'))?.seviyeSayisi - 1 > aktifSeviye)
                ? 'Sonraki Bölüm'
                : 'Bölge Tamamlandı!'}
            </button>
          ) : (
            <button className="btn btn-birincil" style={{ width: '100%' }} onClick={() => window.location.reload()}>Tekrar Oyna</button>
          )}

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
        <button className="geri-btn" style={{ marginLeft: '10px', fontSize: '1rem', padding: '0.4rem' }} onClick={toggleMute}>
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

      <div className="mj-durum-row">
        <span>{eslendi}/{toplamCift} eslesme</span>
        <span>{hamle} hamle</span>
      </div>

      {efektMesaj && <div className="mj-efekt-mesaj">{efektMesaj}</div>}

      {/* Çarpışma sahnesi */}
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

      {/* Alt alan: önizleme + birikme */}
      <div className="mj-alt-alan">
        {/* Seçili önizleme */}
        <div className="mj-secili-alan">
          {secili ? (
            <div className={[
              'mj-secili-kart',
              secili.kart.kategori === 'mitoloji' ? 'mj-tas-mit' : '',
              secili.kart.kategori === 'hayvan' ? 'mj-tas-hay' : '',
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
