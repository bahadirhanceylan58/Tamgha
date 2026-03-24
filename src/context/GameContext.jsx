// @refresh reset
import { createContext, useContext, useReducer, useEffect } from 'react';
import { BOLGELER } from '../data/tamgalar';

const GameContext = createContext(null);

const INITIAL_STATE = {
  ekran: 'home',
  seciliBolge: null,
  seciliSeviye: null,
  kazanilanKartlar: [],
  bolgeIlerlemesi: {
    orhun: { yildizlar: Array(15).fill(0), kilit: false },
    selenga: { yildizlar: Array(15).fill(0), kilit: true },
    altay: { yildizlar: Array(15).fill(0), kilit: true },
    tengri_yurdu: { yildizlar: Array(15).fill(0), kilit: true },
  },
  toplamPuan: 0,
  gunlukKartTalep: null,
  yeniKazanilanKartlar: [],
  aktifGuc: null,
  dogumYili: null,
  dogumHayvaniId: null,
  // Profil
  kullaniciAdi: '',
  avatar: '\u{10C00}',
  dil: 'tr', // tr | en | ru

  // Sefer Modu (Campaign)
  sefer: {
    aktif: false,
    bolgeId: null,
    seviye: null,
    guc: null,
    asama: 0, // 0: Eşleştirme, 1: Arena, 2: Quiz
    ozelSeviye: false,
  },

  // Taş eşleştirme global bölüm ilerlemesi (1-50)
  eslestirmeBolum: 1,
  // Her SEFER_BASLAT'ta artar — EslestirmeScreen remount için key olarak kullanılır
  seferSayaci: 0,
  // Günlük haklar (karıştır vb.)
  gunlukHaklar: { tarih: null, karistirKalan: 3 },
  // Günlük görevler
  gunlukGorevler: { tarih: null, gorevler: [], toplamOdul: 0 },
};

function yukleKayit() {
  try {
    const kayit = localStorage.getItem('tamgha_kayit');
    if (kayit) {
      const parsed = JSON.parse(kayit);
      // tengri_yurdu yoksa ekle (eski kayitlar icin)
      const bolgeIlerlemesi = {
        orhun: { yildizlar: Array(15).fill(0), kilit: false },
        selenga: { yildizlar: Array(15).fill(0), kilit: true },
        altay: { yildizlar: Array(15).fill(0), kilit: true },
        tengri_yurdu: { yildizlar: Array(15).fill(0), kilit: true },
        ...(parsed.bolgeIlerlemesi || {}),
      };
      if (!bolgeIlerlemesi.tengri_yurdu) {
        bolgeIlerlemesi.tengri_yurdu = { yildizlar: Array(15).fill(0), kilit: true };
      }
      // Eski kayıt: yıldız dizilerini 15'e genişlet
      for (const k of Object.keys(bolgeIlerlemesi)) {
        const y = bolgeIlerlemesi[k].yildizlar;
        if (y.length < 15) {
          bolgeIlerlemesi[k] = { ...bolgeIlerlemesi[k], yildizlar: [...y, ...Array(15 - y.length).fill(0)] };
        }
      }
      return { ...INITIAL_STATE, ...parsed, bolgeIlerlemesi, ekran: 'home', yeniKazanilanKartlar: [], aktifGuc: null, dogumYili: parsed.dogumYili ?? null, dogumHayvaniId: parsed.dogumHayvaniId ?? null, kullaniciAdi: parsed.kullaniciAdi ?? '', avatar: parsed.avatar ?? '\u{10C00}', dil: parsed.dil ?? 'tr', sefer: { aktif: false, bolgeId: null, seviye: null, guc: null, asama: 0, ozelSeviye: false }, eslestirmeBolum: parsed.eslestirmeBolum ?? 1, gunlukHaklar: parsed.gunlukHaklar ?? { tarih: null, karistirKalan: 3 }, gunlukGorevler: parsed.gunlukGorevler ?? { tarih: null, gorevler: [], toplamOdul: 0 } };
    }
  } catch (e) {
    // ignore
  }
  return INITIAL_STATE;
}

