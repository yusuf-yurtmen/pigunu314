import { useState, useEffect, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import { useStore, APP_CONFIG } from '@/lib/store';
import { EffectEngine } from '@/lib/engine';
import { AudioEngine } from '@/lib/audio';

export default function MemoryGame() {
    const [memory, updateMemory] = useStore('memory');
    const [cards, setCards] = useState([]);
    const areaRef = useRef(null);

    useEffect(() => {
        if (areaRef.current) EffectEngine.mount(areaRef.current);
        return () => EffectEngine.unmount();
    }, []);

    useEffect(() => {
        reset();
        // eslint-disable-next-line
    }, []);

    function reset() {
        updateMemory({ flipped: [], matches: 0, moves: 0, locked: false });
        const newCards = [];
        APP_CONFIG.PAIRS.forEach(p => {
            newCards.push({ id: Math.random().toString(), val: p.a, matchId: p.b, isFlipped: false, isMatched: false });
            newCards.push({ id: Math.random().toString(), val: p.b, matchId: p.a, isFlipped: false, isMatched: false });
        });
        setCards(newCards.sort(() => Math.random() - 0.5));
    }

    const handleCardClick = (clickedCard) => {
        if (memory.locked || clickedCard.isFlipped || clickedCard.isMatched) return;

        AudioEngine.playNote(memory.flipped.length * 2, 0.08);

        const updatedCards = cards.map(c =>
            c.id === clickedCard.id ? { ...c, isFlipped: true } : c
        );
        setCards(updatedCards);

        const newlyFlipped = [...memory.flipped, clickedCard];

        if (newlyFlipped.length === 2) {
            updateMemory({ locked: true, moves: memory.moves + 1, flipped: newlyFlipped });
            const [a, b] = newlyFlipped;

            if (a.val === b.matchId || b.val === a.matchId) {
                // Match!
                const cMatch = memory.matches + 1;

                setTimeout(() => {
                    setCards(prev => prev.map(c =>
                        (c.id === a.id || c.id === b.id) ? { ...c, isMatched: true } : c
                    ));
                    updateMemory({ flipped: [], locked: false, matches: cMatch });

                    if (areaRef.current) {
                        const r = areaRef.current.getBoundingClientRect();
                        EffectEngine.addBurst(r.width / 2, r.height / 2, 10);
                    }
                }, 400);

            } else {
                // No match
                setTimeout(() => {
                    setCards(prev => prev.map(c =>
                        (c.id === a.id || c.id === b.id) ? { ...c, isFlipped: false } : c
                    ));
                    updateMemory({ flipped: [], locked: false });
                }, 800);
            }
        } else {
            updateMemory({ flipped: newlyFlipped });
        }
    };

    return (
        <div className="glass-panel animate-fade-in" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <span className="glass-card" style={{ padding: '6px 12px', borderRadius: '12px' }}>
                        Eşleşme <strong style={{ color: 'var(--emerald-success)' }}>{memory.matches}</strong>/{APP_CONFIG.PAIRS.length}
                    </span>
                    <span className="glass-card" style={{ padding: '6px 12px', borderRadius: '12px' }}>
                        Hamle <strong style={{ color: 'var(--text-muted)' }}>{memory.moves}</strong>
                    </span>
                </div>
                <button className="btn-icon" onClick={reset}><RotateCcw size={18} /></button>
            </div>

            <div
                ref={areaRef}
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '8px',
                    maxWidth: '360px',
                    margin: '0 auto',
                    position: 'relative' // for effect engine
                }}
            >
                {cards.map(c => (
                    <div
                        key={c.id}
                        onClick={() => handleCardClick(c)}
                        style={{
                            aspectRatio: '1',
                            position: 'relative',
                            perspective: '1000px',
                            cursor: (c.isFlipped || c.isMatched || memory.locked) ? 'default' : 'pointer'
                        }}
                    >
                        <div style={{
                            position: 'absolute', inset: 0,
                            transition: 'transform 0.4s ease-in-out',
                            transformStyle: 'preserve-3d',
                            transform: (c.isFlipped || c.isMatched) ? 'rotateY(180deg)' : 'rotateY(0deg)'
                        }}>
                            {/* Back (Cover) */}
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: 'rgba(139, 92, 246, 0.08)',
                                border: '2px solid rgba(139, 92, 246, 0.2)',
                                borderRadius: '12px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                backfaceVisibility: 'hidden',
                                color: 'var(--purple-glow)',
                                fontSize: '1.5em', fontWeight: 900
                            }}>
                                π
                            </div>

                            {/* Front (Value) */}
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: c.isMatched ? 'linear-gradient(135deg, var(--emerald-success), #059669)' : 'linear-gradient(135deg, var(--purple-glow), var(--pink-pop))',
                                borderRadius: '12px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                backfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)',
                                color: 'white',
                                fontFamily: 'Space Mono', fontWeight: 700, fontSize: '1.2em',
                                boxShadow: c.isMatched ? '0 0 14px rgba(16, 185, 129, 0.4)' : 'none'
                            }}>
                                {c.val}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {memory.matches === APP_CONFIG.PAIRS.length && (
                <div style={{ textAlign: 'center', marginTop: '20px', color: 'var(--gold-star)', fontWeight: 'bold', fontSize: '1.2em' }}>
                    Tebrikler! Tüm eşleşmeleri buldun.
                </div>
            )}
        </div>
    );
}
