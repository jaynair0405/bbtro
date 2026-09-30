#!/usr/bin/env python3
"""Build the WDFC (Western Dedicated Freight Corridor) signal-book import, 30 Sep 2026.

Sources (data/WDFCC/):
  W-DFCC.xlsx  - user sheet: JNPT->UDNA and UDNA->JNPT signals, neutral sections, PSRs
  DFCCIL_WDFC_DN_Signal_JNPT_to_Makarpura_Exact_Format_Final.pdf - JNPT->Makarpura signal chart
  JNPN ROUTES.docx - station codes and km from JNPN (RBS data)

User decisions (30 Sep 2026):
  - JNPN -> UDNN -> MPRN is UP; the reverse is DN.
  - Station signals carry the station code (NIJN S-98); automatic signals as A-6134 / A-6020 (G).
  - UP: follow the PDF (it matches the sheet), up to Makarpura; drop LX-1; one UDNN S-98.
  - DN: sheet tab; missing km estimated at 1 km spacing (noted on the signal); rows put in km order;
    A 5613 (G) kept once at 195/29.
  - Functions by position at each station (first = Home, S-42/S-41 = Starter, loop/shunt = Starter (Loop),
    last = Advance Starter); diversion arms left for later; PDF sighting remarks kept.
  - A separate DFC beat.
NOTE: this script produced the import as applied on 30 Sep 2026, with JNPN->MPRN labelled UP. The user then
confirmed JNPN->UDNN->MPRN is DN; sql/2026-09-30_wdfc_direction_relabel.sql swaps the labels. Re-running this
script regenerates the ORIGINAL import (UP/DN as first applied), not the relabelled book.
Usage: python3 scripts/build-wdfc-signals.py > review.txt   (writes the two SQL files)
"""
import json, re, subprocess, sys
import openpyxl

D = 'data/WDFCC'
OUT = 'sql/2026-09-30_wdfc_jnpn_mprn_signals.sql'
UNDO = 'sql/2026-09-30_wdfc_jnpn_mprn_signals_UNDO.sql'
SECTION = 'JNPN-MPRN'
LINE = {'UP': 'WDFC UP', 'DN': 'WDFC DN'}
PAGE = {'UP': ('WDFC_JNPN_MPRN_UP', 'JNPN-MPRN WDFC UP LINE'),
        'DN': ('WDFC_MPRN_JNPN_DN', 'MPRN-JNPN WDFC DN LINE')}
WHY = 'WDFC import: sheet W-DFCC + DFCCIL JNPT-Makarpura chart (user, 30 Sep 2026)'
EST = 'km estimated at 1 km spacing (not in the sheet) - to confirm'

# Stations, km from JNPN (docx RBS data); names as in div_stations
STATIONS = [('JNPN', 'NEW JAWAHARLAL NEHRU PORT TRUST', 0.0), ('NIJN', 'NEW NILAJE', 36.93),
            ('KHBN', 'NEW KHARBAV', 71.32), ('SAHN', 'NEW SAPHALE', 106.06), ('PLGR', 'NEW PALGHAR', 140.7),
            ('UBRN', 'NEW UMBERGAON ROAD', 180.38), ('PADN', 'NEW PARDI', 220.9), ('ACLN', 'NEW ANCHELI', 258.61),
            ('BHEN', 'NEW BHESTAN', 290.51), ('UDNN', 'NEW UDHNA', 302.38), ('GTXN', 'NEW GOTHANGAM', 318.55),
            ('SNJN', 'NEW SANJALI', 356.69), ('VREN', 'NEW VAREDIYA', 384.76), ('MPRN', 'NEW MAKARPURA JN', 422.27)]


def fixkm(k):
    """Excel turned some 'mm/dd' km into dates; undo that. Ranges '303/18-20' keep the first km."""
    k = str(k or '').strip()
    m = re.match(r'20\d\d-(\d\d)-(\d\d)', k)
    if m:
        return f'{m.group(1)}/{m.group(2)}'
    return re.sub(r'\s+', '', k).split('-')[0]


def kmkey(k):
    m = re.match(r'(\d+)/(\d+)', k or '')
    return (int(m.group(1)), int(m.group(2))) if m else None


def kmval(k):
    t = kmkey(k)
    return None if t is None else t[0] + t[1] / 100.0


def station_for(k):
    v = kmval(k)
    code, name, skm = min(STATIONS, key=lambda s: abs(s[2] - v))
    return code if abs(skm - v) <= 6 else None   # UBRN's loop signals stand ~5 km out


