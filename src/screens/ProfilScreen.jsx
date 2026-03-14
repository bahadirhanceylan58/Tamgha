import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { TAMGALAR, HAYVANLAR, MITOLOJI } from '../data/tamgalar';
import { getT } from '../i18n/translations';

// ── Latin → Göktürk çevirisi (CeviriScreen'den alındı) ──
const LIGATURLER = [
  { l: 'ng', t: '\u{10C2D}' }, { l: 'nç', t: '\u{10C28}' },
  { l: 'nt', t: '\u{10C26}' }, { l: 'nd', t: '\u{10C26}' },
  { l: 'lt', t: '\u{10C21}' }, { l: 'ld', t: '\u{10C21}' },
  { l: 'ny', t: '\u{10C2A}' }, { l: 'ok', t: '\u{10C38}' },
  { l: 'uk', t: '\u{10C38}' }, { l: 'ök', t: '\u{10C1C}' },
  { l: 'ük', t: '\u{10C1C}' }, { l: 'ik', t: '\u{10C36}' },
  { l: 'ki', t: '\u{10C36}' }, { l: 'ık', t: '\u{10C36}' },
];
const SESLER = {
  a:'\u{10C00}',e:'\u{10C00}',ı:'\u{10C03}',i:'\u{10C03}',
  o:'\u{10C06}',u:'\u{10C06}',ö:'\u{10C07}',ü:'\u{10C07}',
  b:'\u{10C09}',k:'\u{10C34}',t:'\u{10C43}',n:'\u{10C23}',
  r:'\u{10C3A}',g:'\u{10C0D}',ğ:'\u{10C0D}',d:'\u{10C11}',
  y:'\u{10C16}',l:'\u{10C1E}',m:'\u{10C22}',s:'\u{10C3D}',
  z:'\u{10C14}',ç:'\u{10C32}',ş:'\u{10C41}',p:'\u{10C2F}',
  h:'\u{10C34}',f:'\u{10C2F}',v:'\u{10C09}',c:'\u{10C32}',
  j:'\u{10C32}',w:'\u{10C09}',x:'\u{10C34}',q:'\u{10C34}',
};
const DUZ_UNLU = new Set(['a','e','ı','i']);

function adGokt(metin) {
  if (!metin) return '';
  const lower = metin.toLowerCase().trim();
  const son = lower.length - 1;
  let result = '';
  let i = 0;
  while (i < lower.length) {
    if (i < son) {
      const iki = lower.slice(i, i + 2);
      const lig = LIGATURLER.find(l => l.l === iki);
      if (lig) { result += lig.t; i += 2; continue; }
    }
    const ch = lower[i];
    if (SESLER[ch]) {
      if (DUZ_UNLU.has(ch) && i > 0 && i < son) { i++; continue; }
      result += SESLER[ch];
    } else if (ch === ' ') {
      result += ' ';
    }
    i++;
  }
  return result;
}

const AVATAR_SECENEKLER = [
  '\u{10C00}', '\u{10C09}', '\u{10C1A}', '\u{10C2D}', '\u{10C03}',
  '\u{10C3A}', '\u{10C23}', '\u{10C43}', '\u{10C15}', '\u{10C32}',
  '🐯', '🐉', '🦅', '🐺', '🦁',
  '☀', '🌙', '⭐', '💎', '👑',
];

const DİLLER = [
  { id: 'tr', ad: 'Türkçe', bayrak: '🇹🇷' },
  { id: 'en', ad: 'English', bayrak: '🇬🇧' },
  { id: 'ru', ad: 'Русский', bayrak: '🇷🇺' },
];

