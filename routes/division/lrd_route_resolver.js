/**
 * lrd_route_resolver.js
 *
 * Runtime resolver for CTR legs using prebuilt routes.json
 * - Same route works for both directions via index slicing
 * - Canonicalizes JNPT-complex aliases (BMCT/NSPT/NSCIT -> JNPT)
 * - Handles through lines (KLVA/MBQ) vs 5th/6th (PSK) between TNA and DIVA
 *   using the CTR Route Name, else the leg's far end
 * - Handles via-PNVL vs via-KYN between the ghat side and KYN/BSR/DIVA
 *   using the CTR Route Name (PNVL or KYN named), else the crew's office
 * - Same-station legs (PNVL -> PNVL) with a route name of the form X-X-FAR
 *   resolve as out-and-back X -> FAR -> X, unless the train number marks a
 *   shunting / yard / tower-wagon / departmental / waiting row
 * - Office exclusion checking for LRD credit
 *
 * Exported:
 *   loadRoutesJson(routesJsonPath)
 *   buildRouteIndex(routeDb)
 *   resolveLegWithRoutes(from, to, ctx, { routeName, crewOffice, trainNo })
 *   crewOfficeFromCmsId(cmsId)
 *   checkOfficeExclusion(from, to, office, ctx)
 *   stationsToAdjacentPairs(stations)
 */

const fs = require("fs");
const path = require("path");

/**
 * Load routes.json from disk
 */
function loadRoutesJson(routesJsonPath) {
  const raw = fs.readFileSync(routesJsonPath, "utf8");
  return JSON.parse(raw);
}

/**
 * Canonicalize station code using alias map
 */
function canonStation(stn, aliasMap) {
  if (!stn) return stn;
  const s = String(stn).trim().toUpperCase();
  return (aliasMap && aliasMap[s]) ? aliasMap[s] : s;
}

/**
 * Build fast index: station -> list of route indices
 */
function buildRouteIndex(routeDb) {
  const aliasMap = {};
  // normalize alias keys to uppercase
  for (const [k, v] of Object.entries(routeDb.aliases || {})) {
    aliasMap[String(k).trim().toUpperCase()] = String(v).trim().toUpperCase();
  }

  const routes = (routeDb.routes || []).map(r => ({
    route_id: r.route_id,
    from: String(r.from).trim().toUpperCase(),
    to: String(r.to).trim().toUpperCase(),
    variant: r.variant ?? null,
    stations: (r.stations || []).map(s => String(s).trim().toUpperCase()),
  }));

  const stationToRoutes = new Map(); // station -> Set(routeIdx)
  routes.forEach((r, idx) => {
    r.stations.forEach(st => {
      const key = st;
      if (!stationToRoutes.has(key)) stationToRoutes.set(key, new Set());
      stationToRoutes.get(key).add(idx);
    });
  });

  // Process office exclusions
  const officeExclusions = routeDb.office_exclusions || {};

  return { routes, aliasMap, stationToRoutes, officeExclusions };
}

/**
 * Convert station list to adjacent pairs for segment tracking
 */
function stationsToAdjacentPairs(stations) {
  const pairs = [];
  for (let i = 0; i < stations.length - 1; i++) {
    pairs.push([stations[i], stations[i + 1]]);
  }
  return pairs;
}

/**
 * Slice a route's station list between two stations (handles both directions)
 */
function slicePath(routeStations, fromSt, toSt) {
  const i = routeStations.indexOf(fromSt);
  const j = routeStations.indexOf(toSt);
  if (i === -1 || j === -1) return null;

  if (i <= j) return routeStations.slice(i, j + 1);
  // reverse direction
  return routeStations.slice(j, i + 1).reverse();
}

/**
 * Create signature from station array for deduplication
 */
function pathSignature(stations) {
  return stations.join(">");
}

