import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { TAMGALAR, HAYVANLAR, findKartById, NADIRLIK } from '../data/tamgalar';
import { getT } from '../i18n/translations';
import { useAudio } from '../hooks/useAudio';

const YUZUCU_TAMGALAR = ['\u{10C00}', '\u{10C09}', '\u{10C1A}', '\u{10C43}', '\u{10C23}', '\u{10C3A}', '\u{10C03}', '\u{10C2D}'];

// 2020 = Sıçgan (index 0), döngü HAYVANLAR sıralamasıyla eşleşiyor
function yildenHayvan(yil) {
  const index = ((yil - 2020) % 12 + 12) % 12;
  return HAYVANLAR[index];
}

function DogumYiliModal({ onKapat, onKaydet }) {
  const [yil, setYil] = useState('');
  const [sonuc, setSonuc] = useState(null);

  function hesapla() {
    const y = parseInt(yil);
    if (isNaN(y) || y < 1900 || y > 2100) return;
    setSonuc(yildenHayvan(y));
  }

  function kaydet() {
    if (!sonuc) return;
    onKaydet(parseInt(yil), sonuc.id);
  }

  const nadirlik = sonuc ? (NADIRLIK[sonuc.nadirlik] || NADIRLIK.demir) : null;

  return (
    <div className="dogum-overlay" onClick={onKapat}>
      <div className="dogum-modal" onClick={(e) => e.stopPropagation()}>
        <button className="detay-kapat" onClick={onKapat}>&#10005;</button>

        <div className="dogum-baslik-bolum">
          <div className="dogum-ust-ikon">{'\u{1F4C5}'}</div>
          <h3 className="dogum-baslik">Takvim Ruhunu Bul</h3>
          <p className="dogum-alt">12 Hayvanlı Türk Takvimine göre doğum ruhunu keşfet</p>
        </div>

        <div className="dogum-giris-bolum">
          <input
            className="dogum-input"
            type="number"
            placeholder="Doğum yılın (örn: 1998)"
            value={yil}
            onChange={(e) => { setYil(e.target.value); setSonuc(null); }}
            min="1900"
            max="2100"
          />
          <button className="btn btn-birincil dogum-hesapla-btn" onClick={hesapla}>
            Ruhunu Keşfet
          </button>
        </div>

        {sonuc && (
          <div
            className="dogum-sonuc"
            style={{ '--nadirlik-renk': nadirlik.renk, '--nadirlik-parlak': nadirlik.parlak }}
          >
            <div className="dogum-sonuc-parcaciklar">
              {[...Array(8)].map((_, i) => (
                <span key={i} className="dogum-parcacik" style={{ animationDelay: `${i * 0.1}s` }}>
                  {'\u2726'}
                </span>
              ))}
            </div>

            <div className="dogum-sonuc-hayvan">{sonuc.tamga}</div>
            <div className="dogum-sonuc-adi" style={{ color: nadirlik.renk }}>{sonuc.ses}</div>
            <div className="dogum-sonuc-yil">{yil} {'\u2022'} {sonuc.sira}. Hayvan</div>

            <div className="dogum-guc-karti" style={{ borderColor: nadirlik.renk }}>
              <span className="dogum-guc-ikon">{sonuc.guc.ikon}</span>
              <div className="dogum-guc-bilgi">
                <span className="dogum-guc-adi" style={{ color: nadirlik.renk }}>{sonuc.guc.adi}</span>
                <span className="dogum-guc-aciklama">{sonuc.guc.aciklama}</span>
              </div>
            </div>

            <p className="dogum-aciklama">{sonuc.aciklama}</p>

            <button
              className="btn btn-birincil dogum-aktif-btn"
              style={{ background: `linear-gradient(135deg, ${nadirlik.renk}88, ${nadirlik.renk})` }}
              onClick={kaydet}
            >
              <span>{sonuc.tamga}</span> Ruhumu Aktive Et! +500 puan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HomeScreen() {
  const { state, dispatch } = useGame();
  const { unlockAudio, unlocked, isMuted, toggleMute, bgmVolume, setBgmVolume } = useAudio();
  const t = getT(state.dil || 'tr');
  const [dogumModalAcik, setDogumModalAcik] = useState(false);
  const bugun = new Date().toDateString();
  const gunlukAlindi = state.gunlukKartTalep === bugun;

  // Doğum hayvanı verisi
  const dogumHayvani = state.dogumHayvaniId ? findKartById(state.dogumHayvaniId) : null;
  const dogumNadirlik = dogumHayvani ? (NADIRLIK[dogumHayvani.nadirlik] || NADIRLIK.demir) : null;

  // Günlük görevleri oluştur
  useEffect(() => {
    dispatch({ type: 'GUNLUK_GOREV_OLUSTUR' });
  }, []);

  const gorevler = state.gunlukGorevler?.gorevler || [];
  const tumToplandi = gorevler.length > 0 && gorevler.every(g => g.toplandi);

  function gunlukKartAl() {
    const kilitsiTamgalar = TAMGALAR.filter((t) => !state.kazanilanKartlar.includes(t.id));
    const havuz = kilitsiTamgalar.length > 0 ? kilitsiTamgalar : TAMGALAR;

    // gunluk_2x gucu aktifse 2 kart
    const dogumGuc = dogumHayvani?.guc?.id;
    const ikiKart = dogumGuc === 'gunluk_2x';
    const secilen = havuz[Math.floor(Math.random() * havuz.length)];
    let kartIds = [secilen.id];
    if (ikiKart && havuz.length > 1) {
      const ikinci = havuz.filter((t) => t.id !== secilen.id)[Math.floor(Math.random() * (havuz.length - 1))];
      kartIds = [secilen.id, ikinci.id];
    }
    dispatch({ type: 'GUNLUK_KART_AL', kartId: kartIds });
  }

  function dogumKaydet(yil, hayvanId) {
    setDogumModalAcik(false);
    dispatch({ type: 'DOGUM_YILI_KAYDET', yil, hayvanId });
  }

  return (
    <div className="screen home-screen">
      {/* Arka plan */}
      <div className="stars-bg">
        {YUZUCU_TAMGALAR.map((t, i) => (
          <span
            key={i}
            className="bg-tamga"
            style={{
              left: `${10 + i * 12}%`,
              animationDelay: `${i * 0.7}s`,
              fontSize: `${1.5 + (i % 3) * 0.8}rem`,
              opacity: 0.08 + (i % 4) * 0.04,
            }}
          >
            {t}
          </span>
        ))}
      </div>

      {/* Profil rozeti */}
      <div className="home-profil-satir">
        <button className="home-profil-btn" onClick={() => dispatch({ type: 'NAVIGATE', ekran: 'profil' })}>
          <span className="home-profil-avatar">{state.avatar || '\u{10C00}'}</span>
          <span className="home-profil-ad">{state.kullaniciAdi || t('profilBtn')}</span>
        </button>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
  <button className="home-ses-btn" onClick={!unlocked ? unlockAudio : toggleMute}>
    {!unlocked || isMuted ? '\u{1F507}' : '\u{1F50A}'}
  </button>
  <input
    className="home-ses-slider"
    type="range"
    min="0"
    max="1"
    step="0.01"
    value={bgmVolume}
    onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
    aria-label="Müzik Sesi"
  />
  <div className="home-dil-rozet">
    {state.dil === 'en' ? '\u{1F1EC}\u{1F1E7}' : state.dil === 'ru' ? '\u{1F1F7}\u{1F1FA}' : '\u{1F1F9}\u{1F1F7}'}
  </div>
</div>
      </div>

      {/* Logo */}
      <div className="home-logo">
        <div className="logo-tamga">{'\u{10C00}'}</div>
        <h1 className="logo-baslik">TAMGHA</h1>
        <p className="logo-altyazi">{t('logoAltyazi')}</p>
        <div className="logo-cizgi" />
        <p className="logo-aciklama">{t('logoAciklama').split('\n').map((l, i) => <span key={i}>{l}<br /></span>)}</p>
      </div>

      {/* Dogum hayvani rozeti */}
      {dogumHayvani && (
        <div
          className="dogum-rozet"
          style={{ '--nadirlik-renk': dogumNadirlik.renk }}
          onClick={() => setDogumModalAcik(true)}
        >
          <span className="dogum-rozet-tamga">{dogumHayvani.tamga}</span>
          <div className="dogum-rozet-bilgi">
            <span className="dogum-rozet-adi" style={{ color: dogumNadirlik.renk }}>
              {dogumHayvani.ses} Ruhu
            </span>
            <span className="dogum-rozet-guc">{dogumHayvani.guc.ikon} {dogumHayvani.guc.adi}</span>
          </div>
          <span className="dogum-rozet-yil">{state.dogumYili}</span>
        </div>
      )}

      {/* Istatistik */}
      <div className="home-stats">
        <div className="stat-item">
          <span className="stat-sayi">{state.kazanilanKartlar.length}</span>
          <span className="stat-etiket">{t('kart')}</span>
        </div>
        <div className="stat-ayirici" />
        <div className="stat-item">
          <span className="stat-sayi">{state.toplamPuan}</span>
          <span className="stat-etiket">{t('puan')}</span>
        </div>
        <div className="stat-ayirici" />
        <div className="stat-item">
          <span className="stat-sayi">{TAMGALAR.length}</span>
          <span className="stat-etiket">{t('toplam')}</span>
        </div>
      </div>

      {/* Günlük Görevler Paneli (Modal'a taşındı) */}

      {/* Butonlar */}
      <div className="home-butonlar">
        <button
          className="btn btn-birincil btn-buyuk"
          onClick={() => dispatch({ type: 'NAVIGATE', ekran: 'map' })}
        >
          <span className="btn-simge">{'\u{10C1A}'}</span>
          {t('oynaBtn')}
        </button>

        <button
          className={`btn ${gunlukAlindi ? 'btn-kapali' : 'btn-altin'}`}
          onClick={gunlukAlindi ? null : gunlukKartAl}
          disabled={gunlukAlindi}
          style={{ fontSize: '1rem', width: '100%', marginBottom: '10px' }}
        >
          {gunlukAlindi ? t('gunlukAlindi') : t('gunlukKartBtn')}
        </button>

        {/* Takvim ruhu butonu */}
        <button
          className={`btn btn-takvim ${dogumHayvani ? 'btn-takvim-aktif' : ''}`}
          onClick={() => setDogumModalAcik(true)}
          style={dogumHayvani ? { '--nadirlik-renk': dogumNadirlik.renk } : {}}
        >
          <span>{'\u{1F4C5}'}</span>
          {dogumHayvani ? `${dogumHayvani.tamga} Takvim Ruhum` : t('takvimRuhu')}
        </button>

        <div className="home-alt-butonlar">
          <button
            className="btn btn-takvim home-alt-btn"
            onClick={() => dispatch({ type: 'NAVIGATE', ekran: 'isim_carki' })}
          >
            <span>🎡</span>
            {t('isimCarki')}
          </button>
          <button
            className="btn btn-takvim home-alt-btn"
            onClick={() => dispatch({ type: 'NAVIGATE', ekran: 'sozluk' })}
          >
            <span>📖</span>
            {t('sozlukBtn')}
          </button>
          <button
            className="btn btn-takvim home-alt-btn"
            onClick={() => dispatch({ type: 'NAVIGATE', ekran: 'ceviri' })}
          >
            <span>{'\u{10C00}'}</span>
            {t('ceviriBtn')}
          </button>
        </div>
      </div>

      {/* Alt bilgi */}
      <div className="home-alt">
        <p>Göktürk Alfabesi • MS 6-8. Yüzyıl</p>
      </div>

      {dogumModalAcik && (
        <DogumYiliModal
          onKapat={() => setDogumModalAcik(false)}
          onKaydet={dogumKaydet}
        />
      )}
    </div>
  );
}
