import { useState, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { getT } from '../i18n/translations';

// Ligature çiftleri — önce kontrol edilmeli (uzundan kısaya)
const LIGATURLER = [
  { l: 'ng', t: '\u{10C2D}' },   // NG = 𐰭
  { l: 'nç', t: '\u{10C28}' },   // NÇ = 𐰨
  { l: 'nt', t: '\u{10C26}' },   // NT = 𐰦
  { l: 'nd', t: '\u{10C26}' },   // ND = 𐰦 (NT ile aynı)
  { l: 'lt', t: '\u{10C21}' },   // LT = 𐰡
  { l: 'ld', t: '\u{10C21}' },   // LD = 𐰡 (LT ile aynı)
  { l: 'ny', t: '\u{10C2A}' },   // NY/Ñ = 𐰪
  { l: 'ok', t: '\u{10C38}' },   // OK = 𐰸
  { l: 'uk', t: '\u{10C38}' },   // UK = 𐰸
  { l: 'ko', t: '\u{10C38}' },   // KO = 𐰸
  { l: 'ku', t: '\u{10C38}' },   // KU = 𐰸
  { l: 'ök', t: '\u{10C1C}' },   // ÖK = 𐰜
  { l: 'ük', t: '\u{10C1C}' },   // ÜK = 𐰜
  { l: 'kö', t: '\u{10C1C}' },   // KÖ = 𐰜
  { l: 'kü', t: '\u{10C1C}' },   // KÜ = 𐰜
  { l: 'ik', t: '\u{10C36}' },   // IK = 𐰶
  { l: 'ki', t: '\u{10C36}' },   // KI = 𐰶
  { l: 'ık', t: '\u{10C36}' },   // IK kalın = 𐰶
  { l: 'kı', t: '\u{10C36}' },   // KI kalın = 𐰶
  { l: 'uç', t: '\u{10C30}' },   // UÇ = 𐰰
  { l: 'oç', t: '\u{10C30}' },   // OÇ = 𐰰
  { l: 'iç', t: '\u{10C31}' },   // İÇ = 𐰱
];

// Ses → tamga: her sesin art/ön karşılığı
const SESLER = {
  a:  { back: '\u{10C00}', front: '\u{10C00}' },
  e:  { back: '\u{10C00}', front: '\u{10C00}' }, // E → A tamgası (Göktürk geleneği)
  ı:  { back: '\u{10C03}', front: '\u{10C03}' },
  i:  { back: '\u{10C03}', front: '\u{10C03}' },
  o:  { back: '\u{10C06}', front: '\u{10C06}' },
  u:  { back: '\u{10C06}', front: '\u{10C06}' },
  ö:  { back: '\u{10C07}', front: '\u{10C07}' },
  ü:  { back: '\u{10C07}', front: '\u{10C07}' },
  b:  { back: '\u{10C09}', front: '\u{10C0B}' },
  k:  { back: '\u{10C34}', front: '\u{10C1A}' },
  t:  { back: '\u{10C43}', front: '\u{10C45}' },
  n:  { back: '\u{10C23}', front: '\u{10C24}' },
  r:  { back: '\u{10C3A}', front: '\u{10C3C}' },
  g:  { back: '\u{10C0D}', front: '\u{10C0F}' },
  ğ:  { back: '\u{10C0D}', front: '\u{10C0F}' },
  d:  { back: '\u{10C11}', front: '\u{10C13}' },
  y:  { back: '\u{10C16}', front: '\u{10C18}' },
  l:  { back: '\u{10C1E}', front: '\u{10C20}' },
  m:  { back: '\u{10C22}', front: '\u{10C22}' },
  s:  { back: '\u{10C3D}', front: '\u{10C3E}' },
  z:  { back: '\u{10C14}', front: '\u{10C14}' }, // Z → U+10C14 (referans)
  ç:  { back: '\u{10C32}', front: '\u{10C32}' },
  ş:  { back: '\u{10C41}', front: '\u{10C41}' }, // Ş → gerçek Ş tamgası (U+10C41)
  p:  { back: '\u{10C2F}', front: '\u{10C2F}' }, // P tamgası (U+10C2F)
  h:  { back: '\u{10C34}', front: '\u{10C1A}' }, // H → K
  f:  { back: '\u{10C2F}', front: '\u{10C2F}' }, // F → P
  v:  { back: '\u{10C09}', front: '\u{10C0B}' }, // V → B
  c:  { back: '\u{10C32}', front: '\u{10C32}' }, // C → Ç
  j:  { back: '\u{10C32}', front: '\u{10C32}' }, // J → Ç
  w:  { back: '\u{10C09}', front: '\u{10C0B}' }, // W → B
  x:  { back: '\u{10C34}', front: '\u{10C1A}' }, // X → K
  q:  { back: '\u{10C34}', front: '\u{10C1A}' }, // Q → K
};

// Her karakter için en yakın ünlüye göre art/ön uyumu (hece-bazlı)
const VOWEL_HARMONY = new Map([
  ['a', 'back'], ['ı', 'back'], ['o', 'back'], ['u', 'back'],
  ['e', 'front'], ['i', 'front'], ['ö', 'front'], ['ü', 'front'],
]);

function getCharHarmony(lower, pos) {
  let bestDist = Infinity;
  let bestHarmony = 'back';
  for (let j = 0; j < lower.length; j++) {
    const h = VOWEL_HARMONY.get(lower[j]);
    if (h !== undefined) {
      const dist = Math.abs(j - pos);
      // Eşit uzaklıkta sağdaki (sonraki) ünlüyü tercih et
      if (dist < bestDist || (dist === bestDist && j > pos)) {
        bestDist = dist;
        bestHarmony = h;
      }
    }
  }
  return bestHarmony;
}

// Düz ünlüler (a, e, ı, i): kelime başı ve sonu dışında yazılmaz (Göktürk geleneği)
// Yuvarlak ünlüler (o, u, ö, ü): her zaman yazılır
const DUZ_UNLU = new Set(['a', 'e', 'ı', 'i']);

function cevirKelime(kelime) {
  const harfler = [];
  let i = 0;
  const lower = kelime.toLowerCase();
  const son = lower.length - 1;

  while (i < lower.length) {
    // 2-karakter ligature (ünlü düşümünden önce kontrol)
    if (i < son) {
      const iki = lower.slice(i, i + 2);
      const lig = LIGATURLER.find((l) => l.l === iki);
      if (lig) {
        harfler.push({ latin: kelime.slice(i, i + 2), tamga: lig.t });
        i += 2;
        continue;
      }
    }

    const ch = lower[i];
    const ses = SESLER[ch];
    if (ses) {
      // Ünlü düşümü: düz ünlüler iç konumda yazılmaz
      if (DUZ_UNLU.has(ch) && i > 0 && i < son) {
        i++;
        continue;
      }
      const uyum = getCharHarmony(lower, i);
      harfler.push({ latin: kelime[i], tamga: ses[uyum] });
    } else if (ch === "'") {
      // Kesme işareti - atla
    } else {
      harfler.push({ latin: kelime[i], tamga: kelime[i] });
    }
    i++;
  }

  return harfler;
}

function cevirMetin(metin) {
  if (!metin.trim()) return [];
  const parcalar = metin.split(/(\s+|\n)/);
  const result = [];

  for (const parca of parcalar) {
    if (!parca) continue;
    if (/^[\s\n]+$/.test(parca)) {
      result.push({ tip: 'bosluk', latin: parca, tamga: parca, harfler: [] });
    } else {
      const harfler = cevirKelime(parca);
      result.push({
        tip: 'kelime',
        latin: parca,
        tamga: harfler.map((h) => h.tamga).join(''),
        harfler,
      });
    }
  }

  return result;
}

export default function CeviriScreen() {
  const { state, dispatch } = useGame();
  const t = getT(state.dil || 'tr');
  const [metin, setMetin] = useState('');
  const [kopyalandi, setKopyalandi] = useState(false);

  const parcalar = cevirMetin(metin);
  const tamgaCikti = parcalar.map((p) => p.tamga).join('');

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
        <button className="geri-btn" onClick={() => dispatch({ type: 'NAVIGATE', ekran: 'home' })}>
          &#8592;
        </button>
        <div className="ceviri-header-icerik">
          <h2 className="ceviri-baslik">{t('ceviriBaslik')}</h2>
          <p className="ceviri-alt">{t('ceviriAlt')}</p>
        </div>
      </div>

      <div className="ceviri-icerik">
        {/* Giriş alanı */}
        <div className="ceviri-giris-bolum">
          <label className="ceviri-etiket">{t('latinYaz')}</label>
          <textarea
            className="ceviri-textarea"
            placeholder={t('ceviriPlaceholder')}
            value={metin}
            onChange={(e) => setMetin(e.target.value)}
            maxLength={200}
            rows={3}
          />
          <div className="ceviri-karakter-sayac">{metin.length}/200</div>
        </div>

        {/* Hızlı örnekler */}
        <div className="ceviri-ornekler">
          {ornekler.map((o) => (
            <button
              key={o}
              className="ceviri-ornek-btn"
              onClick={() => setMetin(o)}
            >
              {o}
            </button>
          ))}
        </div>

        {/* Çıktı alanı */}
        <div className="ceviri-cikis-bolum">
          <div className="ceviri-cikis-baslik">
            <label className="ceviri-etiket">{t('goktUrkceCikis')}</label>
            <button
              className={`ceviri-kopyala-btn ${kopyalandi ? 'kopyalandi' : ''}`}
              onClick={kopyala}
              disabled={!tamgaCikti}
            >
              {kopyalandi ? t('kopyalandi') : t('kopyala')}
            </button>
          </div>

          <div className="ceviri-cikis-kutu">
            {tamgaCikti ? (
              <div className="ceviri-cikis-metin">{tamgaCikti}</div>
            ) : (
              <div className="ceviri-cikis-bos">{t('ceviriiBos')}</div>
            )}
          </div>
        </div>

        {/* Karakter karşılıkları */}
        {metin.trim() && (
          <div className="ceviri-eslestirme">
            <label className="ceviri-etiket">{t('harfEslestirme')}</label>
            <div className="ceviri-harf-satir">
              {parcalar.map((parca, pi) =>
                parca.tip === 'bosluk' ? (
                  <div key={pi} className="ceviri-bosluk" />
                ) : (
                  parca.harfler.map((h, hi) => (
                    <div key={`${pi}-${hi}`} className="ceviri-harf-cift">
                      <span className="ceviri-harf-tamga">{h.tamga}</span>
                      <span className="ceviri-harf-latin">{h.latin.toUpperCase()}</span>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        )}

        {/* Bilgi notu */}
        <div className="ceviri-not">
          <span className="ceviri-not-ikon">ℹ</span>
          <p>{t('ceviriNot')}</p>
        </div>
      </div>
    </div>
  );
}
