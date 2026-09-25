-- TS-030: map Trip Shed users to one or more active sheds.
CREATE TABLE IF NOT EXISTS div_trip_shed_users (
  user_id INT NOT NULL,
  shed_id INT NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  assigned_by INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, shed_id),
  KEY idx_trip_shed_users_shed (shed_id, is_active),
  CONSTRAINT fk_trip_shed_users_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_trip_shed_users_shed FOREIGN KEY (shed_id) REFERENCES div_trip_sheds(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Preserve current VVH access for existing Trip Shed accounts.
INSERT IGNORE INTO div_trip_shed_users(user_id, shed_id)
SELECT u.id, s.id
FROM users u
JOIN div_trip_sheds s ON s.shed_code='VVH' AND s.is_active=1
WHERE u.realm='division'
  AND u.div_role IN ('division_admin','trip_shed_operator','trip_shed_supervisor','lpc','ctlc','ctlc_view','ssehq');
