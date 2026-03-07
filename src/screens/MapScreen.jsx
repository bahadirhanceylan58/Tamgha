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

// Aktif guc rozeti
function GucRozet({ guc, onTemizle }) {
  if (!guc) return null;
  return (
    <div className="aktif-guc-rozet">
      <span className="aktif-guc-ikon">{guc.ikon}</span>
      <span className="aktif-guc-adi">{guc.adi}</span>
      <button className="aktif-guc-temizle" onClick={onTemizle}>&#10005;</button>
    </div>
  );
}

// Guc secim modal
function GucSecimModal({ kazanilanKartlar, onSec, onKapat }) {
  const mevcut = kazanilanKartlar
    .map((id) => findKartById(id))
    .filter((k) => k && k.guc)
    .filter((k, i, arr) => arr.findIndex((x) => x.id === k.id) === i);

  return (
    <div className="guc-modal-overlay" onClick={onKapat}>
      <div className="guc-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="guc-modal-baslik">⚡ Ruh Gucu Sec</h3>
        <p className="guc-modal-alt">Quiz icin bir ruh gucu aktive et</p>
        <div className="guc-modal-liste">
          {mevcut.length === 0 && (
            <p className="guc-bos">Henuz hic ruh gucu kazanmadın. Hayvan ruhu veya mitoloji karti topla!</p>
          )}
          {mevcut.map((kart) => {
            const nadirlik = NADIRLIK[kart.nadirlik] || NADIRLIK.demir;
            return (
              <button
                key={kart.id}
                className="guc-kart"
                style={{ '--guc-renk': nadirlik.renk }}
                onClick={() => onSec(kart.guc)}
              >
                <span className="guc-kart-tamga">{kart.tamga}</span>
                <div className="guc-kart-bilgi">
                  <span className="guc-kart-hayvan">{kart.ses}</span>
                  <span className="guc-kart-guc-adi">{kart.guc.ikon} {kart.guc.adi}</span>
                  <span className="guc-kart-aciklama">{kart.guc.aciklama}</span>
                </div>
              </button>
            );
          })}
        </div>
        <button className="btn btn-ikincil" onClick={() => onSec(null)} style={{ width: '100%', marginTop: '0.5rem' }}>
          Gucsuz Baslat
        </button>
      </div>
    </div>
  );
}

export default function MapScreen() {
  const { state, dispatch } = useGame();
  const [gucModal, setGucModal] = useState(null); // { bolgeId, seviye }
  const [seciliGuc, setSeciliGuc] = useState(null);

  function seviyeTikla(bolgeId, seviye) {
    setGucModal({ bolgeId, seviye });
  }

  function gucSec(guc) {
    setSeciliGuc(guc);
    setGucModal(null);
  }

  function quizBaslat(bolgeId, seviye) {
    dispatch({ type: 'QUIZ_BASLAT', bolgeId, seviye, guc: seciliGuc });
    setSeciliGuc(null);
  }

  const toplamYildiz = Object.values(state.bolgeIlerlemesi).reduce(
    (acc, b) => acc + b.yildizlar.reduce((a, y) => a + y, 0),
    0
  );
  const maxYildiz = BOLGELER.reduce((acc, b) => acc + b.seviyeSayisi * 3, 0);

  // Secilen guc ile seviye secildikten hemen baslat
  function handleGucSecVeBaslat({ bolgeId, seviye }) {
    return (guc) => {
      dispatch({ type: 'QUIZ_BASLAT', bolgeId, seviye, guc });
      setGucModal(null);
      setSeciliGuc(null);
    };
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

    setGucModal({ bolgeId: hedefBolge, seviye: hedefSeviye });
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

      {seciliGuc && (
        <GucRozet guc={seciliGuc} onTemizle={() => setSeciliGuc(null)} />
      )}

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

      <div className="map-alt-nav" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.4rem' }}>
        <button
          className="btn btn-ikincil"
          style={{ padding: '0.5rem', fontSize: '0.85rem', flexDirection: 'column' }}
          onClick={() => dispatch({ type: 'NAVIGATE', ekran: 'koleksiyon' })}
        >
          <span className="btn-simge" style={{ fontSize: '1.2rem' }}>{'\u{10C09}'}</span>
          Koleksiyon
        </button>
        <button
          className="btn btn-birincil"
          style={{ padding: '0.5rem', fontSize: '1rem', flexDirection: 'column' }}
          onClick={baslatSonrakiBolum}
        >
          <span className="btn-simge" style={{ fontSize: '1.5rem', marginBottom: '-4px' }}>{'\u{10C1A}'}</span>
          OYNA
        </button>
        <button
          className="btn btn-ikincil"
          style={{ padding: '0.5rem', fontSize: '0.85rem', flexDirection: 'column' }}
          onClick={() => dispatch({ type: 'NAVIGATE', ekran: 'ruh_arenasi' })}
        >
          <span style={{ fontSize: '1.2rem' }}>⚡</span>
          Arena
        </button>
        <button
          className="btn btn-ikincil"
          style={{ padding: '0.5rem', fontSize: '0.85rem', flexDirection: 'column' }}
          onClick={() => dispatch({ type: 'NAVIGATE', ekran: 'eslestirme' })}
        >
          <span style={{ fontSize: '1.2rem' }}>🀄</span>
          Tamga Avı
        </button>
      </div>

      {gucModal && (
        <GucSecimModal
          kazanilanKartlar={state.kazanilanKartlar}
          onSec={handleGucSecVeBaslat(gucModal)}
          onKapat={() => setGucModal(null)}
        />
      )}
    </div>
  );
}
