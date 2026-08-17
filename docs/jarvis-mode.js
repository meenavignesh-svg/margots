(() => {
  'use strict';
  const input = document.getElementById('input');
  const mic = document.getElementById('mic');
  const status = document.getElementById('status');
  if (!input || !mic) return;

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let speaking = false;

  function say(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const clean = String(text).replace(/https?:\/\/\S+/g, '').slice(0, 700);
    if (!clean.trim()) return;
    const u = new SpeechSynthesisUtterance(clean);
    u.rate = 1.02;
    u.pitch = 0.95;
    u.volume = 0.9;
    window.speechSynthesis.speak(u);
  }

  function listen() {
    if (!SR) {
      status && (status.textContent = '● VOICE UNSUPPORTED');
      return;
    }
    if (recognition) {
      recognition.stop();
      recognition = null;
      return;
    }
    recognition = new SR();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => { if (status) status.textContent = '● LISTENING'; mic.classList.add('active'); };
    recognition.onresult = e => {
      input.value = e.results[0][0].transcript;
      input.dispatchEvent(new Event('input'));
      input.focus();
      const form = document.getElementById('form');
      if (form) form.requestSubmit();
    };
    recognition.onerror = () => { if (status) status.textContent = '● READY'; };
    recognition.onend = () => { recognition = null; mic.classList.remove('active'); if (status) status.textContent = '● READY'; };
    recognition.start();
  }

  mic.addEventListener('click', listen);

  // Public hook: Margots can call this after receiving an assistant message.
  window.MargotsJarvis = {
    speak: say,
    listen,
    stopSpeaking: () => window.speechSynthesis?.cancel(),
    toggleSpeaking: () => { speaking = !speaking; return speaking; }
  };
})();