import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { BOLGELER, getBolgeTamgalari, HAYVANLAR, MITOLOJI, YADA_TASI, findKartById, NADIRLIK } from '../data/tamgalar';

function YildizRow({ yildizlar }) {
  return (
    <div className="yildiz-row">
      {[0, 1, 2].map((i) => (
        <span key={i} className={`yildiz ${yildizlar[i] > 0 ? 'yildiz-dolu' : 'yildiz-bos'}`}>
          &#9733;
        </span>
      ))}
    </div>
  );
}

function SeviyeButon({ bolgeId, seviye, ilerleme, kilit, onClick }) {
  const yildiz = ilerleme?.yildizlar?.[seviye] || 0;
  const tamamlandi = yildiz > 0;

  return (
    <button
      className={`seviye-btn ${tamamlandi ? 'seviye-tamamlandi' : ''} ${kilit ? 'seviye-kapali' : ''}`}
      onClick={!kilit ? onClick : undefined}
      disabled={kilit}
    >
      <span className="seviye-no">{seviye + 1}</span>
      <div className="seviye-yildizlar">
        {[0, 1, 2].map((i) => (
          <span key={i} className={`mini-yildiz ${i < yildiz ? 'dolu' : 'bos'}`}>&#9733;</span>
        ))}
      </div>
    </button>
  );
}


