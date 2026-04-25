/**
 * PEP Audio — small TTS + SFX helper.
 *
 * Strictly offline: uses window.speechSynthesis for narration and the
 * WebAudio API to synthesize short SFX on the fly (no base64 assets).
 * Honors PEP.getState().settings.muted.
 *
 * Public API:
 *   PEPAudio.speak(text, opts)   - opts: { rate, pitch, voice, lang }
 *   PEPAudio.cancel()             - stop current utterance
 *   PEPAudio.sfx(kind)           - 'correct'|'wrong'|'levelup'|'badge'|'click'|'flip'|'swoosh'|'pop'|'tick'
 *   PEPAudio.preferred()         - currently chosen voice (or null)
 *   PEPAudio.isMuted()           - bool from state
 */
(function (global) {
  let _ctx = null;
  function getCtx() {
    if (_ctx) return _ctx;
    try { _ctx = new (global.AudioContext || global.webkitAudioContext)(); } catch(_) { _ctx = null; }
    return _ctx;
  }

  function isMuted() {
    try { return !!(global.PEP && global.PEP.getState().settings.muted); } catch(_) { return false; }
  }

  // ----- TTS ---------------------------------------------------------------

  let _voices = [];
  let _preferredVoice = null;

  function loadVoices() {
    if (!global.speechSynthesis) return;
    _voices = global.speechSynthesis.getVoices() || [];
    // Prefer a child-friendly English voice if possible.
    const preferOrder = [
      v => /child|kid/i.test(v.name),
      v => /female/i.test(v.name) && /en/i.test(v.lang),
      v => /samantha|google.*us|google.*uk/i.test(v.name),
      v => /^en/i.test(v.lang)
    ];
    for (const pred of preferOrder) {
      const found = _voices.find(pred);
      if (found) { _preferredVoice = found; break; }
    }
  }

  if (global.speechSynthesis) {
    loadVoices();
    global.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
  }

  function speak(text, opts) {
    if (!text || !global.speechSynthesis) return;
    if (isMuted()) return;
    const o = opts || {};
    try {
      global.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text));
      u.rate  = o.rate  ?? 0.95;
      u.pitch = o.pitch ?? 1.1;
      u.lang  = o.lang  || 'en-US';
      const voice = o.voice || _preferredVoice;
      if (voice) u.voice = voice;
      global.speechSynthesis.speak(u);
    } catch(e) { /* ignore */ }
  }

  function cancel() {
    try { global.speechSynthesis && global.speechSynthesis.cancel(); } catch(_){}
  }

  // ----- SFX ---------------------------------------------------------------

  /**
   * Schedule a tiny tone at offset t (seconds from now).
   * env: { freq, dur, type='sine', startGain=0.18, attack=0.005, release=0.12 }
   */
  function tone(ctx, t, env) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = env.type || 'sine';
    o.frequency.value = env.freq;
    if (env.glide) {
      o.frequency.setValueAtTime(env.freq, ctx.currentTime + t);
      o.frequency.linearRampToValueAtTime(env.glide, ctx.currentTime + t + env.dur);
    }
    g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
    g.gain.exponentialRampToValueAtTime(env.startGain ?? 0.18, ctx.currentTime + t + (env.attack ?? 0.005));
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + env.dur);
    o.connect(g); g.connect(ctx.destination);
    o.start(ctx.currentTime + t);
    o.stop(ctx.currentTime + t + env.dur + 0.02);
  }

  function sfx(kind) {
    if (isMuted()) return;
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch(_){} }

    switch (kind) {
      case 'correct':
        tone(ctx, 0.00, { freq: 660, dur: 0.10, type: 'triangle' });
        tone(ctx, 0.09, { freq: 880, dur: 0.14, type: 'triangle' });
        tone(ctx, 0.20, { freq: 1320, dur: 0.18, type: 'triangle' });
        break;
      case 'wrong':
        tone(ctx, 0.00, { freq: 220, dur: 0.20, type: 'square', startGain: 0.10, glide: 110 });
        break;
      case 'levelup':
        tone(ctx, 0.00, { freq: 523, dur: 0.12, type: 'triangle' });
        tone(ctx, 0.10, { freq: 659, dur: 0.12, type: 'triangle' });
        tone(ctx, 0.20, { freq: 784, dur: 0.12, type: 'triangle' });
        tone(ctx, 0.32, { freq: 1047, dur: 0.32, type: 'triangle' });
        break;
      case 'badge':
        tone(ctx, 0.00, { freq: 988, dur: 0.10, type: 'triangle' });
        tone(ctx, 0.10, { freq: 1319, dur: 0.20, type: 'triangle' });
        tone(ctx, 0.30, { freq: 1568, dur: 0.30, type: 'triangle' });
        break;
      case 'click':
        tone(ctx, 0.00, { freq: 1500, dur: 0.04, type: 'square', startGain: 0.06 });
        break;
      case 'flip':
        tone(ctx, 0.00, { freq: 520, dur: 0.05, type: 'triangle' });
        tone(ctx, 0.05, { freq: 720, dur: 0.05, type: 'triangle' });
        break;
      case 'swoosh':
        tone(ctx, 0.00, { freq: 200, dur: 0.18, type: 'sawtooth', startGain: 0.06, glide: 800 });
        break;
      case 'pop':
        tone(ctx, 0.00, { freq: 880, dur: 0.07, type: 'sine', glide: 440 });
        break;
      case 'tick':
        tone(ctx, 0.00, { freq: 1800, dur: 0.025, type: 'square', startGain: 0.04 });
        break;
      default:
        tone(ctx, 0.00, { freq: 440, dur: 0.10, type: 'sine' });
    }
  }

  global.PEPAudio = {
    speak, cancel, sfx,
    preferred: () => _preferredVoice,
    isMuted
  };
})(window);
