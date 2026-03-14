
import { useGame } from '../context/GameContext';
import { BOLGELER, getBolgeTamgalari } from '../data/tamgalar';

function SeviyeButon({ seviye, ilerleme, kilit, onClick }) {
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

  function seviyeTikla(bolgeId, seviye) {
    dispatch({ type: 'SEFER_BASLAT', bolgeId, seviye, guc: null });
  }

  function bolgeKilidiHesapla(bolgeId) {
    if (bolgeId === 'orhun') return false;
    if (bolgeId === 'selenga') return aktifBolum < 10;
    if (bolgeId === 'altay') return aktifBolum < 20;
    if (bolgeId === 'tengri_yurdu') return aktifBolum < 30;
    return true;
  }

  function baslatSonrakiBolum() {
    dispatch({ type: 'SEFER_BASLAT', bolgeId: 'orhun', seviye: 0, guc: null, bolum: aktifBolum });
  }

  return (
    <div className="screen map-screen">
      <div className="map-header">
        <button className="geri-btn" onClick={() => dispatch({ type: 'NAVIGATE', ekran: 'home' })}>
          &#8592; Ana Menü
        </button>
        <h2 className="map-baslik">Bozkır Haritası</h2>
        <div className="puan-badge">{state.toplamPuan.toLocaleString()} puan</div>
      </div>

      {/* Bölgeler */}
      <div className="bolgeler-listesi">
        {BOLGELER.map((bolge) => {
          const ilerleme = state.bolgeIlerlemesi[bolge.id];
          const kilit = bolgeKilidiHesapla(bolge.id);
          const kazanilanTamgalar = getBolgeTamgalari(bolge.id).filter((t) =>
            state.kazanilanKartlar.includes(t.id)
          );
          const toplamBolgeTamga = getBolgeTamgalari(bolge.id).length;
          const isTengri = bolge.id === 'tengri_yurdu';
          const yildizlar = ilerleme?.yildizlar || Array(bolge.seviyeSayisi).fill(0);
          const toplamYildiz = yildizlar.reduce((a, b) => a + b, 0);
          const maxYildiz = bolge.seviyeSayisi * 3;
          const tumTamamlandi = !kilit && toplamYildiz >= maxYildiz;

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
                      &#128274;{' '}
                      {bolge.id === 'selenga' ? "Bölüm 10'da açılır" :
                       bolge.id === 'altay' ? "Bölüm 20'de açılır" : "Bölüm 30'da açılır"}
                    </p>
                  ) : (
                    <p className="bolge-tamga-sayisi">
                      {kazanilanTamgalar.length}/{toplamBolgeTamga} kart
                    </p>
                  )}
                </div>
                <div className="bolge-yildiz-ozet">
                  {!kilit ? (
                    <>
                      <div className="bolge-yildiz-oran">{toplamYildiz}<span className="bolge-yildiz-max">/{maxYildiz}</span> &#9733;</div>
                      {tumTamamlandi && <div className="bolge-tam-rozet">✓</div>}
                    </>
                  ) : (
                    <div className="bolge-kilit-ikon">&#128274;</div>
                  )}
                </div>
              </div>

              {!kilit && !tumTamamlandi && (
                <div className="bolge-seviyeler">
                  {Array.from({ length: bolge.seviyeSayisi }, (_, i) => i).map((seviye) => (
                    <SeviyeButon
                      key={seviye}
                      seviye={seviye}
                      ilerleme={ilerleme}
                      kilit={seviye > 0 && (ilerleme?.yildizlar?.[seviye - 1] || 0) === 0}
                      onClick={() => seviyeTikla(bolge.id, seviye)}
                    />
                  ))}
                </div>
              )}

              {!kilit && tumTamamlandi && (
                <div className="bolge-tamamlandi-serit">
                  <span>&#9733;</span> Tüm Görevler Tamamlandı <span>&#9733;</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="map-alt-nav">
        <button
          className="btn btn-altin map-alt-btn"
          onClick={() => dispatch({ type: 'NAVIGATE', ekran: 'koleksiyon' })}
        >
          <span>{'\u{10C09}'}</span>
          Koleksiyon
        </button>
        <button
          className="btn btn-birincil map-alt-btn map-oyna-btn"
          onClick={baslatSonrakiBolum}
        >
          <span>{'\u{10C1A}'}</span>
          Oyna
        </button>
        <button
          className="btn btn-altin map-alt-btn"
          onClick={() => dispatch({ type: 'NAVIGATE', ekran: 'rehber' })}
        >
          <span>📖</span>
          Nasıl Oynanır
        </button>
      </div>
    </div>
  );
}
