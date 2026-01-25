/**
 * lrd_route_resolver.js
 *
 * Runtime resolver for CTR legs using prebuilt routes.json
 * - Same route works for both directions via index slicing
 * - Canonicalizes JNPT-complex aliases (BMCT/NSPT/NSCIT -> JNPT)
 * - Handles TKW vs NNCN fork on BVT->CSMT corridor using directional default
 * - Office exclusion checking for LRD credit
 *
 * Exported:
 *   loadRoutesJson(routesJsonPath)
 *   buildRouteIndex(routeDb)
 *   resolveLegWithRoutes(from, to, ctx)
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
 * Special tie-breaker for the TKW/NNCN fork on BVT->KJT corridor.
 *
 * Rule (based on actual train operations):
 * - DOWN direction (KJT -> BVT): uses TKW
 * - UP direction (BVT -> KJT): uses NNCN (99% of trains)
 *
 * We detect direction by checking if 'to' station is closer to BVT or KJT.
 */
function chooseByTkwNncnDefault(candidatePaths, fromSt, toSt, index) {
  const hasTKW = (p) => p.stations.includes("TKW");
  const hasNNCN = (p) => p.stations.includes("NNCN");

  const tkwPaths = candidatePaths.filter(p => hasTKW(p) && !hasNNCN(p));
  const nncnPaths = candidatePaths.filter(p => hasNNCN(p) && !hasTKW(p));

  // if no clean split, do nothing
  if (tkwPaths.length === 0 && nncnPaths.length === 0) return null;

  // If endpoints explicitly mention TKW or NNCN, that wins automatically.
  if (fromSt === "TKW" || toSt === "TKW") {
    if (tkwPaths.length === 1) return tkwPaths[0];
  }
  if (fromSt === "NNCN" || toSt === "NNCN") {
    if (nncnPaths.length === 1) return nncnPaths[0];
  }

  // Stations on BVT side of the fork
  const bvtSideStations = ['BVT', 'LNL', 'KAD', 'MHLC'];
  // Stations on KJT side of the fork
  const kjtSideStations = ['JBC', 'PDI', 'KJT', 'CHOK', 'MHPE', 'PNVL'];

  const fromBvtSide = bvtSideStations.includes(fromSt);
  const toBvtSide = bvtSideStations.includes(toSt);
  const fromKjtSide = kjtSideStations.includes(fromSt);
  const toKjtSide = kjtSideStations.includes(toSt);

  // DOWN direction: from KJT side towards BVT side -> use TKW
  if (fromKjtSide && toBvtSide) {
    if (tkwPaths.length === 1) return tkwPaths[0];
  }
  // UP direction: from BVT side towards KJT side -> use NNCN
  if (fromBvtSide && toKjtSide) {
    if (nncnPaths.length === 1) return nncnPaths[0];
  }

  // Default to NNCN for UP direction (99% case)
  if (nncnPaths.length === 1) return nncnPaths[0];

  return null;
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
function resolveLegWithRoutes(fromStationRaw, toStationRaw, ctx) {
  const { routes, aliasMap, stationToRoutes } = ctx;

  const fromSt = canonStation(fromStationRaw, aliasMap);
  const toSt = canonStation(toStationRaw, aliasMap);

  if (!fromSt || !toSt) {
    return { status: "UNMAPPED", reason: "Missing from/to station" };
  }
  if (fromSt === toSt) {
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

  // Multiple different physical subpaths: try the ONLY allowed tie-breaker (TKW/NNCN default)
  const tiebreak = chooseByTkwNncnDefault(unique, fromSt, toSt, ctx);
  if (tiebreak) {
    return {
      status: "OK",
      stations: tiebreak.stations,
      adjacent_pairs: stationsToAdjacentPairs(tiebreak.stations),
      route_id: tiebreak.route_id,
      reason: "Resolved by TKW/NNCN directional default",
    };
  }

  return {
    status: "AMBIGUOUS",
    reason: "Multiple distinct subpaths across routes",
    candidates: unique.map(u => `${u.route_id}:${u.sig}`),
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
function resolveLegForOffice(fromStation, toStation, office, ctx) {
  const resolved = resolveLegWithRoutes(fromStation, toStation, ctx);

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
  resolveLegForOffice,
  checkOfficeExclusion,
  getRoutesForOffice,
  stationsToAdjacentPairs,
};
