// Regenerate the KYN-CSMT corridor of the LRD SVG map in ctr-management.html:
// through lines (MBQ/KLVA) + a parallel 5th/6th pair (PSK, NGSM, TAPG branch),
// with every real station (BND, VK, SION, MTN added) so coverage pairs colour.
const fs = require("fs");
process.chdir("/Users/neeraja/bbtro");
const f = "public/div/ctr-management.html";
let html = fs.readFileSync(f, "utf8");

const start = html.indexOf('                        <!-- KYN to CSMT corridor.');
const endMarker = '                        <!-- DIVA hub overlay (rendered last to appear on top of lines) -->';
const end = html.indexOf(endMarker);
if (start < 0 || end < 0 || end < start) throw new Error("corridor block not found");

// ---- geometry helpers
const r1 = (v) => Math.round(v * 10) / 10;
function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
function unit(a, b) { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy); return [dx / L, dy / L]; }
// normal pointing to the lower-right of a line running down-left
function normal(a, b) { const [ux, uy] = unit(a, b); let n = [uy, -ux]; if (n[0] + n[1] < 0) n = [-n[0], -n[1]]; return n; }
function off(p, n, k) { return [r1(p[0] + n[0] * k), r1(p[1] + n[1] * k)]; }
const REVIEW = true; // 5th/6th lines: light slate dashed base look (lobby, 2026-10-23; sky blue clashed with green status lines); status colours still apply
const is56 = (id) => id.endsWith("-l56") || /^seg-(diva-psk|psk-tna|tna-psk|psk-diva|mlnd-ngsm|ngsm-bnd|bnd-ngsm|ngsm-mlnd|psk-tapg|tapg-psk)-/.test(id);
function attrs(id, solid) { return (REVIEW && is56(id)) ? ` data-base="#94a3b8"${solid ? "" : ' stroke-dasharray="5 3"'} stroke="#94a3b8"` : ' stroke="#4a5568"'; }
function line(id, a, b, solid) { return `<path id="${id}" d="M${a[0]} ${a[1]} L${b[0]} ${b[1]}"${attrs(id, solid)} stroke-width="3" fill="none"/>`; }
function quad(id, a, c, b) { return `<path id="${id}" d="M${a[0]} ${a[1]} Q${c[0]} ${c[1]} ${b[0]} ${b[1]}"${attrs(id)} stroke-width="3" fill="none"/>`; }
function text(x, y, s, size = 7, fill = "#a9b4d0", extra = "") { return `<text x="${r1(x)}" y="${r1(y)}" font-size="${size}" fill="${fill}"${extra}>${s}</text>`; }

// ---- station centre line: DIVA -> CLA (9 segments) -> CSMT (8 segments)
const DIVA = [250, 304], CLA = [100, 434], CSMT = [26, 590];
const segA = ["DIVA", "MBQ", "KLVA", "TNA", "MLND", "BND", "VK", "GC", "VVH", "CLA"];
const segB = ["CLA", "SION", "MTN", "DR", "PR", "BY", "SNRD", "WB", "CSMT"];
const P = {};
// VVH-CLA is 1.8 units long (room for the 5th/6th merge, LTT, TMBY, VDLR); the other 8 are 1 unit
const unitsA = segA.map((_, i) => i === segA.length - 1 ? 1.8 : 1); unitsA[0] = 0;
const cumA = unitsA.map((u, i) => unitsA.slice(0, i + 1).reduce((x, y) => x + y, 0)); const totA = cumA[cumA.length - 1];
segA.forEach((s, i) => P[s] = lerp(DIVA, CLA, cumA[i] / totA));
segB.forEach((s, i) => P[s] = lerp(CLA, CSMT, i / (segB.length - 1)));
const nA = normal(DIVA, CLA), nB = normal(CLA, CSMT);
const nOf = (s) => segB.includes(s) && s !== "CLA" ? nB : nA;

// track offsets along the normal (lower-right). Trains keep left, so looking from CSMT towards KYN
// the DN line (CSMT -> KYN) is the upper-left one of each pair (lobby, 2026-10-23, matching the
// hand-placed DIVA-DI pair): through dn 0, through up 6; 5th/6th dn 15, up 21.
const K = { tu: 6, td: 0, fu: 21, fd: 15 };
const pt = (s, k) => off(P[s], nOf(s), k);

