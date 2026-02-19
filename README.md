# master-be

## Security notes (rate limiting + client IP)

### Never commit secrets

- Keep your real secrets in `.env` (ignored by git).
- Use `.env.example` for placeholders and documentation.

### IPv6-safe rate limiting

This project uses `express-rate-limit`. If you provide a custom `keyGenerator`, **do not** use `req.ip` directly for the fallback key.

- The API-key limiter fallback uses `ipKeyGenerator(req)` in `src/middleware/rateLimiter.ts` to avoid IPv6-related bypasses that can happen with raw IP strings.

### Proxy-aware client IP (`trust proxy`)

Client IP detection (and therefore rate limiting) depends on whether the app is behind a reverse proxy/load balancer.

This project sets Express `trust proxy` from `TRUST_PROXY` in `src/server.ts`.

Suggested values:

- `TRUST_PROXY=false` (default): direct-to-node / no reverse proxy
- `TRUST_PROXY=1`: common setups with exactly one proxy (nginx, Render, Railway, ELB/ALB)
- `TRUST_PROXY=2` (or more): multiple proxy hops

Important: enabling `trust proxy` when you *shouldn't* can allow clients to spoof IPs via `X-Forwarded-For`, weakening rate limiting.

