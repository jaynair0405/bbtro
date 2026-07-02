# Graphify — Code-Graph Handover (CRTMS ecosystem)

> **For an AI assistant (e.g. Claude Code) reading this inside a repo:** this app has a
> prebuilt Graphify dependency graph in `graphify-out/`. To understand architecture,
> **prefer `graphify query "<question>"` over grepping raw files** — it is ~5× cheaper and
> already maps who-calls-what. Only run `/graphify .` to rebuild after a *structural* code
> change (new/renamed/removed files or modules, real refactors, new tables). The graph never
> auto-updates; rebuilds are deliberate.

This document records the Graphify setup, the conventions used, and a per-app reference for the
four apps in the CRTMS ecosystem on `crtms.in` (Central Railway, Mumbai Division). All four share
one MySQL database (`bbtro`); they do **not** import each other's code — they are linked only
through that shared DB and the Nginx reverse proxy.

---

## 1. What Graphify is and how it's installed

Graphify (CLI: `graphify`; PyPI package: `graphifyy` — note the double-y; v0.8.25 at setup) builds
a semantic dependency graph of a codebase. It was installed once per machine:

```bash
uv tool install graphifyy && graphify install
```

`graphify install` writes the skill to `~/.claude/skills/graphify/SKILL.md` and registers it in
`~/.claude/CLAUDE.md`, so the `/graphify` slash command works **inside Claude Code**. Running
through the Claude Code CLI uses the Claude subscription — **no separate API key needed**.

To upgrade later: `uv tool upgrade graphifyy && graphify install`.

Each build produces a `graphify-out/` folder containing:

- `graph.html` — interactive clickable graph (open in a browser)
- `GRAPH_REPORT.md` — plain-English audit report
- `graph.json` — raw queryable graph data
- `cache/` — lets the next rebuild re-process only the files that changed

---

## 2. The daily loop (all inside Claude Code)

- **Ask a question (cheap, no rebuild):** `graphify query "<your question>"`
- **Rebuild after a structural change:** `/graphify .` (incremental — only changed files re-extract)
- **Force a fully fresh rebuild:** delete `graphify-out/` first, then `/graphify .`

Steady state: code → deploy → if structure changed, `/graphify .` → `graphify query "..."` whenever
you want the map to answer something.

---

## 3. When to rebuild — and when not to

**Rebuild after:**
- Adding, removing, or renaming files / modules (a new route, service, parser)
- A real refactor that changes who-calls-what (moving functions, splitting modules)
- New DB tables — *only if* `schema.sql` is included in the graph (otherwise the table nodes are absent)

**Do NOT rebuild for:**
- Edits inside an existing function, bug fixes, comment/string tweaks
- Data changes (data is excluded from the graph by design)

Sensible cadence for this codebase: re-graph an app once a feature-sized change lands and is deployed
to `crtms.in` — not every keystroke.

---

## 4. The `.graphifyignore` philosophy (hard-won)

The `.graphifyignore` in each repo is the **source of truth** for what the graph sees. The goal is a
clean *architecture* map, so exclude everything that is noise, secret, or data. Lessons learned across
the four builds:

- **Always exclude:** virtualenvs (`venv/`, `.venv/`), `__pycache__/`, `*.pyc`, `.pytest_cache/`;
  secrets/tooling (`.env`, `.git/`, `.vscode/`, `.claude/`, `.DS_Store`); documentation noise (`*.md`,
  `docs/`); all data files (`*.csv`, `*.xlsx`, `*.xls`, `*.pdf`, `*.json`) and data folders
  (`base-data/`, `database/`, `reports/`, `sql/` or loose `*_data.sql` dumps).
- **Exclude legacy / vendored JS up front.** This was the single biggest noise source in SPM — a
  121 KB legacy Google Apps Script file (`general.js`) full of embedded reference arrays exploded into
  hundreds of junk 4-node communities. Pre-emptively exclude `*.min.js` and any legacy reference JS.
