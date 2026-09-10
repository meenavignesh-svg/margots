(() => {
  'use strict';

  const ready = (fn) => document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', fn, { once: true })
    : fn();

  const decodeJwtPayload = (credential) => {
    try {
      const part = credential.split('.')[1];
      const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(decodeURIComponent(atob(base64).split('').map(c =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join('')));
    } catch (_) {
      return null;
    }
  };

  const loadGoogle = (cb) => {
    if (window.google?.accounts?.id) return cb();
    const existing = document.querySelector('script[data-google-identity]');
    if (existing) {
      existing.addEventListener('load', cb, { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = '1';
    script.onload = cb;
    document.head.appendChild(script);
  };

  const mount = () => {
    if (document.querySelector('#margots-google-login')) return;

    const clientId = String(window.MARGOTS_CONFIG?.GOOGLE_CLIENT_ID || '').trim();
    const host = document.querySelector('#cg-sidebar') || document.querySelector('#mx-shell');
    if (!host) return setTimeout(mount, 250);

    const box = document.createElement('div');
    box.id = 'margots-google-login';
    box.className = 'margots-google-login';
    box.innerHTML = `
      <div class="mgl-title">Account</div>
      <div class="mgl-user" id="mgl-user" hidden></div>
      <div id="mgl-button"></div>
      <button type="button" id="mgl-signout" class="mgl-signout" hidden>Sign out</button>
      ${clientId ? '' : '<small class="mgl-hint">Add GOOGLE_CLIENT_ID in config.js to enable Google sign-in.</small>'}
    `;
    host.appendChild(box);

    if (!clientId) return;

    const user = box.querySelector('#mgl-user');
    const button = box.querySelector('#mgl-button');
    const signout = box.querySelector('#mgl-signout');

    const showUser = (profile) => {
      if (!profile) return;
      user.hidden = false;
      user.innerHTML = `<img src="${String(profile.picture || '').replace(/"/g, '')}" alt=""><span>${String(profile.name || profile.email || 'Google user').replace(/[<>&]/g, '')}</span>`;
      button.hidden = true;
      signout.hidden = false;
    };

    const clearUser = () => {
      user.hidden = true;
      user.textContent = '';
      button.hidden = false;
      signout.hidden = true;
      try { google.accounts.id.disableAutoSelect(); } catch (_) {}
    };

    loadGoogle(() => {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          const profile = decodeJwtPayload(response.credential);
          if (!profile) return;
          sessionStorage.setItem('margots_google_user', JSON.stringify({
            sub: profile.sub,
            name: profile.name,
            email: profile.email,
            picture: profile.picture
          }));
          showUser(profile);
          window.dispatchEvent(new CustomEvent('margots:google-login', { detail: profile }));
        },
        auto_select: false,
        cancel_on_tap_outside: true
      });

      google.accounts.id.renderButton(button, {
        theme: 'filled_black',
        size: 'large',
        shape: 'pill',
        text: 'signin_with',
        width: 240
      });

      signout.addEventListener('click', () => {
        sessionStorage.removeItem('margots_google_user');
        clearUser();
        window.dispatchEvent(new CustomEvent('margots:google-logout'));
      });

      try {
        const saved = JSON.parse(sessionStorage.getItem('margots_google_user') || 'null');
        if (saved) showUser(saved);
      } catch (_) {}
    });
  };

  ready(mount);
})();
