-- Centre-specific registration of shared trainee identities. No master-table writes.
CREATE TABLE div_training_trainee_centers (
  trainee_id BIGINT UNSIGNED NOT NULL,
  training_center_id INT NOT NULL,
  registered_by VARCHAR(100) NOT NULL,
  registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (trainee_id, training_center_id),
  KEY ix_trg_register_center (training_center_id, registered_at),
  CONSTRAINT fk_trg_register_trainee FOREIGN KEY (trainee_id) REFERENCES div_training_trainees(trainee_id),
  CONSTRAINT fk_trg_register_center FOREIGN KEY (training_center_id) REFERENCES div_training_centers(center_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
