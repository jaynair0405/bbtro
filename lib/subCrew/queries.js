/**
 * Suburban Crew Ops — the SQL, in one place.
 *
 * Lifted out of scripts/build_page_snapshots.js so the live API and the offline
 * snapshot builder cannot drift on column lists or ordering. Ordering matters:
 * details are ordered line -> numeric detail_number and legs detail -> start_time,
 * and the pages render in exactly that order.
 *
 * Read-only. Every table here is owned by the detail-book/suburban side:
 *   detail_blocks, details, trains, suburban_train_master
 */
'use strict';

const SQL_BLOCKS = `
  SELECT * FROM detail_blocks WHERE is_active = 1 ORDER BY id
`;

const SQL_DETAILS = `
  SELECT d.detail_id, d.detail_number, d.line,
         d.sign_on_time, d.sign_on_place, d.sign_off_time, d.sign_off_place,
         d.total_duty_hours, d.total_wheel_movement, d.total_piloting,
         d.detail_type, d.next_detail_id, d.cycle_anchor
    FROM details d
   ORDER BY d.line, CAST(d.detail_number AS UNSIGNED)
`;

/**
 * Legs, with the service attributes joined from suburban_train_master.
 *
 * The join goes through a de-duplicating subquery rather than straight onto
 * suburban_train_master. normalized_train_number is only a non-unique KEY (the
 * PK is train_code), and sql/2026-07-29_suburban_train_master_verify.sql already
 * carries a duplicate check — so duplicates are known to be possible, just absent
 * today. A single duplicate master row would fan out EVERY leg of that train:
 * leg counts, wheel movement and the train index would all inflate silently, on
 * every request, with no error anywhere. MIN(train_code) keeps it one-to-one.
 */
const SQL_LEGS = `
  SELECT t.detail_id, t.train_number, t.train_type,
         t.start_station, t.start_time, t.end_station, t.end_time, t.remarks,
         t.rt_detail, t.rb_detail,
         m.service_type, m.car_composition, m.ac_service, m.line_group, m.direction
    FROM trains t
    LEFT JOIN (
           SELECT normalized_train_number AS n, MIN(train_code) AS c
             FROM suburban_train_master
            GROUP BY normalized_train_number
         ) x
      ON x.n = UPPER(REPLACE(CASE WHEN t.train_number LIKE 'P/%'
                                  THEN SUBSTRING(t.train_number, 3)
                                  ELSE t.train_number END, ' ', ''))
    LEFT JOIN suburban_train_master m ON m.train_code = x.c
   ORDER BY t.detail_id, t.start_time
`;

/** from/to + display number, for trains matched to the master. */
const SQL_MASTER = `
  SELECT normalized_train_number AS n, train_number AS tn,
         from_station AS f, to_station AS to_
    FROM suburban_train_master
   ORDER BY train_code
`;

module.exports = { SQL_BLOCKS, SQL_DETAILS, SQL_LEGS, SQL_MASTER };
