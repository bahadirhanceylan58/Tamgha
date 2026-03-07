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
    orhun: { yildizlar: [0, 0, 0, 0, 0], kilit: false },
    selenga: { yildizlar: [0, 0, 0, 0, 0], kilit: true },
    altay: { yildizlar: [0, 0, 0, 0, 0], kilit: true },
    tengri_yurdu: { yildizlar: [0, 0, 0, 0, 0], kilit: true },
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
  }
};

function yukleKayit() {
  try {
    const kayit = localStorage.getItem('tamgha_kayit');
    if (kayit) {
      const parsed = JSON.parse(kayit);
      // tengri_yurdu yoksa ekle (eski kayitlar icin)
      const bolgeIlerlemesi = {
        orhun: { yildizlar: [0, 0, 0, 0, 0], kilit: false },
        selenga: { yildizlar: [0, 0, 0, 0, 0], kilit: true },
        altay: { yildizlar: [0, 0, 0, 0, 0], kilit: true },
        tengri_yurdu: { yildizlar: [0, 0, 0, 0, 0], kilit: true },
        ...(parsed.bolgeIlerlemesi || {}),
      };
      if (!bolgeIlerlemesi.tengri_yurdu) {
        bolgeIlerlemesi.tengri_yurdu = { yildizlar: [0, 0, 0, 0, 0], kilit: true };
      }
      // Eski kayıt: 3 elemanlı yıldız dizilerini 5'e genişlet
      for (const k of Object.keys(bolgeIlerlemesi)) {
        const y = bolgeIlerlemesi[k].yildizlar;
        if (y.length < 5) {
          bolgeIlerlemesi[k] = { ...bolgeIlerlemesi[k], yildizlar: [...y, ...Array(5 - y.length).fill(0)] };
        }
      }
      return { ...INITIAL_STATE, ...parsed, bolgeIlerlemesi, ekran: 'home', yeniKazanilanKartlar: [], aktifGuc: null, dogumYili: parsed.dogumYili ?? null, dogumHayvaniId: parsed.dogumHayvaniId ?? null, kullaniciAdi: parsed.kullaniciAdi ?? '', avatar: parsed.avatar ?? '\u{10C00}', dil: parsed.dil ?? 'tr', sefer: { aktif: false, bolgeId: null, seviye: null, guc: null, asama: 0 } };
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
        sefer: action.ekran === 'home' || action.ekran === 'map' ? { aktif: false, bolgeId: null, seviye: null, guc: null, asama: 0 } : state.sefer
      };

    case 'SEFER_BASLAT':
      return {
        ...state,
        sefer: { aktif: true, bolgeId: action.bolgeId, seviye: action.seviye, guc: action.guc, asama: 0 },
        ekran: 'eslestirme',
        seciliBolge: action.bolgeId,
        seciliSeviye: action.seviye,
        aktifGuc: action.guc || null,
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
        sefer: { aktif: false, bolgeId: null, seviye: null, guc: null, asama: 0 }
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
      const oncekiYildizlar = state.bolgeIlerlemesi[bolgeId]?.yildizlar || [0, 0, 0, 0, 0];
      const yeniYildizlar = [...oncekiYildizlar];

      // Basit yildiz mantigi: Mahjong temizlendiği an en az 1 yildiz, basariliysa 3 yildiz
      const yildiz = action.kazandi ? 3 : 0;
      yeniYildizlar[seviye] = Math.max(yeniYildizlar[seviye], yildiz);

      return {
        ...state,
        bolgeIlerlemesi: {
          ...state.bolgeIlerlemesi,
          [bolgeId]: {
            ...state.bolgeIlerlemesi[bolgeId],
            yildizlar: yeniYildizlar,
          }
        },
        toplamPuan: state.toplamPuan + puan,
      };
    }

    case 'QUIZ_TAMAMLA': {
      const { bolgeId, seviye, yildiz, kazanilanIds } = action;
      const oncekiYildizlar = state.bolgeIlerlemesi[bolgeId]?.yildizlar || [0, 0, 0, 0, 0];
      const yeniYildizlar = [...oncekiYildizlar];
      yeniYildizlar[seviye] = Math.max(yeniYildizlar[seviye], yildiz);

      const toplamYildiz = yeniYildizlar.reduce((a, b) => a + b, 0);
      const bolgeKilidiAc = {};

      if (bolgeId === 'orhun' && toplamYildiz >= 5) {
        bolgeKilidiAc.selenga = { ...state.bolgeIlerlemesi.selenga, kilit: false };
      }
      if (bolgeId === 'selenga' && toplamYildiz >= 5) {
        bolgeKilidiAc.altay = { ...state.bolgeIlerlemesi.altay, kilit: false };
      }
      if (bolgeId === 'altay' && toplamYildiz >= 5) {
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
      return { ...state, ekran: 'map', yeniKazanilanKartlar: [], sefer: { aktif: false, bolgeId: null, seviye: null, guc: null, asama: 0 } };

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
    };
    localStorage.setItem('tamgha_kayit', JSON.stringify(kayit));
  }, [state.kazanilanKartlar, state.bolgeIlerlemesi, state.toplamPuan, state.gunlukKartTalep, state.dogumYili, state.dogumHayvaniId, state.kullaniciAdi, state.avatar, state.dil]);

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
