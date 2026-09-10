(() => {
  'use strict';

  // BYOK security boundary: provider keys exist only in this page's memory.
  const keys = Object.create(null);
  const TIMEOUT_MS = 45000;
  const configured = String(window.MARGOTS_CONFIG?.API_BASE_URL || '').trim().replace(/\/$/, '');
  const API_BASE_URL = configured || (location.protocol === 'http:' || location.protocol === 'https:' ? location.origin : 'http://127.0.0.1:8000');

  const providers = {
    openai: {
      label: 'OpenAI', endpoint: 'https://api.openai.com/v1/chat/completions', defaultModel: 'gpt-5.6-luna',
      headers: key => ({ Authorization: `Bearer ${key}` }),
      body: (model, messages) => ({ model, messages, temperature: 0.2 }),
      extract: data => data?.choices?.[0]?.message?.content || ''
    },
    anthropic: {
      label: 'Anthropic', endpoint: 'https://api.anthropic.com/v1/messages', defaultModel: 'claude-sonnet-4-5',
      headers: key => ({ 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' }),
      body: (model, messages) => ({ model, max_tokens: 1800, system: messages.find(m => m.role === 'system')?.content || '', messages: messages.filter(m => m.role !== 'system') }),
      extract: data => Array.isArray(data?.content) ? data.content.filter(x => x.type === 'text').map(x => x.text).join('\n') : ''
    },
    xai: {
      label: 'xAI', endpoint: 'https://api.x.ai/v1/chat/completions', defaultModel: 'grok-4-1-fast-reasoning',
      headers: key => ({ Authorization: `Bearer ${key}` }),
      body: (model, messages) => ({ model, messages, temperature: 0.2 }),
      extract: data => data?.choices?.[0]?.message?.content || ''
    }
  };

  function validateKey(key) {
    if (!key || typeof key !== 'string' || key.trim().length < 8) throw new Error('Enter a valid API key.');
    if (key.length > 1000) throw new Error('API key is unexpectedly long.');
  }
  function setKey(provider, key) { validateKey(key); keys[provider] = key.trim(); }
  function clearKey(provider) { if (provider) delete keys[provider]; else Object.keys(keys).forEach(k => delete keys[k]); }
  function hasKey(provider) { return Boolean(keys[provider]); }

  async function providerChat(provider, messages, model) {
    const cfg = providers[provider];
    if (!cfg) throw new Error('Unsupported AI provider.');
    const key = keys[provider];
    if (!key) throw new Error(`No ${cfg.label} API key is loaded for this session.`);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(cfg.endpoint, { method:'POST', headers:{'Content-Type':'application/json',...cfg.headers(key)}, body:JSON.stringify(cfg.body(model || cfg.defaultModel,messages)), signal:controller.signal, cache:'no-store', credentials:'omit' });
      let data; try { data=await response.json(); } catch { throw new Error(`AI provider returned invalid JSON (HTTP ${response.status}).`); }
      if (!response.ok) throw new Error(data?.error?.message || data?.message || `AI provider request failed (HTTP ${response.status}).`);
      const text=cfg.extract(data); if(!text) throw new Error('AI provider returned no text.'); return text;
    } catch(error) {
      if(error.name==='AbortError') throw new Error('AI request timed out.');
      if(error instanceof TypeError) throw new Error(`${cfg.label} rejected the browser request or is unreachable. Check provider browser/CORS support.`);
      throw error;
    } finally { clearTimeout(timer); }
  }

  async function backendRequest(path, options={}) {
    if(!navigator.onLine) throw Object.assign(new Error('MARGOTS is offline.'),{code:'OFFLINE'});
    const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),options.timeout||TIMEOUT_MS);
    try {
      const response=await fetch(`${API_BASE_URL}${path}`,{...options,headers:{'Content-Type':'application/json',...(options.headers||{})},signal:controller.signal,credentials:'omit'});
      let payload; try {payload=await response.json();} catch {throw new Error(`MARGOTS backend returned invalid JSON (HTTP ${response.status}).`);}
      if(!response.ok||payload?.success===false){const e=payload?.error;throw Object.assign(new Error(e?.message||`Backend request failed (HTTP ${response.status}).`),{code:e?.code||`HTTP_${response.status}`,status:response.status});}
      return payload;
    } catch(error) {
      if(error.name==='AbortError') throw new Error('MARGOTS backend request timed out.');
      if(error instanceof TypeError) throw new Error('MARGOTS backend is unavailable.');
      throw error;
    } finally {clearTimeout(timer);}
  }

  function buildPrompt(request, deterministic) {
    return ['You are MARGOTS, a careful scientific bioinformatics assistant.','Use the deterministic analysis below as the primary factual input. Do not invent experimental results, database evidence, citations, clinical conclusions, or measurements.','Clearly distinguish calculation, interpretation, hypothesis, and evidence needed to verify a claim.',`TASK: ${request.question || request.context || request.variant || 'Interpret the supplied biological analysis.'}`,`MODE: ${request.mode}`,`INPUT: ${request.sequence || request.variant || request.text || request.context || ''}`,`DETERMINISTIC ANALYSIS: ${JSON.stringify(deterministic || {},null,2)}`].join('\n\n');
  }
  async function analyzeWithAI(provider, model, request, deterministic) {
    return providerChat(provider,[{role:'system',content:'Return concise, scientifically cautious Markdown. Never claim that an AI interpretation is experimental or clinical validation.'},{role:'user',content:buildPrompt(request,deterministic)}],model);
  }

  window.MargotsAPI={
    baseUrl:API_BASE_URL,providers,setKey,clearKey,hasKey,chat:providerChat,analyzeWithAI,
    health:()=>backendRequest('/health',{method:'GET'}),
    analyze:body=>backendRequest('/api/analyze',{method:'POST',body:JSON.stringify(body)}),
    ask:(question,context='')=>backendRequest('/api/ask',{method:'POST',body:JSON.stringify({question,context})}),
    search:query=>backendRequest('/api/search',{method:'POST',body:JSON.stringify({query})})
  };

  window.addEventListener('pagehide',()=>clearKey());
  const manifest=document.createElement('link');manifest.rel='manifest';manifest.href='manifest.webmanifest';document.head.appendChild(manifest);
  const theme=document.createElement('meta');theme.name='theme-color';theme.content='#f7faff';document.head.appendChild(theme);
  const appleIcon=document.createElement('link');appleIcon.rel='apple-touch-icon';appleIcon.href='icon.svg';document.head.appendChild(appleIcon);
  if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1'))window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js',{scope:'./'}).catch(()=>{}));
  function connectivity(){window.dispatchEvent(new CustomEvent('margots:connectivity',{detail:{online:navigator.onLine}}));}
  window.addEventListener('online',connectivity);window.addEventListener('offline',connectivity);
})();
