/**
 * Full-route definitions (Approach A) — a route is an ordered list of existing
 * segment section_codes, optionally trimmed at the signal level so a shared
 * segment can feed several routes that diverge partway through it.
 *
 * No signal data is duplicated: routes only REFERENCE segments. This file is the
 * hand-authored seed that will later be normalised into div_signal_routes /
 * div_signal_route_segments once the officer signs off on the assembly.
 *
 * Segment spec:
 *   'CODE'                              whole segment
 *   { code:'CODE', exclude:['DCC S-3'] } segment minus those signal numbers
 *   { code:'CODE', from:'X', to:'Y' }   only rows from signal X to signal Y (inclusive)
 */
module.exports = {
  'PNVL-BSR UP': {
    title: 'PNVL-BSR UP LINE',
    segments: [
      { code: 'PNVL_DCC_DIVA_UP', exclude: ['DCC S-3'] }, // trunk PNVL -> DCC S-1 (+ DATIVALI hdr); DCC S-3 is the Diva branch
      'DAT_DCC_DIVA_UP',                                   // DCC S-11 -> S-28 -> S-27
      'DCC_KOPAR_BSR_UP',                                  // DI S-8 -> DI S-5
      'KOPAR_BSR_BSR_UP',                                  // -> BSR S-61
    ],
  },

  'BSR-PNVL DN': {
    title: 'BSR-PNVL DN LINE',
    segments: [
      'KOPAR_BSR_BSR_DN',                                  // BSR S-56 -> KOPAR -> DI S-6 (DI S-6 -> KYN branch)
      'DAT_DCC_DIVA_DN',                                   // DCC junction: S-35 -> S-19 -> S-22 (all inline for BSR->PNVL)
      'PNVL_DCC_DIVA_DN',                                  // DCC S-20 -> DATIVALI -> PNVL S-13
    ],
  },

  'PNVL-KYN UP': {
    title: 'PNVL-KYN UP LINE',
    segments: [
      { code: 'PNVL_DCC_DIVA_UP', exclude: ['DCC S-3'] }, // trunk PNVL -> DCC S-1 (+ DATIVALI hdr)
      'DAT_DCC_DIVA_UP',                                   // DCC S-11 -> S-28 -> S-27 (S-27/28 -> TO KYN ME 4515)
      'DCC_KYN_DIVA_UP',                                   // ME 4515 -> DI S-13 -> ... -> KYN S-25
    ],
  },

  // PNVL-DW = the PNVL-Diva route: keeps DCC S-3 + the Diva station signals.
  'PNVL-DW UP': {
    title: 'PNVL-DW UP LINE',
    segments: [
      'PNVL_DCC_DIVA_UP',                                  // full: PNVL -> DCC S-1 -> DATIVALI -> DCC S-3
      'DCC_DIVA_DIVA_UP',                                  // DIVA S-69 -> DIVA station -> DIVA S-59
    ],
  },

  'DW-PNVL DN': {
    title: 'DW-PNVL DN LINE',
    segments: [
      { code: 'DW_DCC_BSR_UP', to: 'DW S-24' },            // Diva PNVL-facing starters DW S-15/16/19/23/24 (shared; drop DCC S-8/28/27 -> BSR)
      { signal: 'DCC S-5' },                               // diverging signal, exclusive to DW-PNVL
      { code: 'PNVL_DCC_DIVA_DN', from: 'GATE-1' },        // GATE-1 -> DP-1 -> ... -> PNVL S-13
    ],
  },

  'KYN-PNVL DN': {
    title: 'KYN-PNVL DN LINE',
    segments: [
      { code: 'KYN_BSR_BSR_UP', to: 'KYN S-21' },          // KYN starters shared w/ KYN-BSR: S-42, S-41, S-6, S-21
      { code: 'CLA_KYN_6TH', from: 'ME 5104', to: 'DCC S-39' }, // 6th line: ME 5104 -> DI S-31 -> DI S-18 -> ME 4602 -> DCC S-39
      { neutral: 'N/S' },                                  // OHE neutral section before DCC S-19
      { code: 'DAT_DCC_DIVA_DN', from: 'DCC S-19' },       // DCC S-19 -> DCC S-22 (drops BSR-side DCC S-35)
      { code: 'PNVL_DCC_DIVA_DN', from: 'DCC S-20', exclude: ['DCC S-4'] }, // DCC S-20 -> GATE-1 -> DP-1 -> ... -> PNVL S-13
    ],
  },

  // Trans-harbour (THB): TNA -> TUH, then TUH branches to NEU(->PNVL) or VSH.
  'TNA-PNVL DN': {
    title: 'TNA-PNVL DN LINE',
    segments: [
      { code: 'TNA_TUH_DN_THB', to: 'TNA S-62' },          // THANE hdr + PF-9 (TNA S-62)
      { signal: 'TNA S-61' },                             // PF-10 (TNA S-61) after PF-9
      { code: 'TNA_TUH_DN_THB', from: 'TN-01' },           // rest -> TUH S-2
      'TUH_NEU_DN_THB',                                    // TUH S-11 -> ... -> NEU S-31 (PF-1 starter)
      { signal: 'NEU S-32' },                             // PF-2 starter (added missing) -> RI to NEU S-41
      { code: 'CSMT_PNVL_DN_HB', from: 'NEU S-41', to: 'PNVL S-403' }, // NEU S-41 -> ... -> Panvel (NEU S-33 URAN branch skipped)
    ],
  },
  'PNVL-TNA UP': {
    title: 'PNVL-TNA UP LINE',
    segments: [
      { code: 'CSMT_PNVL_UP_HB', from: 'PNVL S-421', to: 'NEU S-42' }, // Panvel -> ... -> Nerul arrival (NEU S-42)
      'TUH_NEU_UP_THB',                                    // NEU S-25 -> ... -> TUH S-5
      'TNA_TUH_UP_THB',                                    // TN-24 -> ... -> TNA S-54
    ],
  },
  'TNA-VSH DN': {
    title: 'TNA-VSH DN LINE',
    segments: [
      { code: 'TNA_TUH_DN_THB', to: 'TNA S-62' },          // THANE hdr + PF-9 (TNA S-62)
      { signal: 'TNA S-61' },                             // PF-10 (TNA S-61) after PF-9
      { code: 'TNA_TUH_DN_THB', from: 'TN-01' },           // rest -> TUH S-2
      'TUH_VSH_DN_THB',                                    // TUH S-12 -> ... -> VSH S-19
    ],
  },
  'VSH-TNA UP': {
    title: 'VSH-TNA UP LINE',
    segments: [
      'TUH_VSH_UP_THB',                                    // VSH S-3 -> ... -> TUH S-6
      'TNA_TUH_UP_THB',                                    // TN-24 -> ... -> TNA S-54
    ],
  },

  'KYN-BSR UP': {
    title: 'KYN-BSR UP LINE',
    segments: [
      'KYN_BSR_BSR_UP',                                    // KYN S-42 -> ... -> DI S-18 (TO BSR DI S-7) -> DI S-5
      'KOPAR_BSR_BSR_UP',                                  // GATE-1 DIST -> KOPAR -> ... -> BSR S-61
    ],
  },

  'BSR-KYN DN': {
    title: 'BSR-KYN DN LINE',
    segments: [
      'KOPAR_BSR_BSR_DN',                                  // BSR S-56 -> KOPAR -> DI S-6 (TO KYN DI S-9)
      'DCC_KYN_DIVA_DN',                                   // DI S-9 -> ... -> KYN S-25
    ],
  },
};

