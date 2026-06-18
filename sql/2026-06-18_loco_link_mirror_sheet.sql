-- 2026-06-18_loco_link_mirror_sheet.sql
-- Phase 2 of PNVL sheets: let a master row ALSO appear on a second sheet
-- (e.g. a KR loco-change leg of 22149/22150 shown on PNVL-UP/PNVL-DN) while
-- staying a single record — same master_id + log, edits sync, counted once.
--
-- /today includes rows where sheet_source = ? OR mirror_sheet = ?.

ALTER TABLE div_loco_link_master
  ADD COLUMN mirror_sheet VARCHAR(30) NULL AFTER sheet_source;

-- 22150 (PUNE->ERS): arriving-PNVL leg mirrors to PNVL-UP, departing-PNVL leg
-- to PNVL-DN. (id values are local; on prod scope by train_no + sheet_source.)
--   Leg A id 102  KR-UP  PUNE->PNVL (arrives PNVL)  -> PNVL-UP
--   Leg B id 282  KR-DN  PNVL->RN   (departs PNVL)  -> PNVL-DN
UPDATE div_loco_link_master SET mirror_sheet='PNVL-UP'
  WHERE train_no='22150' AND sheet_source='KR-UP' AND to_station='PNVL';
UPDATE div_loco_link_master SET mirror_sheet='PNVL-DN'
  WHERE train_no='22150' AND sheet_source='KR-DN' AND from_station='PNVL';

-- 22149 (ERS->PUNE): same structure as 22150.
--   KR-UP row = arriving-PNVL leg (RN->ROHA->PNVL)  -> mirror PNVL-UP; to_station=PNVL
--   KR-DN row = departing-PNVL leg (PNVL->PUNE)     -> mirror PNVL-DN; event=PNVL departure
UPDATE div_loco_link_master
  SET to_station='PNVL', mirror_sheet='PNVL-UP'
  WHERE train_no='22149' AND sheet_source='KR-UP';
-- departing leg is Pune-bound (SE side, via LNL) -> section SE so its boundary
-- shows the real LNL handover time, not the (wrong-direction) KR ROHA.
UPDATE div_loco_link_master
  SET section='SE', event_time='03:00', mirror_sheet='PNVL-DN'
  WHERE train_no='22149' AND sheet_source='KR-DN';
