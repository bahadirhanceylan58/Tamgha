import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { TAMGALAR, BOLGELER, generateQuestions, NADIRLIK, findKartById } from '../data/tamgalar';

const SORU_SAYISI = 5;

// ── Kart Kazan Ekrani ──────────────────────────────────────────────────────
function KartKazanEkrani() {
  const { state, dispatch } = useGame();
  const [gosterilen, setGosterilen] = useState(0);
  const [acik, setAcik] = useState(false);

  const kartlar = state.yeniKazanilanKartlar
    .map((id) => findKartById(id))
    .filter(Boolean);

  useEffect(() => {
    const timer = setTimeout(() => setAcik(true), 400);
    return () => clearTimeout(timer);
  }, [gosterilen]);

  function sonrakiKart() {
    if (gosterilen < kartlar.length - 1) {
      setAcik(false);
      setTimeout(() => setGosterilen((p) => p + 1), 300);
    } else {
      dispatch({ type: 'HARITAYA_DON' });
    }
  }

  if (kartlar.length === 0) {
    return (
      <div className="screen kart-kazan-screen">
        <div className="kk-icerik">
          <h2 className="kk-baslik">Haritaya Don</h2>
          <button className="btn btn-birincil" onClick={() => dispatch({ type: 'HARITAYA_DON' })}>
            Haritaya Don
          </button>
        </div>
      </div>
    );
  }

  const kart = kartlar[gosterilen];
  const nadirlikBilgi = NADIRLIK[kart.nadirlik] || NADIRLIK.demir;
  const isHayvanVeyaMit = kart.kategori === 'hayvan' || kart.kategori === 'mitoloji' || kart.kategori === 'efsane';

  return (
    <div className="screen kart-kazan-screen">
      <div className="kk-parca-arka">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="parca"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              fontSize: `${0.5 + Math.random()}rem`,
            }}
          >
            {['\u{10C00}', '\u{10C09}', '\u{10C1A}', '\u{10C2D}', '\u{10C03}', '\u{10C3A}', '\u{10C23}', '\u{10C43}', '\u{10C15}', '\u{10C32}'][Math.floor(Math.random() * 10)]}
          </div>
        ))}
      </div>

      <div className="kk-icerik">
        <p className="kk-alt-yazi">
          {isHayvanVeyaMit ? '✦ Ruh Karti Kazanildi!' : 'Yeni Kart Kazanildi!'}
        </p>
        <p className="kk-sayac">{gosterilen + 1} / {kartlar.length}</p>

        <div
          className={`kk-kart ${acik ? 'kk-kart-acik' : ''} ${isHayvanVeyaMit ? 'kk-kart-ozel' : ''}`}
          style={{ '--nadirlik-renk': nadirlikBilgi.renk, '--nadirlik-parlak': nadirlikBilgi.parlak }}
          onClick={sonrakiKart}
        >
          <div className="kk-kart-ic">
            <div className="kk-kart-on">
              <div className="kk-nadirlik-rozet">{nadirlikBilgi.adi}</div>
              <div className={`kk-tamga-goster ${isHayvanVeyaMit ? 'kk-tamga-emoji' : ''}`}>
                {kart.tamga}
              </div>
              <div className="kk-ses-goster">{kart.ses}</div>
              <div className="kk-fonetik">{kart.fonetik}</div>
              {isHayvanVeyaMit && kart.guc && (
                <div className="kk-guc-blok">
                  <span className="kk-guc-ikon">{kart.guc.ikon}</span>
                  <span className="kk-guc-adi">{kart.guc.adi}</span>
                  <span className="kk-guc-aciklama">{kart.guc.aciklama}</span>
                </div>
              )}
              {!isHayvanVeyaMit && (
                <>
                  <div className="kk-aciklama">{kart.aciklama}</div>
                  <div className="kk-ornek">{kart.ornek}</div>
                </>
              )}
              <div className="kk-bolge-rozet">
                {BOLGELER.find((b) => b.id === kart.bolge)?.adi}
              </div>
            </div>
            <div className="kk-kart-arka">
              <div className="kk-arka-tamga">{'\u{10C00}'}</div>
              <div className="kk-arka-yazi">TAMGHA</div>
            </div>
          </div>
        </div>

        <p className="kk-ipucu">Karta dokun</p>

        <button className="btn btn-ikincil kk-atla-btn" onClick={sonrakiKart}>
          {gosterilen < kartlar.length - 1 ? 'Sonraki Kart' : 'Haritaya Don'}
        </button>
      </div>
    </div>
  );
}

