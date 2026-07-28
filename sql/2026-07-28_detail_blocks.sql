-- Suburban detail crew-link blocks: office + line + link_type + number range.
-- Drives the single/double/triple chaining (which link_type a detail is, and
-- the wrap boundaries for rolling Continuous n->n+1). Editable from UI when a
-- new detail book changes the ranges. office_code -> offices (3 suburban offices).
-- "next" in a Continuous link follows the next detail of the SAME link_type
-- (so PNVL continuous rolls 538 -> 547, skipping the 539-546 fix gap, wraps 551 -> 451).
-- Departmental/dummy details (410,411,412,558,999) are intentionally in NO block.

DROP TABLE IF EXISTS detail_blocks;
CREATE TABLE detail_blocks (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  office_code  VARCHAR(15) NOT NULL,
  line         ENUM('mainline','harbour') NOT NULL,
  link_type    ENUM('continuous','fix','memu') NOT NULL,
  start_number INT NOT NULL,
  end_number   INT NOT NULL,
  label        VARCHAR(60),
  is_active    TINYINT(1) DEFAULT 1,
  CONSTRAINT fk_detail_blocks_office FOREIGN KEY (office_code) REFERENCES offices(office_code)
);

INSERT INTO detail_blocks (office_code, line, link_type, start_number, end_number, label) VALUES
  ('CSMT-SUB','mainline','continuous',   1, 157,'CSMT Mainline Continuous'),
  ('CSMT-SUB','mainline','fix',        158, 177,'CSMT Mainline Fix'),
  ('CSMT-SUB','mainline','memu',       191, 193,'CSMT Mainline MEMU'),
  ('KYN-SUB', 'mainline','continuous', 601, 849,'KYN Mainline Continuous'),
  ('KYN-SUB', 'mainline','fix',        850, 872,'KYN Mainline Fix'),
  ('KYN-SUB', 'mainline','memu',       901, 912,'KYN Mainline MEMU'),
  ('CSMT-SUB','harbour', 'continuous', 201, 384,'CSMT Harbour Continuous'),
  ('CSMT-SUB','harbour', 'fix',        386, 404,'CSMT Harbour Fix'),
  ('PNVL-SUB','harbour', 'continuous', 451, 538,'PNVL Harbour Continuous'),
  ('PNVL-SUB','harbour', 'fix',        539, 546,'PNVL Harbour Fix'),
  ('PNVL-SUB','harbour', 'continuous', 547, 553,'PNVL Harbour Continuous (part 2)'),
  ('PNVL-SUB','harbour', 'memu',       554, 557,'PNVL Harbour MEMU');

SELECT 'detail_blocks created + seeded' AS status, COUNT(*) AS rows_ FROM detail_blocks;
