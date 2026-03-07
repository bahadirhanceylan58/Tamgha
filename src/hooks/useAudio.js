import { useState, useEffect, useCallback, useRef } from 'react';

// Geçici ücretsiz ses kaynakları (Google Actions Free Sounds)
// Sonradan public/audio/ klasörüne kendi mp3/ogg dosyalarınızı atıp bu yolları (örneğin '/audio/bg-music.mp3' şeklinde) değiştirebilirsiniz.
const SOUNDS = {
    bgm: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=wind-outside-sound-ambient-141941.mp3', // Bozkır/Altay Rüzgarı ASMR
    click: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8ced61c94.mp3?filename=ui-click-43196.mp3',      // Taş tıklama
    match: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_245e3f56ce.mp3?filename=magical-twinkle-144062.mp3',    // Normal eşleşme tınısı
    combo: 'https://cdn.pixabay.com/download/audio/2024/09/16/audio_982b6b55eb.mp3?filename=epic-deep-impact-1-240167.mp3'// Şamanik gizemli kombo
};

export function useAudio() {
    const [isMuted, setIsMuted] = useState(false);

    // Audio objelerini referans olarak tutuyoruz ki component render'larında kaybolmasınlar
    const bgmRef = useRef(null);
    const clickRef = useRef(null);
    const matchRef = useRef(null);
    const comboRef = useRef(null);

    useEffect(() => {
        // Sesleri yükle
        bgmRef.current = new Audio(SOUNDS.bgm);
        bgmRef.current.loop = true;
        bgmRef.current.volume = 0.5; // ASMR arka plan müziği daha kısık

        clickRef.current = new Audio(SOUNDS.click);
        clickRef.current.volume = 0.8;

        matchRef.current = new Audio(SOUNDS.match);
        matchRef.current.volume = 0.7;

        comboRef.current = new Audio(SOUNDS.combo);
        comboRef.current.volume = 1.0;

        // BGM'yi başlat (Tarayıcı politikaları gereği kullanıcı ilk tıklamayı yapmadan çalışmayabilir)
        const playBgm = async () => {
            try {
                if (!isMuted && bgmRef.current) {
                    await bgmRef.current.play();
                }
            } catch (err) {
                // Autoplay engellendi, kullanıcının ilk tıklaması bekleniyor
                console.log("Sesin otomatik başlaması için ekrana tıklamanız gerekiyor.");
            }
        };
        playBgm();

        return () => {
            // Bileşen ekrandan kalkınca müziği durdur ve hafızayı temizle
            if (bgmRef.current) {
                bgmRef.current.pause();
                bgmRef.current.src = "";
            }
        };
    }, []); // Sadece ilk yüklemede çalışır

    // Sessize alma durumu değiştiğinde BGM'yi etkile
    useEffect(() => {
        if (bgmRef.current) {
            bgmRef.current.muted = isMuted;
        }
    }, [isMuted]);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => !prev);
    }, []);

    const playClick = useCallback(() => {
        if (!isMuted && clickRef.current) {
            clickRef.current.currentTime = 0;
            clickRef.current.play().catch(() => { });
        }
    }, [isMuted]);

    const playMatch = useCallback(() => {
        if (!isMuted && matchRef.current) {
            matchRef.current.currentTime = 0;
            matchRef.current.play().catch(() => { });
        }
    }, [isMuted]);

    const playCombo = useCallback(() => {
        if (!isMuted && comboRef.current) {
            comboRef.current.currentTime = 0;
            comboRef.current.play().catch(() => { });
        }
    }, [isMuted]);

    // İlk tıklamada müziğin çalışmasını garantiye almak için genel bir tetikleyici fonksiyon
    const unlockAudio = useCallback(() => {
        if (!isMuted && bgmRef.current && bgmRef.current.paused) {
            bgmRef.current.play().catch(() => { });
        }
    }, [isMuted]);

    return { playClick, playMatch, playCombo, toggleMute, isMuted, unlockAudio };
}
