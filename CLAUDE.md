## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- ALWAYS read graphify-out/GRAPH_REPORT.md before reading any source files, running grep/glob searches, or answering codebase questions. The graph is your primary map of the codebase.
- IF graphify-out/wiki/index.md EXISTS, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- YOU (the agent) are responsible for keeping the graph current — the user should never have to ask. After finishing an edit or a batch of related edits to code, proactively run `graphify update .` (AST-only, local, free, instant) before ending your turn.
- After a change that touches docs, architecture, or introduces new concepts (not just code structure), proactively run the full `/graphify --update` pipeline (semantic re-extraction) so community labels and concept nodes stay accurate — do this at the end of the task, not mid-edit.
- Note: `graphify hook install`'s git post-commit hook also runs an AST-only rebuild automatically, which can reset hand-labeled community names back to generic ones. If that happens, re-run `/graphify --update` to restore semantic labels — don't leave the report in a degraded state.