/**
 * Train-number markers of same-station rows that are not line working
 * (lobby, 2026-10-23): tower wagon (TW, T/W), yard (YARD, YD), shunting
 * (PNVL/STG), departmental train (BTN), waiting (WTG, WAIT, WAITING, W/SAFE),
 * period break (PERIOD/BREAK and its spellings), counselling, special duty,
 * hospital, spare, exam. Such rows must not update LRD.
 */
const NON_WORKING_TOKENS = new Set([
  "TW", "YARD", "YD", "STG", "BTN", "WTG", "WAIT", "WAITING", "WATTING", "SAFE", "SAFF",
  "PERIOD", "PRIOD", "PIROD", "PIRED", "PIREDBREK", "BREAK", "BRAKE", "BRACK",
  "COUNCLING", "COUNSELLING", "SPL", "DUTY", "HOSPITAL", "SPARMV", "WORKING", "EXAM",
]);
function trainNoTokens(trainNo) {
  return String(trainNo || "").toUpperCase().replace(/\bT[\/ ]W\b/g, "TW").replace(/YARD/g, " YARD ").split(/[^A-Z0-9]+/).filter(Boolean);
}
function isNonWorkingTrainNo(trainNo) {
  return trainNoTokens(trainNo).some(tok => NON_WORKING_TOKENS.has(tok));
}

/**
 * Road learning written into the train number of a same-station row
 * (lobby, 2026-10-23): "ROHA LRD", "LRD/ROHA", "KYN/LRD", "DIVA/ROHA/LRD" on a
 * PNVL -> PNVL leg mean the crew went out to that station and back for road
 * learning; the route name on such rows is boilerplate (PNVL-PNVL-JNPT/200).
 * Returns the named stations known to the route index, or [] when the label
 * does not say LRD or names no station.
 */
function lrdStationsFromTrainNo(trainNo, ctx) {
  const toks = trainNoTokens(trainNo);
  if (!toks.some(t => /^L?LRD$/.test(t))) return [];
  const out = [];
  for (const t of toks) {
    const st = canonStation(t, ctx.aliasMap);
    if (!/^L?LRD$/.test(t) && !NON_WORKING_TOKENS.has(t) && ctx.stationToRoutes.has(st) && !out.includes(st)) out.push(st);
  }
  return out;
}

/**
 * Same-station leg (X -> X) whose CTR route name reads Y-Y-A[-B...], Y usually X:
 * the crew went out to A and came back (e.g. PNVL-PNVL-JNPT/200 = 59.7 km,
 * twice PNVL-JNPT; PNVL-PNVL-JNPT-BSR = a JNPT trip then a BSR trip).
 * Each far token that is a known station becomes an out-and-back from X and
 * the station lists are chained, so both directions get coverage. Numeric
 * suffixes (/120, /200) and UP/DN are ignored.
 *
 * Returns a resolved object, or null when the rule does not apply.
 */