const BASARIMLAR = [
  { id: 'ilk_kart', ikon: '🃏', tr: 'İlk Adım', en: 'First Step', ru: 'Первый шаг', koşul: (s) => s.kazanilanKartlar.length >= 1 },
  { id: 'bes_kart', ikon: '📚', tr: '5 Kart', en: '5 Cards', ru: '5 карт', koşul: (s) => s.kazanilanKartlar.length >= 5 },
  { id: 'on_kart', ikon: '🎴', tr: '10 Kart', en: '10 Cards', ru: '10 карт', koşul: (s) => s.kazanilanKartlar.length >= 10 },
  { id: 'yirmi_kart', ikon: '📖', tr: '20 Kart', en: '20 Cards', ru: '20 карт', koşul: (s) => s.kazanilanKartlar.length >= 20 },
  { id: 'yuz_puan', ikon: '💯', tr: '100 Puan', en: '100 Points', ru: '100 очков', koşul: (s) => s.toplamPuan >= 100 },
  { id: 'bin_puan', ikon: '🏆', tr: '1000 Puan', en: '1000 Points', ru: '1000 очков', koşul: (s) => s.toplamPuan >= 1000 },
  { id: 'orhun_ac', ikon: '🗿', tr: 'Orhun Kaşifi', en: 'Orhun Explorer', ru: 'Исследователь Орхона', koşul: (s) => !s.bolgeIlerlemesi?.selenga?.kilit },
  { id: 'selenga_ac', ikon: '🌊', tr: 'Selenga Kâşifi', en: 'Selenga Explorer', ru: 'Исследователь Селенги', koşul: (s) => !s.bolgeIlerlemesi?.altay?.kilit },
  { id: 'altay_ac', ikon: '⛰', tr: 'Altay Kâşifi', en: 'Altay Explorer', ru: 'Исследователь Алтая', koşul: (s) => !s.bolgeIlerlemesi?.tengri_yurdu?.kilit },
  { id: 'dogum', ikon: '🐾', tr: 'Ruh Sahibi', en: 'Soul Bearer', ru: 'Носитель духа', koşul: (s) => !!s.dogumHayvaniId },
  { id: 'gunluk', ikon: '📅', tr: 'Günlük Adept', en: 'Daily Adept', ru: 'Ежедневный адепт', koşul: (s) => !!s.gunlukKartTalep },
];

