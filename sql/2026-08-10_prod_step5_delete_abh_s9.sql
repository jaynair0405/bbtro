-- Prod deploy STEP 5: delete prod ABH S-9 (id 2168) to free the colliding id.
-- FK effects: div_aws_events.signal_id -> SET NULL (events preserved, re-linked at step 10);
--             div_signal_aliases -> CASCADE (ABH S-9 alias auto-removed; reloads at id 3603 in bulk).
-- ABH S-9 re-lands at local id 3603 during step 7; id 2168 becomes LNL S-8.

SELECT '--- ABH S-9 (id 2168) before ---' AS x;
SELECT id, signal_number, section, direction FROM div_signals WHERE id=2168;
SELECT COUNT(*) AS aws_events_linked_to_2168 FROM div_aws_events WHERE signal_id=2168;
SELECT COUNT(*) AS alias_rows_for_2168 FROM div_signal_aliases WHERE signal_id=2168;

DELETE FROM div_signals
 WHERE id=2168 AND signal_number='ABH S-9' AND section='KYN-KJT' AND direction='DN';

SELECT '--- after ---' AS x;
SELECT COUNT(*) AS id_2168_remaining FROM div_signals WHERE id=2168;
SELECT COUNT(*) AS alias_2168_remaining FROM div_signal_aliases WHERE signal_id=2168;
SELECT COUNT(*) AS aws_events_now_unlinked FROM div_aws_events WHERE signal_id IS NULL;