function resolveOutAndBack(fromSt, routeName, ctx, hint) {
  const { aliasMap, stationToRoutes } = ctx;
  const trainNo = hint && hint.trainNo;
  // 1. road learning named in the train number wins over the boilerplate route name
  let fars = lrdStationsFromTrainNo(trainNo, ctx).filter(st => st !== fromSt);
  let source = "road learning from train number";
  if (!fars.length) {
    // 2. shunting / yard / tower wagon / waiting / break rows: no line working
    if (trainNo && isNonWorkingTrainNo(trainNo)) return null;
    // 3. the route name must be a round-trip form (X-X-...). X is usually the
    // leg's own station, but a Pen shuttle crew booked PNVL-PNVL-PPDP-JSWD may
    // sign a PEN -> PEN or RSYI -> RSYI leg; the far points are taken from the
    // leg's station either way (24.9 km = twice PEN-JSWD).
    const tokens = String(routeName || "").toUpperCase().split(/[^A-Z0-9]+/).filter(Boolean);
    if (tokens.length < 3) return null;
    if (canonStation(tokens[0], aliasMap) !== canonStation(tokens[1], aliasMap)) return null;
    for (const tok of tokens.slice(2)) {
      if (/^\d+$/.test(tok) || tok === "UP" || tok === "DN") continue;
      const st = canonStation(tok, aliasMap);
      if (st !== fromSt && stationToRoutes.has(st) && !fars.includes(st)) fars.push(st);
    }
    source = "out-and-back from route name";
  }
  if (!fars.length) return null;

  const stations = [fromSt];
  const legHint = { routeName, crewOffice: hint && hint.crewOffice };
  let routeId = null;
  const done = [];
  for (const far of fars) {
    const out = resolveLegWithRoutes(fromSt, far, ctx, legHint);
    if (out.status !== "OK" || !out.route_id) continue;
    routeId = routeId || out.route_id;
    done.push(far);
    for (let i = 1; i < out.stations.length; i++) stations.push(out.stations[i]);           // out
    for (let i = out.stations.length - 2; i >= 0; i--) stations.push(out.stations[i]);      // back
  }
  if (!done.length) return null;
  return {
    status: "OK",
    stations,
    adjacent_pairs: stationsToAdjacentPairs(stations),
    route_id: routeId,
    reason: `${source}: ${fromSt} to ${done.join(", ")} and back`,
  };
}

/**
 * Crew office from a CMS id prefix: "PNVL3341" -> "PNVL", "KYN5633" -> "KYN".
 * The duty's source_office is empty on older uploads; the CMS id is always there.
 */
function crewOfficeFromCmsId(cmsId) {
  const m = String(cmsId || "").toUpperCase().match(/^([A-Z]+)/);
  return m ? m[1] : null;
}

/**
 * Tie-breaker between the ghat side (LNL..KJT, CHOK, MHPE) and KYN / BSR / DIVA.
 *
 * Two physical routes exist (lobby, 2026-10-22):
 *   - via PNVL:      KJT - CHOK - MHPE - PNVL - KLMG - TPND - NIIJ - ... (PNVL crews)
 *   - via main line: KJT - BVS - NRL - VGI - BUD - ABH - ULNR - VLDI - KYN - ... (KYN crews)
 *
 * Decided by the CTR Route Name when it names exactly one of PNVL / KYN
 * (e.g. "PUNE-BSR-KJT-PNVL" vs "PUNE-BSR-UP-LNL-KYN"); when it names both or
 * neither (e.g. "PUNE-IGP-UP-KJT-PNVL-KYN", "KYN-LNL-UP") the crew's office
 * decides: PNVL via PNVL, KYN or CSMT via the main line. Otherwise undecided.
 *
 * Returns { paths: [one path], reason } or null.
 */
function chooseByPnvlCrew(candidatePaths, routeName, crewOffice) {
  if (candidatePaths.length !== 2) return null;
  const viaPnvl = candidatePaths.filter(p => p.stations.includes("PNVL"));
  const viaMain = candidatePaths.filter(p => !p.stations.includes("PNVL") && p.stations.includes("KYN"));
  if (viaPnvl.length !== 1 || viaMain.length !== 1) return null;

  const tokens = new Set(String(routeName || "").toUpperCase().split(/[^A-Z0-9]+/).filter(Boolean));
  const namesPnvl = tokens.has("PNVL"), namesKyn = tokens.has("KYN");
  if (namesPnvl && !namesKyn) return { paths: viaPnvl, reason: "via PNVL: route name names PNVL" };
  if (namesKyn && !namesPnvl) return { paths: viaMain, reason: "via KYN: route name names KYN" };

  const office = String(crewOffice || "").toUpperCase();
  if (office === "PNVL") return { paths: viaPnvl, reason: "via PNVL: PNVL crew" };
  if (office === "KYN" || office === "CSMT") return { paths: viaMain, reason: `via KYN: ${office} crew` };
  return null;
}

