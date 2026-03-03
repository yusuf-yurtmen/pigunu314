import { useState } from 'react';
import {
    ArrowLeft, ArrowRight, AlertTriangle, CheckCircle, RotateCw,
    ClipboardList, AlertCircle, Scale, ThumbsUp, Calculator, BookOpen,
    Monitor, Ruler, Car, Satellite, Music, Globe, Gem, GraduationCap
} from 'lucide-react';
import { useStore, APP_CONFIG, StorageService } from '../../lib/store';

// Helper to map string icon names from config to Lucide components
const IconMap = {
    ClipboardList: <ClipboardList className="inline-icon" />,
    AlertCircle: <AlertCircle className="inline-icon" />,
    CheckCircle: <CheckCircle className="inline-icon" />,
    Vote: <ThumbsUp className="inline-icon" />,
    Scale: <Scale className="inline-icon" />,
    Zap: <AlertTriangle className="inline-icon" />,
    Calculator: <Calculator className="inline-icon" />,
    BookOpen: <BookOpen className="inline-icon" />,
    Monitor: <Monitor className="inline-icon" />,
    Ruler: <Ruler className="inline-icon" />,
    Car: <Car className="inline-icon" />,
    Satellite: <Satellite className="inline-icon" />,
    Music: <Music className="inline-icon" />,
    Globe: <Globe className="inline-icon" />,
    Gem: <Gem className="inline-icon" />,
    GraduationCap: <GraduationCap className="inline-icon" />
};

