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
    const [bgmVolume, setBgmVolume] = useState(0.22);

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
            const buf = ac.createBuffer(1, ac.sampleRate * 0.12, ac.sampleRate);
            const d = buf.getChannelData(0);
            for (let i = 0; i < d.length; i++) {
                d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ac.sampleRate * 0.018));
            }
            const src = ac.createBufferSource();
            src.buffer = buf;
            const filt = ac.createBiquadFilter();
            filt.type = 'bandpass';
            filt.frequency.value = 1100;
            filt.Q.value = 0.7;
            const gain = ac.createGain();
            gain.gain.setValueAtTime(0.55, ac.currentTime);
            src.connect(filt);
            filt.connect(gain);
            gain.connect(ac.destination);
            src.start();
        } catch (_) { }
    }, [isMuted]);

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
