-- Division Portal Test Data
-- Run this to populate initial test data for the division portal

-- Insert test data into div_staff_master
INSERT INTO div_staff_master
(hrms_id, name, current_cms_id, current_office_code, designation_id, safety_category, assignment_status, pme_due_date, mobile, email, date_of_birth, date_of_joining)
VALUES
-- CSMT Staff
('HRMS001', 'Rajesh Kumar Sharma', 'CMS12345', 'CSMT', 1, 'Safety', 'Active', '2025-10-15', '9876543210', 'rajesh.sharma@railway.gov.in', '1985-03-15', '2010-06-01'),
('HRMS002', 'Priya Deshmukh', 'CMS12346', 'CSMT', 2, 'Non-Safety', 'Active', '2025-11-20', '9876543211', 'priya.d@railway.gov.in', '1990-07-22', '2015-04-10'),
('HRMS003', 'Amit Patil', 'CMS12347', 'CSMT', 1, 'Safety', 'Active', '2025-09-05', '9876543212', 'amit.patil@railway.gov.in', '1988-11-30', '2012-08-15'),
('HRMS004', 'Sneha Joshi', 'CMS12348', 'CSMT', 3, 'Non-Safety', 'Active', NULL, '9876543213', 'sneha.j@railway.gov.in', '1992-05-18', '2018-01-20'),
('HRMS005', 'Vikram Singh', 'CMS12349', 'CSMT', 1, 'Safety', 'Active', '2025-10-25', '9876543214', 'vikram.singh@railway.gov.in', '1987-09-10', '2011-03-05'),

-- PNVL Staff
('HRMS006', 'Anjali Mehta', 'CMS12350', 'PNVL', 2, 'Non-Safety', 'Active', '2025-12-10', '9876543215', 'anjali.m@railway.gov.in', '1991-02-28', '2016-07-12'),
('HRMS007', 'Suresh Yadav', 'CMS12351', 'PNVL', 1, 'Safety', 'Active', '2025-10-08', '9876543216', 'suresh.y@railway.gov.in', '1986-08-14', '2010-11-22'),
('HRMS008', 'Kavita Nair', 'CMS12352', 'PNVL', 3, 'Non-Safety', 'Active', NULL, '9876543217', 'kavita.nair@railway.gov.in', '1993-12-05', '2019-05-30'),

-- KYN Staff
('HRMS009', 'Ravi Kulkarni', 'CMS12353', 'KYN', 1, 'Safety', 'Active', '2025-09-20', '9876543218', 'ravi.k@railway.gov.in', '1989-04-17', '2013-02-14'),
('HRMS010', 'Deepa Sawant', 'CMS12354', 'KYN', 2, 'Non-Safety', 'Active', '2025-11-05', '9876543219', 'deepa.s@railway.gov.in', '1990-10-08', '2015-09-01'),

-- NRL Staff
('HRMS011', 'Mahesh Pawar', 'CMS12355', 'NRL', 1, 'Safety', 'Active', '2025-10-30', '9876543220', 'mahesh.p@railway.gov.in', '1987-06-25', '2011-12-10'),
('HRMS012', 'Sunita Rane', 'CMS12356', 'NRL', 3, 'Non-Safety', 'Active', NULL, '9876543221', 'sunita.r@railway.gov.in', '1994-03-12', '2020-01-15'),

-- LNL Staff
('HRMS013', 'Anil Shinde', 'CMS12357', 'LNL', 1, 'Safety', 'Active', '2025-09-15', '9876543222', 'anil.shinde@railway.gov.in', '1988-01-20', '2012-05-18'),
('HRMS014', 'Meena Ghosh', 'CMS12358', 'LNL', 2, 'Non-Safety', 'Active', '2025-12-01', '9876543223', 'meena.g@railway.gov.in', '1991-08-30', '2016-10-05'),

-- IGP Staff
('HRMS015', 'Rahul Jadhav', 'CMS12359', 'IGP', 1, 'Safety', 'Active', '2025-10-18', '9876543224', 'rahul.j@railway.gov.in', '1986-11-11', '2010-07-20'),

-- CLA Staff
('HRMS016', 'Pooja Khanna', 'CMS12360', 'CLA', 2, 'Non-Safety', 'Active', '2025-11-28', '9876543225', 'pooja.k@railway.gov.in', '1992-09-22', '2017-03-15'),
('HRMS017', 'Sachin More', 'CMS12361', 'CLA', 1, 'Safety', 'Active', '2025-09-10', '9876543226', 'sachin.m@railway.gov.in', '1989-07-05', '2013-11-08'),
('HRMS018', 'Nisha Verma', 'CMS12362', 'CLA', 3, 'Non-Safety', 'Active', NULL, '9876543227', 'nisha.v@railway.gov.in', '1993-04-16', '2019-08-22')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert test transfer requests
INSERT INTO div_transfer_requests
(staff_hrms_id, from_office_code, to_office_code, request_date, status, remarks)
VALUES
('HRMS003', 'CSMT', 'PNVL', '2025-09-20', 'Pending', 'Family reasons - spouse transferred'),
('HRMS007', 'PNVL', 'KYN', '2025-09-25', 'Pending', 'Request for proximity to residence')
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- Verify the data
SELECT
    o.office_code,
    o.office_name,
    COUNT(s.hrms_id) as staff_count,
    SUM(CASE WHEN s.pme_due_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as pending_pme
FROM offices o
LEFT JOIN div_staff_master s ON o.office_code = s.current_office_code
WHERE o.is_active = 1
GROUP BY o.office_code, o.office_name
ORDER BY o.office_name;