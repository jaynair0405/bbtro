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
