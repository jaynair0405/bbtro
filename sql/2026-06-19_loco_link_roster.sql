-- ============================================================================
-- Loco-Link Roster Maintenance — schema + Link 1 seed
-- Control Office module.  Date: 2026-06-19
--
-- WHAT THIS IS
-- A "loco link" is a multi-day cyclic roster that one physical loco follows
-- (CR Electric Loco Link review doc, ~69 links).  The loco threads through an
-- ordered chain of trains; some legs leave Mumbai division (worked by another
-- zone under a different train number we cannot observe) and return on a known
-- Mumbai-touching train.  The link is "maintained" when the SAME loco number we
-- sent out comes back on the expected return train on the expected day.
--
-- This module stores the link definitions (header + ordered checkpoint legs).
-- The loco observations themselves are reused from div_loco_link_log
-- (the existing LPC daily sheet) — no new data entry.  The report engine
-- (GET /api/division/loco-link/reports/link-maintenance) walks consecutive
-- checkpoint legs and compares logged loco numbers at the right dates.
--
-- IDEMPOTENT: safe to re-run.  No changes to any existing table.
-- ============================================================================

-- ── Header: one row per link (mirrors the PDF summary table) ───────────────
CREATE TABLE IF NOT EXISTS div_loco_link_roster (
    id              INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    link_no         VARCHAR(10) NOT NULL,            -- string: links have gaps/letters ('1','43','69')
    shed_code       VARCHAR(10) DEFAULT NULL,        -- KYN / PA / BSL / AQ
    loco_type       VARCHAR(20) DEFAULT NULL,        -- WAP7 / WAP4 / WCAM3
    hog_flag        VARCHAR(20) DEFAULT NULL,        -- HOG / ICF / LHB (the "HOG/Non HOG" + Rake column)
    locos_in_link   INT DEFAULT NULL,
    link_kms        INT DEFAULT NULL,
    utilization     INT DEFAULT NULL,
    train_pairs     INT DEFAULT NULL,
    ti_locations    VARCHAR(60) DEFAULT NULL,        -- e.g. 'GKP AND LTT'
    cycle_days      INT DEFAULT NULL,                -- total cycle length (for the wrap-around leg)
    notes           VARCHAR(255) DEFAULT NULL,
    active          TINYINT(1) NOT NULL DEFAULT 1,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_link_no (link_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Legs: ordered checkpoint sequence per link ─────────────────────────────
CREATE TABLE IF NOT EXISTS div_loco_link_roster_legs (
    id              INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    roster_id       INT NOT NULL,
    seq_order       INT NOT NULL,                    -- position in the cycle (1..N)
    train_no        VARCHAR(20) NOT NULL,
    train_id        INT DEFAULT NULL,                -- resolved via resolveTrainByNo(); nullable
    direction       ENUM('UP','DN','BYPASS') NOT NULL,
    day_offset      INT NOT NULL DEFAULT 1,          -- day number within the cycle (20103 = day 1)
    is_checkpoint   TINYINT(1) NOT NULL DEFAULT 1,   -- 1 = Mumbai-touching (observed); 0 = other-zone (display only)
    ti_after        TINYINT(1) NOT NULL DEFAULT 0,   -- TI performed after this train
    remark          VARCHAR(255) DEFAULT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_roster_legs FOREIGN KEY (roster_id)
        REFERENCES div_loco_link_roster(id) ON DELETE CASCADE,
    UNIQUE KEY uk_roster_seq (roster_id, seq_order),
    KEY idx_roster (roster_id),
    KEY idx_train (train_no, direction)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SEED — Link 1 (KYN / WAP7 / HOG)
--   Cycle ≈ 17 days.  Checkpoint trains only (other-zone 15104/15081/15082/
--   15103 legs are NOT tracked).  TI is done at LTT after each return leg.
--
--   day_offset values are derived from the LPC narrative + page-4 pictorial:
--     20103 dep day 1  →  20104 back day 4  →  12167 day 5  →  12168 back day 9 …
--   *** VERIFY day_offset values with the LPC before relying on the report. ***
-- ============================================================================

INSERT INTO div_loco_link_roster
    (link_no, shed_code, loco_type, hog_flag, locos_in_link, link_kms,
     utilization, train_pairs, ti_locations, cycle_days, notes)
VALUES
    ('1', 'KYN', 'WAP7', 'HOG', 19, 16174, 851, 14, 'GKP AND LTT', 17,
     'Pilot link. Other-zone legs (15104/15081/15082/15103) untracked. Day offsets to verify with LPC.')
ON DUPLICATE KEY UPDATE
    shed_code=VALUES(shed_code), loco_type=VALUES(loco_type), hog_flag=VALUES(hog_flag),
    locos_in_link=VALUES(locos_in_link), link_kms=VALUES(link_kms),
    utilization=VALUES(utilization), train_pairs=VALUES(train_pairs),
    ti_locations=VALUES(ti_locations), cycle_days=VALUES(cycle_days), notes=VALUES(notes);

-- Re-seed legs cleanly (idempotent): clear this link's legs, then insert.
DELETE lg FROM div_loco_link_roster_legs lg
    JOIN div_loco_link_roster r ON r.id = lg.roster_id
    WHERE r.link_no = '1';

INSERT INTO div_loco_link_roster_legs
    (roster_id, seq_order, train_no, direction, day_offset, is_checkpoint, ti_after, remark)
SELECT r.id, t.seq_order, t.train_no, t.direction, t.day_offset, 1, t.ti_after, t.remark
FROM div_loco_link_roster r
JOIN (
    SELECT 1  AS seq_order, '20103' AS train_no, 'DN' AS direction, 1  AS day_offset, 0 AS ti_after, 'LTT-GKP SUPER-FAST (out)'        AS remark UNION ALL
    SELECT 2,               '20104',             'UP',              4,               1,            'GKP-LTT SUPER-FAST (back); TI @ LTT'      UNION ALL
    SELECT 3,               '12167',             'DN',              5,               0,            'LTT(T)-BSBS SF (out, leaves division)'    UNION ALL
    SELECT 4,               '12168',             'UP',              9,               1,            'BSBS-LTT SF (back); TI @ LTT'             UNION ALL
    SELECT 5,               '15017',             'DN',              10,              0,            'LTT-GKR KASHI (out)'                      UNION ALL
    SELECT 6,               '15018',             'UP',              12,              1,            'GKR-LTT KASHI (back); TI @ LTT'           UNION ALL
    SELECT 7,               '18520',             'DN',              13,              0,            'LTT-VSKP (out)'                           UNION ALL
    SELECT 8,               '18519',             'UP',              15,              1,            'VSKP-LTT (back); TI @ LTT'                UNION ALL
    SELECT 9,               '12141',             'DN',              16,              0,            'LTT-PPTA (out)'                           UNION ALL
    SELECT 10,              '12142',             'UP',              17,              1,            'PPTA-LTT (back); TI @ LTT; link repeats'
) t
WHERE r.link_no = '1';
