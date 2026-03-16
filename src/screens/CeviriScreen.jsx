import { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { useAudio } from '../hooks/useAudio';
import { getT } from '../i18n/translations';

// ── Çeviri motoru ────────────────────────────────────────────────────────────
const LIGATURLER = [
  { l: 'ng', t: '\u{10C2D}' }, { l: 'nç', t: '\u{10C28}' }, { l: 'nt', t: '\u{10C26}' },
  { l: 'nd', t: '\u{10C26}' }, { l: 'lt', t: '\u{10C21}' }, { l: 'ld', t: '\u{10C21}' },
  { l: 'ny', t: '\u{10C2A}' }, { l: 'ok', t: '\u{10C38}' }, { l: 'uk', t: '\u{10C38}' },
  { l: 'ko', t: '\u{10C38}' }, { l: 'ku', t: '\u{10C38}' }, { l: 'ök', t: '\u{10C1C}' },
  { l: 'ük', t: '\u{10C1C}' }, { l: 'kö', t: '\u{10C1C}' }, { l: 'kü', t: '\u{10C1C}' },
  { l: 'ik', t: '\u{10C36}' }, { l: 'ki', t: '\u{10C36}' }, { l: 'ık', t: '\u{10C36}' },
  { l: 'kı', t: '\u{10C36}' }, { l: 'uç', t: '\u{10C30}' }, { l: 'oç', t: '\u{10C30}' },
  { l: 'iç', t: '\u{10C31}' },
];
const SESLER = {
  a:{back:'\u{10C00}',front:'\u{10C00}'}, e:{back:'\u{10C00}',front:'\u{10C00}'},
  ı:{back:'\u{10C03}',front:'\u{10C03}'}, i:{back:'\u{10C03}',front:'\u{10C03}'},
  o:{back:'\u{10C06}',front:'\u{10C06}'}, u:{back:'\u{10C06}',front:'\u{10C06}'},
  ö:{back:'\u{10C07}',front:'\u{10C07}'}, ü:{back:'\u{10C07}',front:'\u{10C07}'},
  b:{back:'\u{10C09}',front:'\u{10C0B}'}, k:{back:'\u{10C34}',front:'\u{10C1A}'},
  t:{back:'\u{10C43}',front:'\u{10C45}'}, n:{back:'\u{10C23}',front:'\u{10C24}'},
  r:{back:'\u{10C3A}',front:'\u{10C3C}'}, g:{back:'\u{10C0D}',front:'\u{10C0F}'},
  ğ:{back:'\u{10C0D}',front:'\u{10C0F}'}, d:{back:'\u{10C11}',front:'\u{10C13}'},
  y:{back:'\u{10C16}',front:'\u{10C18}'}, l:{back:'\u{10C1E}',front:'\u{10C20}'},
  m:{back:'\u{10C22}',front:'\u{10C22}'}, s:{back:'\u{10C3D}',front:'\u{10C3E}'},
  z:{back:'\u{10C14}',front:'\u{10C14}'}, ç:{back:'\u{10C32}',front:'\u{10C32}'},
  ş:{back:'\u{10C41}',front:'\u{10C41}'}, p:{back:'\u{10C2F}',front:'\u{10C2F}'},
  h:{back:'\u{10C34}',front:'\u{10C1A}'}, f:{back:'\u{10C2F}',front:'\u{10C2F}'},
  v:{back:'\u{10C09}',front:'\u{10C0B}'}, c:{back:'\u{10C32}',front:'\u{10C32}'},
  j:{back:'\u{10C32}',front:'\u{10C32}'}, w:{back:'\u{10C09}',front:'\u{10C0B}'},
  x:{back:'\u{10C34}',front:'\u{10C1A}'}, q:{back:'\u{10C34}',front:'\u{10C1A}'},
};
const VOWEL_HARMONY = new Map([
  ['a','back'],['ı','back'],['o','back'],['u','back'],
  ['e','front'],['i','front'],['ö','front'],['ü','front'],
]);
const DUZ_UNLU = new Set(['a','e','ı','i']);

function getCharHarmony(lower, pos) {
  let bestDist = Infinity, bestHarmony = 'back';
  for (let j = 0; j < lower.length; j++) {
    const h = VOWEL_HARMONY.get(lower[j]);
    if (h !== undefined) {
      const dist = Math.abs(j - pos);
      if (dist < bestDist || (dist === bestDist && j > pos)) { bestDist = dist; bestHarmony = h; }
    }
  }
  return bestHarmony;
}

function cevirKelime(kelime) {
  const harfler = []; let i = 0;
  const lower = kelime.toLowerCase(), son = lower.length - 1;
  while (i < lower.length) {
    if (i < son) {
      const iki = lower.slice(i, i + 2);
      const lig = LIGATURLER.find(l => l.l === iki);
      if (lig) { harfler.push({ latin: kelime.slice(i, i + 2), tamga: lig.t }); i += 2; continue; }
    }
    const ch = lower[i], ses = SESLER[ch];
    if (ses) {
      if (DUZ_UNLU.has(ch) && i > 0 && i < son) { i++; continue; }
      harfler.push({ latin: kelime[i], tamga: ses[getCharHarmony(lower, i)] });
    } else if (ch !== "'") {
      harfler.push({ latin: kelime[i], tamga: kelime[i] });
    }
    i++;
  }
  return harfler;
}

function cevirMetin(metin) {
  if (!metin.trim()) return [];
  return metin.split(/(\s+|\n)/).filter(Boolean).map(parca => {
    if (/^[\s\n]+$/.test(parca)) return { tip: 'bosluk', latin: parca, tamga: parca, harfler: [] };
    const harfler = cevirKelime(parca);
    return { tip: 'kelime', latin: parca, tamga: harfler.map(h => h.tamga).join(''), harfler };
  });
}

// ── Tamga Çöz oyunu ─────────────────────────────────────────────────────────
const KELIMELER = [
  { latin: 'TÜRK',   anlam: 'Türk milleti',       harfler: ['\u{10C45}','\u{10C07}','\u{10C3C}','\u{10C1A}'] },
  { latin: 'TANRI',  anlam: 'Gök Tanrısı',        harfler: ['\u{10C45}','\u{10C2D}','\u{10C3C}','\u{10C03}'] },
  { latin: 'KÜN',    anlam: 'Güneş / Gün',        harfler: ['\u{10C1A}','\u{10C07}','\u{10C24}'] },
  { latin: 'YER',    anlam: 'Yer / Toprak',        harfler: ['\u{10C18}','\u{10C3C}'] },
  { latin: 'SU',     anlam: 'Su / Ordu',           harfler: ['\u{10C3D}','\u{10C06}'] },
  { latin: 'AT',     anlam: 'At / Savaş hayvanı',  harfler: ['\u{10C00}','\u{10C43}'] },
  { latin: 'BODUN',  anlam: 'Halk / Millet',       harfler: ['\u{10C09}','\u{10C06}','\u{10C11}','\u{10C06}','\u{10C23}'] },
  { latin: 'TÖRE',   anlam: 'Gelenek / Yasa',      harfler: ['\u{10C45}','\u{10C07}','\u{10C3C}','\u{10C00}'] },
  { latin: 'BEG',    anlam: 'Bey / Lider',         harfler: ['\u{10C0B}','\u{10C0F}'] },
  { latin: 'KAGAN',  anlam: 'Han / Hükümdar',      harfler: ['\u{10C34}','\u{10C0D}','\u{10C23}'] },
  { latin: 'ÖD',     anlam: 'Zaman',               harfler: ['\u{10C07}','\u{10C13}'] },
  { latin: 'EL',     anlam: 'Devlet / İl',         harfler: ['\u{10C00}','\u{10C20}'] },
  { latin: 'ER',     anlam: 'Erkek / Savaşçı',     harfler: ['\u{10C00}','\u{10C3C}'] },
  { latin: 'KUT',    anlam: 'Kutsal güç / Talih',  harfler: ['\u{10C34}','\u{10C06}','\u{10C43}'] },
  { latin: 'ÜÇ',     anlam: 'Üç sayısı',           harfler: ['\u{10C07}','\u{10C32}'] },
];
const HAVUZ = [
  '\u{10C00}','\u{10C03}','\u{10C06}','\u{10C07}','\u{10C09}','\u{10C0B}',
  '\u{10C0D}','\u{10C0F}','\u{10C11}','\u{10C13}','\u{10C16}','\u{10C18}',
  '\u{10C1A}','\u{10C1E}','\u{10C20}','\u{10C22}','\u{10C23}','\u{10C24}',
  '\u{10C2D}','\u{10C2F}','\u{10C32}','\u{10C34}','\u{10C3A}','\u{10C3C}',
  '\u{10C3D}','\u{10C3E}','\u{10C41}','\u{10C43}','\u{10C45}',
];

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function buildTiles(harfler) {
  const set = new Set(harfler);
  const decoys = shuffle(HAVUZ.filter(h => !set.has(h))).slice(0, Math.min(5, 6 - harfler.length));
  return shuffle([...harfler, ...decoys]).map((harf, i) => ({ id: i, harf, durum: 'idle' }));
}

function TamgaCoz({ onGeri }) {
  const { playTas, playMatch } = useAudio();
  const siralama = useMemo(() => shuffle(KELIMELER.map((_, i) => i)), []);
  const [pos, setPos] = useState(0);
  const [tahmin, setTahmin] = useState(0);
  const [taslar, setTaslar] = useState(() => buildTiles(KELIMELER[siralama[0]].harfler));
  const [puan, setPuan] = useState(0);
  const [hata, setHata] = useState(0);
  const [bitti, setBitti] = useState(false);
  const [salla, setSalla] = useState(null);
  const [sonAcilan, setSonAcilan] = useState(-1);

  const kelime = KELIMELER[siralama[pos]];

  function tasTikla(tas) {
    if (tas.durum !== 'idle' || bitti) return;
    if (tas.harf === kelime.harfler[tahmin]) {
      playMatch();
      setTaslar(p => p.map(t => t.id === tas.id ? { ...t, durum: 'dogru' } : t));
      const yeni = tahmin + 1;
      setTahmin(yeni);
      setSonAcilan(yeni - 1);
      if (yeni >= kelime.harfler.length) {
        setPuan(p => p + Math.max(50, 200 - hata * 50));
        setTimeout(() => {
          if (pos >= KELIMELER.length - 1) { setBitti(true); return; }
          const s = pos + 1;
          setPos(s); setTahmin(0); setHata(0); setSonAcilan(-1);
          setTaslar(buildTiles(KELIMELER[siralama[s]].harfler));
        }, 1200);
      }
    } else {
      playTas();
      setHata(h => h + 1);
      setSalla(tas.id);
      setTimeout(() => setSalla(null), 450);
    }
  }

  if (bitti) return (
    <div className="tc-bitis">
      <div className="tc-bitis-gokt">{'\u{10C45}\u{10C07}\u{10C3C}\u{10C1A}'}</div>
      <div className="tc-bitis-baslik">TÜM KELİMELER ÇÖZÜLDÜ</div>
      <div className="tc-bitis-puan">{puan}</div>
      <div className="tc-bitis-etiket">TOPLAM PUAN</div>
      <button className="btn btn-birincil tc-btn" onClick={() => {
        setPos(0); setTahmin(0); setHata(0); setSonAcilan(-1);
        setPuan(0); setBitti(false);
        setTaslar(buildTiles(KELIMELER[siralama[0]].harfler));
      }}>Tekrar Oyna</button>
      <button className="btn btn-ikincil tc-btn" onClick={onGeri}>Çeviriye Dön</button>
    </div>
  );

  return (
    <div className="tc-oyun">
      {/* İlerleme */}
      <div className="tc-ilerleme">
        <span className="tc-ilerleme-sayi">{pos + 1}<span>/{KELIMELER.length}</span></span>
        <div className="tc-hatalar">
          {[0,1,2].map(i => <span key={i} className={`tc-hata ${i < hata ? 'tc-hata-dolu' : ''}`} />)}
        </div>
        <span className="tc-puan-mini">{puan} puan</span>
      </div>

      {/* İpucu */}
      <div className="tc-ipucu">
        <div className="tc-latin">{kelime.latin}</div>
        <div className="tc-anlam">{kelime.anlam}</div>
      </div>

      {/* Slotlar */}
      <div className="tc-slotlar">
        {kelime.harfler.map((harf, i) => {
          const acik = i < tahmin;
          return (
            <div key={i} className={[
              'tc-slot',
              acik ? 'tc-slot-acik' : 'tc-slot-gizli',
              i === sonAcilan ? 'tc-slot-parlak' : '',
            ].filter(Boolean).join(' ')}>
              <span className="tc-slot-harf">{acik ? harf : '?'}</span>
            </div>
          );
        })}
      </div>

      {/* Sıra göstergesi */}
      <div className="tc-siraci">
        {kelime.harfler.map((_, i) => (
          <div key={i} className={`tc-siraci-nokta ${i < tahmin ? 'tc-s-tamam' : i === tahmin ? 'tc-s-aktif' : ''}`} />
        ))}
      </div>

      {/* Taşlar */}
      <div className="tc-taslar">
        {taslar.map(tas => (
          <button key={tas.id}
            className={['tc-tas', tas.durum === 'dogru' ? 'tc-tas-dogru' : '', salla === tas.id ? 'tc-tas-salla' : ''].filter(Boolean).join(' ')}
            onClick={() => tasTikla(tas)}
            disabled={tas.durum === 'dogru'}
          >
            {tas.harf}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Ana ekran ────────────────────────────────────────────────────────────────
export default function CeviriScreen() {
  const { state, dispatch } = useGame();
  const t = getT(state.dil || 'tr');
  const [sekme, setSekme] = useState('ceviri');
  const [metin, setMetin] = useState('');
  const [kopyalandi, setKopyalandi] = useState(false);

  const parcalar = cevirMetin(metin);
  const tamgaCikti = parcalar.map(p => p.tamga).join('');

  function kopyala() {
    if (!tamgaCikti) return;
    navigator.clipboard?.writeText(tamgaCikti).then(() => {
      setKopyalandi(true);
      setTimeout(() => setKopyalandi(false), 2000);
    });
  }

  const ornekler = ['TENGRI', 'TÜRK', 'KAGAN', 'BILGE', 'ATA', 'EL'];

  return (
    <div className="screen ceviri-screen">
      {/* Header */}
      <div className="ceviri-header">
        <button className="geri-btn" onClick={() => dispatch({ type: 'NAVIGATE', ekran: 'home' })}>&#8592;</button>
        <div className="ceviri-header-icerik">
          <h2 className="ceviri-baslik">{t('ceviriBaslik')}</h2>
          <p className="ceviri-alt">{t('ceviriAlt')}</p>
        </div>
      </div>

      {/* Sekme çubuğu */}
      <div className="ceviri-sekmeler">
        <button
          className={`ceviri-sekme ${sekme === 'ceviri' ? 'ceviri-sekme-aktif' : ''}`}
          onClick={() => setSekme('ceviri')}
        >
          <span>{'\u{10C00}'}</span> Çeviri
        </button>
        <button
          className={`ceviri-sekme ${sekme === 'oyun' ? 'ceviri-sekme-aktif' : ''}`}
          onClick={() => setSekme('oyun')}
        >
          <span style={{ fontFamily: "'Segoe UI Historic','Noto Serif Old Turkic',serif" }}>{'\u{10C45}\u{10C07}\u{10C3C}\u{10C1A}'}</span> Tamga Çöz
        </button>
      </div>

      {/* Çeviri sekmesi */}
      {sekme === 'ceviri' && (
        <div className="ceviri-icerik">
          <div className="ceviri-giris-bolum">
            <label className="ceviri-etiket">{t('latinYaz')}</label>
            <textarea
              className="ceviri-textarea"
              placeholder={t('ceviriPlaceholder')}
              value={metin}
              onChange={e => setMetin(e.target.value)}
              maxLength={200}
              rows={3}
            />
            <div className="ceviri-karakter-sayac">{metin.length}/200</div>
          </div>
          <div className="ceviri-ornekler">
            {ornekler.map(o => (
              <button key={o} className="ceviri-ornek-btn" onClick={() => setMetin(o)}>{o}</button>
            ))}
          </div>
          <div className="ceviri-cikis-bolum">
            <div className="ceviri-cikis-baslik">
              <label className="ceviri-etiket">{t('goktUrkceCikis')}</label>
              <button className={`ceviri-kopyala-btn ${kopyalandi ? 'kopyalandi' : ''}`} onClick={kopyala} disabled={!tamgaCikti}>
                {kopyalandi ? t('kopyalandi') : t('kopyala')}
              </button>
            </div>
            <div className="ceviri-cikis-kutu">
              {tamgaCikti
                ? <div className="ceviri-cikis-metin">{tamgaCikti}</div>
                : <div className="ceviri-cikis-bos">{t('ceviriiBos')}</div>
              }
            </div>
          </div>
          {metin.trim() && (
            <div className="ceviri-eslestirme">
              <label className="ceviri-etiket">{t('harfEslestirme')}</label>
              <div className="ceviri-harf-satir">
                {parcalar.map((parca, pi) =>
                  parca.tip === 'bosluk' ? <div key={pi} className="ceviri-bosluk" /> :
                  parca.harfler.map((h, hi) => (
                    <div key={`${pi}-${hi}`} className="ceviri-harf-cift">
                      <span className="ceviri-harf-tamga">{h.tamga}</span>
                      <span className="ceviri-harf-latin">{h.latin.toUpperCase()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          <div className="ceviri-not">
            <span className="ceviri-not-ikon">ℹ</span>
            <p>{t('ceviriNot')}</p>
          </div>
        </div>
      )}

      {/* Tamga Çöz sekmesi */}
      {sekme === 'oyun' && (
        <div className="ceviri-icerik tc-kap">
          <TamgaCoz onGeri={() => setSekme('ceviri')} />
        </div>
      )}
    </div>
  );
}
