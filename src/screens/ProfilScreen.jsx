import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { TAMGALAR, HAYVANLAR, MITOLOJI } from '../data/tamgalar';
import { getT } from '../i18n/translations';

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
        {/* Avatar + İsim */}
        <div className="profil-kimlik">
          <div className="profil-avatar-buyuk">{state.avatar || '\u{10C00}'}</div>
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
              <span className="profil-duzenle-ikon">✏️</span>
            </div>
          )}
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
          <div className="profil-ilerleme-bar">
            <div className="profil-ilerleme-dolgu" style={{ width: `${tamamlanma}%` }} />
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
      </div>
    </div>
  );
}
