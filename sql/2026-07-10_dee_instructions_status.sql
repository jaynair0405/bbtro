-- Documents repository: draft/finalise workflow for composed instructions.
-- A composed instruction is first saved as a DRAFT (private to its author,
-- hidden from the Sr.DEE Instructions list) and only appears in the list once
-- the author clicks "Finalize" (status='final'). Uploaded rows have status NULL.

-- A draft may be unnumbered until it is finalised, so title becomes nullable
-- (uploaded rows and finalised instructions always carry a title).
ALTER TABLE div_documents
  ADD COLUMN status ENUM('draft','final') NULL AFTER source_type,
  MODIFY title VARCHAR(255) NULL;
