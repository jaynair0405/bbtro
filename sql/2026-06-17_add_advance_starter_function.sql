-- Add 'Advance Starter' to div_signals.signal_function enum.
-- BB Division uses "Advance Starter" (not "Advanced Starter") as the standard
-- term for the advance starter signal. Kept alongside the existing value.
ALTER TABLE div_signals
  MODIFY COLUMN signal_function ENUM(
    'Double Distant','Distant','Inner Distant','Home','Inner Home',
    'Starter','Starter (Loop)','Advance Starter','Advanced Starter',
    'IBS','IBS Distant','Gate Distant','Repeater','Other'
  ) DEFAULT NULL;
