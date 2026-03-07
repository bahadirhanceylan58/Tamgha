import { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { SOZLUK_SOZ } from '../data/sozlukSoz';

const HARFLER = [...new Set(SOZLUK_SOZ.map((e) => e.word[0]))].sort((a, b) =>
  a.localeCompare(b, 'tr')
);

export default function SozlukSozScreen() {
  const { dispatch } = useGame();
  const [aktifHarf, setAktifHarf] = useState(HARFLER[0]);
  const [arama, setArama] = useState('');
  const [acikId, setAcikId] = useState(null);

  const gosterilen = useMemo(() => {
    if (arama.trim().length > 1) {
      const q = arama.toUpperCase();
      return SOZLUK_SOZ.filter(
        (e) => e.word.includes(q) || e.def.toUpperCase().includes(q)
      ).slice(0, 300);
    }
    return SOZLUK_SOZ.filter((e) => e.word.startsWith(aktifHarf));
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
          <h2 className="sozluk-baslik">Türkçe İsimler Sözlüğü</h2>
          <p className="sozluk-altyazi">Türkçe kökenli isimler · {SOZLUK_SOZ.length} kelime</p>
        </div>
        <div className="sozluk-sayi">{gosterilen.length}</div>
      </div>

      {/* Arama */}
      <div className="sozluk-arama-sarici">
        <span className="sozluk-arama-ikon">🔍</span>
        <input
          className="sozluk-arama"
          type="text"
          placeholder="İsim veya anlam ara..."
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
          <div className="sozluk-bos">
            <span>🔍</span>
            <p>Kelime bulunamadı</p>
          </div>
        )}

        {gosterilen.map((k) => {
          const uzun = k.def.length > 80;
          const acik = acikId === k.id;
          return (
            <div
              key={k.id}
              className={`sozluk-satir ${acik ? 'acik' : ''}`}
              onClick={() => uzun && setAcikId(acik ? null : k.id)}
            >
              <div className="sozluk-satir-ust">
                <div className="sozluk-kelime-bilgi">
                  <span className="sozluk-goktürkce">{k.word}</span>
                  <span className="sozluk-anlam">
                    {uzun && !acik ? k.def.slice(0, 80) + '…' : k.def}
                  </span>
                </div>
                {uzun && (
                  <span className="sozluk-ok">{acik ? '▲' : '▼'}</span>
                )}
              </div>
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
