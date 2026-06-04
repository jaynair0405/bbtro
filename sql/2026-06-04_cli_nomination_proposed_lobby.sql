-- CLI Nomination: add "Proposed Lobby" to nominations
--
-- Why: when a staff's CLI nomination changes they are often being moved to
-- another lobby (office), but the actual transfer may not yet be accepted by
-- the receiving lobby (or released by the current lobby). The nomination letter
-- needs to record the proposed/target lobby manually until the transfer is
-- formalised. Later this will be wired automatically from the Transfer Letter
-- preparation feature (see TODO.md › CLI Nomination).
--
-- Stores offices.office_code (varchar(15)). NULL = no proposed lobby (staff
-- stays in current lobby). This column does NOT change div_staff_master — it is
-- purely informational on the nomination record / letter.

ALTER TABLE div_cli_nominations
  ADD COLUMN proposed_lobby VARCHAR(15) NULL DEFAULT NULL AFTER letter_id;