def auto_name(raw):
    s = re.sub(r'\s+', ' ', str(raw)).strip()
    m = re.match(r'A\s*(\d+)\s*(\(?G\)?)?$', s, re.I)
    if not m:
        raise ValueError(f'unexpected automatic name {raw!r}')
    return f'A-{m.group(1)}' + (' (G)' if m.group(2) else '')


def semi_base(raw):
    s = re.sub(r'\s+', '', str(raw)).upper()
    m = re.match(r'S-?(\d+)', s)
    return f'S-{int(m.group(1))}' if m else None


def norm(s):
    return re.sub(r'[\s\-/_.()]', '', s).upper()


# ---------------------------------------------------------------- UP from the PDF
def up_items():
    txt = subprocess.run(['pdftotext', '-layout', f'{D}/DFCCIL_WDFC_DN_Signal_JNPT_to_Makarpura_Exact_Format_Final.pdf', '-'],
                         capture_output=True, text=True).stdout.splitlines()
    rows = []
    for line in txt:
        m = re.match(r'^\s{1,6}(\d{1,3})\s{2,}(\S.*?)\s{2,}(\S+)\s{2,}(\S.*?)\s{2,}(\S.*?)\s*$', line)
        if m:
            rows.append(dict(no=int(m.group(1)), sig=m.group(2).strip(), km=fixkm(m.group(3)),
                             cls=m.group(4).strip(), rem=m.group(5).strip()))
    items, seen_udnn98 = [], False
    for r in rows:
        if r['sig'].startswith('N/S'):
            items.append(dict(kind='NS', km=r['km']))
            continue
        cm = re.match(r'(\d+) CAUTION', r['sig'])
        if cm:
            items.append(dict(kind='PSR', km=r['km'], speed=int(cm.group(1))))
            continue
        if r['sig'].upper().startswith('A'):
            name, st = auto_name(r['sig']), None
            typ = 'Automatic'
        else:
            base = semi_base(r['sig'])
            st = station_for(r['km'])
            if st == 'UDNN' and base == 'S-98':
                if seen_udnn98:
                    continue                     # user: only one UDNN S-98
                seen_udnn98 = True
            name, typ = f'{st} {base}', 'Semi-Automatic'
        sight, tech = [], []
        if re.search(r'CAN BE SEEN|CREW ALERT|CRITICAL', r['rem'], re.I):
            sight.append(re.sub(r'^\W+', '', r['rem']).strip())   # the chart's own words
        if 'AG MARKER' in r['rem'].upper():
            tech.append('AG marker board')
        if 'SHUNT' in r['rem'].upper() or '/SH-' in r['sig'].upper():
            sh = re.search(r'SH-\d+', r['sig'].upper())
            tech.append(f'with shunt signal {sh.group(0)}' if sh else 'with shunt signal')
        dv = re.search(r'(\d+)\s*DIVERSION', r['rem'].upper())
        items.append(dict(kind='SIG', name=name, station=st, km=r['km'], type=typ, pdfrem=r['rem'],
                          sighting='; '.join(sight) or None, tech='; '.join(tech) or None,
                          ri_note=f'{dv.group(1)} diversion(s) per DFCCIL chart; arms/sides to be added' if dv else None,
                          shunt=bool(re.search(r'SH-\d+', r['sig'].upper()))))
    return items


