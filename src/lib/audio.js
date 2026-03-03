// Web Audio API Wrapper
class AudioEngineClass {
    constructor() {
        this.actx = null;
        this.unlocked = false;
        this.NOTES = [261.63, 293.66, 329.63, 349.23, 392, 440, 493.88, 523.25, 587.33, 659.25];
        this.initAndUnlock = this.initAndUnlock.bind(this);

        // Attach single unlock listener
        if (typeof window !== 'undefined') {
            document.addEventListener('pointerdown', this.initAndUnlock, { once: true, passive: true });
            document.addEventListener('keydown', this.initAndUnlock, { once: true, passive: true });
        }
    }

    initAndUnlock() {
        if (this.unlocked) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            if (!this.actx) this.actx = new AudioContext();
            if (this.actx.state === 'suspended') this.actx.resume();
            const osc = this.actx.createOscillator();
            const gain = this.actx.createGain();
            gain.gain.value = 0.001;
            osc.connect(gain); gain.connect(this.actx.destination);
            osc.start(0); osc.stop(this.actx.currentTime + 0.001);
            this.unlocked = true;
        } catch {
            console.warn('AudioContext unlock failed');
        }
    }

    playNote(digit, duration = 0.25) {
        if (!this.unlocked || !this.actx) return;
        try {
            const osc = this.actx.createOscillator(), gain = this.actx.createGain(), filter = this.actx.createBiquadFilter();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(this.NOTES[digit], this.actx.currentTime);
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2200, this.actx.currentTime);
            osc.connect(filter); filter.connect(gain); gain.connect(this.actx.destination);
            gain.gain.setValueAtTime(0.16, this.actx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.actx.currentTime + duration);
            osc.start();
            osc.stop(this.actx.currentTime + duration);
        } catch { /* ignored */ }
    }

    playEffect(type) {
        if (!this.unlocked || !this.actx) return;
        try {
            const osc = this.actx.createOscillator(), gain = this.actx.createGain();
            osc.connect(gain); gain.connect(this.actx.destination);
            if (type === 'pop') {
                osc.frequency.setValueAtTime(600 + Math.random() * 400, this.actx.currentTime);
                osc.type = 'sine';
                gain.gain.setValueAtTime(0.08, this.actx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.actx.currentTime + 0.1);
                osc.start(); osc.stop(this.actx.currentTime + 0.1);
            } else if (type === 'buzz') {
                osc.frequency.setValueAtTime(180, this.actx.currentTime);
                osc.type = 'sawtooth';
                gain.gain.setValueAtTime(0.06, this.actx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.actx.currentTime + 0.15);
                osc.start(); osc.stop(this.actx.currentTime + 0.15);
            }
        } catch { /* ignored */ }
    }

    vibrate(ms) {
        try { if (navigator.vibrate) navigator.vibrate(ms); }
        catch { /* ignored */ }
    }
}

export const AudioEngine = new AudioEngineClass();
