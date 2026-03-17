-- CLA to CSMT/VVH CMS ID Migration - Batch 2
-- Date: 2026-03-16
-- Updates current_cms_id and sets is_yard_staff = 1

SET SQL_SAFE_UPDATES = 0;

UPDATE div_staff_master SET current_cms_id = 'CSMT4770', current_office_code = 'CSMT-ML', is_yard_staff = 1 WHERE current_cms_id = 'CLA4188';
UPDATE div_staff_master SET current_cms_id = 'CSMT4780', current_office_code = 'CSMT-ML', is_yard_staff = 1 WHERE current_cms_id = 'CLA3908';
UPDATE div_staff_master SET current_cms_id = 'CSMT5048', current_office_code = 'CSMT-ML', is_yard_staff = 1 WHERE current_cms_id = 'CLA4265';
UPDATE div_staff_master SET current_cms_id = 'CSMT6002', current_office_code = 'CSMT-ML', is_yard_staff = 1 WHERE current_cms_id = 'CLA3267';
UPDATE div_staff_master SET current_cms_id = 'CSMT6328', current_office_code = 'CSMT-ML', is_yard_staff = 1 WHERE current_cms_id = 'CLA3833';
UPDATE div_staff_master SET current_cms_id = 'CSMT4689', current_office_code = 'CSMT-ML', is_yard_staff = 1 WHERE current_cms_id = 'CLA3924';
UPDATE div_staff_master SET current_cms_id = 'CSMT4714', current_office_code = 'CSMT-ML', is_yard_staff = 1 WHERE current_cms_id = 'CLA4033';
UPDATE div_staff_master SET current_cms_id = 'CSMT4911', current_office_code = 'CSMT-ML', is_yard_staff = 1 WHERE current_cms_id = 'CLA3826';
UPDATE div_staff_master SET current_cms_id = 'CSMT6180', current_office_code = 'CSMT-ML', is_yard_staff = 1 WHERE current_cms_id = 'CLA3679';
UPDATE div_staff_master SET current_cms_id = 'CSMT6008', current_office_code = 'CSMT-ML', is_yard_staff = 1 WHERE current_cms_id = 'CLA2585';
UPDATE div_staff_master SET current_cms_id = 'CSMT5059', current_office_code = 'CSMT-ML', is_yard_staff = 1 WHERE current_cms_id = 'CLA4219';
UPDATE div_staff_master SET current_cms_id = 'CSMT6338', current_office_code = 'CSMT-ML', is_yard_staff = 1 WHERE current_cms_id = 'CLA3863';
UPDATE div_staff_master SET current_cms_id = 'CSMT6003', current_office_code = 'CSMT-ML', is_yard_staff = 1 WHERE current_cms_id = 'CLA5250';
UPDATE div_staff_master SET current_cms_id = 'VVH1179', current_office_code = 'VVH-ML', is_yard_staff = 1 WHERE current_cms_id = 'CLA4195';
UPDATE div_staff_master SET current_cms_id = 'CSMT5665', current_office_code = 'CSMT-ML', is_yard_staff = 1 WHERE current_cms_id = 'CLA3525';
UPDATE div_staff_master SET current_cms_id = 'CSMT4802', current_office_code = 'CSMT-ML', is_yard_staff = 1 WHERE current_cms_id = 'CLA3935';
UPDATE div_staff_master SET current_cms_id = 'CSMT6041', current_office_code = 'CSMT-ML', is_yard_staff = 1 WHERE current_cms_id = 'CLA5045';
UPDATE div_staff_master SET current_cms_id = 'CSMT4850', current_office_code = 'CSMT-ML', is_yard_staff = 1 WHERE current_cms_id = 'CLA4120';
UPDATE div_staff_master SET current_cms_id = 'CSMT4720', current_office_code = 'CSMT-ML', is_yard_staff = 1 WHERE current_cms_id = 'CLA4032';

SET SQL_SAFE_UPDATES = 1;

-- Verify
SELECT current_cms_id, original_cms_id, name, current_office_code, is_yard_staff
FROM div_staff_master
WHERE original_cms_id IN ('CLA4188','CLA3908','CLA4265','CLA3267','CLA3833','CLA3924','CLA4033','CLA3826','CLA3679','CLA2585','CLA4219','CLA3863','CLA5250','CLA4195','CLA3525','CLA3935','CLA5045','CLA4120','CLA4032');
