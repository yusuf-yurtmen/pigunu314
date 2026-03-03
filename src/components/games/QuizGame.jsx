import { useRef, useEffect, useState } from 'react';
import { Brain, Award, Clock, AlertCircle, RotateCw, CheckCircle, XCircle } from 'lucide-react';
import { store, useStore, APP_CONFIG } from '../../lib/store';
import { AudioEngine } from '../../lib/audio';

export default function QuizGame() {
    const [quiz, updateQuiz] = useStore('quiz');
    const timerRef = useRef(null);
    const [shuffledOptions, setShuffledOptions] = useState([]);

    useEffect(() => {
        return () => clearInterval(timerRef.current);
    }, []);

    const loadQuestion = () => {
        const st = store.get('quiz');
        if (st.idx >= APP_CONFIG.QUESTIONS.length) {
            endQuiz();
            return;
        }

        updateQuiz({ answered: false, timeLeft: 12 });
        clearInterval(timerRef.current);

        const q = APP_CONFIG.QUESTIONS[st.idx];
        setShuffledOptions([...q.o].sort(() => Math.random() - 0.5));

        timerRef.current = setInterval(() => {
            const cSt = store.get('quiz');
            const t = cSt.timeLeft - 1;
            updateQuiz({ timeLeft: t });

            if (t <= 0) {
                clearInterval(timerRef.current);
                if (!cSt.answered) skipQuestion();
            }
        }, 1000);
    };

    const start = () => {
        updateQuiz({ idx: 0, points: 0, streak: 0, answered: false });
        // setTimeout to ensure state is clean
        setTimeout(loadQuestion, 50);
    };

    const answerQuestion = (choice) => {
        const st = store.get('quiz');
        if (st.answered) return;

        updateQuiz({ answered: true });
        clearInterval(timerRef.current);

        const q = APP_CONFIG.QUESTIONS[st.idx];
        const isCorrect = choice === q.a;

        if (isCorrect) {
            const nStreak = st.streak + 1;
            const earned = 10 + nStreak * 5 + st.timeLeft * 3;
            updateQuiz({ streak: nStreak, points: st.points + earned });
            AudioEngine.playNote(APP_CONFIG.PI_DIGITS[(st.idx + 5) % 10], 0.12);
        } else {
            updateQuiz({ streak: 0 });
            AudioEngine.playEffect('buzz');
        }

        setTimeout(() => {
            updateQuiz({ idx: store.get('quiz').idx + 1 });
            loadQuestion();
        }, 1000);
    };

    const skipQuestion = () => {
        updateQuiz({ answered: true, streak: 0 });
        setTimeout(() => {
            updateQuiz({ idx: store.get('quiz').idx + 1 });
            loadQuestion();
        }, 700);
    };

    const endQuiz = () => {
        // handled by render logic below when idx >= limit
    };

    const isGameOver = quiz.idx >= APP_CONFIG.QUESTIONS.length;
    const currentQ = APP_CONFIG.QUESTIONS[quiz.idx];

    if (isGameOver) {
        return (
            <div className="glass-panel animate-fade-in" style={{ padding: '32px', textAlign: 'center' }}>
                <Award size={48} color="var(--gold-star)" style={{ margin: '0 auto 16px' }} />
                <h2 style={{ fontSize: '2em', fontWeight: 900, color: 'var(--gold-star)' }}>{quiz.points} Puan</h2>
                <p style={{ color: 'var(--text-muted)', margin: '12px 0' }}>
                    {quiz.points >= 500 ? '🌟 Pi Ustası!' : quiz.points >= 250 ? '🎉 Harika!' : '💪 Tekrar Dene!'}
                </p>
                <button className="btn-primary" onClick={start} style={{ marginTop: '16px' }}>
                    <RotateCw size={18} /> Tekrar Testi Çöz
                </button>
            </div>
        );
    }

    // If haven't started (e.g., initial state with empty options and idx=0)
    if (!shuffledOptions.length && quiz.idx === 0 && !quiz.answered) {
        return (
            <div className="glass-panel animate-fade-in" style={{ padding: '32px', textAlign: 'center' }}>
                <Brain size={48} color="var(--purple-light)" style={{ margin: '0 auto 16px' }} />
                <h2 style={{ marginBottom: '16px' }}>Pi Bilgi Testi</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Ne kadar hızlı cevaplarsan o kadar çok puan alırsın.</p>
                <button className="btn-primary" onClick={start}>Süreyi Başlat</button>
            </div>
        );
    }

    return (
        <div className="glass-panel animate-fade-in" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <span className="glass-card" style={{ padding: '6px 12px', borderRadius: '12px', fontSize: '0.9em' }}>
                        <strong style={{ color: 'var(--pink-pop)' }}>{quiz.points}</strong> Puan
                    </span>
                    <span className="glass-card" style={{ padding: '6px 12px', borderRadius: '12px', fontSize: '0.9em' }}>
                        Seri: <strong style={{ color: 'var(--emerald-success)' }}>{quiz.streak}</strong>
                    </span>
                </div>
                <div style={{
                    color: quiz.timeLeft <= 3 ? 'var(--red-alert)' : 'var(--purple-light)',
                    fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                    <Clock size={16} /> {quiz.timeLeft}s
                </div>
            </div>

            <div style={{
                width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)',
                borderRadius: '3px', marginBottom: '20px', overflow: 'hidden'
            }}>
                <div style={{
                    height: '100%', background: 'linear-gradient(90deg, var(--purple-glow), var(--pink-pop))',
                    width: `${((quiz.idx + 1) / APP_CONFIG.QUESTIONS.length) * 100}%`, transition: 'width 0.3s'
                }} />
            </div>

            <div className="glass-card" style={{ padding: '30px', textAlign: 'center', marginBottom: '20px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85em' }}>Soru {quiz.idx + 1} / {APP_CONFIG.QUESTIONS.length}</span>
                <h3 style={{ fontSize: '1.4em', marginTop: '10px' }}>{currentQ?.q}</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {shuffledOptions.map((opt, i) => {
                    let btnStyle = {
                        padding: '16px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)',
                        border: '2px solid rgba(139, 92, 246, 0.2)', color: 'var(--text-main)',
                        fontWeight: 600, cursor: quiz.answered ? 'default' : 'pointer',
                        transition: 'all 0.2s', textAlign: 'center'
                    };

                    if (quiz.answered) {
                        if (opt === currentQ.a) {
                            btnStyle.background = 'rgba(16, 185, 129, 0.2)';
                            btnStyle.borderColor = 'var(--emerald-success)';
                            btnStyle.color = 'var(--emerald-success)';
                        } else {
                            btnStyle.background = 'rgba(239, 68, 68, 0.15)';
                            btnStyle.borderColor = 'var(--red-alert)';
                            btnStyle.color = 'var(--text-muted)';
                        }
                    }

                    return (
                        <button
                            key={i}
                            style={btnStyle}
                            onClick={() => !quiz.answered && answerQuestion(opt)}
                            onMouseEnter={(e) => {
                                if (!quiz.answered) {
                                    e.currentTarget.style.borderColor = 'var(--purple-light)';
                                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!quiz.answered) {
                                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                                }
                            }}
                        >
                            {opt}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
