import { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { useAudio } from '../hooks/useAudio';

// ── Kelime veritabanı (Göktürk harfleri elle doğrulandı) ──────────────────────
const KELIMELER = [
  { latin: 'TÜRK',   anlam: 'Türk milleti',        harfler: ['\u{10C45}','\u{10C07}','\u{10C3C}','\u{10C1A}'] },
  { latin: 'TANRI',  anlam: 'Gök Tanrısı',         harfler: ['\u{10C45}','\u{10C2D}','\u{10C3C}','\u{10C03}'] },
  { latin: 'KÜN',    anlam: 'Güneş / Gün',         harfler: ['\u{10C1A}','\u{10C07}','\u{10C24}'] },
  { latin: 'YER',    anlam: 'Yer / Toprak',         harfler: ['\u{10C18}','\u{10C3C}'] },
  { latin: 'SU',     anlam: 'Su / Ordu',            harfler: ['\u{10C3D}','\u{10C06}'] },
  { latin: 'AT',     anlam: 'At / Savaş hayvanı',   harfler: ['\u{10C00}','\u{10C43}'] },
  { latin: 'BODUN',  anlam: 'Halk / Millet',        harfler: ['\u{10C09}','\u{10C06}','\u{10C11}','\u{10C06}','\u{10C23}'] },
  { latin: 'TÖRE',   anlam: 'Gelenek / Yasa',       harfler: ['\u{10C45}','\u{10C07}','\u{10C3C}','\u{10C00}'] },
  { latin: 'BEG',    anlam: 'Bey / Lider',          harfler: ['\u{10C0B}','\u{10C0F}'] },
  { latin: 'KAGAN',  anlam: 'Han / Hükümdar',       harfler: ['\u{10C34}','\u{10C0D}','\u{10C23}'] },
  { latin: 'ÖD',     anlam: 'Zaman',                harfler: ['\u{10C07}','\u{10C13}'] },
  { latin: 'EL',     anlam: 'Devlet / İl',          harfler: ['\u{10C00}','\u{10C20}'] },
  { latin: 'ER',     anlam: 'Erkek / Savaşçı',      harfler: ['\u{10C00}','\u{10C3C}'] },
  { latin: 'KUT',    anlam: 'Kutsal güç / Talih',   harfler: ['\u{10C34}','\u{10C06}','\u{10C43}'] },
  { latin: 'ÜÇ',     anlam: 'Üç sayısı',            harfler: ['\u{10C07}','\u{10C32}'] },
];

// Tüm mevcut Göktürk harfleri (yanlış seçenek havuzu)
const HAVUZ = [
  '\u{10C00}','\u{10C03}','\u{10C06}','\u{10C07}','\u{10C09}','\u{10C0B}',
  '\u{10C0D}','\u{10C0F}','\u{10C11}','\u{10C13}','\u{10C16}','\u{10C18}',
  '\u{10C1A}','\u{10C1E}','\u{10C20}','\u{10C22}','\u{10C23}','\u{10C24}',
  '\u{10C2D}','\u{10C2F}','\u{10C32}','\u{10C34}','\u{10C3A}','\u{10C3C}',
  '\u{10C3D}','\u{10C3E}','\u{10C41}','\u{10C43}','\u{10C45}',
];

const MAX_HATA = 3;

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function buildTiles(harfler) {
  const hedefSeti = new Set(harfler);
  const decoyPool = HAVUZ.filter(h => !hedefSeti.has(h));
  const decoyCount = Math.min(4 + Math.floor(harfler.length / 2), 6);
  const decoys = shuffle(decoyPool).slice(0, decoyCount);
  return shuffle([...harfler, ...decoys]).map((harf, i) => ({ id: i, harf, durum: 'idle' }));
}

export default function SozmacaScreen() {
  const { dispatch } = useGame();
  const { playTas, playMatch } = useAudio();

  const siralama = useMemo(() => shuffle(KELIMELER.map((_, i) => i)), []);
  const [kelimePos, setKelimePos] = useState(0);
  const [tahminSayisi, setTahminSayisi] = useState(0);
  const [taslar, setTaslar] = useState(() => buildTiles(KELIMELER[siralama[0]].harfler));
  const [toplamPuan, setToplamPuan] = useState(0);
  const [hataSayisi, setHataSayisi] = useState(0);
  const [fase, setFase] = useState('oynuyor'); // 'oynuyor' | 'kelime_tamam' | 'bitis'
  const [sallananTas, setSallananTas] = useState(null);
  const [aciklananSlot, setAciklananSlot] = useState(-1);

  const kelime = KELIMELER[siralama[kelimePos]];
  const sonKelime = kelimePos >= KELIMELER.length - 1;

  function tasTikla(tas) {
    if (tas.durum !== 'idle' || fase !== 'oynuyor') return;

    const hedefHarf = kelime.harfler[tahminSayisi];

    if (tas.harf === hedefHarf) {
      // Doğru!
      playMatch();
      setTaslar(prev => prev.map(t => t.id === tas.id ? { ...t, durum: 'dogru' } : t));
      const yeniTahmin = tahminSayisi + 1;
      setTahminSayisi(yeniTahmin);
      setAciklananSlot(yeniTahmin - 1);

      if (yeniTahmin >= kelime.harfler.length) {
        // Kelime tamamlandı
        const puan = Math.max(50, 200 - hataSayisi * 50);
        setToplamPuan(s => s + puan);
        setFase('kelime_tamam');
        setTimeout(() => {
          if (sonKelime) {
            setFase('bitis');
          } else {
            const sonrakiPos = kelimePos + 1;
            setKelimePos(sonrakiPos);
            setTahminSayisi(0);
            setHataSayisi(0);
            setAciklananSlot(-1);
            setTaslar(buildTiles(KELIMELER[siralama[sonrakiPos]].harfler));
            setFase('oynuyor');
          }
        }, 1400);
      }
    } else {
      // Yanlış
      playTas();
      const yeniHata = hataSayisi + 1;
      setHataSayisi(yeniHata);
      setSallananTas(tas.id);
      setTimeout(() => setSallananTas(null), 450);
    }
  }

  // ── Bitiş ekranı ──────────────────────────────────────────────────────────
  if (fase === 'bitis') {
    return (
      <div className="sm-screen sm-bitis-ekran">
        <div className="sm-bitis-ic">
          <div className="sm-bitis-gokt">{'\u{10C45}\u{10C07}\u{10C3C}\u{10C1A}'}</div>
          <div className="sm-bitis-baslik">TÜM KELİMELER ÇÖZÜLDÜ</div>
          <div className="sm-bitis-puan">{toplamPuan}</div>
          <div className="sm-bitis-etiket">TOPLAM PUAN</div>
          <div className="sm-bitis-bilgi">{KELIMELER.length} kelime tamamlandı</div>
          <button
            className="btn btn-birincil sm-bitis-btn"
            onClick={() => dispatch({ type: 'NAVIGATE', ekran: 'home' })}
          >
            Ana Sayfaya Dön
          </button>
          <button
            className="btn btn-ikincil sm-bitis-btn"
            onClick={() => {
              setKelimePos(0);
              setTahminSayisi(0);
              setHataSayisi(0);
              setAciklananSlot(-1);
              setToplamPuan(0);
              setTaslar(buildTiles(KELIMELER[siralama[0]].harfler));
              setFase('oynuyor');
            }}
          >
            Tekrar Oyna
          </button>
        </div>
      </div>
    );
  }

  // ── Oyun ekranı ───────────────────────────────────────────────────────────
  return (
    <div className="sm-screen">
      {/* Header */}
      <div className="sm-header">
        <button className="sm-geri" onClick={() => dispatch({ type: 'NAVIGATE', ekran: 'home' })}>
          ←
        </button>
        <div className="sm-baslik-kap">
          <span className="sm-baslik-latin">SÖZMACA</span>
          <span className="sm-baslik-gokt">{'\u{10C45}\u{10C07}\u{10C3C}\u{10C1A}'}</span>
        </div>
        <div className="sm-ilerleme">{kelimePos + 1}<span>/{KELIMELER.length}</span></div>
      </div>

      {/* Puan çubuğu */}
      <div className="sm-puan-bar">
        <span className="sm-puan-sayi">{toplamPuan}</span>
        <div className="sm-hatalar">
          {Array.from({ length: MAX_HATA }).map((_, i) => (
            <span key={i} className={`sm-hata-nokta ${i < hataSayisi ? 'sm-hata-dolu' : ''}`} />
          ))}
        </div>
      </div>

      {/* İpucu */}
      <div className="sm-ipucu">
        <div className="sm-ipucu-latin">{kelime.latin}</div>
        <div className="sm-ipucu-anlam">{kelime.anlam}</div>
      </div>

      {/* Gizli slotlar */}
      <div className="sm-slotlar">
        {kelime.harfler.map((harf, i) => {
          const acik = i < tahminSayisi;
          const yeniAcilan = i === aciklananSlot;
          return (
            <div
              key={i}
              className={[
                'sm-slot',
                acik ? 'sm-slot-acik' : 'sm-slot-gizli',
                yeniAcilan ? 'sm-slot-parlak' : '',
                fase === 'kelime_tamam' && acik ? 'sm-slot-tamamlandi' : '',
              ].filter(Boolean).join(' ')}
            >
              <span className="sm-slot-harf">{acik ? harf : '?'}</span>
            </div>
          );
        })}
      </div>

      {/* Görev çizgisi */}
      <div className="sm-gorev">
        <span className="sm-gorev-ok">↓</span>
        <span className="sm-gorev-yazi">
          {tahminSayisi < kelime.harfler.length
            ? `${tahminSayisi + 1}. harfi bul`
            : 'Tamamlandı!'}
        </span>
        <span className="sm-gorev-ok">↓</span>
      </div>

      {/* Taşlar */}
      <div className="sm-taslar-alan">
        {taslar.map(tas => (
          <button
            key={tas.id}
            className={[
              'sm-tas',
              tas.durum === 'dogru' ? 'sm-tas-dogru' : '',
              sallananTas === tas.id ? 'sm-tas-salla' : '',
            ].filter(Boolean).join(' ')}
            onClick={() => tasTikla(tas)}
            disabled={tas.durum === 'dogru'}
          >
            <span className="sm-tas-harf">{tas.harf}</span>
          </button>
        ))}
      </div>

      {/* Alt alan: sıra çubuğu */}
      <div className="sm-siraci">
        {kelime.harfler.map((_, i) => (
          <div
            key={i}
            className={`sm-siraci-nokta ${i < tahminSayisi ? 'sm-siraci-tamam' : i === tahminSayisi ? 'sm-siraci-aktif' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}