const out = [];
const ind = "                            ";
out.push(`                        <!-- KYN to CSMT corridor. Two parallel pairs KYN..CLA (lobby, 2026-10-21):
                             through lines via MBQ/KLVA (upper pair) and 5th/6th lines via PSK (lower pair,
                             ids suffixed -l56 where both lines share a station pair; the TAPG goods line
                             leaves the 5th line at PSK, NGSM goods yard sits just after MLND). All real
                             stations are drawn (BND, VK, SION, MTN included) so every coverage pair colours. -->`);
out.push(`                        <g id="route-kyn-csmt" class="route-group">`);

// KYN - DI - DIVA (through pair as before; 5th/6th parallel added)
const KYN = [450, 180], DI = [378, 227];
out.push(ind + `<!-- DI to DIVA, through pair -->`);
out.push(ind + line("seg-di-diva-up", [385, 228], [256, 306]));
out.push(ind + line("seg-diva-di-dn", [256, 300], [370, 226]));
const nKD = normal(KYN, DI), nDD = normal(DI, DIVA);
out.push(ind + `<!-- KYN - DI - DIVA, 5th/6th pair -->`);
out.push(ind + line("seg-kyn-di-up-l56", [449, 197], off(DI, nKD, 20)));
out.push(ind + line("seg-di-kyn-dn-l56", off(DI, nKD, 14), [444, 195]));
out.push(ind + line("seg-di-diva-up-l56", off(DI, nDD, 20), off(DIVA, nDD, 20)));
out.push(ind + line("seg-diva-di-dn-l56", off(DIVA, nDD, 14), off(DI, nDD, 14)));

// through pair DIVA..CSMT
out.push(ind + `<!-- through lines DIVA .. CSMT -->`);
const chain = [...segA, ...segB.slice(1)];
for (let i = 0; i < chain.length - 1; i++) {
  const a = chain[i], b = chain[i + 1];
  out.push(ind + line(`seg-${a.toLowerCase()}-${b.toLowerCase()}-up`, pt(a, K.tu), pt(b, K.tu)));
}
for (let i = chain.length - 1; i > 0; i--) {
  const a = chain[i], b = chain[i - 1];
  out.push(ind + line(`seg-${a.toLowerCase()}-${b.toLowerCase()}-dn`, pt(a, K.td), pt(b, K.td)));
}