// Beat membership: which beats' "full-route book" each route appears in. A route
// can belong to several beats (the DIVA/BSR trunk is in PNVL_GOODS + KYN_GOODS;
// trans-harbour is in PNVL_SUB_HB). FIRST-CUT — adjust per the officer's grouping.
// Which beats' full-route book each route appears in. KYN-BSR / BSR-KYN are KYN
// goods only (excluded from PNVL per the officer); the rest of the DIVA/BSR routes
// serve both goods beats.
const BOTH_GOODS = ['PNVL_GOODS', 'KYN_GOODS'];
const BEAT_MEMBERSHIP = {
  'PNVL-BSR UP': BOTH_GOODS,
  'BSR-PNVL DN': BOTH_GOODS,
  'PNVL-KYN UP': BOTH_GOODS,
  'KYN-PNVL DN': BOTH_GOODS,
  'PNVL-DW UP':  ['PNVL_GOODS'],   // DW routes are PNVL only; KYN shows the dw-dcc connector instead
  'DW-PNVL DN':  ['PNVL_GOODS'],
  'KYN-BSR UP':  ['KYN_GOODS'],
  'BSR-KYN DN':  ['KYN_GOODS'],
  'TNA-PNVL DN': ['PNVL_SUB_HB'],
  'PNVL-TNA UP': ['PNVL_SUB_HB'],
  'TNA-VSH DN':  ['PNVL_SUB_HB'],
  'VSH-TNA UP':  ['PNVL_SUB_HB'],
};
Object.entries(BEAT_MEMBERSHIP).forEach(([name, beats]) => {
  if (module.exports[name]) module.exports[name].beats = beats;
});

