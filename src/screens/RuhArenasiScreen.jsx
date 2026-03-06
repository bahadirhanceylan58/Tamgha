import { useState, useEffect, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { HAYVANLAR, MITOLOJI } from '../data/tamgalar';

const TUM_KARTLAR = [...HAYVANLAR, ...MITOLOJI];
const ARENA_SURE = 90;
const ESLESME_SAYISI = 6;

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function RuhArenasiScreen() {
  const { dispatch } = useGame();

  const [seciliHayvanlar] = useState(() => shuffle(TUM_KARTLAR).slice(0, ESLESME_SAYISI));
  const [karisikGucler] = useState(() => shuffle([...Array(ESLESME_SAYISI).keys()]));

  const [secilenSol, setSecilenSol] = useState(null); // index
  const [tamamlananlar, setTamamlananlar] = useState(new Set());
  const [yanlisCift, setYanlisCift] = useState(null);
  const [puan, setPuan] = useState(0);
  const [combo, setCombo] = useState(0);
  const [sure, setSure] = useState(ARENA_SURE);
  const [bitti, setBitti] = useState(false);
  const [comboGoster, setComboGoster] = useState(null);
  const [baslamadi, setBaslamadi] = useState(true);

  useEffect(() => {
    if (baslamadi || bitti) return;
    if (sure <= 0) {
      setBitti(true);
      return;
    }
    const t = setTimeout(() => setSure((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [sure, bitti, baslamadi]);

  useEffect(() => {
    if (tamamlananlar.size === ESLESME_SAYISI) {
      setBitti(true);
    }
  }, [tamamlananlar]);

  function secHayvan(idx) {
    if (bitti || baslamadi) return;
    if (tamamlananlar.has(idx)) return;
    setSecilenSol(idx === secilenSol ? null : idx);
  }

  function secGuc(gucIdx) {
    if (bitti || baslamadi) return;
    if (secilenSol === null) return;
    const gercekHayvanIdx = karisikGucler[gucIdx];
    if (tamamlananlar.has(gercekHayvanIdx)) return;

    if (secilenSol === gercekHayvanIdx) {
      // ESLESME
      const yeniCombo = combo + 1;
      const kazanilanPuan = 100 * yeniCombo;
      setCombo(yeniCombo);
      setPuan((p) => p + kazanilanPuan);
      setTamamlananlar((prev) => new Set([...prev, secilenSol]));
      setSecilenSol(null);
      setComboGoster({ puan: kazanilanPuan, combo: yeniCombo });
      setTimeout(() => setComboGoster(null), 800);
    } else {
      // YANLIS
      setYanlisCift({ sol: secilenSol, sag: gucIdx });
      setCombo(0);
      setTimeout(() => {
        setYanlisCift(null);
        setSecilenSol(null);
      }, 600);
    }
  }

  function bitisKartiKazan() {
    const kazanilacakKartlar = shuffle(
      [...HAYVANLAR, ...MITOLOJI].filter((k) => !tamamlananlar.has(seciliHayvanlar.indexOf(k)))
    )
      .slice(0, Math.min(3, Math.ceil(tamamlananlar.size / 2)))
      .map((k) => k.id);

    // En az 1 kart garantisi
    const sonucKartlar =
      kazanilacakKartlar.length === 0
        ? [shuffle([...HAYVANLAR, ...MITOLOJI])[0].id]
        : kazanilacakKartlar;

    dispatch({ type: 'ARENA_KAZAN', kazanilanIds: sonucKartlar, puan });
  }

  const surePct = (sure / ARENA_SURE) * 100;
  const sureRenk = sure > 30 ? '#00d4ff' : sure > 10 ? '#ffaa00' : '#ff4444';

  if (baslamadi) {
    return (
      <div className="screen arena-screen">
        <div className="arena-intro">
          <div className="arena-intro-ikon">⚡</div>
          <h2 className="arena-intro-baslik">RUH ARENASI</h2>
          <p className="arena-intro-alt">12 Hayvan Ruhu ile Mitoloji gucleri arasindaki baglari kur</p>
          <div className="arena-intro-kural">
            <div className="kural-item"><span className="kural-ikon">👈</span> Sol: Hayvan / Mitoloji karti sec</div>
            <div className="kural-item"><span className="kural-ikon">👉</span> Sag: Kart gucuyle eslestir</div>
            <div className="kural-item"><span className="kural-ikon">🔥</span> Ust uste dogru = COMBO!</div>
            <div className="kural-item"><span className="kural-ikon">⏱</span> {ARENA_SURE} saniye icinde tamamla</div>
          </div>
          <button className="btn btn-arena-baslat" onClick={() => setBaslamadi(false)}>
            <span>⚡</span> BASLAT
          </button>
          <button
            className="btn btn-ikincil"
            onClick={() => dispatch({ type: 'NAVIGATE', ekran: 'map' })}
            style={{ marginTop: '0.5rem' }}
          >
            Geri
          </button>
        </div>
      </div>
    );
  }

  if (bitti) {
    const basari = tamamlananlar.size === ESLESME_SAYISI;
    return (
      <div className="screen arena-screen">
        <div className="arena-bitis">
          <div className="arena-bitis-ikon">{basari ? '🏆' : tamamlananlar.size >= 3 ? '⭐' : '💀'}</div>
          <h2 className="arena-bitis-baslik">
            {basari ? 'MUKEMMEL!' : tamamlananlar.size >= 3 ? 'IYI!' : 'SURE DOLDU'}
          </h2>
          <div className="arena-bitis-puan">{puan}</div>
          <p className="arena-bitis-alt">puan</p>
          <div className="arena-bitis-sonuc">
            <div className="bitis-stat">
              <span className="bitis-stat-sayi">{tamamlananlar.size}</span>
              <span className="bitis-stat-etiket">/ {ESLESME_SAYISI} eslesmE</span>
            </div>
            <div className="bitis-stat">
              <span className="bitis-stat-sayi">{combo}</span>
              <span className="bitis-stat-etiket">max combo</span>
            </div>
          </div>
          <p className="arena-kazan-mesaj">
            {Math.min(3, Math.ceil(tamamlananlar.size / 2))} Hayvan Ruhu karti kazaniyorsun!
          </p>
          <button className="btn btn-birincil" onClick={bitisKartiKazan}>
            Kartlari Al!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen arena-screen">
      {/* Header */}
      <div className="arena-header">
        <button
          className="geri-btn"
          onClick={() => dispatch({ type: 'NAVIGATE', ekran: 'map' })}
        >
          &#8592;
        </button>
        <div className="arena-sure-wrapper">
          <div className="arena-sure-bar">
            <div
              className="arena-sure-dolgu"
              style={{ width: `${surePct}%`, background: sureRenk }}
            />
          </div>
          <span className="arena-sure-sayi" style={{ color: sureRenk }}>
            {sure}s
          </span>
        </div>
        <div className="arena-puan-badge">
          {puan > 0 && <span className="arena-combo-badge">{combo > 1 ? `${combo}x` : ''}</span>}
          {puan}
        </div>
      </div>

      {/* Combo efekti */}
      {comboGoster && (
        <div className="combo-efekt">
          +{comboGoster.puan}
          {comboGoster.combo > 1 && <span className="combo-x"> {comboGoster.combo}x COMBO!</span>}
        </div>
      )}

      {/* Eslesmeler sayaci */}
      <div className="arena-ilerleme">
        {Array.from({ length: ESLESME_SAYISI }).map((_, i) => (
          <div key={i} className={`arena-dot ${i < tamamlananlar.size ? 'arena-dot-dolu' : ''}`} />
        ))}
      </div>

      {/* Ana grid */}
      <div className="arena-grid">
        {/* Sol: Hayvan/Mitoloji kartlari */}
        <div className="arena-sutun">
          <p className="arena-sutun-baslik">RUHLAR</p>
          {seciliHayvanlar.map((kart, idx) => {
            const tamamlandi = tamamlananlar.has(idx);
            const secili = secilenSol === idx;
            const yanlis = yanlisCift?.sol === idx;
            return (
              <button
                key={kart.id}
                className={`arena-kart sol-kart
                  ${secili ? 'arena-kart-secili' : ''}
                  ${tamamlandi ? 'arena-kart-tamam' : ''}
                  ${yanlis ? 'arena-kart-yanlis' : ''}
                `}
                onClick={() => secHayvan(idx)}
                disabled={tamamlandi}
              >
                <span className="arena-kart-tamga">{kart.tamga}</span>
                <span className="arena-kart-ses">{kart.ses}</span>
                {tamamlandi && <span className="arena-tamam-ikon">✓</span>}
              </button>
            );
          })}
        </div>

        {/* Orta: cizgi efekti */}
        <div className="arena-orta">
          <div className="arena-orta-cizgi" />
        </div>

        {/* Sag: Guc kartlari (karisik) */}
        <div className="arena-sutun">
          <p className="arena-sutun-baslik">GUCLER</p>
          {karisikGucler.map((gercekIdx, gucIdx) => {
            const kart = seciliHayvanlar[gercekIdx];
            const tamamlandi = tamamlananlar.has(gercekIdx);
            const yanlis = yanlisCift?.sag === gucIdx;
            return (
              <button
                key={`guc-${gucIdx}`}
                className={`arena-kart sag-kart
                  ${tamamlandi ? 'arena-kart-tamam' : ''}
                  ${yanlis ? 'arena-kart-yanlis' : ''}
                `}
                onClick={() => secGuc(gucIdx)}
                disabled={tamamlandi || secilenSol === null}
              >
                <span className="arena-kart-ikon">{kart.guc.ikon}</span>
                <span className="arena-kart-guc-adi">{kart.guc.adi}</span>
                {tamamlandi && <span className="arena-tamam-ikon">✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
