import { useState, useEffect } from 'react';
import { Sparkles, Activity, Target, Brain, Scale, MessageSquare } from 'lucide-react';
import StarMap from '@/components/games/StarMap';
import RhythmGame from '@/components/games/RhythmGame';
import BubbleHunt from '@/components/games/BubbleHunt';
import QuizGame from '@/components/games/QuizGame';
import MemoryGame from '@/components/games/MemoryGame';
import CourtRoom from '@/components/games/CourtRoom';
import Comments from '@/components/Comments';

function useBackgroundEngine() {
  useEffect(() => {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    let bgs = [], w = 0, h = 0, rAF;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      bgs = Array.from({ length: 70 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5 + 0.5,
        a: Math.random(),
        d: (Math.random() - 0.5) * 0.012
      }));
    };

    const render = () => {
      if (!ctx) return;
      ctx.fillStyle = '#02040a';
      ctx.fillRect(0, 0, w, h);

      const g = ctx.createRadialGradient(w * 0.3, h * 0.4, 0, w * 0.3, h * 0.4, w * 0.4);
      g.addColorStop(0, 'rgba(139, 92, 246, 0.03)');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      ctx.beginPath();
      bgs.forEach(s => {
        s.a += s.d;
        if (s.a > 1 || s.a < 0.1) s.d *= -1;
        ctx.moveTo(s.x, s.y);
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 220, 255, ${Math.max(0, s.a)})`;
        ctx.fill();
      });
      rAF = requestAnimationFrame(render);
    };

    window.addEventListener('resize', resize);
    resize();
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rAF);
    };
  }, []);
}

export default function App() {
  const [activeTab, setActiveTab] = useState('star');
  useBackgroundEngine();

  const tabs = [
    { id: 'star', label: 'Yıldız Haritası', icon: <Sparkles size={16} /> },
    { id: 'rhy', label: 'Melodi', icon: <Activity size={16} /> },
    { id: 'bub', label: 'Av', icon: <Target size={16} /> },
    { id: 'qui', label: 'Test', icon: <Brain size={16} /> },
    { id: 'mem', label: 'Hafıza', icon: <Brain size={16} /> },
    { id: 'crt', label: 'Mahkeme', icon: <Scale size={16} /> },
    { id: 'cmt', label: 'Yorumlar', icon: <MessageSquare size={16} /> }
  ];

  return (
    <>
      <canvas id="bgCanvas"></canvas>
      <div className="container animate-fade-in">
        <header style={{ textAlign: 'center', padding: '28px 12px 8px' }}>
          <h1 className="text-gradient" style={{ fontSize: 'clamp(2em, 7vw, 3.5em)' }}>
            π Günü Portalı
          </h1>
          <p className="font-mono" style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            14 Mart • Sanat, Ritim ve Zekâ
          </p>
        </header>

        <nav className="tab-list">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </nav>

        <main>
          {activeTab === 'star' && <StarMap />}
          {activeTab === 'rhy' && <RhythmGame />}
          {activeTab === 'bub' && <BubbleHunt />}
          {activeTab === 'qui' && <QuizGame />}
          {activeTab === 'mem' && <MemoryGame />}
          {activeTab === 'crt' && <CourtRoom />}
          {activeTab === 'cmt' && <Comments />}
        </main>
      </div>
    </>
  );
}
