import { useState, useEffect, useRef } from 'react';
import { Star, Download, Play, Palette, Network } from 'lucide-react';
import { store, useStore, APP_CONFIG } from '@/lib/store';
import { AudioEngine } from '@/lib/audio';

const PALETTES = [
    ['#c084fc', '#ec4899', '#fbbf24', '#06d6a0', '#7c3aed', '#f97316', '#60a5fa', '#34d399', '#f87171', '#e2e8f0'],
    ['#f87171', '#fb923c', '#ef4444', '#fcd34d', '#4ade80', '#60a5fa', '#ffffff', '#22c55e', '#f97316', '#e2e8f0'],
    ['#06d6a0', '#34d399', '#67e8f9', '#059669', '#c084fc', '#60a5fa', '#475569', '#94a3b8', '#3b82f6', '#e2e8f0']
];

export default function StarMap() {
    const [starMap, updateStarMap] = useStore('starMap');
    const [dateStr, setDateStr] = useState('');
    const canvasRef = useRef(null);

    const getDigits = (dateVal) => {
        const p = dateVal.split('-');
        const sd = ((parseInt(p[2]) * 31 + parseInt(p[1]) * 397 + parseInt(p[0]) * 7919) % 99991) + 1;
        const off = sd % APP_CONFIG.PI_DIGITS.length;
        const arr = [...(p[2] + p[1]).split('').map(Number)];
        for (let i = 0; i < 76; i++) arr.push(APP_CONFIG.PI_DIGITS[(off + i) % APP_CONFIG.PI_DIGITS.length]);
        return { seed: sd, arr };
    };

    const handleCreate = () => {
        if (!dateStr) return; // Add a toast here
        const { seed, arr } = getDigits(dateStr);
        updateStarMap({ active: true, seed, digits: arr, anim: true, frame: 0 });

        const loop = () => {
            const st = store.get('starMap');
            if (!st.anim) return;
            updateStarMap({ frame: st.frame + 1 });
            if (st.frame % 3 === 0) AudioEngine.playNote(APP_CONFIG.PI_DIGITS[st.frame % 10], 0.05);
            if (st.frame <= st.digits.length) {
                requestAnimationFrame(loop);
            } else {
                updateStarMap({ anim: false });
            }
        };
        loop();
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const render = () => {
            const st = store.get('starMap');
            const rect = canvas.parentElement.getBoundingClientRect();
            const w = rect.width, h = rect.height;
            const dpr = window.devicePixelRatio || 1;

            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            ctx.scale(dpr, dpr);

            const bg = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.5, w * 0.55);
            bg.addColorStop(0, '#0c0a1e'); bg.addColorStop(0.6, '#060510'); bg.addColorStop(1, '#020308');
            ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

            if (!st.active) {
                ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.font = "600 18px 'Outfit'"; ctx.textAlign = 'center';
                ctx.fillText('Yıldız Haritan Burada', w / 2, h / 2 - 8);
                ctx.font = "14px 'Outfit'"; ctx.fillStyle = 'rgba(255,255,255,.04)'; ctx.fillText('Doğum tarihini gir', w / 2, h / 2 + 16);
                return;
            }

            const th = PALETTES[st.theme % 3], cx2 = w / 2, cy = h / 2, R = Math.min(w, h) * 0.36, sP = [];
            for (let i = 0; i < 10; i++) {
                const a = -Math.PI / 2 + i * Math.PI * 2 / 10;
                sP.push({ x: cx2 + Math.cos(a) * R, y: cy + Math.sin(a) * R });
            }

            const dc = st.anim ? Math.min(st.frame, st.digits.length) : st.digits.length;
            if (st.lines && dc > 1) {
                for (let i = 1; i < dc; i++) {
                    const f = st.digits[i - 1], t = st.digits[i], a2 = sP[f], b = sP[t];
                    const lg = ctx.createLinearGradient(a2.x, a2.y, b.x, b.y);
                    lg.addColorStop(0, th[f] + '66'); lg.addColorStop(1, th[t] + '66');
                    ctx.beginPath(); ctx.moveTo(a2.x, a2.y); ctx.lineTo(b.x, b.y); ctx.strokeStyle = lg; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.04 + i / dc * 0.3; ctx.stroke(); ctx.globalAlpha = 1;
                }
            }

            sP.forEach((p, i) => {
                const r = 7 + i * 0.4, c = th[i];
                ctx.fillStyle = c + '40'; ctx.beginPath(); ctx.arc(p.x, p.y, r * 4.5, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = c; ctx.beginPath(); ctx.arc(p.x, p.y, r * 1.8, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p.x, p.y, r * 0.5, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = c + '33'; ctx.lineWidth = 0.5;
                ctx.beginPath(); ctx.moveTo(p.x - r * 2.5, p.y); ctx.lineTo(p.x + r * 2.5, p.y); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(p.x, p.y - r * 2.5); ctx.lineTo(p.x, p.y + r * 2.5); ctx.stroke();
                ctx.fillStyle = '#e2e8f0'; ctx.font = "bold 13px 'Space Mono'"; ctx.textAlign = 'center'; ctx.fillText(i, p.x, p.y - r * 2.5 - 3);
            });
            ctx.fillStyle = 'rgba(192,132,252,.12)'; ctx.font = "800 48px 'Outfit'"; ctx.textAlign = 'center'; ctx.fillText('π', cx2, cy + 12);
        };

        render();
        const handleResize = () => render();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [starMap.active, starMap.frame, starMap.theme, starMap.lines, starMap.digits]);

    return (
        <div className="glass-panel animate-fade-in" style={{ padding: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.4em', marginBottom: '10px' }}><Star className="inline-icon" /> Kişisel Pi Yıldız Haritası</h2>
                <p style={{ color: 'var(--text-muted)' }}>Doğum tarihini gir, senin Pi desenini çizelim.</p>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '16px 0' }}>
                    <input
                        type="date"
                        value={dateStr}
                        onChange={(e) => setDateStr(e.target.value)}
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            color: 'white',
                            padding: '10px 16px',
                            borderRadius: '12px',
                            fontFamily: 'Space Mono',
                            outline: 'none'
                        }}
                    />
                    <button className="btn-primary" onClick={handleCreate}>Oluştur</button>
                </div>
            </div>

            <div style={{ position: 'relative', width: '100%', height: '400px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(139, 92, 246, 0.1)' }}>
                <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
            </div>

            {starMap.active && (
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '16px' }}>
                    <button className="btn-icon" onClick={() => updateStarMap({ anim: true, frame: 0 })} title="Yeniden Oynat"><Play size={18} /></button>
                    <button className="btn-icon" onClick={() => updateStarMap({ lines: !starMap.lines })} title="Çizgileri Aç/Kapat"><Network size={18} /></button>
                    <button className="btn-icon" onClick={() => updateStarMap({ theme: starMap.theme + 1 })} title="Tema Değiştir"><Palette size={18} /></button>
                    <button className="btn-icon" onClick={() => {
                        const a = document.createElement('a'); a.download = 'pi_yildiz.png'; a.href = canvasRef.current.toDataURL(); a.click();
                    }} title="İndir"><Download size={18} /></button>
                </div>
            )}
        </div>
    );
}
