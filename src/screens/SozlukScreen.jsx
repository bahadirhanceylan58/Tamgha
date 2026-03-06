import { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { SOZLUK, SOZLUK_KATEGORILER } from '../data/sozluk';
import { getT } from '../i18n/translations';

const KAT_ADI = {
  tr: { hepsi: 'Hepsi', toplum: 'Toplum', doga: 'Doğa', isim: 'İsimler', fiil: 'Fiiller' },
  en: { hepsi: 'All', toplum: 'Society', doga: 'Nature', isim: 'Nouns', fiil: 'Verbs' },
  ru: { hepsi: 'Все', toplum: 'Общество', doga: 'Природа', isim: 'Имена', fiil: 'Глаголы' },
};

export default function SozlukScreen() {
  const { state, dispatch } = useGame();
  const dil = state.dil || 'tr';
  const t = getT(dil);
  const [kategori, setKategori] = useState('hepsi');
  const [arama, setArama] = useState('');
  const [acikKelime, setAcikKelime] = useState(null);

  const katAdi = KAT_ADI[dil] || KAT_ADI.tr;

  const filtreliKelimeler = useMemo(() => {
    return SOZLUK.filter((k) => {
      const katEsles = kategori === 'hepsi' || k.kategori === kategori;
      const aramaEsles = !arama ||
        k.goktürkce.toLowerCase().includes(arama.toLowerCase()) ||
        k.tr.toLowerCase().includes(arama.toLowerCase()) ||
        k.en.toLowerCase().includes(arama.toLowerCase()) ||
        k.ru.toLowerCase().includes(arama.toLowerCase());
      return katEsles && aramaEsles;
    });
  }, [kategori, arama]);

  function kelimeAnlam(k) {
    if (dil === 'en') return k.en;
    if (dil === 'ru') return k.ru;
    return k.tr;
  }

  return (
    <div className="screen sozluk-screen">
      {/* Header */}
      <div className="sozluk-header">
        <button className="geri-btn" onClick={() => dispatch({ type: 'NAVIGATE', ekran: 'home' })}>
          &#8592; {t('geri').replace('← ', '')}
        </button>
        <div className="sozluk-baslik-grup">
          <h2 className="sozluk-baslik">{t('sozluk')}</h2>
          <p className="sozluk-altyazi">{t('sozlukAlt')}</p>
        </div>
        <div className="sozluk-sayi">{filtreliKelimeler.length}</div>
      </div>

      {/* Arama */}
      <div className="sozluk-arama-sarici">
        <span className="sozluk-arama-ikon">🔍</span>
        <input
          className="sozluk-arama"
          type="text"
          placeholder={t('ara')}
          value={arama}
          onChange={(e) => setArama(e.target.value)}
        />
        {arama && (
          <button className="sozluk-temizle" onClick={() => setArama('')}>✕</button>
        )}
      </div>

      {/* Kategori sekmeleri */}
      <div className="sozluk-kat-row">
        {SOZLUK_KATEGORILER.map((kat) => (
          <button
            key={kat.id}
            className={`sozluk-kat-btn ${kategori === kat.id ? 'aktif' : ''}`}
            onClick={() => setKategori(kat.id)}
          >
            <span>{kat.ikon}</span>
            <span>{katAdi[kat.id]}</span>
          </button>
        ))}
      </div>

      {/* Kelime listesi */}
      <div className="sozluk-liste">
        {filtreliKelimeler.length === 0 && (
          <div className="sozluk-bos">
            <span>🔍</span>
            <p>Kelime bulunamadı</p>
          </div>
        )}
        {filtreliKelimeler.map((k) => (
          <div
            key={k.id}
            className={`sozluk-satir ${acikKelime === k.id ? 'acik' : ''}`}
            onClick={() => setAcikKelime(acikKelime === k.id ? null : k.id)}
          >
            <div className="sozluk-satir-ust">
              <span className="sozluk-tamga">{k.tamga}</span>
              <div className="sozluk-kelime-bilgi">
                <span className="sozluk-goktürkce">{k.goktürkce}</span>
                <span className="sozluk-anlam">{kelimeAnlam(k)}</span>
              </div>
              <span className="sozluk-ok">{acikKelime === k.id ? '▲' : '▼'}</span>
            </div>

            {acikKelime === k.id && (
              <div className="sozluk-detay">
                <div className="sozluk-detay-diller">
                  <div className="sozluk-dil-satir">
                    <span className="sozluk-dil-bayrak">🇹🇷</span>
                    <span>{k.tr}</span>
                  </div>
                  <div className="sozluk-dil-satir">
                    <span className="sozluk-dil-bayrak">🇬🇧</span>
                    <span>{k.en}</span>
                  </div>
                  <div className="sozluk-dil-satir">
                    <span className="sozluk-dil-bayrak">🇷🇺</span>
                    <span>{k.ru}</span>
                  </div>
                </div>
                <div className="sozluk-ornek">
                  <span className="sozluk-ornek-etiket">{t('ornek')}:</span>
                  <span className="sozluk-ornek-metin">{k.ornek}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