// 5th/6th pair DIVA .. VVH: bowed past PSK, straight MLND-BND with an NGSM stub, merging into the through line after VVH
out.push(ind + `<!-- 5th/6th lines DIVA - PSK - TNA - MLND (NGSM stub) - BND .. VVH, merging before CLA -->`);
const bow = 10, fu = K.fu, fd = K.fd;
const mid = lerp(P.DIVA, P.TNA, 0.5), q1 = lerp(P.DIVA, P.TNA, 0.25), q3 = lerp(P.DIVA, P.TNA, 0.75);
out.push(ind + quad("seg-diva-psk-up", pt("DIVA", fu), off(q1, nA, fu + bow), off(mid, nA, fu + bow)));
out.push(ind + quad("seg-psk-tna-up", off(mid, nA, fu + bow), off(q3, nA, fu + bow), pt("TNA", fu)));
out.push(ind + quad("seg-tna-psk-dn", pt("TNA", fd), off(q3, nA, fd + bow), off(mid, nA, fd + bow)));
out.push(ind + quad("seg-psk-diva-dn", off(mid, nA, fd + bow), off(q1, nA, fd + bow), pt("DIVA", fd)));
const PSKmid = off(mid, nA, 18 + bow);
const straight = ["TNA", "MLND", "BND", "VK", "GC", "VVH"];
for (let i = 0; i < straight.length - 1; i++) {
  const a = straight[i], b = straight[i + 1];
  out.push(ind + line(`seg-${a.toLowerCase()}-${b.toLowerCase()}-up-l56`, pt(a, fu), pt(b, fu)));
}
for (let i = straight.length - 1; i > 0; i--) {
  const a = straight[i], b = straight[i - 1];
  out.push(ind + line(`seg-${a.toLowerCase()}-${b.toLowerCase()}-dn-l56`, pt(a, fd), pt(b, fd)));
}
// merge into the through line between VVH and CLA: solid stubs, each joining its own direction
// (dn 15 -> dn 0 above, up 21 -> up 6 below), so they do not cross each other (lobby, 2026-10-23)
const join = lerp(P.VVH, P.CLA, 0.55);
out.push(ind + line("seg-vvh-cla-up-l56", pt("VVH", fu), off(join, nA, K.tu), true));
out.push(ind + line("seg-cla-vvh-dn-l56", off(join, nA, K.td), pt("VVH", fd), true));
// NGSM stub: tiny loop off the pair between MLND and BND
const NA = lerp(P.MLND, P.BND, 0.3), NB = lerp(P.MLND, P.BND, 0.7), NG = off(lerp(P.MLND, P.BND, 0.5), nA, 38); // longer stub so the direction reads (lobby, 2026-10-23)
// the two loops sit side by side across the stub (offset along the corridor direction), not one
// behind the other along it (lobby, 2026-10-23)
const uC = unit(P.MLND, P.BND);
const NGu = [r1(NG[0] - 3 * uC[0]), r1(NG[1] - 3 * uC[1])], NGd = [r1(NG[0] + 3 * uC[0]), r1(NG[1] + 3 * uC[1])];
out.push(ind + line("seg-mlnd-ngsm-up", off(NA, nA, fu), NGu));
out.push(ind + line("seg-ngsm-bnd-up", NGu, off(NB, nA, fu)));
out.push(ind + line("seg-bnd-ngsm-dn", off(NB, nA, fd), NGd));
out.push(ind + line("seg-ngsm-mlnd-dn", NGd, off(NA, nA, fd)));
// TAPG branch from PSK (lower right)
const TAPG = [PSKmid[0] + 30, PSKmid[1] + 34];
out.push(ind + `<g id="branch-tapg">`);
// heading down-right to TAPG a train's left is the upper-right side: PSK -> TAPG is the upper line (lobby, 2026-10-23)
out.push(ind + "    " + line("seg-psk-tapg-dn", [PSKmid[0] + 3, PSKmid[1] - 3], [TAPG[0] + 3, TAPG[1] - 3]));
out.push(ind + "    " + line("seg-tapg-psk-up", [TAPG[0] - 3, TAPG[1] + 3], [PSKmid[0] - 3, PSKmid[1] + 3]));
out.push(ind + "    " + `<circle cx="${TAPG[0]}" cy="${TAPG[1]}" r="5" fill="#f59e0b" stroke="#d97706" stroke-width="1"/>`);
out.push(ind + "    " + text(TAPG[0] + 8, TAPG[1] + 4, "TAPG", 8, "#f59e0b"));
out.push(ind + `</g>`);

// station marks and labels
out.push(ind + `<!-- station labels: through stations upper-left, 5th/6th-only stations lower-right -->`);
for (const s of chain) {
  if (s === "DIVA" || s === "CSMT") continue;
  const lp = off(P[s], nOf(s), -9);
  out.push(ind + text(lp[0] - 10, lp[1] + 2, s, 7));
}
out.push(ind + `<circle cx="${PSKmid[0]}" cy="${PSKmid[1]}" r="4" fill="#a9b4d0"/>`);
out.push(ind + text(PSKmid[0] + 7, PSKmid[1] + 3, "PSK", 7));
out.push(ind + `<circle cx="${NG[0]}" cy="${NG[1]}" r="4" fill="#f59e0b" stroke="#d97706" stroke-width="1"/>`);
out.push(ind + text(NG[0] + 7, NG[1] + 3, "NGSM", 7, "#f59e0b"));
const cap = off(lerp(P.BND, P.VK, 0.5), nA, 34);
out.push(ind + text(cap[0] - 4, cap[1] + 6, "5th / 6th line", 6, "#6b7a99"));
out.push(ind + text(150, 304, "through lines (MBQ/KLVA)", 6, "#6b7a99"));
// CSMT hub
out.push(ind + `<circle cx="${r1(CSMT[0] + 3)}" cy="${r1(CSMT[1] + 4)}" r="8" fill="#dc2626" stroke="#991b1b" stroke-width="2"/>`);
out.push(ind + text(CSMT[0] - 20, CSMT[1] + 22, "CSMT", 10, "#dc2626", ' font-weight="600"'));

