import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { TAMGALAR, HAYVANLAR, MITOLOJI, YADA_TASI } from '../data/tamgalar';
import { getT } from '../i18n/translations';

// ── Latin → Göktürk çevirisi ──
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
  '☀', '🌙', '⭐', '💎', '✦',
];

const DİLLER = [
  { id: 'tr', ad: 'Türkçe', bayrak: '🇹🇷' },
  { id: 'en', ad: 'English', bayrak: '🇬🇧' },
  { id: 'ru', ad: 'Русский', bayrak: '🇷🇺' },
];

const BASARIMLAR = [
  { id: 'ilk_kart',     ikon: '🃏', tr: 'İlk Adım',       en: 'First Step',        ru: 'Первый шаг',             kosul: (s) => s.kazanilanKartlar.length >= 1 },
  { id: 'bes_kart',     ikon: '📚', tr: '5 Kart',          en: '5 Cards',           ru: '5 карт',                 kosul: (s) => s.kazanilanKartlar.length >= 5 },
  { id: 'on_kart',      ikon: '🎴', tr: '10 Kart',         en: '10 Cards',          ru: '10 карт',                kosul: (s) => s.kazanilanKartlar.length >= 10 },
  { id: 'yirmi_kart',   ikon: '📖', tr: '20 Kart',         en: '20 Cards',          ru: '20 карт',                kosul: (s) => s.kazanilanKartlar.length >= 20 },
  { id: 'kirk_kart',    ikon: '🌟', tr: '40 Kart',         en: '40 Cards',          ru: '40 карт',                kosul: (s) => s.kazanilanKartlar.length >= 40 },
  { id: 'yuz_puan',     ikon: '💯', tr: '100 Puan',        en: '100 Points',        ru: '100 очков',              kosul: (s) => s.toplamPuan >= 100 },
  { id: 'bin_puan',     ikon: '🏆', tr: '1000 Puan',       en: '1000 Points',       ru: '1000 очков',             kosul: (s) => s.toplamPuan >= 1000 },
  { id: 'onbin_puan',   ikon: '👑', tr: '10.000 Puan',     en: '10,000 Points',     ru: '10 000 очков',           kosul: (s) => s.toplamPuan >= 10000 },
  { id: 'orhun_ac',     ikon: '🗿', tr: 'Orhun Kaşifi',    en: 'Orhun Explorer',    ru: 'Исследователь Орхона',   kosul: (s) => !s.bolgeIlerlemesi?.selenga?.kilit },
  { id: 'selenga_ac',   ikon: '🌊', tr: 'Selenga Kâşifi',  en: 'Selenga Explorer',  ru: 'Исследователь Селенги', kosul: (s) => !s.bolgeIlerlemesi?.altay?.kilit },
  { id: 'altay_ac',     ikon: '⛰',  tr: 'Altay Kâşifi',   en: 'Altay Explorer',    ru: 'Исследователь Алтая',    kosul: (s) => !s.bolgeIlerlemesi?.tengri_yurdu?.kilit },
  { id: 'onbolum',      ikon: '📍', tr: 'B10 Ustası',      en: 'Chapter 10 Master', ru: 'Мастер главы 10',        kosul: (s) => (s.eslestirmeBolum || 1) >= 10 },
  { id: 'yirmibolum',   ikon: '⚡', tr: 'B20 Savaşçısı',   en: 'Ch.20 Warrior',     ru: 'Воин главы 20',          kosul: (s) => (s.eslestirmeBolum || 1) >= 20 },
  { id: 'elliBolum',    ikon: '🔥', tr: 'B50 Efsanesi',    en: 'Ch.50 Legend',      ru: 'Легенда главы 50',       kosul: (s) => (s.eslestirmeBolum || 1) >= 50 },
  { id: 'dogum',        ikon: '🐾', tr: 'Ruh Sahibi',      en: 'Soul Bearer',       ru: 'Носитель духа',          kosul: (s) => !!s.dogumHayvaniId },
  { id: 'gunluk',       ikon: '📅', tr: 'Günlük Adept',    en: 'Daily Adept',       ru: 'Ежедневный адепт',       kosul: (s) => !!s.gunlukKartTalep },
];

