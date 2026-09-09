# Install MARGOTS

MARGOTS is delivered as an installable Progressive Web App. The application shell is static; AI and server-backed analysis remain on the HTTPS MARGOTS API.

## Android / Chrome

1. Open the deployed MARGOTS HTTPS site in Chrome.
2. Use the browser menu and choose **Install app** or **Add to Home screen**.
3. Launch MARGOTS from the home screen.

## iPhone / iPad / Safari

1. Open the deployed MARGOTS HTTPS site in Safari.
2. Tap **Share**.
3. Choose **Add to Home Screen**.
4. Launch MARGOTS from the new icon.

iOS PWA behavior is governed by Safari; this is not an App Store native application.

## Windows / macOS / Linux

Use a current Chromium-based browser or another browser with PWA installation support. Open MARGOTS over HTTPS and select the browser's **Install MARGOTS** / **Install app** action when offered.

## Offline behavior

After the application has been opened online at least once, its static shell and PWA assets are cached. The app can open and navigate offline, but server-backed AI and analysis require a network connection. MARGOTS does not pretend to execute AI locally when disconnected.

## Developer note

PWA installation does not ship any provider credential. The browser receives only public frontend code and the public API endpoint. Private AI credentials remain on the backend deployment.