# ---------------------------------------------------------------- DN from the sheet
def dn_items(wb):
    ws = wb['UDNA-NEW JNPT']
    rows = [dict(zip([c.value for c in ws[1]], [c.value for c in r])) for r in ws.iter_rows(min_row=2)]
    rows = [r for r in rows if r.get('signal_number')]
    sigs = []
    for r in rows:
        raw = str(r['signal_number']).strip()
        km = fixkm(r['km_text'])
        if raw.upper().startswith('A'):
            name = auto_name(raw)
            if name == 'A-5613 (G)' and km == '195/35':
                continue                          # user: keep A 5613 (G) once, at 195/29
            sigs.append(dict(raw=raw, name=name, km=km, type='Automatic', est=False, station=None))
        else:
            sigs.append(dict(raw=raw, base=semi_base(raw), km=km, type='Semi-Automatic', est=False, station=None))
    # missing km: 1 km below the previous signal (DN runs down the km)
    for i, s in enumerate(sigs):
        if not kmkey(s['km']):
            prev = kmkey(sigs[i - 1]['km'])
            s['km'] = f'{prev[0] - 1}/{prev[1]:02d}' if prev[1] >= 10 else f'{prev[0] - 1}/{prev[1]}'
            s['est'] = True
    for s in sigs:
        if s['type'] == 'Semi-Automatic':
            s['station'] = station_for(s['km'])
            s['name'] = f"{s['station']} {s['base']}"
    # km order (DN: km falling); stable for equal km
    sigs.sort(key=lambda s: kmkey(s['km']), reverse=True)
    # neutral sections: "before signal" (by the sheet's own name)
    ns = [r for r in wb['NS UDNA-JNPT'].iter_rows(min_row=2, values_only=True) if r[0]]
    ns_before = []
    for r in ns:
        hdr, before = r[0], r[1]
        if hdr == 'N/S':
            ns_before.append(str(before).strip())
    items = []
    used = set()
    for s in sigs:
        for b in ns_before:
            key = norm(b)
            match = (norm(s['raw']).startswith(key) and (b.upper().startswith('A') or s['station'] == 'JNPN'))
            if match and b not in used:
                items.append(dict(kind='NS', km=None))
                used.add(b)
                break
        items.append(dict(kind='SIG', name=s['name'], station=s['station'], km=s['km'], type=s['type'],
                          sighting=None, tech=EST if s['est'] else None, ri_note=None, shunt=False, pdfrem=''))
    missing = [b for b in ns_before if b not in used]
    return items, missing


def functions(items):
    """By the numbering every station follows: UP S-98 Home, S-42 Starter, S-2 Advance Starter;
    DN S-1 Home, S-41 Starter, S-99 Advance Starter; shunt / loop signals Starter (Loop); others left blank."""
    FN = {'S-98': 'Home', 'S-42': 'Starter', 'S-2': 'Advance Starter',
          'S-1': 'Home', 'S-41': 'Starter', 'S-99': 'Advance Starter'}
    for it in items:
        if it['kind'] != 'SIG' or it['type'] != 'Semi-Automatic':
            continue
        base = it['name'].split(' ', 1)[1]
        if 'LOOP' in it.get('pdfrem', '').upper():
            it['function'] = 'Starter (Loop)'
        else:
            it['function'] = FN.get(base)


def with_headers(items, direction):
    """Station header right after the station's Home signal (its first signal if it has no Home);
    a station at the start of the page gets its header first (the train starts there)."""
    out, placed = [], set()
    anchor = {}
    for it in items:
        if it['kind'] == 'SIG' and it['station']:
            if it.get('function') == 'Home' or it['station'] not in anchor:
                if it.get('function') == 'Home' or anchor.get(it['station']) is None:
                    anchor[it['station']] = id(it)
    first_st = next(it['station'] for it in items if it['kind'] == 'SIG' and it['station'])
    homes = {it['station'] for it in items if it['kind'] == 'SIG' and it.get('function') == 'Home'}
    for it in items:
        st = it.get('station')
        if not out and st == first_st and st not in homes:
            out.append(dict(kind='HDR', station=st)); placed.add(st)
        out.append(it)
        if it['kind'] == 'SIG' and st and st not in placed and anchor.get(st) == id(it):
            out.append(dict(kind='HDR', station=st)); placed.add(st)
    if direction == 'UP' and 'MPRN' not in placed:
        out.append(dict(kind='HDR', station='MPRN'))
    return out


def q(v):
    return 'NULL' if v is None else "'" + str(v).replace("'", "''") + "'"