/**
 * Tie-breaker for the KYN-CSMT corridor between TNA and DIVA.
 *
 * Two physical routes exist (lobby, 2026-10-21):
 *   - Through lines (DN/UP through + local): TNA - KLVA - MBQ - DIVA
 *   - 5th/6th lines:                         TNA - PSK - DIVA (via Parsik),
 *     with NGSM goods yard just after MLND and the TAPG line leaving at PSK
 * routes.json carries both: the CSMT routes run the through lines, the
 * TMBY/LTT/VDLR routes run the 5th/6th. A leg such as KYN-CLA slices both.
 *
 * The CMS "Route Name" on the CTR row names which route the lobby booked,
 * so it decides first. Without it: an end beyond CLA towards CSMT means the
 * through lines, otherwise the 5th/6th (goods between KYN and CLA/TMBY/LTT/
 * VDLR run there).
 */
const CSMT_SIDE_STATIONS = ["SION", "MTN", "DR", "PR", "BY", "SNRD", "WB", "CSMT"];

function chooseByCsmtCorridor(candidatePaths, fromSt, toSt, routeName) {
  const isThrough = (p) => p.baseRouteStations.includes("KLVA") || p.baseRouteStations.includes("MBQ");
  const isParsik = (p) => !isThrough(p) &&
    (p.baseRouteStations.includes("PSK") || p.baseRouteStations.includes("NGSM"));

  const throughPaths = candidatePaths.filter(isThrough);
  const parsikPaths = candidatePaths.filter(isParsik);

  // Only acts on a clean split between the two families
  if (throughPaths.length === 0 || parsikPaths.length === 0) return null;
  if (throughPaths.length + parsikPaths.length !== candidatePaths.length) return null;

  const name = String(routeName || "").toUpperCase();
  const nameThrough = /CSMT/.test(name);
  const nameParsik = /TMBY|NGSM|LTT|VDLR/.test(name);
  if (nameThrough && !nameParsik) {
    return { paths: throughPaths, reason: `CSMT corridor: through lines (KLVA/MBQ) per Route Name "${routeName}"` };
  }
  if (nameParsik && !nameThrough) {
    return { paths: parsikPaths, reason: `CSMT corridor: 5th/6th line (PSK) per Route Name "${routeName}"` };
  }

  if (CSMT_SIDE_STATIONS.includes(fromSt) || CSMT_SIDE_STATIONS.includes(toSt)) {
    return { paths: throughPaths, reason: "CSMT corridor: through lines (KLVA/MBQ), leg reaches beyond CLA" };
  }
  return { paths: parsikPaths, reason: "CSMT corridor: 5th/6th line (PSK) default for KYN-CLA/TMBY/LTT/VDLR" };
}

/**
 * Check if a leg segment falls within an office's excluded sections
 *
 * @param {string} fromStation - Leg start station
 * @param {string} toStation - Leg end station
 * @param {string[]} resolvedStations - Full resolved path
 * @param {string} office - Staff office (PNVL or KYN)
 * @param {object} ctx - Route context with officeExclusions
 * @returns {object} { excluded: boolean, reason: string }
 */
function checkOfficeExclusion(fromStation, toStation, resolvedStations, office, ctx) {
  const { officeExclusions, aliasMap } = ctx;

  if (!office || !officeExclusions[office]) {
    return { excluded: false, reason: "No exclusions defined for office" };
  }

  const exclusions = officeExclusions[office].excluded_segments || [];
  const stationSet = new Set(resolvedStations.map(s => canonStation(s, aliasMap)));

  const from = canonStation(fromStation, aliasMap);
  const to = canonStation(toStation, aliasMap);

  for (const excl of exclusions) {
    const exclFrom = canonStation(excl.from, aliasMap);
    const exclTo = canonStation(excl.to, aliasMap);

    // Check if both exclusion boundary stations are in the resolved path
    // This means the leg crosses/includes the excluded segment
    if (stationSet.has(exclFrom) && stationSet.has(exclTo)) {
      return {
        excluded: true,
        reason: `Segment ${exclFrom}-${exclTo} excluded for ${office} (${excl.note || ''})`
      };
    }

    // Also check if the leg's endpoints match the exclusion boundaries
    if ((from === exclFrom && to === exclTo) || (from === exclTo && to === exclFrom)) {
      return {
        excluded: true,
        reason: `Direct match: ${exclFrom}-${exclTo} excluded for ${office} (${excl.note || ''})`
      };
    }

    // Check if leg is entirely within the excluded corridor
    // (both from and to are in the exclusion's station range)
    // This requires checking if from/to fall between exclFrom and exclTo in any route
  }

  return { excluded: false, reason: "Not in excluded segments" };
}

