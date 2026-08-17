# Margots + J.A.R.V.I.S integration

Margots now includes a browser-safe Jarvis command bridge at `docs/jarvis-bridge.js`.

## Integrated ideas

The bridge brings the Jarvis-style command model into Margots:

- `search <query>` → Google search
- `open youtube`
- `open github`
- `open wikipedia`
- `open reddit`
- `open google`

It exposes `window.MargotsJarvis` so the unified Margots chat can route commands through the same interface.

## What cannot run directly in GitHub Pages

The original Jarvis project contains Python desktop automation such as application control, scrolling/tab automation, computer vision, WhatsApp automation, speech engines and OS-level actions. Those require a local Python runtime or a controlled backend; a browser page cannot safely execute arbitrary desktop commands.

The intended architecture is:

```text
Margots unified chat
        ↓
Jarvis-style intent router
        ├── web/search actions → browser-safe bridge
        ├── bioinformatics → Margots tools
        └── desktop actions → optional local Jarvis runtime
```

Source project: `https://github.com/meenavignesh-svg/jarvis-ai-assistant`