export default function ProfilScreen() {
  const { state, dispatch } = useGame();
  const dil = state.dil || 'tr';
  const t = getT(dil);

  const [adDuzenle, setAdDuzenle] = useState(false);
  const [adInput, setAdInput] = useState(state.kullaniciAdi || '');
  const [gorevModalAcik, setGorevModalAcik] = useState(false);

  // Görev verileri
  const gorevler = state.gunlukGorevler?.gorevler || [];
  const tumToplandi = gorevler.length > 0 && gorevler.every(g => g.toplandi);

  const toplamKart = TAMGALAR.length + HAYVANLAR.length + MITOLOJI.length + 1; // +1 YADA
  const tamamlanma = Math.round((state.kazanilanKartlar.length / toplamKart) * 100);

  const dogumHayvani = state.dogumHayvaniId
    ? HAYVANLAR.find(h => h.id === state.dogumHayvaniId)
    : null;

  // Günlük haklar
  const bugun = new Date().toDateString();
  const hakGuncelse = state.gunlukHaklar?.tarih === bugun;
  const karistirKalan = hakGuncelse ? (state.gunlukHaklar?.karistirKalan ?? 3) : 3;
  const gunlukKartAlindi = state.gunlukKartTalep === bugun;

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

  const kazanilanBasarimlar = BASARIMLAR.filter((b) => b.kosul(state));

  function basarimAd(b) {
    if (dil === 'en') return b.en;
    if (dil === 'ru') return b.ru;
    return b.tr;
  }

  const goktAd = adGokt(adDuzenle ? adInput : (state.kullaniciAdi || ''));
  const bolumIlerleme = Math.min(state.eslestirmeBolum || 1, 50);

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
          <div className="profil-kart-bg-tamgalar" aria-hidden>
            {['\u{10C00}','\u{10C09}','\u{10C1A}','\u{10C2D}','\u{10C3A}'].map((t,i)=>(
              <span key={i} className="profil-kart-bg-tamga">{t}</span>
            ))}
          </div>

          <div className="profil-avatar-buyuk">{state.avatar || '\u{10C00}'}</div>

          {goktAd && <div className="profil-gokt-ad">{goktAd}</div>}

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

          {/* Doğum Hayvanı */}
          {dogumHayvani && (
            <div className="profil-dogum-hayvan">
              <span className="profil-dogum-emoji">{dogumHayvani.tamga}</span>
              <span className="profil-dogum-yazi">{dogumHayvani.ses} · {state.dogumYili}</span>
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

        {/* Görevler ve Liderlik */}
        <div className="profil-bolum">
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-altin"
              onClick={() => dispatch({ type: 'NAVIGATE', ekran: 'liderlik' })}
              style={{ flex: 1, padding: '12px', fontSize: '1rem' }}
            >
              <span className="btn-simge">🏆</span> Liderlik
            </button>
            <button
              className="btn btn-altin"
              onClick={() => setGorevModalAcik(true)}
              style={{ flex: 1, padding: '12px', fontSize: '1rem' }}
            >
              <span className="btn-simge">📜</span> Görevler
              {tumToplandi && <span style={{ color: '#4a9e6a', marginLeft: '6px', fontWeight: 'bold' }}>✓</span>}
            </button>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="profil-bolum">
          <h3 className="profil-bolum-baslik">{t('istatistikler')}</h3>
          <div className="profil-stat-grid">
            <div className="profil-stat">
              <span className="profil-stat-sayi">{state.kazanilanKartlar.length}<span style={{fontSize:'0.65rem',opacity:0.6}}>/{toplamKart}</span></span>
              <span className="profil-stat-etiket">{t('kazanilanKartlar')}</span>
            </div>
            <div className="profil-stat">
              <span className="profil-stat-sayi">{state.toplamPuan.toLocaleString()}</span>
              <span className="profil-stat-etiket">{t('toplamPuan')}</span>
            </div>
            <div className="profil-stat">
              <span className="profil-stat-sayi">B{bolumIlerleme}<span style={{fontSize:'0.65rem',opacity:0.6}}>/50</span></span>
              <span className="profil-stat-etiket">Taş Bölümü</span>
            </div>
            <div className="profil-stat">
              <span className="profil-stat-sayi">{tamamlanma}%</span>
              <span className="profil-stat-etiket">{t('tamamlanma')}</span>
            </div>
          </div>
          {/* Bölüm ilerleme barı */}
          <div style={{ marginTop: '0.5rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.7rem', opacity:0.6, marginBottom:'3px' }}>
              <span>Taş Bölüm İlerlemesi</span><span>B{bolumIlerleme}/50</span>
            </div>
            <div className="profil-ilerleme-bar">
              <div className="profil-ilerleme-dolgu" style={{ width: `${(bolumIlerleme / 50) * 100}%`, background: 'linear-gradient(90deg, #1a6a3a, #40c870)' }} />
            </div>
          </div>
        </div>

        {/* Günlük Haklar */}
        <div className="profil-bolum">
          <h3 className="profil-bolum-baslik">Günlük Haklar</h3>
          <div className="profil-gunluk-haklar">
            <div className="profil-hak-kart">
              <div className="profil-hak-ikon">🌀</div>
              <div className="profil-hak-bilgi">
                <span className="profil-hak-ad">Ücretsiz Karıştır</span>
                <span className="profil-hak-aciklama">Her gün 3 kez ücretsiz taş karıştırma hakkı</span>
              </div>
              <div className={`profil-hak-sayac ${karistirKalan === 0 ? 'hak-bos' : 'hak-dolu'}`}>
                {karistirKalan}/3
              </div>
            </div>
            <div className="profil-hak-kart">
              <div className="profil-hak-ikon">🎴</div>
              <div className="profil-hak-bilgi">
                <span className="profil-hak-ad">Günlük Kart</span>
                <span className="profil-hak-aciklama">Her gün yeni bir kart kazan</span>
              </div>
              <div className={`profil-hak-sayac ${gunlukKartAlindi ? 'hak-bos' : 'hak-dolu'}`}>
                {gunlukKartAlindi ? '✓' : '!'}
              </div>
            </div>
          </div>
          <p style={{ fontSize:'0.7rem', opacity:0.5, marginTop:'0.4rem', textAlign:'center' }}>
            Haklar her gece yarısı sıfırlanır
          </p>
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
              const kazanildi = b.kosul(state);
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

      {/* Görevler Modal */}
      {gorevModalAcik && (
        <div className="modal-overlay" onClick={() => setGorevModalAcik(false)}>
          <div className="modal-content" style={{ background: 'var(--bg)', padding: '1.5rem', width: '90%', maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--sinir)', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontFamily: 'Cinzel, serif', color: 'var(--altin)', margin: 0, fontSize: '1.2rem' }}>📜 Günlük Görevler</h3>
              <button onClick={() => setGorevModalAcik(false)} style={{ background: 'none', border: 'none', color: 'var(--metin-soluk)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>
            
            {gorevler.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--metin-soluk)', margin: '2rem 0' }}>Görevler yükleniyor...</p>
            ) : (
              <div className="gunluk-gorev-liste">
                {gorevler.map((gorev, idx) => {
                  const yuzde = Math.min(100, Math.round((gorev.ilerleme / gorev.hedef) * 100));
                  return (
                    <div key={gorev.id} className={`gunluk-gorev-kart ${gorev.tamamlandi ? 'gunluk-kart-tamam' : ''} ${gorev.toplandi ? 'gunluk-kart-toplandi' : ''}`}>
                      <div className="gunluk-gorev-ust">
                        <span className="gunluk-gorev-ikon">{gorev.ikon}</span>
                        <span className="gunluk-gorev-aciklama">{gorev.aciklama}</span>
                        <span className="gunluk-gorev-odul">+{gorev.odul}</span>
                      </div>
                      <div className="gunluk-gorev-bar">
                        <div className="gunluk-gorev-bar-ic" style={{ width: `${yuzde}%` }} />
                      </div>
                      <div className="gunluk-gorev-alt">
                        <span>{gorev.ilerleme}/{gorev.hedef}</span>
                        {gorev.tamamlandi && !gorev.toplandi && (
                          <button className="gunluk-topla-btn" onClick={() => dispatch({ type: 'GUNLUK_GOREV_TOPLA', gorevIdx: idx })}>
                            Topla! ✦
                          </button>
                        )}
                        {gorev.toplandi && <span className="gunluk-toplandi-yazi">✓ Toplandı</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {tumToplandi && (
              <div style={{ textAlign: 'center', marginTop: '1.2rem', color: '#4a9e6a', fontWeight: 'bold', fontSize: '1.1rem' }}>
                🎉 Tüm görevler tamamlandı!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
