import { useState } from 'react';
import { MessageSquare, User, Send, Check } from 'lucide-react';
import { StorageService } from '../../lib/store';

export default function Comments() {
    const [comments, setComments] = useState(() => StorageService.get('piCm', []));
    const [inputText, setInputText] = useState('');
    const [username, setUsername] = useState(() => StorageService.get('piUser', 'Misafir'));
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const newComment = {
            t: inputText.trim(),
            b: username || 'Misafir',
            d: `${new Date().getDate()}/${new Date().getMonth() + 1}`
        };

        const updatedComments = [...comments, newComment];
        StorageService.set('piCm', updatedComments);
        StorageService.set('piUser', username);
        setComments(updatedComments);
        setInputText('');

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    return (
        <div className="glass-panel animate-fade-in" style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: 'var(--purple-light)' }}>
                <MessageSquare size={24} /> Yorumlar ({comments.length})
            </h2>

            <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="İsminiz (opsiyonel)"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            maxLength={20}
                            style={{
                                width: '100%', padding: '10px 12px 10px 36px',
                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(139, 92, 246, 0.2)',
                                borderRadius: '8px', color: 'white', fontFamily: 'Outfit', outline: 'none'
                            }}
                        />
                    </div>
                </div>

                <textarea
                    placeholder="Pi Günü hakkında ne düşünüyorsun?"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    maxLength={150}
                    required
                    style={{
                        width: '100%', padding: '12px', minHeight: '80px',
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(139, 92, 246, 0.2)',
                        borderRadius: '8px', color: 'white', fontFamily: 'Outfit', resize: 'vertical',
                        outline: 'none', marginBottom: '12px'
                    }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8em', color: inputText.length >= 150 ? 'var(--red-alert)' : 'var(--text-muted)' }}>
                        {inputText.length}/150
                    </span>
                    <button type="submit" className="btn-primary" style={{ padding: '8px 20px' }}>
                        {showSuccess ? <Check size={16} /> : <Send size={16} />}
                        {showSuccess ? 'Gönderildi' : 'Gönder'}
                    </button>
                </div>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {comments.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>İlk yorumu sen yaz!</p>
                ) : (
                    comments.slice().reverse().slice(0, 50).map((c, i) => (
                        <div key={i} className="glass-card" style={{ padding: '16px', background: 'rgba(139, 92, 246, 0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <strong style={{ color: 'var(--pink-pop)', fontSize: '0.9em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <User size={14} /> {c.b}
                                </strong>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8em' }}>{c.d}</span>
                            </div>
                            <p style={{ lineHeight: '1.4', fontSize: '0.95em', wordBreak: 'break-word' }}>{c.t}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
