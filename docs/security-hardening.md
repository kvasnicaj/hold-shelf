# Security design

This document describes the repository's application controls and contribution
requirements. It is not a statement about the configuration or release status of
any hosted instance.

## Authentication and access control

- Production authentication uses HTTPS with Secure, HttpOnly, SameSite cookies.
  Local HTTP development has separate origin configuration.
- Server-side handlers derive account identity from authenticated sessions or
  validated personal access tokens, then check ownership before accessing data.
- Public shares use revocable capabilities and a deliberately limited projection.
- Proxy-derived client identity is trusted only behind the configured ingress.

See [authentication](auth.md) for configuration and supported credential flows.

## Resource and content boundaries

- Request bodies are bounded before application deserialization.
- Account quotas apply at the database layer to saves, imports and cached content.
- External article fetches use URL, redirect and response-size guards.
- Reader content is sanitized, and human-readable CLI output excludes terminal
  control characters. JSON exports preserve original values through escaping.
- Navigation to the save handoff page requires explicit confirmation.

See [quota policy](security-quotas.md), [architecture](architecture.md) and the
[CLI guide](cli-guide.md) for the relevant interfaces.

## Browser and telemetry policy

The Worker applies browser response defenses and a private cache policy for
dynamic responses. Hashed static assets have a separate cache policy. When
changing response policies, preserve stricter route-specific controls and verify
OAuth, hydration, the reader and extension compatibility.

Telemetry uses an allowlisted diagnostic projection rather than raw request
content. Keep credentials, article text, private URLs and sharing capabilities out
of logs and telemetry. Test the complete SDK export path, including envelopes,
when changing collection or redaction behavior.

## Contribution requirements

- Never commit credentials, environment files, database exports, private user
  records or incident evidence. Use synthetic fixtures in tests.
- Keep vulnerability evidence, instance-specific findings and operational
  remediation plans in an access-controlled location outside the public repo.
- Public issues and documentation should not contain exploit payloads or private
  security reports. Coordinate sensitive reports privately with the maintainer.
- Security-sensitive changes need focused regressions and the repository's
  validation checks. CI includes secret scanning and release validation.
- Deployment owners must configure their own HTTPS, edge, cache, backup and access
  policies. Follow [deployment](deployment.md) rather than assuming source
  defaults establish the security of a hosted instance.
