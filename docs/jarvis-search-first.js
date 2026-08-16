(() => {
  'use strict';
  const boot = () => {
    const form = document.getElementById('jarvisForm');
    const input = document.getElementById('jarvisInput');
    const readout = document.getElementById('jarvisReadout');
    if (!form || !input || !readout) return;

    const say = (html) => { readout.innerHTML = html; };
    const keysExist = () => ['gemini','groq','openrouter'].some(k => (localStorage.getItem('margots_' + k) || '').trim());
    const openKeys = () => {
      const button = document.getElementById('open_keys');
      if (button) button.click();
      else say('<strong>API setup required.</strong> Open the API Keys panel to continue.');
    };
    const isLocalCommand = q => /^(analy[sz]e|run|open agent|show history|system time|clear|reset|agent|history|time)\b/i.test(q);
    const sendToAgent = q => {
      const agentInput = document.querySelector('.agent-row input');
      if (!agentInput) { say('<strong>Agent workspace unavailable.</strong>'); return; }
      agentInput.value = q;
      agentInput.dispatchEvent(new Event('input', { bubbles: true }));
      const send = agentInput.parentElement?.querySelector('button');
      if (send) send.click();
      else say('<strong>Agent ready.</strong> Enter the question in the Agent workspace.');
    };

    // Capture before the existing JARVIS handler so every research question follows:
    // Google search -> API availability check -> Margots Agent.
    document.addEventListener('submit', (event) => {
      if (event.target !== form || form.dataset.searchFirstBypass === '1') return;
      const q = input.value.trim();
      if (!q || isLocalCommand(q)) return;
      event.preventDefault();
      event.stopImmediatePropagation();

      const googleUrl = 'https://www.google.com/search?q=' + encodeURIComponent(q);
      say('<strong>Step 1/2 — Web search.</strong> Opening Google for: ' + q.replace(/[<>]/g,'') + ' …');
      window.open(googleUrl, '_blank', 'noopener,noreferrer');

      window.setTimeout(() => {
        if (!keysExist()) {
          say('<strong>Step 2/2 — API required.</strong> Google search opened. Add at least one AI API key, then send the question again.');
          openKeys();
          return;
        }
        say('<strong>Step 2/2 — AI analysis.</strong> API available. Sending the question to the Margots Agent.');
        sendToAgent(q);
      }, 700);
      input.value = '';
    }, true);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
