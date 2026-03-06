import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { TAMGALAR, BOLGELER, NADIRLIK, HAYVANLAR, MITOLOJI, YADA_TASI } from '../data/tamgalar';

function TamgaDetay({ tamga, onKapat }) {
  const nadirlik = NADIRLIK[tamga.nadirlik] || NADIRLIK.demir;
  const bolge = BOLGELER.find((b) => b.id === tamga.bolge);
  const isOzel = tamga.kategori === 'hayvan' || tamga.kategori === 'mitoloji' || tamga.kategori === 'efsane';

  return (
    <div className="detay-overlay" onClick={onKapat}>
      <div
        className="detay-kart"
        onClick={(e) => e.stopPropagation()}
        style={{ '--nadirlik-renk': nadirlik.renk, '--nadirlik-parlak': nadirlik.parlak }}
      >
        <button className="detay-kapat" onClick={onKapat}>&#10005;</button>
        <div className="detay-nadirlik">{nadirlik.adi}</div>
        <div className={`detay-tamga ${isOzel ? 'detay-tamga-emoji' : ''}`}>{tamga.tamga}</div>
        <div className="detay-ses">{tamga.ses}</div>
        <div className="detay-fonetik">[{tamga.fonetik}]</div>
        {isOzel && tamga.guc && (
          <div className="detay-guc-blok">
            <div className="detay-guc-baslik">⚡ Ruh Gucu</div>
            <div className="detay-guc-ikon-adi">
              <span>{tamga.guc.ikon}</span>
              <strong>{tamga.guc.adi}</strong>
            </div>
            <div className="detay-guc-aciklama">{tamga.guc.aciklama}</div>
          </div>
        )}
        <div className="detay-bolum">
          <strong>Kategori:</strong> {tamga.kategori}
        </div>
        <div className="detay-bolum">
          <strong>Bolge:</strong> {bolge?.adi}
        </div>
        <div className="detay-aciklama">{tamga.aciklama}</div>
        <div className="detay-tarih">{tamga.tarih}</div>
        <div className="detay-ornek">
          <strong>Ornek:</strong> {tamga.ornek}
        </div>
      </div>
    </div>
  );
}

const KATEGORILER = [
  { id: 'tamgalar', adi: 'Tamgalar', ikon: '\u{10C00}' },
  { id: 'hayvanlar', adi: 'Hayvan Ruhlari', ikon: '🐯' },
  { id: 'mitoloji', adi: 'Mitoloji', ikon: '☀' },
  { id: 'efsane', adi: 'Efsane', ikon: '💎' },
];

export default function CollectionScreen() {
  const { state, dispatch } = useGame();
  const [seciliTamga, setSeciliTamga] = useState(null);
  const [filtreBolge, setFiltreBolge] = useState('hepsi');
  const [aktifKategori, setAktifKategori] = useState('tamgalar');

  let kartListesi = [];
  if (aktifKategori === 'tamgalar') {
    kartListesi = filtreBolge === 'hepsi'
      ? TAMGALAR
      : TAMGALAR.filter((t) => t.bolge === filtreBolge);
  } else if (aktifKategori === 'hayvanlar') {
    kartListesi = HAYVANLAR;
  } else if (aktifKategori === 'mitoloji') {
    kartListesi = MITOLOJI;
  } else if (aktifKategori === 'efsane') {
    kartListesi = [YADA_TASI];
  }

  const kazanilanSayi = state.kazanilanKartlar.length;
  const toplamSayi = TAMGALAR.length + HAYVANLAR.length + MITOLOJI.length + 1;

  return (
    <div className="screen koleksiyon-screen">
      <div className="koleksiyon-header">
        <button className="geri-btn" onClick={() => dispatch({ type: 'NAVIGATE', ekran: 'map' })}>
          &#8592; Geri
        </button>
        <h2 className="koleksiyon-baslik">Koleksiyon</h2>
        <div className="koleksiyon-sayac">
          {kazanilanSayi} / {toplamSayi}
        </div>
      </div>

      {/* Ilerleme */}
      <div className="koleksiyon-ilerleme">
        <div className="ilerleme-bar">
          <div
            className="ilerleme-dolgu"
            style={{ width: `${(kazanilanSayi / toplamSayi) * 100}%` }}
          />
        </div>
        <p className="koleksiyon-ilerleme-yazi">
          {Math.round((kazanilanSayi / toplamSayi) * 100)}% tamamlandi
        </p>
      </div>

      {/* Kategori sekmeleri */}
      <div className="kategori-sekmeler">
        {KATEGORILER.map((kat) => (
          <button
            key={kat.id}
            className={`kategori-sekme ${aktifKategori === kat.id ? 'aktif' : ''}`}
            onClick={() => { setAktifKategori(kat.id); setFiltreBolge('hepsi'); }}
          >
            <span className="sekme-ikon">{kat.ikon}</span>
            <span className="sekme-adi">{kat.adi}</span>
          </button>
        ))}
      </div>

      {/* Bolge filtresi (sadece tamgalar kategorisinde) */}
      {aktifKategori === 'tamgalar' && (
        <div className="filtre-row">
          <button
            className={`filtre-btn ${filtreBolge === 'hepsi' ? 'aktif' : ''}`}
            onClick={() => setFiltreBolge('hepsi')}
          >
            Hepsi
          </button>
          {BOLGELER.map((b) => (
            <button
              key={b.id}
              className={`filtre-btn ${filtreBolge === b.id ? 'aktif' : ''}`}
              onClick={() => setFiltreBolge(b.id)}
            >
              {b.adi}
            </button>
          ))}
        </div>
      )}

      {/* Kart grid */}
      <div className={`koleksiyon-grid ${aktifKategori !== 'tamgalar' ? 'koleksiyon-grid-genis' : ''}`}>
        {kartListesi.map((tamga) => {
          const kazanildi = state.kazanilanKartlar.includes(tamga.id);
          const nadirlik = NADIRLIK[tamga.nadirlik] || NADIRLIK.demir;
          const isOzel = tamga.kategori === 'hayvan' || tamga.kategori === 'mitoloji' || tamga.kategori === 'efsane';

          return (
            <div
              key={tamga.id}
              className={`mini-kart ${kazanildi ? 'mini-kart-kazanildi' : 'mini-kart-kapali'} ${isOzel && kazanildi ? 'mini-kart-ozel' : ''}`}
              style={kazanildi ? { '--nadirlik-renk': nadirlik.renk, '--nadirlik-parlak': nadirlik.parlak } : {}}
              onClick={kazanildi ? () => setSeciliTamga(tamga) : undefined}
            >
              {kazanildi ? (
                <>
                  <div className={`mini-tamga ${isOzel ? 'mini-tamga-emoji' : ''}`}>{tamga.tamga}</div>
                  <div className="mini-ses">{tamga.ses}</div>
                  {isOzel && tamga.guc && (
                    <div className="mini-guc-ikon">{tamga.guc.ikon}</div>
                  )}
                  <div className="mini-nadirlik-dot" style={{ background: nadirlik.renk }} />
                </>
              ) : (
                <>
                  <div className="mini-kapali-tamga">?</div>
                  <div className="mini-ses" style={{ opacity: 0.3 }}>???</div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {seciliTamga && (
        <TamgaDetay tamga={seciliTamga} onKapat={() => setSeciliTamga(null)} />
      )}
    </div>
  );
}
