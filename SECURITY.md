# Security Policy

## Supported Versions

Security fixes are applied to the latest version on the `main` branch.

## Reporting a Vulnerability

Please do **not** publish credentials, API keys, private biological datasets, or exploitable security details in a public issue.

For a sensitive report, contact the repository owner privately through GitHub or the contact method listed on the maintainer's profile. Include:

- affected component or URL
- reproduction steps
- expected vs actual behavior
- security impact
- a minimal proof of concept where safe

Please allow reasonable time for assessment and remediation before public disclosure.

## Secret Handling

- Never commit API keys or tokens.
- Use `.env.example` only as a configuration template.
- Rotate a credential immediately if it is accidentally exposed.
- Do not upload patient data, identifiable human data, proprietary sequences, or other confidential biological data.

## Scientific Safety

MARGOTS is a research/educational software project. AI-generated output must not be treated as clinical advice, diagnostic evidence, or experimental validation.
