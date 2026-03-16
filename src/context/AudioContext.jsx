import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const AudioContext = createContext();

// Reliable ASMR-style sounds (Mixkit / SoundJay placeholders - User should replace with local files for best results)
const SOUNDS = {
    bgm: '/intro.mp3', // Local intro music
    click: 'https://assets.mixkit.co/active-storage/sfx/2568/2568-preview.mp3', // Soft wood tap
    match: 'https://assets.mixkit.co/active-storage/sfx/2012/2012-preview.mp3', // Ethereal shimmer
    combo: 'https://assets.mixkit.co/active-storage/sfx/2000/2000-preview.mp3'  // Magical burst
};

export function AudioProvider({ children }) {
    const [isMuted, setIsMuted] = useState(false);
    const [unlocked, setUnlocked] = useState(false);
    const [bgmVolume, setBgmVolume] = useState(0.04);

    const bgmRef = useRef(null);
    const clickRef = useRef(null);
    const matchRef = useRef(null);
    const comboRef = useRef(null);

    useEffect(() => {
        bgmRef.current = new Audio(SOUNDS.bgm);
        bgmRef.current.loop = true;
        bgmRef.current.volume = bgmVolume;

        clickRef.current = new Audio(SOUNDS.click);
        clickRef.current.volume = 0.6;

        matchRef.current = new Audio(SOUNDS.match);
        matchRef.current.volume = 0.5;

        comboRef.current = new Audio(SOUNDS.combo);
        comboRef.current.volume = 0.8;

        return () => {
            if (bgmRef.current) {
                bgmRef.current.pause();
                bgmRef.current.src = "";
            }
        };
    }, []);

    useEffect(() => {
        if (bgmRef.current) {
            bgmRef.current.volume = bgmVolume;
        }
    }, [bgmVolume]);

    const unlockAudio = useCallback(() => {
        if (unlocked) return;
        const silent = new Audio();
        silent.play().catch(() => { });
        setUnlocked(true);
    }, [unlocked]);

    const playBgm = useCallback(() => {
        if (isMuted || !bgmRef.current) return;
        bgmRef.current.play().catch(() => { });
    }, [isMuted]);

    const stopBgm = useCallback(() => {
        if (!bgmRef.current) return;
        bgmRef.current.pause();
        bgmRef.current.currentTime = 0;
    }, []);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => {
            const next = !prev;
            if (bgmRef.current) bgmRef.current.muted = next;
            return next;
        });
    }, []);

    const setVolume = useCallback((v) => {
        const safe = Math.max(0, Math.min(1, v));
        setBgmVolume(safe);
    }, []);

    const playTas = useCallback(() => {
        if (isMuted) return;
        try {
            const ac = new (window.AudioContext || window.webkitAudioContext)();
            const sr = ac.sampleRate;

            // Taş tıklama: kısa gürültü + düşük thump
            const bufLen = sr * 0.07;
            const buf = ac.createBuffer(1, bufLen, sr);
            const d = buf.getChannelData(0);
            for (let i = 0; i < bufLen; i++) {
                d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 0.010));
            }
            const src = ac.createBufferSource();
            src.buffer = buf;
            const filt = ac.createBiquadFilter();
            filt.type = 'bandpass';
            filt.frequency.value = 900;
            filt.Q.value = 1.4;
            const gain = ac.createGain();
            gain.gain.setValueAtTime(0.4, ac.currentTime);

            // Düşük frekans thump
            const osc = ac.createOscillator();
            osc.frequency.setValueAtTime(180, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(55, ac.currentTime + 0.04);
            const og = ac.createGain();
            og.gain.setValueAtTime(0.3, ac.currentTime);
            og.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.05);

            src.connect(filt); filt.connect(gain); gain.connect(ac.destination);
            osc.connect(og); og.connect(ac.destination);
            src.start(); osc.start(); osc.stop(ac.currentTime + 0.06);
        } catch (_) { }
    }, [isMuted]);

    const playClick = useCallback(() => {
        if (!isMuted && clickRef.current) {
            clickRef.current.currentTime = 0;
            clickRef.current.play().catch(() => { });
        }
    }, [isMuted]);

    const playMatch = useCallback(() => {
        if (isMuted) return;
        try {
            const ac = new (window.AudioContext || window.webkitAudioContext)();
            const sr = ac.sampleRate;
            const now = ac.currentTime;

            // Katman 1: ilk çatlak — yüksek frekanslı gürültü patlaması
            const crack1 = ac.createBuffer(1, sr * 0.06, sr);
            const c1 = crack1.getChannelData(0);
            for (let i = 0; i < c1.length; i++)
                c1[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 0.008));
            const s1 = ac.createBufferSource(); s1.buffer = crack1;
            const f1 = ac.createBiquadFilter(); f1.type = 'highpass'; f1.frequency.value = 3000;
            const g1 = ac.createGain(); g1.gain.setValueAtTime(0.85, now);
            s1.connect(f1); f1.connect(g1); g1.connect(ac.destination);

            // Katman 2: orta çatlak — bandpass
            const crack2 = ac.createBuffer(1, sr * 0.10, sr);
            const c2 = crack2.getChannelData(0);
            for (let i = 0; i < c2.length; i++)
                c2[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 0.022));
            const s2 = ac.createBufferSource(); s2.buffer = crack2;
            const f2 = ac.createBiquadFilter(); f2.type = 'bandpass'; f2.frequency.value = 1200; f2.Q.value = 0.8;
            const g2 = ac.createGain(); g2.gain.setValueAtTime(0.65, now);
            s2.connect(f2); f2.connect(g2); g2.connect(ac.destination);

            // Katman 3: taş gövdesi — düşük osilasyon
            const osc = ac.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(110, now);
            osc.frequency.exponentialRampToValueAtTime(35, now + 0.09);
            const og = ac.createGain();
            og.gain.setValueAtTime(0.6, now);
            og.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
            osc.connect(og); og.connect(ac.destination);

            // Katman 4: ikinci küçük çatlak (0.04s sonra)
            const crack3 = ac.createBuffer(1, sr * 0.04, sr);
            const c3 = crack3.getChannelData(0);
            for (let i = 0; i < c3.length; i++)
                c3[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 0.006));
            const s3 = ac.createBufferSource(); s3.buffer = crack3;
            const f3 = ac.createBiquadFilter(); f3.type = 'highpass'; f3.frequency.value = 5000;
            const g3 = ac.createGain(); g3.gain.setValueAtTime(0.5, now + 0.04);
            s3.connect(f3); f3.connect(g3); g3.connect(ac.destination);

            s1.start(now); s2.start(now); osc.start(now); osc.stop(now + 0.15);
            s3.start(now + 0.04);
        } catch (_) { }
    }, [isMuted]);

    const playCombo = useCallback(() => {
        if (!isMuted && comboRef.current) {
            comboRef.current.currentTime = 0;
            comboRef.current.play().catch(() => { });
        }
    }, [isMuted]);

    return (
        <AudioContext.Provider value={{
            playTas, playClick, playMatch, playCombo, toggleMute, isMuted, unlockAudio, unlocked,
            bgmVolume, setBgmVolume: setVolume, playBgm, stopBgm
        }}>
            {children}
        </AudioContext.Provider>
    );
}

export function useAudio() {
    const context = useContext(AudioContext);
    if (!context) throw new Error("useAudio must be used within AudioProvider");
    return context;
}