/**
 * Main resolver using routes cache.
 *
 * @returns {object}
 *  {
 *    status: "OK" | "UNMAPPED" | "AMBIGUOUS",
 *    stations?: string[],
 *    adjacent_pairs?: [string,string][],
 *    route_id?: string,
 *    reason?: string,
 *    candidates?: string[]   // route_ids or signatures for debugging
 *  }
 */
function resolveLegWithRoutes(fromStationRaw, toStationRaw, ctx, hint) {
  const routeName = hint && hint.routeName ? hint.routeName : null;
  const crewOffice = hint && hint.crewOffice ? hint.crewOffice : null;
  const { routes, aliasMap, stationToRoutes } = ctx;

  const fromSt = canonStation(fromStationRaw, aliasMap);
  const toSt = canonStation(toStationRaw, aliasMap);

  if (!fromSt || !toSt) {
    return { status: "UNMAPPED", reason: "Missing from/to station" };
  }
  if (fromSt === toSt) {
    const oab = resolveOutAndBack(fromSt, routeName, ctx, hint);
    if (oab) return oab;
    return {
      status: "OK",
      stations: [fromSt],
      adjacent_pairs: [],
      route_id: null,
      reason: "Same station (no segments)"
    };
  }

  const fromSet = stationToRoutes.get(fromSt);
  const toSet = stationToRoutes.get(toSt);
  if (!fromSet || !toSet) {
    return { status: "UNMAPPED", reason: `Station not in route index: ${!fromSet ? fromSt : toSt}` };
  }

  // intersection of candidate routes
  const candidateRouteIdxs = [];
  for (const idx of fromSet) {
    if (toSet.has(idx)) candidateRouteIdxs.push(idx);
  }

  if (candidateRouteIdxs.length === 0) {
    return { status: "UNMAPPED", reason: "No route contains both stations" };
  }

  // Build candidate paths (slice for each route)
  const candidatePaths = [];
  for (const idx of candidateRouteIdxs) {
    const r = routes[idx];
    const sliced = slicePath(r.stations, fromSt, toSt);
    if (!sliced) continue;
    // Ignore degenerate / invalid
    if (sliced.length < 2) continue;

    candidatePaths.push({
      route_id: r.route_id,
      stations: sliced,
      sig: pathSignature(sliced),
      baseRouteStations: r.stations,
    });
  }

  if (candidatePaths.length === 0) {
    return { status: "UNMAPPED", reason: "Candidates found but none produced a valid slice" };
  }

  // Deduplicate by exact station sequence
  const bySig = new Map(); // sig -> candidatePath
  for (const p of candidatePaths) {
    if (!bySig.has(p.sig)) bySig.set(p.sig, p);
  }
  const unique = [...bySig.values()];

  if (unique.length === 1) {
    const chosen = unique[0];
    return {
      status: "OK",
      stations: chosen.stations,
      adjacent_pairs: stationsToAdjacentPairs(chosen.stations),
      route_id: chosen.route_id,
      reason: "Unique route slice",
    };
  }

  // Multiple different physical subpaths: two tie-breakers are allowed.
  // 1. KYN-CSMT corridor: through lines vs 5th/6th
  let pool = unique;
  let corridorReason = null;
  const corridor = chooseByCsmtCorridor(pool, fromSt, toSt, routeName);
  if (corridor) {
    pool = corridor.paths;
    corridorReason = corridor.reason;
    if (pool.length === 1) {
      return {
        status: "OK",
        stations: pool[0].stations,
        adjacent_pairs: stationsToAdjacentPairs(pool[0].stations),
        route_id: pool[0].route_id,
        reason: corridorReason,
      };
    }
  }

  // 2. Ghat side to KYN/BSR/DIVA: via PNVL vs via the main line
  const pnvl = chooseByPnvlCrew(pool, routeName, crewOffice);
  if (pnvl && pnvl.paths.length === 1) {
    return {
      status: "OK",
      stations: pnvl.paths[0].stations,
      adjacent_pairs: stationsToAdjacentPairs(pnvl.paths[0].stations),
      route_id: pnvl.paths[0].route_id,
      reason: corridorReason ? `${corridorReason}; ${pnvl.reason}` : pnvl.reason,
    };
  }

  return {
    status: "AMBIGUOUS",
    reason: "Multiple distinct subpaths across routes",
    candidates: pool.map(u => `${u.route_id}:${u.sig}`),
  };
}

