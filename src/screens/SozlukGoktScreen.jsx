import { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { SOZLUK } from '../data/sozluk';
import { SOZLUK_SOZ } from '../data/sozlukSoz';

// Birleşik veri: SOZLUK (tamgalı) + SOZLUK_SOZ (isimler), alfabetik sıralı
const BIRLESIK = [
  ...SOZLUK.map((k) => ({
    id: 'gokt_' + k.id,
    word: k.goktürkce,
    def: k.tr,
    tamga: k.tamga,
    en: k.en,
    ru: k.ru,
    ornek: k.ornek,
  })),
  ...SOZLUK_SOZ.map((k) => ({
    id: 'soz_' + k.id,
    word: k.word,
    def: k.def,
    tamga: null,
    en: null,
    ru: null,
    ornek: null,
  })),
].sort((a, b) => a.word.localeCompare(b.word, 'tr'));

const HARFLER = [...new Set(BIRLESIK.map((e) => e.word[0]))].sort((a, b) =>
  a.localeCompare(b, 'tr')
);

export default function SozlukGoktScreen() {
  const { dispatch } = useGame();
  const [aktifHarf, setAktifHarf] = useState(HARFLER[0]);
  const [arama, setArama] = useState('');
  const [acikId, setAcikId] = useState(null);

  const gosterilen = useMemo(() => {
    if (arama.trim().length > 1) {
      const q = arama.toUpperCase();
      return BIRLESIK.filter(
        (e) => e.word.toUpperCase().includes(q) || e.def.toUpperCase().includes(q)
      ).slice(0, 300);
    }
    return BIRLESIK.filter((e) => e.word.startsWith(aktifHarf));
  }, [aktifHarf, arama]);

  return (
    <div className="screen sozluk-screen">
      {/* Header */}
      <div className="sozluk-header">
        <button
          className="geri-btn"
          onClick={() => dispatch({ type: 'NAVIGATE', ekran: 'sozluk' })}
        >
          &#8592;
        </button>
        <div className="sozluk-baslik-grup">
          <h2 className="sozluk-baslik">Göktürkçe Sözlük</h2>
          <p className="sozluk-altyazi">Orhun Yazıtları · Türkçe İsimler · {BIRLESIK.length} kelime</p>
        </div>
        <div className="sozluk-sayi">{gosterilen.length}</div>
      </div>

      {/* Arama */}
      <div className="sozluk-arama-sarici">
        <span className="sozluk-arama-ikon">🔍</span>
        <input
          className="sozluk-arama"
          type="text"
          placeholder="Kelime veya anlam ara..."
          value={arama}
          onChange={(e) => { setArama(e.target.value); setAcikId(null); }}
        />
        {arama && (
          <button className="sozluk-temizle" onClick={() => setArama('')}>✕</button>
        )}
      </div>

      {/* Harf filtresi */}
      {!arama && (
        <div className="sozluk-kat-row">
          {HARFLER.map((harf) => (
            <button
              key={harf}
              className={`sozluk-kat-btn ${aktifHarf === harf ? 'aktif' : ''}`}
              onClick={() => { setAktifHarf(harf); setAcikId(null); }}
            >
              {harf}
            </button>
          ))}
        </div>
      )}

      {/* Liste */}
      <div className="sozluk-liste">
        {gosterilen.length === 0 && (
          <div className="sozluk-bos"><span>🔍</span><p>Kelime bulunamadı</p></div>
        )}

        {gosterilen.map((k) => {
          const uzun = k.def.length > 80 || k.en || k.ornek;
          const acik = acikId === k.id;
          return (
            <div
              key={k.id}
              className={`sozluk-satir ${acik ? 'acik' : ''}`}
              onClick={() => uzun && setAcikId(acik ? null : k.id)}
            >
              <div className="sozluk-satir-ust">
                {k.tamga && <span className="sozluk-tamga">{k.tamga}</span>}
                <div className="sozluk-kelime-bilgi">
                  <span className="sozluk-goktürkce">{k.word}</span>
                  <span className="sozluk-anlam">
                    {uzun && !acik ? k.def.slice(0, 80) + '…' : k.def}
                  </span>
                </div>
                {uzun && <span className="sozluk-ok">{acik ? '▲' : '▼'}</span>}
              </div>

              {acik && (k.en || k.ru || k.ornek) && (
                <div className="sozluk-detay">
                  {(k.en || k.ru) && (
                    <div className="sozluk-detay-diller">
                      <div className="sozluk-dil-satir"><span className="sozluk-dil-bayrak">🇹🇷</span><span>{k.def}</span></div>
                      {k.en && <div className="sozluk-dil-satir"><span className="sozluk-dil-bayrak">🇬🇧</span><span>{k.en}</span></div>}
                      {k.ru && <div className="sozluk-dil-satir"><span className="sozluk-dil-bayrak">🇷🇺</span><span>{k.ru}</span></div>}
                    </div>
                  )}
                  {k.ornek && (
                    <div className="sozluk-ornek">
                      <span className="sozluk-ornek-etiket">Örnek:</span>
                      <span className="sozluk-ornek-metin">{k.ornek}</span>
                    </div>
                  )}
                </div>
              )}

              {acik && !k.en && !k.ru && !k.ornek && k.def.length > 80 && (
                <div className="sozluk-detay">
                  <span className="sozluk-anlam">{k.def}</span>
                </div>
              )}
            </div>
          );
        })}

        {arama && gosterilen.length === 300 && (
          <p className="sozluk-limit-uyari">İlk 300 sonuç · aramayı daraltın</p>
        )}
      </div>
    </div>
  );
}
