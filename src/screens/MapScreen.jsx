import { useState } from 'react';
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

  function seviyeTikla(bolgeId, seviye) {
    dispatch({ type: 'SEFER_BASLAT', bolgeId, seviye, guc: null });
  }

  const toplamYildiz = Object.values(state.bolgeIlerlemesi).reduce(
    (acc, b) => acc + b.yildizlar.reduce((a, y) => a + y, 0),
    0
  );
  const maxYildiz = BOLGELER.reduce((acc, b) => acc + b.seviyeSayisi * 3, 0);

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
          <span>{toplamYildiz}/{maxYildiz} &#9733;</span>
        </div>
        <div className="ilerleme-bar">
          <div
            className="ilerleme-dolgu"
            style={{ width: `${(toplamYildiz / maxYildiz) * 100}%` }}
          />
        </div>
      </div>


      <div className="bolgeler-listesi">
        {BOLGELER.map((bolge) => {
          const ilerleme = state.bolgeIlerlemesi[bolge.id];
          const kilit = ilerleme?.kilit ?? true;
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
                    <p className="bolge-kilit-mesaj">&#128274; Onceki bolgeyi tamamla</p>
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