// ── Quiz Ekrani ────────────────────────────────────────────────────────────
export default function QuizScreen() {
  const { state, dispatch } = useGame();

  if (state.ekran === 'kart_kazan') {
    return <KartKazanEkrani />;
  }

  // Sefer aktifse sefer objesini, degilse normal secili state'leri kullan
  const bolgeId = state.sefer?.aktif ? state.sefer.bolgeId : state.seciliBolge;
  const seviye = state.sefer?.aktif ? state.sefer.seviye : (state.seciliSeviye ?? 0);
  const aktifGuc = state.sefer?.aktif ? state.sefer.guc : state.aktifGuc;

  const bolge = BOLGELER.find((b) => b.id === bolgeId);

  const [sorular] = useState(() => {
    let q = generateQuestions(bolgeId, SORU_SAYISI);
    // secim_sil gucu: her soruda bir yanlis secenek kaldir
    if (aktifGuc?.id === 'secim_sil') {
      q = q.map((s) => {
        const yanlisSec = s.options.filter((o) => o.id !== s.correct.id);
        const kaldir = yanlisSec[Math.floor(Math.random() * yanlisSec.length)];
        return { ...s, options: s.options.filter((o) => o.id !== kaldir?.id) };
      });
    }
    return q;
  });

  const [mevcutSoru, setMevcutSoru] = useState(0);
  const [secilen, setSecilen] = useState(null);
  const [cevapDurumu, setCevapDurumu] = useState(null);
  const [puan, setPuan] = useState(0);
  const [bitti, setBitti] = useState(false);
  const [yanlisSayisi, setYanlisSayisi] = useState(0);
  const [affedilenKullanildi, setAffedilenKullanildi] = useState(false);
  const [ipucuKullanildi, setIpucuKullanildi] = useState(false);
  const [ilkBilUygulanmis, setIlkBilUygulanmis] = useState(false);

  // ilk_bil: ilk soruyu otomatik dogru say
  useEffect(() => {
    if (aktifGuc?.id === 'ilk_bil' && !ilkBilUygulanmis && mevcutSoru === 0 && secilen === null && !bitti) {
      setIlkBilUygulanmis(true);
      const soru = sorular[0];
      setSecilen(soru.correct.id);
      setCevapDurumu('dogru');
      setPuan((p) => p + 1);
      setTimeout(() => {
        if (sorular.length > 1) {
          setMevcutSoru(1);
          setSecilen(null);
          setCevapDurumu(null);
        } else {
          setBitti(true);
        }
      }, 800);
    }
  }, []);

  const soru = sorular[mevcutSoru];

  function cevapSec(secim) {
    if (secilen !== null) return;
    setSecilen(secim.id);

    const dogru = secim.id === soru.correct.id;

    if (dogru) {
      setCevapDurumu('dogru');
      setPuan((p) => p + 1);
    } else {
      // yanlis_affet / umay_koruma / kalkan / yada
      const affetGucler = ['yanlis_affet', 'umay_koruma', 'yada_gucu'];
      const afedebilir = affetGucler.includes(aktifGuc?.id);
      const umayIki = aktifGuc?.id === 'umay_koruma';

      if (afedebilir && !affedilenKullanildi) {
        setCevapDurumu('dogru'); // sayilmaz
        if (!umayIki || yanlisSayisi >= 1) setAffedilenKullanildi(true);
      } else if (aktifGuc?.id === 'kalkan' || aktifGuc?.id === 'yada_gucu') {
        setCevapDurumu('yanlis');
        setYanlisSayisi((y) => y + 1);
        // kalkan: yanlis sayilir ama yildiz kaybi yok (sonucta handle edilir)
      } else {
        setCevapDurumu('yanlis');
        setYanlisSayisi((y) => y + 1);
      }
    }

    setTimeout(() => {
      if (mevcutSoru < sorular.length - 1) {
        setMevcutSoru((m) => m + 1);
        setSecilen(null);
        setCevapDurumu(null);
      } else {
        setBitti(true);
      }
    }, 1200);
  }

  function ipucuKullan() {
    if (ipucuKullanildi || secilen !== null) return;
    setIpucuKullanildi(true);
  }

  function sonucuGoster() {
    const dogruSayisi = puan;
    const oran = dogruSayisi / SORU_SAYISI;
    let yildiz = 0;
    if (oran >= 1.0) yildiz = 3;
    else if (oran >= 0.8) yildiz = 2;
    else if (oran >= 0.6) yildiz = 1;

    // Guc modifikasyonlari
    if (aktifGuc?.id === 'cift_puan' || aktifGuc?.id === 'yada_gucu') {
      yildiz = Math.min(3, yildiz * 2 === 0 ? 1 : yildiz * 2);
    }
    if (aktifGuc?.id === 'kalkan') {
      // kalkan: yanlis cevap yildiz indirmiyor - minimum 1 yildiz
      yildiz = Math.max(1, yildiz);
    }
    if (aktifGuc?.id === 'ulgen_isik' || aktifGuc?.id === 'yada_gucu') {
      yildiz = Math.max(1, yildiz);
    }
    if (aktifGuc?.id === 'kayra_fermani') {
      yildiz = Math.min(3, yildiz + 1);
    }

    const bolgeTamgalari = TAMGALAR.filter((t) => t.bolge === state.seciliBolge);
    let kazanilanSayi = Math.max(1, yildiz);
    if (aktifGuc?.id === 'bonus_kart') kazanilanSayi += 1;
    if (aktifGuc?.id === 'cift_kart') kazanilanSayi = kazanilanSayi * 2;

    const karisik = [...bolgeTamgalari].sort(() => Math.random() - 0.5);
    const kazanilanIds = karisik.slice(0, Math.min(kazanilanSayi, bolgeTamgalari.length)).map((t) => t.id);

    // Sefer'deysek Quiz biterken Sefer'i de kapat
    if (state.sefer?.aktif) {
      dispatch({ type: 'SEFER_BITIR' });
    }

    dispatch({
      type: 'QUIZ_TAMAMLA',
      bolgeId: bolgeId,
      seviye,
      yildiz,
      kazanilanIds,
    });
    dispatch({ type: 'GUC_KULLAN' });
  }

  if (bitti) {
    const dogruSayisi = puan;
    const oran = dogruSayisi / SORU_SAYISI;
    let yildiz = 0;
    if (oran >= 1.0) yildiz = 3;
    else if (oran >= 0.8) yildiz = 2;
    else if (oran >= 0.6) yildiz = 1;

    if (aktifGuc?.id === 'cift_puan' || aktifGuc?.id === 'yada_gucu') yildiz = Math.min(3, yildiz * 2 === 0 ? 1 : yildiz * 2);
    if (aktifGuc?.id === 'kalkan') yildiz = Math.max(1, yildiz);
    if (aktifGuc?.id === 'ulgen_isik' || aktifGuc?.id === 'yada_gucu') yildiz = Math.max(1, yildiz);
    if (aktifGuc?.id === 'kayra_fermani') yildiz = Math.min(3, yildiz + 1);

    return (
      <div className="screen quiz-screen">
        <div className="sonuc-ekrani">
          <h2 className="sonuc-baslik">
            {yildiz >= 2 ? 'Harika!' : yildiz === 1 ? 'Iyi Deneme!' : 'Tekrar Dene'}
          </h2>
          <div className="sonuc-yildizlar">
            {[0, 1, 2].map((i) => (
              <span key={i} className={`buyuk-yildiz ${i < yildiz ? 'dolu' : 'bos'}`}>&#9733;</span>
            ))}
          </div>
          <div className="sonuc-puan">
            <span className="sonuc-sayi">{dogruSayisi}</span>
            <span className="sonuc-bolen">/ {SORU_SAYISI}</span>
          </div>
          {aktifGuc && (
            <div className="sonuc-guc-rozet">
              <span>{aktifGuc.ikon}</span> {aktifGuc.adi} aktifti
            </div>
          )}
          <p className="sonuc-mesaj">
            {yildiz === 3
              ? 'Mukemmel! Tum tamgalari dogru bildin!'
              : yildiz === 2
                ? 'Cok iyi! Biraz daha pratik yapabilirsin.'
                : yildiz === 1
                  ? 'Baslangic iyi. Tamgalari tekrar incele.'
                  : 'Endislenme! Her deneme daha iyiye goturur.'}
          </p>
          <p className="sonuc-kart-mesaj">
            {Math.max(1, yildiz)} kart kazaniyorsun!
          </p>
          <button className="btn btn-birincil" onClick={sonucuGoster}>
            Kartlari Goster!
          </button>
          <button
            className="btn btn-ikincil"
            onClick={() => { dispatch({ type: 'GUC_KULLAN' }); dispatch({ type: 'NAVIGATE', ekran: 'map' }); }}
            style={{ marginTop: '0.5rem' }}
          >
            Haritaya Don
          </button>
        </div>
      </div>
    );
  }

  const isTamgaToSes = soru.tip === 'tamga_to_ses';

  // ipucu modu: secilmemis yanlis seceneklerden birini bul
  const ipucuSilinen = ipucuKullanildi && secilen === null
    ? soru.options.find((o) => o.id !== soru.correct.id)?.id
    : null;

  return (
    <div className="screen quiz-screen">
      <div className="quiz-header">
        <button className="geri-btn" onClick={() => { dispatch({ type: 'GUC_KULLAN' }); dispatch({ type: 'NAVIGATE', ekran: 'map' }); }}>
          &#8592;
        </button>
        <div className="quiz-ilerleme">
          <div className="quiz-ilerleme-bar">
            <div
              className="quiz-ilerleme-dolgu"
              style={{ width: `${(mevcutSoru / SORU_SAYISI) * 100}%` }}
            />
          </div>
          <span className="quiz-ilerleme-yazi">{mevcutSoru + 1}/{SORU_SAYISI}</span>
        </div>
        <div className="quiz-puan-badge">{puan} &#9733;</div>
      </div>

      {/* Aktif guc rozeti */}
      {aktifGuc && (
        <div className="quiz-aktif-guc">
          <span>{aktifGuc.ikon}</span>
          <span>{aktifGuc.adi}</span>
        </div>
      )}

      <div className="quiz-bolge-rozet" style={{ background: bolge?.gradyan }}>
        {bolge?.adi} &bull; Seviye {seviye + 1}
      </div>

      <div className={`quiz-soru-alani ${cevapDurumu ? `quiz-${cevapDurumu}` : ''}`}>
        {isTamgaToSes ? (
          <>
            <p className="quiz-soru-metin">Bu tamga hangi sesi cikarir?</p>
            <div className="quiz-tamga-goster">{soru.correct.tamga}</div>
          </>
        ) : (
          <>
            <p className="quiz-soru-metin">Bu ses hangi tamgaya ait?</p>
            <div className="quiz-ses-goster">{soru.correct.ses}</div>
            <div className="quiz-fonetik-goster">[{soru.correct.fonetik}]</div>
          </>
        )}
      </div>

      <div className="quiz-secenekler">
        {soru.options.map((opt) => {
          if (opt.id === ipucuSilinen) return null;
          let durum = '';
          if (secilen !== null) {
            if (opt.id === soru.correct.id) durum = 'dogru-secenek';
            else if (opt.id === secilen) durum = 'yanlis-secenek';
          }

          return (
            <button
              key={opt.id}
              className={`secenek-btn ${durum}`}
              onClick={() => cevapSec(opt)}
              disabled={secilen !== null}
            >
              {isTamgaToSes ? (
                <span className="secenek-ses">{opt.ses}</span>
              ) : (
                <span className={`secenek-tamga ${opt.kategori === 'hayvan' || opt.kategori === 'mitoloji' ? 'secenek-emoji' : ''}`}>
                  {opt.tamga}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Ipucu butonu */}
      {(aktifGuc?.id === 'ipucu' || aktifGuc?.id === 'yada_gucu') && !ipucuKullanildi && secilen === null && (
        <button className="btn btn-ipucu" onClick={ipucuKullan}>
          💨 Ipucu (1 yanlis sil)
        </button>
      )}

      {cevapDurumu && (
        <div className={`quiz-geri-bildirim ${cevapDurumu}`}>
          {cevapDurumu === 'dogru' ? (
            <span>&#10003; Dogru! {soru.correct.aciklama}</span>
          ) : (
            <span>&#10007; Yanlis. Dogru cevap: <strong>{soru.correct.ses}</strong> - {soru.correct.tamga}</span>
          )}
        </div>
      )}
    </div>
  );
}