export default function ProfilScreen() {
  const { state, dispatch } = useGame();
  const dil = state.dil || 'tr';
  const t = getT(dil);

  const [adDuzenle, setAdDuzenle] = useState(false);
  const [adInput, setAdInput] = useState(state.kullaniciAdi || '');

  const toplamKart = TAMGALAR.length + HAYVANLAR.length + MITOLOJI.length + 1;
  const tamamlanma = Math.round((state.kazanilanKartlar.length / toplamKart) * 100);

  function adKaydet() {
    dispatch({ type: 'PROFİL_GUNCELLE', kullaniciAdi: adInput.trim() });
    setAdDuzenle(false);
  }

  function avatarSec(avatar) {
    dispatch({ type: 'PROFİL_GUNCELLE', avatar });
  }

  function dilSec(yeniDil) {
    dispatch({ type: 'DIL_DEGISTIR', dil: yeniDil });
  }

  const kazanilanBasarimlar = BASARIMLAR.filter((b) => b.koşul(state));

  function basarimAd(b) {
    if (dil === 'en') return b.en;
    if (dil === 'ru') return b.ru;
    return b.tr;
  }

  const goktAd = adGokt(adDuzenle ? adInput : (state.kullaniciAdi || ''));

  return (
    <div className="screen profil-screen">
      {/* Header */}
      <div className="profil-header">
        <button className="geri-btn" onClick={() => dispatch({ type: 'NAVIGATE', ekran: 'home' })}>
          &#8592;
        </button>
        <h2 className="profil-baslik">{t('profilim')}</h2>
        <div style={{ width: 40 }} />
      </div>

      <div className="profil-icerik">
        {/* Kimlik Kartı */}
        <div className="profil-kimlik-kart">
          {/* Süsleme tamgaları arka planda */}
          <div className="profil-kart-bg-tamgalar" aria-hidden>
            {['\u{10C00}','\u{10C09}','\u{10C1A}','\u{10C2D}','\u{10C3A}'].map((t,i)=>(
              <span key={i} className="profil-kart-bg-tamga">{t}</span>
            ))}
          </div>

          <div className="profil-avatar-buyuk">{state.avatar || '\u{10C00}'}</div>

          {/* Göktürk isim */}
          {goktAd && (
            <div className="profil-gokt-ad">{goktAd}</div>
          )}

          {/* Latin isim / düzenleme */}
          {adDuzenle ? (
            <div className="profil-ad-duzenle">
              <input
                className="profil-ad-input"
                value={adInput}
                onChange={(e) => setAdInput(e.target.value)}
                placeholder={t('adiniGir')}
                maxLength={16}
                autoFocus
              />
              <button className="btn btn-birincil profil-kaydet-btn" onClick={adKaydet}>
                {t('kaydet')}
              </button>
            </div>
          ) : (
            <div className="profil-ad-satir" onClick={() => setAdDuzenle(true)}>
              <span className="profil-ad">{state.kullaniciAdi || t('adiniGir')}</span>
              <span className="profil-duzenle-ikon">✏</span>
            </div>
          )}

          {/* İlerleme */}
          <div className="profil-kart-ilerleme">
            <div className="profil-ilerleme-bar">
              <div className="profil-ilerleme-dolgu" style={{ width: `${tamamlanma}%` }} />
            </div>
            <span className="profil-kart-yuzde">{tamamlanma}%</span>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="profil-bolum">
          <h3 className="profil-bolum-baslik">{t('istatistikler')}</h3>
          <div className="profil-stat-grid">
            <div className="profil-stat">
              <span className="profil-stat-sayi">{state.kazanilanKartlar.length}</span>
              <span className="profil-stat-etiket">{t('kazanilanKartlar')}</span>
            </div>
            <div className="profil-stat">
              <span className="profil-stat-sayi">{state.toplamPuan}</span>
              <span className="profil-stat-etiket">{t('toplamPuan')}</span>
            </div>
            <div className="profil-stat">
              <span className="profil-stat-sayi">{tamamlanma}%</span>
              <span className="profil-stat-etiket">{t('tamamlanma')}</span>
            </div>
          </div>
        </div>

        {/* Avatar Seçimi */}
        <div className="profil-bolum">
          <h3 className="profil-bolum-baslik">{t('avatarSec')}</h3>
          <div className="profil-avatar-grid">
            {AVATAR_SECENEKLER.map((av) => (
              <button
                key={av}
                className={`profil-avatar-btn ${state.avatar === av ? 'secili' : ''}`}
                onClick={() => avatarSec(av)}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {/* Dil Seçimi */}
        <div className="profil-bolum">
          <h3 className="profil-bolum-baslik">{t('dil')}</h3>
          <div className="profil-dil-row">
            {DİLLER.map((d) => (
              <button
                key={d.id}
                className={`profil-dil-btn ${dil === d.id ? 'aktif' : ''}`}
                onClick={() => dilSec(d.id)}
              >
                <span>{d.bayrak}</span>
                <span>{d.ad}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Başarımlar */}
        <div className="profil-bolum">
          <h3 className="profil-bolum-baslik">
            {t('basarimlar')}
            <span className="profil-basarim-sayi">{kazanilanBasarimlar.length}/{BASARIMLAR.length}</span>
          </h3>
          <div className="profil-basarim-grid">
            {BASARIMLAR.map((b) => {
              const kazanildi = b.koşul(state);
              return (
                <div
                  key={b.id}
                  className={`profil-basarim ${kazanildi ? 'kazanildi' : 'kapali'}`}
                  title={basarimAd(b)}
                >
                  <span className="profil-basarim-ikon">{b.ikon}</span>
                  <span className="profil-basarim-ad">{basarimAd(b)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gizlilik */}
        <div className="profil-bolum">
          <a
            href="/privacy.html"
            target="_blank"
            rel="noopener noreferrer"
            className="profil-gizlilik-btn"
          >
            🔒 {dil === 'en' ? 'Privacy Policy' : dil === 'ru' ? 'Политика конфиденциальности' : 'Gizlilik Politikası'}
          </a>
        </div>
      </div>
    </div>
  );
}
