import { useEffect, useRef, useState } from 'react';
import { Target, Trophy, RotateCw } from 'lucide-react';
import { store, useStore, APP_CONFIG } from '../../lib/store';
import { AudioEngine } from '../../lib/audio';
import { EffectEngine } from '../../lib/engine';

const PALETTE_BG = [
    'linear-gradient(135deg,#8b5cf6,#d8b4fe)',
    'linear-gradient(135deg,#f472b6,#fbcfe8)',
    'linear-gradient(135deg,#fcd34d,#fb923c)',
    'linear-gradient(135deg,#34d399,#059669)',
    'linear-gradient(135deg,#f87171,#dc2626)',
    'linear-gradient(135deg,#60a5fa,#3b82f6)'
];

export default function BubbleHunt() {
    const [bubble, updateBubble] = useStore('bubble');
    const areaRef = useRef(null);
    const [bubbles, setBubbles] = useState([]);
    const timerRef = useRef(null);
    const spawnerRef = useRef(null);

    useEffect(() => {
        if (areaRef.current) {
            EffectEngine.mount(areaRef.current);
        }
        return () => {
            EffectEngine.unmount();
            clearInterval(timerRef.current);
            clearInterval(spawnerRef.current);
        };
    }, []);

    const spawn = () => {
        const st = store.get('bubble');
        if (!st.isPlaying) return;
        const ar = areaRef.current;
        if (!ar) return;

        const W = ar.clientWidth, H = ar.clientHeight;
        const ds = [st.targetDigit];
        while (ds.length < 4) {
            const r = Math.floor(Math.random() * 10);
            if (!ds.includes(r)) ds.push(r);
        }
        ds.sort(() => Math.random() - 0.5);

        const newBubbles = ds.map(d => {
            const sz = 48 + Math.random() * 20;
            return {
                id: Math.random().toString(36).substring(2, 9),
                d, sz,
                x: Math.random() * (W - sz - 6) + 3,
                y: Math.random() * (H - sz - 6) + 3,
                visible: true
            };
        });

        setBubbles(prev => {
            const filtered = prev.filter(b => b.visible).slice(-6); // max 10 bubbles
            return [...filtered, ...newBubbles];
        });
    };

    const start = () => {
        setBubbles([]);
        updateBubble({ isPlaying: true, score: 0, combo: 0, timeLeft: 30, piIndex: 0, targetDigit: APP_CONFIG.PI_DIGITS[0] });
        clearInterval(spawnerRef.current);
        clearInterval(timerRef.current);

        spawnerRef.current = setInterval(spawn, 750);
        timerRef.current = setInterval(() => {
            const t = store.get('bubble').timeLeft - 1;
            updateBubble({ timeLeft: t });
            if (t <= 0) stop();
        }, 1000);
    };

    const stop = () => {
        updateBubble({ isPlaying: false });
        clearInterval(timerRef.current);
        clearInterval(spawnerRef.current);
        setBubbles([]);
    };

    const popBubble = (bubbleData) => {
        const st = store.get('bubble');
        if (!st.isPlaying) return;

        if (bubbleData.d === st.targetDigit) {
            const nc = st.combo + 1;
            updateBubble({
                combo: nc,
                score: st.score + 10 + nc * 3,
                targetDigit: APP_CONFIG.PI_DIGITS[(st.piIndex + 1) % APP_CONFIG.PI_DIGITS.length],
                piIndex: st.piIndex + 1
            });
            AudioEngine.playEffect('pop');
            EffectEngine.addBurst(bubbleData.x + bubbleData.sz / 2, bubbleData.y + bubbleData.sz / 2, 8);
        } else {
            updateBubble({ combo: 0 });
            AudioEngine.playEffect('buzz');
        }

        setBubbles(prev => prev.map(b => b.id === bubbleData.id ? { ...b, visible: false } : b));
    };

    return (
        <div className="glass-panel animate-fade-in" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <span className="glass-card" style={{ padding: '6px 12px', borderRadius: '12px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Süre</span> <strong style={{ color: bubble.timeLeft <= 5 ? 'var(--red-alert)' : 'var(--gold-star)' }}>{bubble.timeLeft}</strong>
                    </span>
                    <span className="glass-card" style={{ padding: '6px 12px', borderRadius: '12px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Skor</span> <strong style={{ color: 'var(--pink-pop)' }}>{bubble.score}</strong>
                    </span>
                </div>
                <div style={{
                    background: 'var(--purple-glow)', padding: '6px 20px', borderRadius: '30px',
                    fontWeight: 'bold', fontSize: '1.2em', boxShadow: 'var(--shadow-glow)', color: 'white'
                }}>
                    <Target className="inline-icon" size={18} /> Hedef: {bubble.targetDigit}
                </div>
            </div>

            <div
                ref={areaRef}
                style={{
                    width: '100%', height: '300px',
                    background: 'radial-gradient(ellipse at center, rgba(30, 41, 59, 0.4), var(--bg-card))',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid rgba(139, 92, 246, 0.1)',
                    position: 'relative', overflow: 'hidden'
                }}
            >
                {bubble.isPlaying ? bubbles.map(b => b.visible && (
                    <button
                        key={b.id}
                        onClick={() => popBubble(b)}
                        style={{
                            position: 'absolute',
                            width: `${b.sz}px`, height: `${b.sz}px`,
                            left: `${b.x}px`, top: `${b.y}px`,
                            background: PALETTE_BG[b.d % 6],
                            borderRadius: '50%',
                            border: 'none',
                            color: 'white',
                            fontFamily: 'Space Mono', fontWeight: 900,
                            fontSize: `${b.sz * 0.4}px`,
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: `0 4px 15px rgba(0,0,0,0.3)`,
                            animation: 'fadeIn 0.2s ease-out'
                        }}
                    >
                        {b.d}
                    </button>
                )) : (
                    <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)'
                    }}>
                        <div style={{ fontSize: '3em', fontWeight: 900, color: 'var(--gold-star)' }}>
                            <Trophy className="inline-icon" /> {bubble.score}
                        </div>
                        <p style={{ color: 'var(--text-muted)', margin: '10px 0' }}>Kombo: {bubble.combo}</p>
                        <button className="btn-primary" onClick={start} style={{ marginTop: '10px' }}>
                            <RotateCw size={18} /> {bubble.score === 0 && bubble.timeLeft === 30 ? 'Başla' : 'Tekrar'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
