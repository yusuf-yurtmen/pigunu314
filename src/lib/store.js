// A lightweight global state manager wrapper over React concepts, or simply an event emitter.
// We will export a generic store for our games.
import { useState, useEffect } from 'react';

const APP_CONFIG = {
    PI: '31415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931',
    PI_DIGITS: [], // initialized below
    LEVELS: [
        { n: 'Çaylak', t: 50, bpm: 80, icon: 'Sprout' },
        { n: 'Normal', t: 100, bpm: 100, icon: 'Star' },
        { n: 'Ateş', t: 150, bpm: 120, icon: 'Flame' },
        { n: 'Uzman', t: 200, bpm: 140, icon: 'Zap' },
        { n: 'Efsane', t: 250, bpm: 160, icon: 'Award' }
    ],
    PALETTE: ['#fcd34d', '#d8b4fe', '#f472b6', '#34d399', '#f87171', '#60a5fa'],
    QUESTIONS: [
        { q: 'Pi tam değeri?', a: 'Sonsuz!', o: ['3.14', '22/7', 'Sonsuz!', '3.14159'] },
        { q: 'Pi Günü neden 14 Mart?', a: '3/14=3.14', o: ['Einstein', '3/14=3.14', 'Rastgele', 'UNESCO'] },
        { q: 'İlk Pi Günü nerede?', a: 'Exploratorium', o: ['MIT', 'NASA', 'Exploratorium', 'Oxford'] },
        { q: '70K basamak ezberleyen?', a: 'Rajveer Meena', o: ['Einstein', 'Rajveer Meena', 'Ramanujan', 'Lu Chao'] },
        { q: 'Çevre=?', a: '2πr', o: ['πr²', '2πr', 'πd²', '4πr'] },
        { q: 'Pi 4.basamak?', a: '1', o: ['5', '9', '1', '4'] },
        { q: 'Alan=?', a: 'πr²', o: ['2πr', 'πr²', 'πd', 'r²/π'] },
        { q: 'Pi ne tür?', a: 'İrrasyonel', o: ['Tam', 'İrrasyonel', 'Rasyonel', 'Doğal'] },
        { q: 'NASA kaç basamak?', a: '15', o: ['3', '15', '100', '1M'] },
        { q: 'π ilk?', a: 'Jones 1706', o: ['Arşimet', 'Euler', 'Jones 1706', 'Newton'] },
        { q: '1m çap çevre?', a: '~3.14m', o: ['~2m', '~3.14m', '~6.28m', '~1m'] },
        { q: 'Pi kesir?', a: '22/7', o: ['21/7', '22/7', '23/7', '22/8'] }
    ],
    PAIRS: [
        { a: '1.', b: '3' }, { a: '2.', b: '1' }, { a: '3.', b: '4' }, { a: '4.', b: '1' },
        { a: '5.', b: '5' }, { a: '6.', b: '9' }, { a: '7.', b: '2' }, { a: '8.', b: '6' }
    ],
    COURT_PAGES: [
        { i: 'ClipboardList', t: 'Dava Açılışı', h: '<p><b>Dava:</b> π-2026-314 | <b>Sanık:</b> Pi</p><p style="margin:6px 0"><b>Suçlama:</b> İrrasyonel olmak!</p><div class="ev" style="color:var(--gold-star)">"Jüri, dikkatle dinleyin!"</div>' },
        { i: 'AlertCircle', t: 'Savcılık', h: '<div class="ev">Pi kaotik! Düzen yok!</div><div class="ev">NASA 15 basamak diyor!</div><div class="ev">Öğrenciler puan kaybı!</div><div class="ev">Trilyon basamak = israf!</div><div class="ev">Diğer sayılar düzenli!</div>' },
        { i: 'CheckCircle', t: 'Savunma', h: '<div class="ev df">Tekerlekler = Pi!</div><div class="ev df">GPS, uydu = Pi!</div><div class="ev df">Müzik dalgaları = Pi!</div><div class="ev df">DNA, gezegen = Pi!</div><div class="ev df">İrrasyonel = eşsiz!</div><div class="ev df">100+ ülke kutluyor!</div>' },
        { i: 'Vote', t: 'Kararın!', h: '<p style="font-size:1.05em;font-weight:800;color:var(--gold-star);text-align:center;margin:8px 0">Pi suçlu mu, masum mu?</p>' }
    ]
};

APP_CONFIG.PI_DIGITS = APP_CONFIG.PI.split('').map(Number);

export { APP_CONFIG };

export const StorageService = {
    get: (key, fallback = null) => {
        try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : fallback; }
        catch { return fallback; }
    },
    set: (key, value) => {
        try { localStorage.setItem(key, JSON.stringify(value)); }
        catch { console.warn('Storage full!'); }
    }
};

class SimpleStore {
    constructor() {
        this.state = {
            rhythm: { isPlaying: false, currentIndex: 0, score: 0, combo: 0, bpm: 80, targetNotes: 50, misses: 0, bestScore: StorageService.get('piRhBest', 0), levelIndex: 0 },
            bubble: { isPlaying: false, score: 0, combo: 0, timeLeft: 30, targetDigit: 3, piIndex: 0 },
            quiz: { idx: 0, points: 0, streak: 0, answered: false, timeLeft: 12 },
            memory: { flipped: [], matches: 0, moves: 0, locked: false },
            court: { ci: 0 },
            starMap: { seed: 0, lines: true, theme: 0, anim: false, frame: 0, digits: [], active: false }
        };
        this.listeners = new Set();
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    update(module, updates) {
        this.state[module] = { ...this.state[module], ...updates };
        this.listeners.forEach(l => l(this.state, module));
    }

    get(module) {
        if (module) return this.state[module];
        return this.state;
    }
}

export const store = new SimpleStore();

// React hook for connecting to the simple store
export function useStore(module) {
    const [data, setData] = useState(store.get(module));

    useEffect(() => {
        const unsub = store.subscribe((newState, updatedModule) => {
            if (updatedModule === module) {
                setData(newState[module]);
            }
        });
        return unsub;
    }, [module]);

    return [data, (updates) => store.update(module, updates)];
}
