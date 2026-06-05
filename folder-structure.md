Here's the folder structure for your GST litigation platform. Key points:
Root-level organization:

.claude — AI tooling (skills, rules, commands, agents) — we'll expand this once you approve
client — Next.js independent app (no shared deps)
server — Express.js API with /api and /services separation
docs — architecture docs (HLD, LLD, project description), tracking, UI-UX
resources — design files, UI templates, reference material

Backend detail (server/):

/api — route handlers & controllers
/services — business logic & domain services
/middleware — auth, validation, rate limiting
/models — Prisma schema + TS types
/utils — helpers, constants
/config — env, database, external service configs

This structure supports:

Complete separation of concerns
Independent package managers (no shared node_modules)
Clear AI context boundaries (everything .claude knows lives there)
Realistic backend organization for a consultation-gated, payment-handling platform