function reducer(state, action) {
  switch (action.type) {
    case 'NAVIGATE':
      return {
        ...state,
        ekran: action.ekran,
        seciliBolge: action.bolge ?? state.seciliBolge,
        sefer: action.ekran === 'home' || action.ekran === 'map' ? { aktif: false, bolgeId: null, seviye: null, guc: null, asama: 0, ozelSeviye: false } : state.sefer
      };

    case 'SEFER_BASLAT':
      return {
        ...state,
        sefer: { aktif: true, bolgeId: action.bolgeId, seviye: action.seviye, guc: action.guc, asama: 0, ozelSeviye: !!action.ozelSeviye },
        ekran: 'eslestirme',
        seciliBolge: action.bolgeId,
        seciliSeviye: action.seviye,
        aktifGuc: action.guc || null,
        seferSayaci: (state.seferSayaci || 0) + 1,
        ...(action.bolum ? { eslestirmeBolum: action.bolum } : {}),
      };

    case 'SEFER_ILERLE': {
      const yeniAsama = state.sefer.asama + 1;
      let yeniEkran = state.ekran;
      if (yeniAsama === 1) yeniEkran = 'ruh_arenasi';
      else if (yeniAsama === 2) yeniEkran = 'quiz';

      return {
        ...state,
        sefer: { ...state.sefer, asama: yeniAsama },
        ekran: yeniEkran
      };
    }

    case 'SEFER_BITIR':
      return {
        ...state,
        sefer: { aktif: false, bolgeId: null, seviye: null, guc: null, asama: 0, ozelSeviye: false }
      };

    case 'QUIZ_BASLAT':
      return {
        ...state,
        ekran: 'quiz',
        seciliBolge: action.bolgeId,
        seciliSeviye: action.seviye,
        aktifGuc: action.guc ?? null,
      };

    case 'ESLESTIRME_BASLAT':
      return {
        ...state,
        ekran: 'eslestirme',
        seciliBolge: action.bolgeId,
        aktifGuc: null,
      };

    case 'ARENA_BASLAT':
      return {
        ...state,
        ekran: 'ruh_arenasi',
        seciliBolge: action.bolgeId,
        aktifGuc: null,
      };

    case 'GUC_KULLAN':
      return { ...state, aktifGuc: null };

    case 'ESLESTIRME_TAMAMLA': {
      const { bolgeId, seviye, puan } = action;
      const oncekiYildizlar = state.bolgeIlerlemesi[bolgeId]?.yildizlar || Array(15).fill(0);
      const yeniYildizlar = [...oncekiYildizlar];

      if (seviye >= 0 && seviye < yeniYildizlar.length) {
        // kazandi=false ama yildiz verilmişse (örn. ozelSeviye kaybı → 1 yıldız) onu kullan
        const yildiz = action.yildiz != null ? action.yildiz : (action.kazandi ? 1 : 0);
        yeniYildizlar[seviye] = Math.max(yeniYildizlar[seviye], yildiz);
      }

      const yeniBolum = action.kazandi ? Math.min((state.eslestirmeBolum || 1) + 1, 50) : (state.eslestirmeBolum || 1);

      // eslestirmeBolum milestonlarına göre bölge kilitleri aç
      const bolgeKilidiAc = {};
      if (yeniBolum >= 10 && state.bolgeIlerlemesi.selenga?.kilit) {
        bolgeKilidiAc.selenga = { ...state.bolgeIlerlemesi.selenga, kilit: false };
      }
      if (yeniBolum >= 20 && state.bolgeIlerlemesi.altay?.kilit) {
        bolgeKilidiAc.altay = { ...state.bolgeIlerlemesi.altay, kilit: false };
      }
      if (yeniBolum >= 30 && state.bolgeIlerlemesi.tengri_yurdu?.kilit) {
        bolgeKilidiAc.tengri_yurdu = { ...state.bolgeIlerlemesi.tengri_yurdu, kilit: false };
      }

      return {
        ...state,
        bolgeIlerlemesi: {
          ...state.bolgeIlerlemesi,
          [bolgeId]: { ...state.bolgeIlerlemesi[bolgeId], yildizlar: yeniYildizlar },
          ...bolgeKilidiAc,
        },
        eslestirmeBolum: yeniBolum,
        toplamPuan: state.toplamPuan + puan,
      };
    }

    case 'QUIZ_TAMAMLA': {
      const { bolgeId, seviye, yildiz, kazanilanIds } = action;
      const oncekiYildizlar = state.bolgeIlerlemesi[bolgeId]?.yildizlar || Array(15).fill(0);
      const yeniYildizlar = [...oncekiYildizlar];
      yeniYildizlar[seviye] = Math.max(yeniYildizlar[seviye], yildiz);

      const toplamYildiz = yeniYildizlar.reduce((a, b) => a + b, 0);
      const bolgeKilidiAc = {};

      if (bolgeId === 'orhun' && toplamYildiz >= 15) {
        bolgeKilidiAc.selenga = { ...state.bolgeIlerlemesi.selenga, kilit: false };
      }
      if (bolgeId === 'selenga' && toplamYildiz >= 15) {
        bolgeKilidiAc.altay = { ...state.bolgeIlerlemesi.altay, kilit: false };
      }
      if (bolgeId === 'altay' && toplamYildiz >= 15) {
        bolgeKilidiAc.tengri_yurdu = { ...state.bolgeIlerlemesi.tengri_yurdu, kilit: false };
      }

      const yeniKartlar = kazanilanIds.filter((id) => !state.kazanilanKartlar.includes(id));

      return {
        ...state,
        ekran: 'kart_kazan',
        aktifGuc: null,
        bolgeIlerlemesi: {
          ...state.bolgeIlerlemesi,
          [bolgeId]: {
            ...state.bolgeIlerlemesi[bolgeId],
            yildizlar: yeniYildizlar,
          },
          ...bolgeKilidiAc,
        },
        kazanilanKartlar: [...new Set([...state.kazanilanKartlar, ...kazanilanIds])],
        yeniKazanilanKartlar: kazanilanIds,
        toplamPuan: state.toplamPuan + yildiz * 100 + yeniKartlar.length * 50,
      };
    }

    case 'GUNLUK_KART_AL': {
      const bugun = new Date().toDateString();
      if (state.gunlukKartTalep === bugun) return state;
      // gunluk_2x gucu aktifse 2 kart ver
      const kartIds = Array.isArray(action.kartId) ? action.kartId : [action.kartId];
      return {
        ...state,
        gunlukKartTalep: bugun,
        kazanilanKartlar: [...new Set([...state.kazanilanKartlar, ...kartIds])],
        yeniKazanilanKartlar: kartIds,
        ekran: 'kart_kazan',
      };
    }

    case 'HARITAYA_DON':
      return { ...state, ekran: 'map', yeniKazanilanKartlar: [], sefer: { aktif: false, bolgeId: null, seviye: null, guc: null, asama: 0, ozelSeviye: false } };

    case 'DOGUM_YILI_KAYDET': {
      const { yil, hayvanId } = action;
      const yeniKartlar = state.kazanilanKartlar.includes(hayvanId)
        ? state.kazanilanKartlar
        : [...state.kazanilanKartlar, hayvanId];
      return {
        ...state,
        dogumYili: yil,
        dogumHayvaniId: hayvanId,
        kazanilanKartlar: yeniKartlar,
        yeniKazanilanKartlar: [hayvanId],
        ekran: 'kart_kazan',
        toplamPuan: state.toplamPuan + 500,
      };
    }

    case 'PROFİL_GUNCELLE':
      return {
        ...state,
        ...(action.kullaniciAdi !== undefined ? { kullaniciAdi: action.kullaniciAdi } : {}),
        ...(action.avatar !== undefined ? { avatar: action.avatar } : {}),
      };

    case 'DIL_DEGISTIR':
      return { ...state, dil: action.dil };

    case 'ARENA_KAZAN': {
      const yeniKartlar = action.kazanilanIds.filter((id) => !state.kazanilanKartlar.includes(id));
      return {
        ...state,
        ekran: 'kart_kazan',
        kazanilanKartlar: [...new Set([...state.kazanilanKartlar, ...action.kazanilanIds])],
        yeniKazanilanKartlar: action.kazanilanIds,
        toplamPuan: state.toplamPuan + action.puan + yeniKartlar.length * 50,
      };
    }

    case 'GUNLUK_HAKLAR_YENILE':
      return { ...state, gunlukHaklar: { tarih: action.tarih, karistirKalan: 3 } };

    case 'KARISTIR_HAKKI_KULLAN':
      return {
        ...state,
        gunlukHaklar: {
          ...state.gunlukHaklar,
          karistirKalan: Math.max(0, (state.gunlukHaklar?.karistirKalan ?? 0) - 1),
        },
      };

    case 'GUNLUK_GOREV_OLUSTUR': {
      const bugun = new Date().toDateString();
      if (state.gunlukGorevler?.tarih === bugun) return state;
      const havuz = [
        { id: 'e10', tip: 'eslestirme', hedef: 10, odul: 200, ikon: '✨', aciklama: '10 taş eşleştir' },
        { id: 'e20', tip: 'eslestirme', hedef: 20, odul: 400, ikon: '✨', aciklama: '20 taş eşleştir' },
        { id: 'e30', tip: 'eslestirme', hedef: 30, odul: 600, ikon: '✨', aciklama: '30 taş eşleştir' },
        { id: 'c3', tip: 'combo', hedef: 3, odul: 300, ikon: '🔥', aciklama: '3 combo yap' },
        { id: 'c5', tip: 'combo', hedef: 5, odul: 500, ikon: '🔥', aciklama: '5 combo yap' },
        { id: 'm2', tip: 'mitoloji', hedef: 2, odul: 500, ikon: '⚡', aciklama: '2 mitoloji taşı eşleştir' },
        { id: 'm4', tip: 'mitoloji', hedef: 4, odul: 1000, ikon: '⚡', aciklama: '4 mitoloji taşı eşleştir' },
        { id: 'h2', tip: 'hayvan', hedef: 2, odul: 500, ikon: '🐺', aciklama: '2 hayvan taşı eşleştir' },
        { id: 'h4', tip: 'hayvan', hedef: 4, odul: 1000, ikon: '🐺', aciklama: '4 hayvan taşı eşleştir' },
        { id: 's1', tip: 'seviye', hedef: 1, odul: 300, ikon: '⭐', aciklama: '1 seviye tamamla' },
        { id: 's3', tip: 'seviye', hedef: 3, odul: 800, ikon: '⭐', aciklama: '3 seviye tamamla' },
        { id: 'b1', tip: 'bomba', hedef: 1, odul: 200, ikon: '💣', aciklama: '1 bomba imha et' },
      ];
      const karisik = [...havuz].sort(() => Math.random() - 0.5);
      // Farklı tiplerden seç — 3 görev
      const secilen = [];
      const secilenTipler = new Set();
      for (const g of karisik) {
        if (secilen.length >= 3) break;
        if (secilenTipler.has(g.tip)) continue;
        secilenTipler.add(g.tip);
        secilen.push({ ...g, ilerleme: 0, tamamlandi: false, toplandi: false });
      }
      return { ...state, gunlukGorevler: { tarih: bugun, gorevler: secilen, toplamOdul: 0 } };
    }

    case 'GUNLUK_GOREV_ILERLE': {
      if (!state.gunlukGorevler?.gorevler?.length) return state;
      const { gorevTip, miktar = 1 } = action;
      const yeniGorevler = state.gunlukGorevler.gorevler.map(g => {
        if (g.tip !== gorevTip || g.tamamlandi) return g;
        const yeniIlerleme = Math.min(g.hedef, g.ilerleme + miktar);
        return { ...g, ilerleme: yeniIlerleme, tamamlandi: yeniIlerleme >= g.hedef };
      });
      return { ...state, gunlukGorevler: { ...state.gunlukGorevler, gorevler: yeniGorevler } };
    }

    case 'GUNLUK_GOREV_TOPLA': {
      if (!state.gunlukGorevler?.gorevler?.length) return state;
      const gorevIdx = action.gorevIdx;
      const gorev = state.gunlukGorevler.gorevler[gorevIdx];
      if (!gorev || !gorev.tamamlandi || gorev.toplandi) return state;
      const yeniGorevler = [...state.gunlukGorevler.gorevler];
      yeniGorevler[gorevIdx] = { ...gorev, toplandi: true };
      return {
        ...state,
        toplamPuan: state.toplamPuan + gorev.odul,
        gunlukGorevler: {
          ...state.gunlukGorevler,
          gorevler: yeniGorevler,
          toplamOdul: (state.gunlukGorevler.toplamOdul || 0) + gorev.odul
        }
      };
    }

    case 'GUNLUK_GOREV_SEVIYE':
      return state; // GUNLUK_GOREV_ILERLE zaten seviye tipini destekliyor

    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, yukleKayit);

  useEffect(() => {
    const kayit = {
      kazanilanKartlar: state.kazanilanKartlar,
      bolgeIlerlemesi: state.bolgeIlerlemesi,
      toplamPuan: state.toplamPuan,
      gunlukKartTalep: state.gunlukKartTalep,
      dogumYili: state.dogumYili,
      dogumHayvaniId: state.dogumHayvaniId,
      kullaniciAdi: state.kullaniciAdi,
      avatar: state.avatar,
      dil: state.dil,
      eslestirmeBolum: state.eslestirmeBolum,
      gunlukHaklar: state.gunlukHaklar,
      gunlukGorevler: state.gunlukGorevler,
    };
    localStorage.setItem('tamgha_kayit', JSON.stringify(kayit));
  }, [state.kazanilanKartlar, state.bolgeIlerlemesi, state.toplamPuan, state.gunlukKartTalep, state.dogumYili, state.dogumHayvaniId, state.kullaniciAdi, state.avatar, state.dil, state.eslestirmeBolum, state.gunlukHaklar, state.gunlukGorevler]);

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
