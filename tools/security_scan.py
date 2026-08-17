"""Small dependency-free secret-pattern scanner for Margots source files.
This is a guardrail, not a replacement for GitHub secret scanning.
"""
from pathlib import Path
import re, sys

ROOT = Path(__file__).resolve().parents[1]
SKIP = {'.git', 'node_modules', '.venv', '__pycache__'}
PATTERNS = [
    re.compile(r'(?i)(api[_-]?key|secret|token|password)\s*[:=]\s*["\'][A-Za-z0-9_\-]{20,}["\']'),
    re.compile(r'(?i)sk-[A-Za-z0-9]{20,}'),
    re.compile(r'(?i)AIza[A-Za-z0-9_\-]{20,}'),
    re.compile(r'(?i)gh[pousr]_[A-Za-z0-9_]{20,}'),
]

ALLOW = {'tools/security_scan.py'}
TEXT_EXT = {'.js','.html','.css','.py','.json','.yml','.yaml','.md','.txt','.toml','.env','.example'}

def main():
    hits=[]
    for p in ROOT.rglob('*'):
        if not p.is_file() or p.suffix.lower() not in TEXT_EXT or any(part in SKIP for part in p.parts):
            continue
        rel=p.relative_to(ROOT).as_posix()
        if rel in ALLOW: continue
        try: text=p.read_text(encoding='utf-8',errors='ignore')
        except OSError: continue
        for n,line in enumerate(text.splitlines(),1):
            if any(rx.search(line) for rx in PATTERNS): hits.append(f'{rel}:{n}')
    if hits:
        print('Potential credential patterns found:')
        print('\n'.join(hits))
        return 1
    print('No high-confidence credential patterns found.')
    return 0

if __name__ == '__main__': sys.exit(main())