/**
 * Resolve leg and check office exclusion in one call
 *
 * @param {string} fromStation
 * @param {string} toStation
 * @param {string} office - Staff office (PNVL or KYN)
 * @param {object} ctx - Route context
 * @returns {object} Resolution result with exclusion info
 */
function resolveLegForOffice(fromStation, toStation, office, ctx, hint) {
  const resolved = resolveLegWithRoutes(fromStation, toStation, ctx, hint);

  if (resolved.status !== "OK") {
    return {
      ...resolved,
      lrd_credit: false,
      exclusion: null
    };
  }

  const exclusion = checkOfficeExclusion(
    fromStation,
    toStation,
    resolved.stations,
    office,
    ctx
  );

  return {
    ...resolved,
    lrd_credit: !exclusion.excluded,
    exclusion: exclusion
  };
}

/**
 * Get all routes applicable to an office (for LRD status display)
 * Filters out routes that are entirely within excluded segments
 *
 * @param {string} office - PNVL or KYN
 * @param {object} ctx - Route context
 * @returns {object[]} Filtered routes for the office
 */
function getRoutesForOffice(office, ctx) {
  const { routes, officeExclusions, aliasMap } = ctx;

  if (!office || !officeExclusions[office]) {
    return routes; // Return all if no exclusions
  }

  const exclusions = officeExclusions[office].excluded_segments || [];

  return routes.filter(route => {
    const routeStationSet = new Set(route.stations);

    // Check if route is entirely within any excluded segment
    for (const excl of exclusions) {
      const exclFrom = canonStation(excl.from, aliasMap);
      const exclTo = canonStation(excl.to, aliasMap);

      // If both exclusion endpoints are in route AND route endpoints match exclusion
      // then this route is excluded
      const routeFrom = route.stations[0];
      const routeTo = route.stations[route.stations.length - 1];

      // Check if route is subset of excluded segment
      if (routeStationSet.has(exclFrom) && routeStationSet.has(exclTo)) {
        // Route touches excluded segment - check if it's entirely within
        const fromIdx = route.stations.indexOf(exclFrom);
        const toIdx = route.stations.indexOf(exclTo);

        // If route starts at or after exclFrom and ends at or before exclTo (or reverse)
        // it's entirely within the excluded segment
        if ((fromIdx === 0 || toIdx === 0) &&
            (fromIdx === route.stations.length - 1 || toIdx === route.stations.length - 1)) {
          return false; // Exclude this route
        }
      }
    }

    return true; // Include route
  });
}

module.exports = {
  loadRoutesJson,
  buildRouteIndex,
  canonStation,
  resolveLegWithRoutes,
  crewOfficeFromCmsId,
  isNonWorkingTrainNo,
  resolveLegForOffice,
  checkOfficeExclusion,
  getRoutesForOffice,
  stationsToAdjacentPairs,
};