- **A large *application* file is fine to keep** even if it is huge (RTIS's `app.py` is 317 KB) — that is
  real architecture, not noise. The distinction is data/reference-array files vs. genuine logic.
- **Keep schema-only SQL for table linkage.** Exclude big data-dump `.sql` files (INSERT statements),
  but keep a clean DDL-only `schema.sql` (CREATE TABLE, no rows) so the graph surfaces *which `bbtro`
  tables the app touches*. This is the cross-app/database linkage view without building one unwieldy
  mega-graph.

---

## 5. Verify after every build (no data should leak)

After each build, confirm no data-file *content* entered the graph. From the app folder:

```bash
grep -oiE '[A-Za-z0-9_/. -]+\.(csv|xlsx|xls|pdf|sql)' graphify-out/graph.json | sort | uniq -c
```

How to read it:
- **Empty = totally clean.**
- **Filenames only** (e.g. `route_graph.csv` next to verbs like "load"/"import") = the code *referencing*
  a file by name — a mention, not the rows. This is expected and fine.
- **Must be absent:** any file that carries staff PII or bulk data content (e.g. the staff-name CSV/PDF in
  RTIS, or the `questions_data.sql` rows in counselling). A useful sanity check: `graph.json` should never
  be *larger* than a data file it supposedly absorbed.

---

## 6. Per-app reference

| App | Folder | Stack | Structural hub (god node) | Size (clean build) |
|-----|--------|-------|---------------------------|--------------------|
| **BBTRO** (main app) | main CRTMS repo | Node.js + MySQL | `div_staff_master` | — |
| **SPM analysis** | `spm analysis app` | Python | `PlatformEntryCalculator` | ~442 nodes / 40 communities (~24 meaningful) |
| **RTIS** | `rail-data-app` | Python | `get_db_connection()` (betweenness 0.271) | 641 nodes / 1,449 edges / 48 communities |
| **Counselling** ("CRTMS RUNSAFE") | `counselling-app` | Python / FastAPI (uvicorn, PM2) | `get_db_connection()` (betweenness 0.40 with schema) | 209 nodes / 379 edges / 16 communities |

**Cross-app pattern worth remembering:** both Python analysis apps pivot on `get_db_connection()` against
the shared `bbtro` DB. The graphs surfaced the real "hidden" glue each time — RTIS's DB layer implicitly
depends on the MySQL SSH-tunnel script (`start-ssh-tunnel.sh`); counselling has no login of its own and
reads BBTRO's Express-session table for auth (`get_current_user() → get_db_connection()`), bridging the
Python and Node stacks. With `schema.sql` included, counselling's graph shows it touching the
`div_runsafe_sessions` and `div_runsafe_answers` tables.

**Notable findings to act on later (optional):**
- RTIS: `get_current_user()` fans across 13 communities — auth is woven through everything.
- Counselling: `import_questions.main` ≈ `import_emu_questions.main` — two near-duplicate import scripts,
  a clean refactor candidate.

---

## 7. `.graphifyignore` files

The committed `.graphifyignore` in each repo is authoritative. Reproduced below are the two established
verbatim; for SPM and BBTRO, confirm against the file in the repo (BBTRO's is Node-oriented:
`node_modules/`, `.env`, `.git/`, build artifacts, `*.csv`/`*.xlsx`, etc.; SPM's is the Python template
below **plus** the legacy GAS files `general.js`, `overspeed.js`, `scriptjs.html`).

### RTIS — `rail-data-app/.graphifyignore`

```gitignore
# === Python environments & caches ===
venv/
.venv/
__pycache__/
*.pyc

# === Secrets & tooling ===
.env
.env.example
.git/
.claude/
.vscode/
.DS_Store

# === Documentation (heavy .md noise) ===
*.md
docs/
CHANGELOG.txt

# === Data folders ===
base-data/
database/
reports/
sql/

# === Data & media (incl. staff PII) ===
*.csv
*.xlsx
*.xls
*.pdf
*.json

# === Vendored / minified JS (pre-empt SPM-style noise) ===
*.min.js
```

### Counselling — `counselling-app/.graphifyignore`

Note: `*.sql` is **not** wildcarded here — the data dumps are excluded by name so the clean
`schema.sql` (DDL) stays in for table linkage.

```gitignore
# === Python environments & caches ===
venv/
.venv/
__pycache__/
*.pyc
.pytest_cache/

# === Secrets & tooling ===
.env
.git/
.vscode/
.claude/
.DS_Store

# === Documentation (.md noise) ===
*.md

# === SQL — keep schema.sql (DDL = table-linkage); exclude data dumps ===
categories_data.sql
subcategories_data.sql
questions_data.sql
CONCURRENCY_HARDENING.sql

# === Data & media (question banks etc.) ===
*.csv
*.xlsx
*.xls
*.pdf
*.json

# === Tests (optional — delete this line to include test coverage) ===
tests/

# === Vendored / minified JS ===
*.min.js
```

---

## 8. Git hygiene

- **Commit each `.graphifyignore`** so the rules travel with the repo and rebuilds stay reproducible.
- **Add `graphify-out/` to `.gitignore`** — it is large and fully regenerable; only the config should be
  versioned, not the generated graph.

---

## 9. Query cookbook

Run these inside Claude Code (or paste the question and say "use the graphify graph to answer").
The `query` path costs roughly a fifth of the tokens of reading the raw files. The **blast-radius**
and **trace-the-path** shapes are where the graph beats grepping by the widest margin — use them
before any refactor. If you've changed structure in the area you're asking about since the last
build, run `/graphify .` first so the answer isn't from stale wiring.

### BBTRO (Node.js) — hub `div_staff_master`

```bash
graphify query "What reads from and writes to div_staff_master, and what would break if its primary key changed?"
graphify query "Trace how a MEMU duty assignment flows from memu_day_patterns through to the JFO console."
graphify query "Where is realm/role-based access enforced across the suburban and division portals?"
graphify query "Which modules depend on the wheel-movement / duty-hours calculation logic?"
```

### SPM analysis (Python) — hub `PlatformEntryCalculator`

```bash
graphify query "What does PlatformEntryCalculator depend on, and which subsystems break if I change it?"
graphify query "Trace an SPM file from upload_spm_file() through parsing to halt detection and the final report."
graphify query "How do the Laxven, Medha, and TelPro parsers differ, and where do they converge?"
graphify query "Where is the legacy Apps Script logic (overspeed.js) still referenced by current Python code?"
```

### RTIS (`rail-data-app`, Python) — hub `get_db_connection()`

```bash
graphify query "Why does get_db_connection() bridge so many communities — what depends on it?"
graphify query "Trace a recorder file from parse_telpro through trip extraction and analysis to the generated PDF."
graphify query "Everywhere get_current_user() is used — which routes are auth-gated and which aren't?"
graphify query "What loads route_graph.csv and all_section_psr.csv, and which analysis functions consume that data?"
graphify query "Show the three lowest-cohesion communities and what they would split into."
```

### Counselling (`counselling-app`, FastAPI) — hub `get_db_connection()`

```bash
graphify query "Which functions read or write div_runsafe_sessions and div_runsafe_answers?"
graphify query "Trace a session from start_session() through generate_quiz() and evaluate_answers() to where the score is stored."
graphify query "Show the auth path from get_current_user() to the BBTRO Express-session table."
graphify query "What's duplicated between import_questions and import_emu_questions, and what would a merged loader look like?"
```

### Generic templates (swap in any function / table / feature)

```bash
graphify query "What's the blast radius if I change <function or table>?"
graphify query "Trace the call path from <entry point> to <target>."
graphify query "Which files would I need to touch to add <feature>?"
graphify query "What are the god nodes and how is the app partitioned into communities?"
```

---

*Setup completed across BBTRO, SPM, RTIS, and Counselling. All four mapped, verified clean, and
reproducible from their `.graphifyignore` files. To add the table-linkage view to RTIS as well, un-exclude
its schema-only SQL and rebuild.*