// branches LTT (from VVH), TMBY and VDLR (from CLA), hanging below the 5th/6th pair
const VVHb = pt("VVH", Math.max(K.fu, K.fd) + 2), CLAb = pt("CLA", Math.max(K.tu, K.td) + 2);
out.push(ind + `<g id="branch-ltt">`);
// heading down the screen a train's left is the viewer's right, so VVH -> LTT is the right-hand
// line of the pair (lobby, 2026-10-23)
out.push(ind + "    " + line("seg-vvh-ltt-dn", [VVHb[0] + 3, VVHb[1]], [VVHb[0] + 3, VVHb[1] + 30]));
out.push(ind + "    " + line("seg-ltt-vvh-up", [VVHb[0] - 3, VVHb[1] + 30], [VVHb[0] - 3, VVHb[1]]));
out.push(ind + "    " + `<circle cx="${VVHb[0]}" cy="${r1(VVHb[1] + 35)}" r="5" fill="#f59e0b" stroke="#d97706" stroke-width="1"/>`);
out.push(ind + "    " + text(VVHb[0] + 7, VVHb[1] + 40, "LTT", 8, "#f59e0b"));
out.push(ind + `</g>`);
out.push(ind + `<g id="branch-tmby">`);
// TMBY starts at the CLA junction itself (same start as VDLR) and angles right
// down the screen a train's left is the viewer's right: CLA -> TMBY is the right-hand line (lobby, 2026-10-23)
out.push(ind + "    " + line("seg-cla-tmby-dn", [CLAb[0] + 4, CLAb[1] - 4], [CLAb[0] + 32, CLAb[1] + 38]));
out.push(ind + "    " + line("seg-tmby-cla-up", [CLAb[0] + 25, CLAb[1] + 40], [CLAb[0] - 3, CLAb[1] - 2]));
out.push(ind + "    " + `<circle cx="${r1(CLAb[0] + 30)}" cy="${r1(CLAb[1] + 45)}" r="5" fill="#f59e0b" stroke="#d97706" stroke-width="1"/>`);
out.push(ind + "    " + text(CLAb[0] + 38, CLAb[1] + 49, "TMBY", 8, "#f59e0b"));
out.push(ind + `</g>`);
out.push(ind + `<g id="branch-vdlr">`);
// VDLR leaves CLA to the right (down-left would sit on the CSMT line)
// same rule: CLA -> VDLR on the right (lobby, 2026-10-23)
out.push(ind + "    " + line("seg-cla-vdlr-dn", [CLAb[0] + 3, CLAb[1]], [CLAb[0] + 3, CLAb[1] + 44]));
out.push(ind + "    " + line("seg-vdlr-cla-up", [CLAb[0] - 3, CLAb[1] + 44], [CLAb[0] - 3, CLAb[1]]));
out.push(ind + "    " + `<circle cx="${CLAb[0]}" cy="${r1(CLAb[1] + 49)}" r="5" fill="#f59e0b" stroke="#d97706" stroke-width="1"/>`);
out.push(ind + "    " + text(CLAb[0] + 7, CLAb[1] + 54, "VDLR", 8, "#f59e0b"));
out.push(ind + `</g>`);
out.push(`                        </g>`);
out.push("");

html = html.slice(0, start) + out.join("\n") + "\n" + html.slice(end);
fs.writeFileSync(f, html);

// sanity: unique ids
const ids = [...html.matchAll(/id="(seg-[^"]+)"/g)].map(m => m[1]);
const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
console.log("seg ids:", ids.length, "duplicates:", dup.length ? dup.join(",") : "none");
console.log("PSK at", PSKmid, "NGSM at", NG, "TAPG at", TAPG, "CLA at", P.CLA.map(r1), "CSMT", CSMT);