def build():
    wb = openpyxl.load_workbook(f'{D}/W-DFCC.xlsx', data_only=True)
    up = up_items()
    dn, dn_ns_missing = dn_items(wb)
    functions(up); functions(dn)
    pages = {'UP': with_headers(up, 'UP'), 'DN': with_headers(dn, 'DN')}

    # checks
    problems = []
    for d, items in pages.items():
        names = [it['name'] for it in items if it['kind'] == 'SIG']
        dup = {n for n in names if names.count(n) > 1}
        if dup: problems.append(f'{d}: duplicate names {sorted(dup)}')
        ks = [kmkey(it['km']) for it in items if it['kind'] == 'SIG']
        bad = [(names[i], ks[i]) for i in range(1, len(ks)) if (ks[i] < ks[i - 1] if d == 'UP' else ks[i] > ks[i - 1])]
        if bad: problems.append(f'{d}: km out of order at {bad}')
    if dn_ns_missing: problems.append(f'DN neutral sections not placed: {dn_ns_missing}')
    sname = {c: n for c, n, k in STATIONS}
    skm = {c: k for c, n, k in STATIONS}

    # ---------------- SQL
    L = []
    L.append(f"-- {WHY}")
    L.append("-- Generated by scripts/build-wdfc-signals.py - do not edit by hand; re-run the script.")
    L.append("-- Two pages (UP JNPN -> UDNN -> MPRN, DN UDNN -> JNPN), a DFC beat, signals, aliases, history, N/S rows, PSRs.")
    L.append("-- Undo: 2026-09-30_wdfc_jnpn_mprn_signals_UNDO.sql")
    L.append("START TRANSACTION;")
    L.append(f"SET @why = {q(WHY)};")
    L.append("INSERT INTO div_signal_beats (beat_code, beat_name, office_code, beat_category, description, is_active)"
             " VALUES ('WDFC', 'WDFC (DFC)', 'PNVL', 'GOODS', 'Western Dedicated Freight Corridor, JNPN - MPRN', 1);")
    L.append("SET @beat = LAST_INSERT_ID();")
    order = 0
    for d in ('UP', 'DN'):
        code, title = PAGE[d]
        L.append(f"INSERT INTO div_signal_book_sections (section_title, section_code, direction, line, is_active, edit_source)"
                 f" VALUES ({q(title)}, {q(code)}, '{d}', {q(LINE[d])}, 1, 'import');")
        L.append(f"SET @pg{d} = LAST_INSERT_ID();")
        order += 1
        L.append(f"INSERT INTO div_signal_beat_sections (beat_id, section_id, display_order, is_active) VALUES (@beat, @pg{d}, {order}, 1);")
    for d in ('UP', 'DN'):
        ro = 0
        L.append(f"-- ---------------- {d}: {PAGE[d][1]}")
        for it in pages[d]:
            ro += 100
            if it['kind'] == 'HDR':
                c = it['station']
                txt = f"{sname[c]} ({c}) {skm[c]:g} KM"
                L.append(f"INSERT INTO div_signal_book_rows (book_section_id, row_order, row_type, row_source, display_description,"
                         f" station_code, station_name, highlight_color, text_color, icon_type) VALUES (@pg{d}, {ro}, 'STATION_HEADER', 'import',"
                         f" {q(txt)}, {q(c)}, {q(sname[c])}, 'PURPLE', 'BLACK', 'NONE');")
            elif it['kind'] == 'NS':
                for j, lab in enumerate(('500M', '250M', 'N/S')):
                    L.append(f"INSERT INTO div_signal_book_rows (book_section_id, row_order, row_type, row_source, display_signal_no,"
                             f" display_location, display_description, highlight_color, text_color, icon_type) VALUES (@pg{d}, {ro + j * 10},"
                             f" 'NEUTRAL_SECTION', 'import', {q('NS' if lab == 'N/S' else lab)}, {q(it['km'] if lab == 'N/S' else None)}, {q(lab)},"
                             f" 'GREY', 'BLACK', {q('NEUTRAL_SECTION' if lab == 'N/S' else 'NONE')});")
            elif it['kind'] == 'PSR':
                L.append(f"INSERT INTO div_psr (section, line, direction, start_km_text, end_km_text, speed_kmph, remarks, is_active)"
                         f" VALUES ({q(SECTION)}, {q(LINE[d])}, '{d}', {q(it['km'])}, '', {it['speed']}, @why, 1);")
                L.append(f"INSERT INTO div_signal_book_rows (book_section_id, row_order, row_type, row_source, psr_id, speed_kmph,"
                         f" km_range_text, icon_type) VALUES (@pg{d}, {ro}, 'PSR', 'import', LAST_INSERT_ID(), {it['speed']}, {q(it['km'])}, 'PSR');")
            else:
                st = it['station']
                L.append(f"INSERT INTO div_signals (signal_number, normalized_signal_number, station_code, station_name, section, line,"
                         f" direction, location_text, km_text, signal_type, signal_function, placement, on_curve, is_rhs, is_ext_rhs,"
                         f" is_lhs, is_ext_lhs, has_legend_board, has_calling_on, has_shunt_signal, ri_left_arms, ri_right_arms,"
                         f" route_indicator_notes, technical_remarks, sighting_remarks, is_active) VALUES ({q(it['name'])},"
                         f" {q(norm(it['name']))}, {q(st)}, {q(sname[st].title() if st else None)}, {q(SECTION)}, {q(LINE[d])}, '{d}',"
                         f" {q(it['km'])}, {q(it['km'])}, {q(it['type'])}, {q(it.get('function'))}, 'Unknown', 'Unknown', 0, 0, 0, 0, 0, 0,"
                         f" {1 if it.get('shunt') else 0}, 0, 0, {q(it.get('ri_note'))}, {q(it.get('tech'))}, {q(it.get('sighting'))}, 1);")
                L.append("SET @s = LAST_INSERT_ID();")
                L.append("UPDATE div_signals SET magnet_id = @s WHERE id = @s;")
                L.append(f"INSERT INTO div_signal_book_rows (book_section_id, row_order, row_type, row_source, signal_id, display_signal_no,"
                         f" display_location, highlight_color, text_color, icon_type) VALUES (@pg{d}, {ro}, 'SIGNAL', 'import', @s,"
                         f" {q(it['name'])}, {q(it['km'])}, 'NONE', 'BLACK', 'NONE');")
                L.append(f"INSERT INTO div_signal_aliases (signal_id, alias_text, normalized_alias, source, confidence, remarks)"
                         f" VALUES (@s, {q(it['name'])}, {q(norm(it['name']))}, 'excel_import', 'HIGH', @why);")
                L.append("INSERT INTO div_signal_history (signal_id, change_type, old_value, new_value, change_date, remarks)"
                         f" VALUES (@s, 'Created', NULL, {q(it['name'])}, CURDATE(), @why);")
    L.append("COMMIT;")
    L.append(f"SELECT line, signal_type, COUNT(*) n FROM div_signals WHERE section = {q(SECTION)} GROUP BY 1, 2 ORDER BY 1, 2;")
    open(OUT, 'w').write('\n'.join(L) + '\n')

    U = [f"-- Undo 2026-09-30_wdfc_jnpn_mprn_signals.sql", "START TRANSACTION;",
         f"SET @why = {q(WHY)};",
         f"DELETE h FROM div_signal_history h JOIN div_signals s ON s.id = h.signal_id WHERE s.section = {q(SECTION)};",
         f"DELETE a FROM div_signal_aliases a JOIN div_signals s ON s.id = a.signal_id WHERE s.section = {q(SECTION)};",
         f"DELETE r FROM div_signal_book_rows r JOIN div_signal_book_sections b ON b.id = r.book_section_id"
         f" WHERE b.section_code IN ({q(PAGE['UP'][0])}, {q(PAGE['DN'][0])});",
         f"DELETE FROM div_signals WHERE section = {q(SECTION)};",
         f"DELETE FROM div_psr WHERE section = {q(SECTION)} AND remarks = @why;",
         "DELETE bs FROM div_signal_beat_sections bs JOIN div_signal_beats b ON b.id = bs.beat_id WHERE b.beat_code = 'WDFC';",
         f"DELETE FROM div_signal_book_sections WHERE section_code IN ({q(PAGE['UP'][0])}, {q(PAGE['DN'][0])});",
         "DELETE FROM div_signal_beats WHERE beat_code = 'WDFC';", "COMMIT;"]
    open(UNDO, 'w').write('\n'.join(U) + '\n')

    # ---------------- review listing
    print('PROBLEMS:', problems or 'none')
    for d in ('UP', 'DN'):
        items = pages[d]
        sig = [it for it in items if it['kind'] == 'SIG']
        print(f"\n===== {d} {PAGE[d][1]}: {len(sig)} signals, {sum(1 for it in items if it['kind']=='NS')} neutral sections,"
              f" {sum(1 for it in items if it['kind']=='PSR')} PSRs, {sum(1 for it in items if it['kind']=='HDR')} station headers")
        for it in items:
            if it['kind'] == 'HDR':
                print(f"   ---- {sname[it['station']]} ({it['station']}) {skm[it['station']]:g} KM")
            elif it['kind'] == 'NS':
                print(f"   [N/S {it['km'] or ''}]")
            elif it['kind'] == 'PSR':
                print(f"   [PSR {it['speed']} km/h from {it['km']}]")
            elif it['type'] != 'Automatic' or it.get('sighting') or it.get('tech'):
                extra = ' | '.join(x for x in (it.get('function'), it.get('ri_note'), it.get('sighting'), it.get('tech')) if x)
                print(f"   {it['name']:<16} {it['km']:<9} {it['type']:<15} {extra}")


if __name__ == '__main__':
    build()
