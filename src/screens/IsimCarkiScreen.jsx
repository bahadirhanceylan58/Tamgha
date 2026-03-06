import { useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { ISIMLER, filtreIsimler, rastgeleIsim } from '../data/isimler';

const CARK_TAMGALAR = ['\u{10C00}', '\u{10C09}', '\u{10C1A}', '\u{10C2D}', '\u{10C03}', '\u{10C3A}', '\u{10C23}', '\u{10C3B}'];

const FILTRELER = [
  { id: 'hepsi', adi: 'Hepsi', ikon: '✦' },
  { id: 'e', adi: 'Erkek', ikon: '🗡' },
  { id: 'k', adi: 'Kız', ikon: '🌸' },
];

export default function IsimCarkiScreen() {
  const { dispatch } = useGame();
  const [filtre, setFiltre] = useState('hepsi');
  { /* dönme açısı */ }
  const [donme, setDonme] = useState(0);
  const [doniyor, setDoniyor] = useState(false);
  const [sonuc, setSonuc] = useState(null);
  const [kayitliIsimler, setKayitliIsimler] = useState([]);
  const [parcaciklar, setParcaciklar] = useState([]);
  const carkRef = useRef(null);

  function cevir() {
    if (doniyor) return;
    setSonuc(null);
    setDoniyor(true);
    setParcaciklar([]);

    // Rastgele toplam dönme: 5-8 tam tur + rastgele açı
    const ekstraAci = Math.floor(Math.random() * 360);
    const turSayisi = 5 + Math.floor(Math.random() * 4);
    const toplamAci = donme + turSayisi * 360 + ekstraAci;
    setDonme(toplamAci);

    // Animasyon bittikten sonra sonuç göster
    setTimeout(() => {
      const secilen = rastgeleIsim(filtre);
      setSonuc(secilen);
      setDoniyor(false);
      // Parçacık efekti
      setParcaciklar(Array.from({ length: 12 }, (_, i) => i));
    }, 3200);
  }

  function kaydet(isim) {
    if (!kayitliIsimler.find((k) => k.isim === isim.isim)) {
      setKayitliIsimler([...kayitliIsimler, isim]);
    }
  }

  function cikar(isimAdi) {
    setKayitliIsimler(kayitliIsimler.filter((k) => k.isim !== isimAdi));
  }

  const filtreliSayi = filtreIsimler(filtre).length;

  return (
    <div className="screen isim-carki-screen">
      {/* Başlık */}
      <div className="isim-header">
        <button className="geri-btn" onClick={() => dispatch({ type: 'NAVIGATE', ekran: 'home' })}>
          &#8592; Geri
        </button>
        <div className="isim-baslik-grup">
          <h2 className="isim-baslik">İsim Çarkı</h2>
          <p className="isim-altyazi">Göktürkçe kökenli Türk isimleri</p>
        </div>
        <div className="isim-sayi-rozet">{filtreliSayi}</div>
      </div>

      {/* Cinsiyet filtresi */}
      <div className="isim-filtre-row">
        {FILTRELER.map((f) => (
          <button
            key={f.id}
            className={`isim-filtre-btn ${filtre === f.id ? 'aktif' : ''}`}
            onClick={() => { setFiltre(f.id); setSonuc(null); }}
          >
            <span>{f.ikon}</span>
            {f.adi}
          </button>
        ))}
      </div>

      {/* Çark alanı */}
      <div className="cark-alan">
        {/* Çark */}
        <div className="cark-sarici">
          <div
            ref={carkRef}
            className="cark"
            style={{
              transform: `rotate(${donme}deg)`,
              transition: doniyor ? 'transform 3.2s cubic-bezier(0.17, 0.67, 0.12, 1)' : 'none',
            }}
          >
            {/* Çark segmentleri */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="cark-segment"
                style={{ transform: `rotate(${i * 45}deg)` }}
              >
                <div className="cark-segment-ic">
                  <span className="cark-tamga">{CARK_TAMGALAR[i]}</span>
                </div>
              </div>
            ))}
            {/* Merkez */}
            <div className="cark-merkez">
              <span className="cark-merkez-tamga">{'\u{10C00}'}</span>
            </div>
          </div>

          {/* Gösterge (pointer) */}
          <div className="cark-gosterge">▼</div>

          {/* Parçacık efekti */}
          {parcaciklar.map((i) => (
            <span
              key={i}
              className="cark-parcacik"
              style={{
                '--angle': `${i * 30}deg`,
                animationDelay: `${i * 0.05}s`,
              }}
            >
              ✦
            </span>
          ))}
        </div>

        {/* ÇEVİR butonu */}
        <button
          className={`btn cark-cevir-btn ${doniyor ? 'doniyor' : ''}`}
          onClick={cevir}
          disabled={doniyor}
        >
          {doniyor ? '◌ Dönüyor...' : '⟳ ÇEVİR'}
        </button>
      </div>

      {/* Sonuç */}
      {sonuc && (
        <div className="isim-sonuc">
          <div className="isim-sonuc-ic">
            <div className="isim-sonuc-ust">
              <span className="isim-sonuc-ikon">
                {sonuc.cinsiyet === 'e' ? '🗡' : sonuc.cinsiyet === 'k' ? '🌸' : '✦'}
              </span>
              <span className="isim-sonuc-cinsiyet">
                {sonuc.cinsiyet === 'e' ? 'Erkek' : sonuc.cinsiyet === 'k' ? 'Kız' : 'Uniseks'}
              </span>
            </div>
            <div className="isim-sonuc-ad">{sonuc.isim}</div>
            <div className="isim-sonuc-anlam">{sonuc.anlam}</div>
            <div className="isim-sonuc-butonlar">
              <button className="btn btn-birincil isim-kaydet-btn" onClick={() => kaydet(sonuc)}>
                ♥ Beğen
              </button>
              <button className="btn btn-ikincil isim-tekrar-btn" onClick={cevir} disabled={doniyor}>
                ⟳ Tekrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kaydedilen isimler */}
      {kayitliIsimler.length > 0 && (
        <div className="isim-kayitli-bolum">
          <div className="isim-kayitli-baslik">
            <span>♥ Beğenilenler</span>
            <span className="isim-kayitli-sayi">{kayitliIsimler.length}</span>
          </div>
          <div className="isim-kayitli-liste">
            {kayitliIsimler.map((k) => (
              <div key={k.isim} className="isim-kayitli-satir">
                <div className="isim-kayitli-bilgi">
                  <span className="isim-kayitli-ad">{k.isim}</span>
                  <span className="isim-kayitli-anlam">{k.anlam}</span>
                </div>
                <button className="isim-cikar-btn" onClick={() => cikar(k.isim)}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