// Explicit render order for a beat's full-route book: an ordered mix of full
// routes ({route}) and plain sections ({section}), each corridor with both
// directions. Beats without an entry fall back to auto (book order, split
// segments replaced by their routes).
const BEAT_ROUTE_ORDER = {
  PNVL_GOODS: [
    { route: 'PNVL-BSR UP' }, { route: 'BSR-PNVL DN' },
    { section: 'PNVL_JNPT_JNPT_DN' }, { section: 'PNVL_JNPT_JNPT_UP' },
    { route: 'PNVL-KYN UP' }, { route: 'KYN-PNVL DN' },
    { section: 'PNVL_KJT_DN_KJT' }, { section: 'PNVL_KJT_UP_KJT' },
    { section: 'KJT_LNL_DN_SE' }, { section: 'KJT_LNL_UP_SE' },
    { section: 'KJT_LNL_DN_SE_MID' }, { section: 'KJT_LNL_UP_SE_MID' },
    { section: 'PNVL_ROHA_DN_KR' }, { section: 'PNVL_ROHA_UP_KR' },
    { section: 'PEN_TVSG_DN_TVSG' }, { section: 'PEN_TVSG_UP_TVSG' },
    { route: 'PNVL-DW UP' }, { route: 'DW-PNVL DN' },
    { section: 'DCC_DIVA_DIVA_DN', label: 'DCC-DIVA' }, // into Diva
    { section: 'DW_DCC_BSR_UP', label: 'DIVA-DCC' },    // reverse: Diva -> DCC S-8 -> S-28/S-27
  ],
  KYN_GOODS: [
    { section: 'CSMT_KYN_DN_TH' }, { section: 'CSMT_KYN_UP_TH' },
    { section: 'CSMT_KYN_DN_LOC' }, { section: 'CSMT_KYN_UP_LOC' },
    { section: 'CLA_KYN_5TH' }, { section: 'CLA_KYN_6TH' },
    { section: 'KYN_KSRA_DN_NE' }, { section: 'KYN_KSRA_UP_NE' },
    { section: 'KSRA_IGP_DN_NE' }, { section: 'KSRA_IGP_UP_NE' },
    { section: 'KSRA_IGP_DN_NE_MID' }, { section: 'KSRA_IGP_UP_NE_MID' },
    { section: 'KYN_KJT_DN_SE' }, { section: 'KYN_KJT_UP_SE' },
    { section: 'KJT_LNL_DN_SE' }, { section: 'KJT_LNL_UP_SE' },
    { section: 'KJT_LNL_DN_SE_MID' }, { section: 'KJT_LNL_UP_SE_MID' },
    { route: 'KYN-PNVL DN' }, { route: 'PNVL-KYN UP' },
    { route: 'KYN-BSR UP' }, { route: 'BSR-KYN DN' },
    { route: 'BSR-PNVL DN' }, { route: 'PNVL-BSR UP' },
    { section: 'CLA_TMBY_DN_TMBY' }, { section: 'CLA_TMBY_UP_TMBY' },
    { section: 'CLA_VDLR_BPT_DN' }, { section: 'CLA_VDLR_BPT_UP' },
    { section: 'DCC_DIVA_DIVA_DN', label: 'DCC-DIVA' }, // into Diva
    { section: 'DW_DCC_BSR_UP', label: 'DIVA-DCC' },    // reverse: Diva -> DCC S-8 -> S-28/S-27
  ],
};
Object.defineProperty(module.exports, '__beatOrder', { value: BEAT_ROUTE_ORDER, enumerable: false });
