-- Division Portal Test Data (matching actual office codes)

-- Insert test data into div_staff_master
INSERT INTO div_staff_master
(hrms_id, original_cms_id, current_cms_id, name, current_office_code, designation_id, safety_category, assignment_status, date_of_birth, date_of_appointment)
VALUES
-- CSMT-SUB Staff (5 staff)
('HRMS001', 'CMS12345', 'CMS12345', 'Rajesh Kumar Sharma', 'CSMT-SUB', 1, 'A', 'permanent', '1985-03-15', '2010-06-01'),
('HRMS002', 'CMS12346', 'CMS12346', 'Priya Deshmukh', 'CSMT-SUB', 2, 'B', 'permanent', '1990-07-22', '2015-04-10'),
('HRMS003', 'CMS12347', 'CMS12347', 'Amit Patil', 'CSMT-SUB', 1, 'A', 'permanent', '1988-11-30', '2012-08-15'),
('HRMS004', 'CMS12348', 'CMS12348', 'Sneha Joshi', 'CSMT-SUB', 3, 'C', 'permanent', '1992-05-18', '2018-01-20'),
('HRMS005', 'CMS12349', 'CMS12349', 'Vikram Singh', 'CSMT-SUB', 1, 'A', 'permanent', '1987-09-10', '2011-03-05'),

-- PNVL-SUB Staff (3 staff)
('HRMS006', 'CMS12350', 'CMS12350', 'Anjali Mehta', 'PNVL-SUB', 2, 'B', 'permanent', '1991-02-28', '2016-07-12'),
('HRMS007', 'CMS12351', 'CMS12351', 'Suresh Yadav', 'PNVL-SUB', 1, 'A', 'permanent', '1986-08-14', '2010-11-22'),
('HRMS008', 'CMS12352', 'CMS12352', 'Kavita Nair', 'PNVL-SUB', 3, 'C', 'permanent', '1993-12-05', '2019-05-30'),

-- KYN-SUB Staff (2 staff)
('HRMS009', 'CMS12353', 'CMS12353', 'Ravi Kulkarni', 'KYN-SUB', 1, 'A', 'permanent', '1989-04-17', '2013-02-14'),
('HRMS010', 'CMS12354', 'CMS12354', 'Deepa Sawant', 'KYN-SUB', 2, 'B', 'permanent', '1990-10-08', '2015-09-01'),

-- NRL Staff (2 staff)
('HRMS011', 'CMS12355', 'CMS12355', 'Mahesh Pawar', 'NRL', 1, 'A', 'permanent', '1987-06-25', '2011-12-10'),
('HRMS012', 'CMS12356', 'CMS12356', 'Sunita Rane', 'NRL', 3, 'C', 'permanent', '1994-03-12', '2020-01-15'),

-- LNL Staff (2 staff)
('HRMS013', 'CMS12357', 'CMS12357', 'Anil Shinde', 'LNL', 1, 'A', 'permanent', '1988-01-20', '2012-05-18'),
('HRMS014', 'CMS12358', 'CMS12358', 'Meena Ghosh', 'LNL', 2, 'B', 'permanent', '1991-08-30', '2016-10-05'),

-- IGP Staff (1 staff)
('HRMS015', 'CMS12359', 'CMS12359', 'Rahul Jadhav', 'IGP', 1, 'A', 'permanent', '1986-11-11', '2010-07-20'),

-- CLA Staff (3 staff)
('HRMS016', 'CMS12360', 'CMS12360', 'Pooja Khanna', 'CLA', 2, 'B', 'permanent', '1992-09-22', '2017-03-15'),
('HRMS017', 'CMS12361', 'CMS12361', 'Sachin More', 'CLA', 1, 'A', 'permanent', '1989-07-05', '2013-11-08'),
('HRMS018', 'CMS12362', 'CMS12362', 'Nisha Verma', 'CLA', 3, 'C', 'permanent', '1993-04-16', '2019-08-22')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Verify the data
SELECT 'Staff count per office:' as Info;
SELECT
    o.office_code,
    o.office_name,
    COUNT(s.hrms_id) as staff_count
FROM offices o
LEFT JOIN div_staff_master s ON o.office_code = s.current_office_code
WHERE o.is_active = 1
GROUP BY o.office_code, o.office_name
ORDER BY staff_count DESC;

SELECT '' as '';
SELECT 'Total staff added:' as Info;
SELECT COUNT(*) as total_staff FROM div_staff_master;
