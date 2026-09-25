-- Prod deploy STEP 3: align div_signals.signal_function enum with local (adds 'Intermediate Starter').
-- Safe/additive. Run on prod.
ALTER TABLE div_signals MODIFY COLUMN signal_function
  ENUM('Double Distant','Distant','Inner Distant','Home','Inner Home','Starter',
       'Starter (Loop)','Advance Starter','Advanced Starter','IBS','IBS Distant',
       'Gate Distant','Repeater','Other','Intermediate Starter') NULL;
SELECT COLUMN_TYPE FROM information_schema.columns
WHERE table_schema=DATABASE() AND table_name='div_signals' AND column_name='signal_function';
