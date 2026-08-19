# Contributing to MARGOTS

Thank you for helping improve MARGOTS.

## Development principles

1. Prefer small, focused changes.
2. Keep deterministic bioinformatics calculations separate from AI/provider logic.
3. Validate and normalize biological input before analysis.
4. Never commit credentials or private biological data.
5. Document changes that could affect scientific interpretation.
6. Preserve accessibility, responsive behavior, and reduced-motion support.
7. Prefer reproducible, testable logic over UI-only workarounds.

## Before opening a pull request

- Test the affected workflow locally.
- Check browser console errors.
- Verify malformed/empty biological input is handled safely.
- Confirm API failures produce a useful user-facing state.
- Check that no secrets or personal data were introduced.
- Update documentation when behavior changes.

## Pull requests

A useful PR should explain:

- **Problem:** what was wrong or missing?
- **Change:** what was implemented?
- **Validation:** how was it tested?
- **Scientific impact:** does the change alter a calculation or interpretation?
- **Security/privacy:** does it change data or credential handling?

Keep PRs narrow enough to review confidently.