export default function MapScreen() {
  const { state, dispatch } = useGame();
  const aktifBolum = state.eslestirmeBolum || 1;
  const [bolumSayfa, setBolumSayfa] = useState(Math.floor((aktifBolum - 1) / 5));

  useEffect(() => {
    setBolumSayfa(Math.floor((aktifBolum - 1) / 5));
  }, [aktifBolum]);

  function seviyeTikla(bolgeId, seviye) {
    dispatch({ type: 'SEFER_BASLAT', bolgeId, seviye, guc: null });
  }

  // eslestirmeBolum milestonlarına göre bölge kilidini hesapla (state'teki kilit bayrağından bağımsız)
  function bolgeKilidiHesapla(bolgeId) {
    if (bolgeId === 'orhun') return false;
    if (bolgeId === 'selenga') return aktifBolum < 10;
    if (bolgeId === 'altay') return aktifBolum < 20;
    if (bolgeId === 'tengri_yurdu') return aktifBolum < 30;
    return true;
  }

  function baslatSonrakiBolum() {
    let hedefBolge = BOLGELER[0].id;
    let hedefSeviye = 0;

    for (const b of BOLGELER) {
      const ilerleme = state.bolgeIlerlemesi[b.id];
      if (!ilerleme || ilerleme.kilit) continue;

      const bolge2 = BOLGELER.find(x => x.id === b.id);
      const yildizlar = ilerleme.yildizlar || Array(bolge2?.seviyeSayisi || 5).fill(0);
      const eksikIndex = yildizlar.findIndex(y => y < 3);

      // Eger bu bolgede eksik bir yildiz varsa ve oynanabilirse burayi sec
      if (eksikIndex !== -1) {
        if (eksikIndex === 0 || yildizlar[eksikIndex - 1] > 0) {
          hedefBolge = b.id;
          hedefSeviye = eksikIndex;
          break;
        }
      }
      // Bolge ful ama son bolge degilse donguye devam et
    }

    dispatch({ type: 'SEFER_BASLAT', bolgeId: hedefBolge, seviye: hedefSeviye, guc: null });
  }

  function eslestirmeBolumSec(bolum) {
    dispatch({ type: 'SEFER_BASLAT', bolgeId: 'orhun', seviye: 0, guc: null, bolum });
  }

  function bolumAciklama(bolum) {
    const etiketler = ['Göktürk Harfleri'];
    if (bolum >= 5) etiketler.push('Mitolojik Karakterler');
    if (bolum >= 11) etiketler.push('12 Hayvan');
    if (bolum >= 15) {
      const adim = Math.floor((bolum - 15) / 5) + 1;
      etiketler.push(`Latin +${adim * 5} Harf`);
    }
    return etiketler.join(' • ');
  }

  return (
    <div className="screen map-screen">
      <div className="map-header">
        <button className="geri-btn" onClick={() => dispatch({ type: 'NAVIGATE', ekran: 'home' })}>
          &#8592; Ana Menü
        </button>
        <h2 className="map-baslik">Bozkir Haritasi</h2>
        <div className="puan-badge">{state.toplamPuan} puan</div>
      </div>

      <div className="ilerleme-bar-wrapper">
        <div className="ilerleme-etiket">
          <span>Tamga Ilerlemesi</span>
          <span>B{aktifBolum} / 50</span>
        </div>
        <div className="ilerleme-bar">
          <div
            className="ilerleme-dolgu"
            style={{ width: `${(aktifBolum / 50) * 100}%` }}
          />
        </div>
      </div>

      <div className="bolum-mini-kart">
        <div className="bolum-mini-ust">
          <div className="bolum-mini-ikon">{'\u{10C1A}'}</div>
          <div className="bolum-mini-icerik">
            <div className="bolum-mini-baslik">
              <span>{aktifBolum}. Bölüm</span>
              <span>B{aktifBolum}/50</span>
            </div>
            <div className="bolum-mini-alt">{bolumAciklama(aktifBolum)}</div>
          </div>
        </div>
        <div className="bolum-mini-nav">
          <button
            className="bolum-mini-nav-btn"
            onClick={() => setBolumSayfa(p => Math.max(0, p - 1))}
            disabled={bolumSayfa === 0}
          >
            &#8249;
          </button>
          <div className="bolum-mini-grid">
            {Array.from({ length: 5 }, (_, i) => {
              const no = bolumSayfa * 5 + i + 1;
              if (no > 50) return <span key={i} className="bolum-mini-bos" />;
              const aktif = no <= aktifBolum;
              return (
                <button
                  key={no}
                  className={`bolum-mini-btn ${aktif ? 'bolum-mini-aktif' : 'bolum-mini-kilit'}`}
                  disabled={!aktif}
                  onClick={aktif ? () => eslestirmeBolumSec(no) : undefined}
                >
                  {no}
                </button>
              );
            })}
          </div>
          <button
            className="bolum-mini-nav-btn"
            onClick={() => setBolumSayfa(p => Math.min(9, p + 1))}
            disabled={bolumSayfa === 9}
          >
            &#8250;
          </button>
        </div>
      </div>


      <div className="bolgeler-listesi">
        {BOLGELER.map((bolge) => {
          const ilerleme = state.bolgeIlerlemesi[bolge.id];
          const kilit = bolgeKilidiHesapla(bolge.id);
          const kazanilanTamgalar = getBolgeTamgalari(bolge.id).filter((t) =>
            state.kazanilanKartlar.includes(t.id)
          );
          const toplamBolgeTamga = getBolgeTamgalari(bolge.id).length;
          const isTengri = bolge.id === 'tengri_yurdu';

          return (
            <div
              key={bolge.id}
              className={`bolge-kart ${kilit ? 'bolge-kapali' : ''} ${isTengri ? 'bolge-tengri' : ''}`}
              style={{ '--bolge-renk': bolge.renk }}
            >
              <div className="bolge-kart-ust" style={{ background: bolge.gradyan }}>
                <div className="bolge-simge">{bolge.simge}</div>
                <div className="bolge-info">
                  <h3 className="bolge-adi">{bolge.adi}</h3>
                  <p className="bolge-altyazi">{bolge.altyazi}</p>
                  {kilit ? (
                    <p className="bolge-kilit-mesaj">
                      &#128274; {bolge.id === 'selenga' ? 'Bölüm 10\'da açılır' : bolge.id === 'altay' ? 'Bölüm 20\'de açılır' : 'Bölüm 30\'da açılır'}
                    </p>
                  ) : (
                    <p className="bolge-tamga-sayisi">
                      {kazanilanTamgalar.length}/{toplamBolgeTamga} kart
                    </p>
                  )}
                </div>
                <YildizRow yildizlar={ilerleme?.yildizlar || [0, 0, 0]} />
              </div>

              {!kilit && (
                <div className="bolge-seviyeler">
                  {Array.from({ length: bolge.seviyeSayisi }, (_, i) => i).map((seviye) => (
                    <SeviyeButon
                      key={seviye}
                      bolgeId={bolge.id}
                      seviye={seviye}
                      ilerleme={ilerleme}
                      kilit={seviye > 0 && (ilerleme?.yildizlar?.[seviye - 1] || 0) === 0}
                      onClick={() => seviyeTikla(bolge.id, seviye)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="map-alt-nav" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem', padding: '0.5rem 1rem' }}>
        <button
          className="btn btn-altin"
          style={{ padding: '0.7rem 0.4rem', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}
          onClick={() => dispatch({ type: 'NAVIGATE', ekran: 'koleksiyon' })}
        >
          <span style={{ fontSize: '1.2rem' }}>{'\u{10C09}'}</span>
          Koleksiyon
        </button>
        <button
          className="btn btn-birincil"
          style={{ padding: '0.7rem 0.4rem', fontSize: '1rem', fontWeight: '700', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', boxShadow: '0 0 12px rgba(200,100,30,0.6)', border: '2px solid #ff9944' }}
          onClick={baslatSonrakiBolum}
        >
          <span style={{ fontSize: '1.3rem' }}>{'\u{10C1A}'}</span>
          Oyna
        </button>
        <button
          className="btn btn-altin"
          style={{ padding: '0.7rem 0.4rem', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}
          onClick={() => dispatch({ type: 'NAVIGATE', ekran: 'rehber' })}
        >
          <span style={{ fontSize: '1.2rem' }}>📖</span>
          Nasıl Oynanır
        </button>
      </div>


    </div>
  );
}