export default function CourtRoom() {
    const [court, updateCourt] = useStore('court');
    const [hasVoted, setHasVoted] = useState(false);
    const [votes, setVotes] = useState(StorageService.get('piV', { guilty: 0, innocent: 0 }));

    const p = APP_CONFIG.COURT_PAGES[court.ci];

    // We need to parse the raw HTML string to replace lucide icon tags if any,
    // but it's simpler to just dangerouslySetInnerHTML and let CSS handle the rest,
    // OR we can map specific icons manually. Since we only have a few pages, we'll
    // parse it simply or just use dangerouslySetInnerHTML.

    const handleVote = (type) => {
        const newVotes = { ...votes };
        newVotes[type]++;
        StorageService.set('piV', newVotes);
        setVotes(newVotes);
        setHasVoted(true);
    };

    const resetCourt = () => {
        setHasVoted(false);
        updateCourt({ ci: 0 });
    };

    // Convert string HTML to native React elements if needed, or just sanitize.
    // For safety and speed, we will dangerously set it since we control APP_CONFIG.
    // However, I will replace `<i data-lucide="..."></i>` with static SVG or emojis in config.
    // Actually, since this is React, let's just use dangerouslySetInnerHTML.

    const renderContent = () => {
        let html = p.h;

        // Quick regex to swap lucide strings with emojis or icons
        html = html.replace(/<i data-lucide="scale"><\/i>/g, '⚖️');
        html = html.replace(/<i data-lucide="zap"><\/i>/g, '⚡');
        html = html.replace(/<i data-lucide="calculator"><\/i>/g, '🧮');
        html = html.replace(/<i data-lucide="book-open"><\/i>/g, '📖');
        html = html.replace(/<i data-lucide="monitor"><\/i>/g, '💻');
        html = html.replace(/<i data-lucide="ruler"><\/i>/g, '📏');
        html = html.replace(/<i data-lucide="car"><\/i>/g, '🚗');
        html = html.replace(/<i data-lucide="satellite"><\/i>/g, '🛰️');
        html = html.replace(/<i data-lucide="music"><\/i>/g, '🎵');
        html = html.replace(/<i data-lucide="globe"><\/i>/g, '🌍');
        html = html.replace(/<i data-lucide="gem"><\/i>/g, '💎');
        html = html.replace(/<i data-lucide="graduation-cap"><\/i>/g, '🎓');

        return (
            <div
                dangerouslySetInnerHTML={{ __html: html }}
                style={{ marginTop: '8px', lineHeight: '1.6', fontSize: '1.05em' }}
            />
        );
    };

    return (
        <div className="glass-panel animate-fade-in" style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
            <div className="glass-card" style={{ padding: '24px', background: 'var(--bg-base)' }}>

                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.4em', marginBottom: '16px', color: 'var(--purple-light)' }}>
                    {IconMap[p.i]} {p.t}
                </h3>

                {renderContent()}

                {court.ci === APP_CONFIG.COURT_PAGES.length - 1 && !hasVoted && (
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
                        <button
                            className="btn-secondary"
                            style={{ background: 'rgba(239,68,68,.12)', borderColor: 'var(--red-alert)', color: 'var(--red-alert)' }}
                            onClick={() => handleVote('guilty')}
                        >
                            <AlertTriangle size={18} /> SUÇLU
                        </button>
                        <button
                            className="btn-secondary"
                            style={{ background: 'rgba(16,185,129,.12)', borderColor: 'var(--emerald-success)', color: 'var(--emerald-success)' }}
                            onClick={() => handleVote('innocent')}
                        >
                            <CheckCircle size={18} /> MASUM
                        </button>
                    </div>
                )}

                {hasVoted && (
                    <div className="animate-fade-in" style={{ textAlign: 'center', marginTop: '20px', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px' }}>
                        <div style={{ fontSize: '1.6em', fontWeight: 900, color: votes.innocent >= votes.guilty ? 'var(--emerald-success)' : 'var(--red-alert)' }}>
                            {votes.innocent >= votes.guilty ? <><CheckCircle className="inline-icon" /> ÇOĞUNLUK: MASUM!</> : <><AlertTriangle className="inline-icon" /> ÇOĞUNLUK: SUÇLU!</>}
                        </div>

                        <p style={{ color: 'var(--text-muted)', margin: '12px 0 8px', fontSize: '0.9em' }}>Toplam {votes.guilty + votes.innocent} oy:</p>

                        <div style={{ width: '100%', height: '24px', background: 'var(--red-alert)', borderRadius: '12px', overflow: 'hidden', margin: '8px 0', position: 'relative' }}>
                            <div style={{
                                height: '100%',
                                background: 'var(--emerald-success)',
                                width: `${(votes.innocent / Math.max(1, votes.guilty + votes.innocent)) * 100}%`,
                                transition: 'width 0.8s ease-out'
                            }} />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9em', color: 'var(--text-main)', fontWeight: 'bold' }}>
                            <span style={{ color: 'var(--emerald-success)' }}>{Math.round((votes.innocent / Math.max(1, votes.guilty + votes.innocent)) * 100)}% Masum</span>
                            <span style={{ color: 'var(--red-alert)' }}>{Math.round((votes.guilty / Math.max(1, votes.guilty + votes.innocent)) * 100)}% Suçlu</span>
                        </div>

                        <button className="btn-primary" onClick={resetCourt} style={{ marginTop: '20px' }}>
                            <RotateCw size={18} /> Başa Dön
                        </button>
                    </div>
                )}

            </div>

            {!hasVoted && (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px' }}>
                    <button
                        className="btn-icon"
                        disabled={court.ci === 0}
                        style={{ opacity: court.ci === 0 ? 0.3 : 1, width: '48px' }}
                        onClick={() => updateCourt({ ci: court.ci - 1 })}
                    >
                        <ArrowLeft size={20} />
                    </button>

                    {court.ci < APP_CONFIG.COURT_PAGES.length - 1 && (
                        <button
                            className="btn-icon"
                            style={{ width: '48px', background: 'var(--purple-glow)', color: 'white' }}
                            onClick={() => updateCourt({ ci: court.ci + 1 })}
                        >
                            <ArrowRight size={20} />
                        </button>
                    )}
                </div>
            )}

        </div>
    );
}
