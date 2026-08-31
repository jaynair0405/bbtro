-- Control office — two independent data fixes.

-- 1. Rake types: VNDB / AMTB / LVPH
-- The Settings dropdowns previously offered LHB, ICF, Vande, Other. "Vande" is
-- replaced by the code VNDB so every rake type is a 4-letter code, and Amrit
-- Bharat (AMTB) and parcel (LVPH) are added. rake_type is a free varchar(20)
-- with no server-side allowlist, so the dropdown IS the vocabulary — a row left
-- on the retired "Vande" value would render blank in the edit modal and be
-- silently cleared on the next save. Hence this rename.
UPDATE div_loco_link_master SET rake_type = 'VNDB' WHERE rake_type = 'Vande';

-- 2. Train 13380 LTT-DHN (Wednesday) departure time
-- Stored as 04:55; the actual LTT departure is 16:55 — a 12-hour data-entry
-- slip (4:55 PM entered as 4:55). The sheet was faithfully showing what was in
-- the table. 13380 has no div_train_stops rows, which is why the WTT cross-check
-- never caught it; every other master row that HAS stop rows was scanned and
-- none is off by 12 hours.
UPDATE div_loco_link_master
   SET event_time = '16:55'
 WHERE train_no = '13380' AND event_time = '04:55';

-- Verify
SELECT train_no, sheet_source, from_station, to_station, event_time, run_days
  FROM div_loco_link_master WHERE train_no = '13380';
SELECT rake_type, COUNT(*) AS rows_ FROM div_loco_link_master GROUP BY 1;
