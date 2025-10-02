-- Create Awards and Punishments tables for Division Portal

CREATE TABLE div_staff_awards (
  award_id INT AUTO_INCREMENT PRIMARY KEY,
  staff_hrms_id VARCHAR(10),
  award_name VARCHAR(200),
  award_date DATE,
  issued_by VARCHAR(100),
  description TEXT,
  remarks TEXT,
  created_by VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by VARCHAR(50),
  updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_hrms_id) REFERENCES div_staff_master(hrms_id)
);

CREATE TABLE div_staff_punishments (
  punishment_id INT AUTO_INCREMENT PRIMARY KEY,
  staff_hrms_id VARCHAR(10),
  punishment_type VARCHAR(100),
  punishment_date DATE,
  severity ENUM('Minor', 'Major', 'Severe'),
  description TEXT,
  issued_by VARCHAR(100),
  remarks TEXT,
  created_by VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by VARCHAR(50),
  updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_hrms_id) REFERENCES div_staff_master(hrms_id)
);

-- Verify tables created
SHOW TABLES LIKE 'div_staff_%';
