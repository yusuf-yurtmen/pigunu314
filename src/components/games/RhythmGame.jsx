import { useEffect, useRef } from 'react';
import { Play, Flame, Zap, Award, Share2 } from 'lucide-react';
import { store, useStore, APP_CONFIG } from '../../lib/store';
import { AudioEngine } from '../../lib/audio';
import { EffectEngine } from '../../lib/engine';

export default function RhythmGame() {
    const [rhythm, updateRhythm] = useStore('rhythm');
    const areaRef = useRef(null);

    useEffect(() => {
        if (areaRef.current) {
            EffectEngine.mount(areaRef.current);
        }
        return () => EffectEngine.unmount();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!rhythm.isPlaying) return;
            const n = parseInt(e.key);
            if (!isNaN(n) && n >= 0 && n <= 9) {
                e.preventDefault();
                hitKey(n);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rhythm]);

    const start = () => {
        const lv = APP_CONFIG.LEVELS[rhythm.levelIndex];
        updateRhythm({
            isPlaying: true, currentIndex: 0, score: 0, combo: 0, misses: 0,
            bpm: lv.bpm, targetNotes: lv.t,
            levelIndex: (rhythm.levelIndex + 1) % APP_CONFIG.LEVELS.length
        });
    };

    function hitKey(n) {
        const st = store.get('rhythm');
        if (!st.isPlaying) return;

        if (n === APP_CONFIG.PI_DIGITS[st.currentIndex]) {
            AudioEngine.playNote(n, 0.12);
            AudioEngine.vibrate(30);

            const targetArea = areaRef.current;
            if (targetArea) {
                const r = targetArea.getBoundingClientRect();
                EffectEngine.addWave(r.width / 2, r.height / 2);
                EffectEngine.addBurst(r.width / 2, Math.max(0, r.height / 2), 6);
            }

            const nCombo = st.combo + 1;
            const earned = Math.round(10 * (st.bpm / 80)) + nCombo * 2;
            let nBpm = st.bpm;

            if (nCombo % 5 === 0) nBpm = Math.min(240, nBpm + 10);

            const nIdx = st.currentIndex + 1;
            const isWin = nIdx >= st.targetNotes;
            let best = st.bestScore;

            if (isWin) {
                const fScore = st.score + earned;
                if (fScore > best) {
                    best = fScore;
                    localStorage.setItem('piRhBest', best);
                }
            }

            updateRhythm({
                currentIndex: nIdx, combo: nCombo, score: st.score + earned,
                misses: 0, bpm: nBpm, isPlaying: !isWin, bestScore: best
            });
        } else {
            AudioEngine.playEffect('buzz');
            AudioEngine.vibrate(80);
            const nMiss = st.misses + 1;
            let nBpm = st.bpm;
            if (nMiss >= 3) {
                nBpm = Math.max(60, nBpm - 20);
            }
            updateRhythm({ combo: 0, misses: nMiss >= 3 ? 0 : nMiss, bpm: nBpm });
        }
    };

    const renderDigits = () => {
        if (!rhythm.isPlaying && rhythm.currentIndex >= rhythm.targetNotes && rhythm.currentIndex > 0) {
            return (
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2em', fontWeight: 900, color: 'var(--gold-star)' }}>
                        <Award className="inline-icon" /> {rhythm.score}
                    </div>
                    <p style={{ color: 'var(--text-muted)', margin: '6px 0' }}>Pi'nin {rhythm.targetNotes}. notasına ulaştın!</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '.85em' }}>Hız: {rhythm.bpm} BPM | Kombo: {rhythm.combo}</p>
                </div>
            );
        }

        const digits = [];
        for (let i = Math.max(0, rhythm.currentIndex - 4); i < Math.min(rhythm.currentIndex + 15, rhythm.targetNotes || 50); i++) {
            const isCurrent = i === rhythm.currentIndex;
            const isDone = i < rhythm.currentIndex;

            digits.push(
                <span
                    key={i}
                    style={{
                        display: 'inline-block', margin: '0 4px', transition: 'all 0.15s',
                        fontSize: isCurrent ? '2.4em' : isDone ? '0.85em' : '1.3em',
                        color: isCurrent ? 'var(--gold-star)' : isDone ? 'var(--emerald-success)' : 'var(--text-muted)',
                        textShadow: isCurrent ? '0 0 24px rgba(251, 191, 36, 0.7)' : 'none',
                        opacity: isDone ? 0.4 : 1,
                        fontFamily: 'Space Mono', fontWeight: 700
                    }}
                >
                    {APP_CONFIG.PI_DIGITS[i]}
                </span>
            );
        }
        return digits;
    };

    return (
        <div className="glass-panel animate-fade-in" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <span className="glass-card" style={{ padding: '6px 12px', borderRadius: '12px' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8tem' }}>Skor</span> <strong style={{ color: 'var(--pink-pop)' }}>{rhythm.score}</strong>
                    </span>
                    <span className="glass-card" style={{ padding: '6px 12px', borderRadius: '12px' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8tem' }}>Kombo</span> <strong style={{ color: 'var(--emerald-success)' }}>{rhythm.combo}</strong>
                    </span>
                    <span className="glass-card" style={{ padding: '6px 12px', borderRadius: '12px' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8tem' }}>Hız</span> <strong style={{ color: 'var(--gold-star)' }}>{rhythm.bpm}</strong>
                    </span>
                </div>
                <button className="btn-secondary" onClick={start}>
                    {rhythm.isPlaying ? <Flame size={16} /> : <Play size={16} />}
                    {APP_CONFIG.LEVELS[rhythm.levelIndex].n}
                </button>
            </div>

            <div
                ref={areaRef}
                style={{
                    width: '100%', height: '220px',
                    background: rhythm.bpm >= 160 ? 'linear-gradient(180deg,rgba(239,68,68,.08),var(--bg-card))'
                        : rhythm.bpm >= 120 ? 'linear-gradient(180deg,rgba(249,115,22,.06),var(--bg-card))'
                            : 'var(--bg-card)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(139, 92, 246, 0.1)',
                    position: 'relative', overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.5s'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'nowrap', zIndex: 2 }}>
                    {renderDigits()}
                </div>
            </div>

            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px',
                maxWidth: '400px', margin: '20px auto 0'
            }}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button
                        key={num}
                        onClick={() => hitKey(num)}
                        style={{
                            height: '64px', borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '2px solid rgba(139, 92, 246, 0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'Space Mono', fontWeight: 700, fontSize: '1.4em',
                            color: 'white', cursor: 'pointer', transition: 'all 0.1s'
                        }}
                        onMouseDown={(e) => {
                            e.currentTarget.style.transform = 'scale(0.9)';
                            e.currentTarget.style.background = 'var(--purple-glow)';
                            e.currentTarget.style.borderColor = 'var(--purple-light)';
                        }}
                        onMouseUp={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.15)';
                        }}
                    >
                        {num}
                    </button>
                ))}
            </div>
        </div>
    );
}
