#!/usr/bin/env node
/**
 * convert_routes.js
 *
 * One-time converter:
 *   CSV (each row = ordered station sequence) -> routes.json
 *
 * Handles:
 * - Trim empty cells
 * - Canonicalize JNPT-complex aliases: BMCT/NSPT/NSCIT -> JNPT
 * - Expand fork token: TKW/NNCN -> 2 variants
 * - Generic rule: slash-token whose parts all canonicalize to same station => collapse
 * - Deduplicate identical station sequences
 *
 * Usage:
 *   node convert_routes.js /path/to/lrd_beats_combined.csv /path/to/routes.json
 *
 * Example:
 *   node convert_routes.js ./lrd_beats_combined.csv ./data/routes.json
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ALIAS_MAP = {
  // JNPT complex aliases
  BMCT: "JNPT",
  NSPT: "JNPT",
  NSCIT: "JNPT",
  // BPCL area sidings - collapse to BPCL
  DRT: "BPCL",
  HSD: "BPCL",
};

const FORK_MAP = {
  // Distinct physical stations -> expand
  "TKW/NNCN": ["TKW", "NNCN"],
};

// Office exclusions - sections that each office does NOT work
const OFFICE_EXCLUSIONS = {
  PNVL: {
    description: "PNVL staff do NOT work these sections",
    excluded_segments: [
      { from: "KYN", to: "IGP", note: "IGP corridor" },
      { from: "KYN", to: "LNL", note: "BVT/LNL corridor" },
      { from: "KYN", to: "BVT", note: "BVT corridor" },
      { from: "DIVA", to: "TAPG", note: "Suburban" },
      { from: "DIVA", to: "TMBY", note: "Suburban" },
      { from: "DIVA", to: "LTT", note: "Suburban" },
      { from: "DIVA", to: "CSMT", note: "Mainline" },
      { from: "DIVA", to: "VDLR", note: "Suburban" },
      { from: "CLA", to: "CSMT", note: "Mainline" },
      { from: "CLA", to: "TMBY", note: "Suburban" }
    ]
  },
  KYN: {
    description: "KYN staff do NOT work these sections",
    excluded_segments: [
      { from: "PNVL", to: "ROHA", note: "Konkan south" },
      { from: "PNVL", to: "TVSG", note: "Konkan south" },
      { from: "PNVL", to: "JNPT", note: "JNPT corridor (includes BMCT/NSPT/NSCIT)" },
      { from: "PNVL", to: "BPCL", note: "BPCL siding" },
      { from: "PNVL", to: "DRT", note: "DRT siding" },
      { from: "PNVL", to: "HSD", note: "HSD siding" },
      { from: "PNVL", to: "KJT", note: "Harbour line section" },
      { from: "PNVL", to: "DPL", note: "Harbour line" },
      { from: "DPL", to: "JNPT", note: "JNPT branch" }
    ]
  }
};

function sha256File(filepath) {
  const buf = fs.readFileSync(filepath);
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function canon(stn) {
  if (!stn) return stn;
  const s = String(stn).trim().toUpperCase();
  return ALIAS_MAP[s] ?? s;
}

function parseCsvLine(line) {
  // Your CSV seems simple (no quoted commas). If later needed, replace with a CSV lib.
  return line.split(",").map((c) => c.trim());
}

function normalizeRow(rawCells) {
  // drop empties at end + within
  const cells = rawCells.map((c) => (c ? c.trim() : "")).filter((c) => c.length > 0);
  // canonicalize aliases now (but keep fork tokens as-is for expansion)
  return cells.map((token) => {
    // If token is a fork token exactly, keep as-is
    if (FORK_MAP[token]) return token;

    // If token includes '/', it may be alias bundle like JNPT/BMCT/NSPT/NSCIT
    if (token.includes("/")) {
      const parts = token.split("/").map((p) => canon(p));
      const uniq = [...new Set(parts)];
      // If all parts canonicalize to same station, collapse to that canonical station
      if (uniq.length === 1) return uniq[0];
      // Otherwise leave as-is (it will be treated as a fork later only if present in FORK_MAP)
      return token;
    }

    return canon(token);
  });
}

function expandForks(tokens) {
  // Expand only known forks in FORK_MAP; any other slash-token is left untouched (and will likely fail validation)
  let variants = [{ tokens: [], picked: [] }];

  for (const t of tokens) {
    if (FORK_MAP[t]) {
      const opts = FORK_MAP[t];
      const next = [];
      for (const v of variants) {
        for (const opt of opts) {
          next.push({
            tokens: [...v.tokens, opt],
            picked: [...v.picked, opt], // for route_id suffix
          });
        }
      }
      variants = next;
    } else {
      variants = variants.map((v) => ({ tokens: [...v.tokens, t], picked: v.picked }));
    }
  }

  return variants;
}

function dedupeConsecutive(stations) {
  const out = [];
  for (const s of stations) {
    if (out.length === 0 || out[out.length - 1] !== s) out.push(s);
  }
  return out;
}

function validateStations(stations, context) {
  if (stations.length < 2) {
    throw new Error(`Invalid route (<2 stations) at ${context}`);
  }
  for (const s of stations) {
    if (!s || typeof s !== "string") {
      throw new Error(`Invalid station token '${s}' at ${context}`);
    }
    if (s.includes("/")) {
      throw new Error(
        `Unresolved slash-token '${s}' at ${context}. Add it to FORK_MAP or make it an alias-collapsible token.`
      );
    }
  }
}

function routeIdBase(from, to) {
  return `${from}_${to}`;
}

function routeIdWithVariant(base, picked) {
  if (!picked || picked.length === 0) return base;
  // If multiple forks ever appear, join them.
  return `${base}__${picked.join("_")}`;
}

function signature(stations) {
  return stations.join(">");
}

function main() {
  const inCsv = process.argv[2];
  const outJson = process.argv[3];

  if (!inCsv || !outJson) {
    console.error("Usage: node convert_routes.js <input.csv> <output.json>");
    process.exit(1);
  }

  const csvText = fs.readFileSync(inCsv, "utf8");
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const routes = [];
  const seenSig = new Map(); // signature -> route_id

  for (let idx = 0; idx < lines.length; idx++) {
    const raw = parseCsvLine(lines[idx]);
    const normalized = normalizeRow(raw);

    const expanded = expandForks(normalized);
    for (const v of expanded) {
      const stations = dedupeConsecutive(v.tokens.map(canon)); // canonicalize again (safe)
      const from = stations[0];
      const to = stations[stations.length - 1];

      const base = routeIdBase(from, to);
      const rid = routeIdWithVariant(base, v.picked.length ? v.picked : null);

      validateStations(stations, `line ${idx + 1} (${rid})`);

      const sig = signature(stations);
      if (seenSig.has(sig)) {
        // Exact duplicate route; skip
        continue;
      }
      seenSig.set(sig, rid);

      routes.push({
        route_id: rid,
        from,
        to,
        variant: v.picked.length ? v.picked.join("_") : null,
        stations,
        station_count: stations.length,
      });
    }
  }

  // Sort for stable diffs
  routes.sort((a, b) => a.route_id.localeCompare(b.route_id));

  const out = {
    schema_version: 1,
    meta: {
      generated_from: path.basename(inCsv),
      generated_on: new Date().toISOString(),
      source_sha256: sha256File(inCsv),
      notes: [
        "CSV rows interpreted as ordered station sequences",
        "Aliases canonicalized: BMCT/NSPT/NSCIT -> JNPT",
        "Fork expanded: TKW/NNCN -> two route variants",
        "Routes deduplicated by exact station sequence",
      ],
    },
    aliases: { ...ALIAS_MAP },
    forks: { ...FORK_MAP },
    office_exclusions: OFFICE_EXCLUSIONS,
    routes,
  };

  fs.writeFileSync(outJson, JSON.stringify(out, null, 2), "utf8");
  console.log(`Wrote ${routes.length} routes -> ${outJson}`);
}

main();
