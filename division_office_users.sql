-- ============================================
-- Division Portal Office Users
-- Generated: 2025-12-03
-- Total Users: 10
-- MySQL 8.0.20+ Compatible (No Warnings)
-- ============================================

-- Office: CLA
-- Username: clasrcc | Password: cla@bbtro45
INSERT INTO users (username, password, full_name, realm, div_role, div_office_code)
VALUES ('clasrcc', '$2b$10$macvdumlPRvADfmV5nlPKuKDeZJPm.EuR5DVSRWDfCIKreEQLSX6K', 'CLA Office SRCC', 'division', 'office_hr', 'CLA') AS new
ON DUPLICATE KEY UPDATE
  password = new.password,
  full_name = new.full_name,
  div_role = new.div_role,
  div_office_code = new.div_office_code;

-- Office: CSMT-ML
-- Username: csmtmlsrcc | Password: csmtml@trobb28
INSERT INTO users (username, password, full_name, realm, div_role, div_office_code)
VALUES ('csmtmlsrcc', '$2b$10$qUwshIuLrM909xFEA/bdoudAzOOVyqfNkQDz7n6OC2K5thOj.XtdO', 'CSMT Main Office SRCC', 'division', 'office_hr', 'CSMT-ML') AS new
ON DUPLICATE KEY UPDATE
  password = new.password,
  full_name = new.full_name,
  div_role = new.div_role,
  div_office_code = new.div_office_code;

-- Office: CSMT-SUB
-- Username: csmtsubsrcc | Password: csmtsub@tro12
INSERT INTO users (username, password, full_name, realm, div_role, div_office_code)
VALUES ('csmtsubsrcc', '$2b$10$bjyckwU6Ard7OCmZfDkA4uKujNA9wEcIv2IF1tpd60gb149OC9TAC', 'CSMT Sub Office SRCC', 'division', 'office_hr', 'CSMT-SUB') AS new
ON DUPLICATE KEY UPDATE
  password = new.password,
  full_name = new.full_name,
  div_role = new.div_role,
  div_office_code = new.div_office_code;

-- Office: IGP
-- Username: igpsrcc | Password: igp@trobb89
INSERT INTO users (username, password, full_name, realm, div_role, div_office_code)
VALUES ('igpsrcc', '$2b$10$Y1nKrAoqRjnDyDIDI7Fpb.JAsiTv.lXf5UVR4EL1dq6ppISPosunu', 'Igatpuri Office SRCC', 'division', 'office_hr', 'IGP') AS new
ON DUPLICATE KEY UPDATE
  password = new.password,
  full_name = new.full_name,
  div_role = new.div_role,
  div_office_code = new.div_office_code;

-- Office: KYN-ML
-- Username: kynmlsrcc | Password: kynml@bbtro33
INSERT INTO users (username, password, full_name, realm, div_role, div_office_code)
VALUES ('kynmlsrcc', '$2b$10$tDmAxAu99A6zMawqOdjfueMJk547ee7ZleG423IJeeew.P/HU/i/e', 'KYN Main Office SRCC', 'division', 'office_hr', 'KYN-ML') AS new
ON DUPLICATE KEY UPDATE
  password = new.password,
  full_name = new.full_name,
  div_role = new.div_role,
  div_office_code = new.div_office_code;

-- Office: KYN-SUB
-- Username: kynsubsrcc | Password: kynsub@tro76
INSERT INTO users (username, password, full_name, realm, div_role, div_office_code)
VALUES ('kynsubsrcc', '$2b$10$j9usBGIQPTcngUhavQWlo.kQFyo0d0u2MlHVWYYoJfPn8Z7Bot/1S', 'KYN Sub Office SRCC', 'division', 'office_hr', 'KYN-SUB') AS new
ON DUPLICATE KEY UPDATE
  password = new.password,
  full_name = new.full_name,
  div_role = new.div_role,
  div_office_code = new.div_office_code;

-- Office: LNL
-- Username: lnlsrcc | Password: lnl@trobb21
INSERT INTO users (username, password, full_name, realm, div_role, div_office_code)
VALUES ('lnlsrcc', '$2b$10$j.NsuxJz.50LfDsbo309ced3okdcHGz8LuB9/keRvLmfiaxCO.Diy', 'Lonavala Office SRCC', 'division', 'office_hr', 'LNL') AS new
ON DUPLICATE KEY UPDATE
  password = new.password,
  full_name = new.full_name,
  div_role = new.div_role,
  div_office_code = new.div_office_code;

-- Office: NRL
-- Username: nrlsrcc | Password: nrl@bbtro50
INSERT INTO users (username, password, full_name, realm, div_role, div_office_code)
VALUES ('nrlsrcc', '$2b$10$HT60gVcN3b80H/6PhkWifukaK4U1mph8sVueOgx6mJkkp/jYfhu6W', 'Neral Office SRCC', 'division', 'office_hr', 'NRL') AS new
ON DUPLICATE KEY UPDATE
  password = new.password,
  full_name = new.full_name,
  div_role = new.div_role,
  div_office_code = new.div_office_code;

-- Office: PNVL-ML
-- Username: pnvlmlsrcc | Password: pnvlml@tro09
INSERT INTO users (username, password, full_name, realm, div_role, div_office_code)
VALUES ('pnvlmlsrcc', '$2b$10$z7nttfyujEQH4tHFT/0LPuIXQdP5qVWXzOg5bhHy5IXa1pfYCEmGC', 'PNVL Main Office SRCC', 'division', 'office_hr', 'PNVL-ML') AS new
ON DUPLICATE KEY UPDATE
  password = new.password,
  full_name = new.full_name,
  div_role = new.div_role,
  div_office_code = new.div_office_code;

-- Office: PNVL-SUB
-- Username: pnvlsubsrcc | Password: pnvlsub@bbtro64
INSERT INTO users (username, password, full_name, realm, div_role, div_office_code)
VALUES ('pnvlsubsrcc', '$2b$10$T3TDZLEhmudbJV6E4wThDuduBfHB5c4H.ejfyA6txK4fCiFazopEq', 'PNVL Sub Office SRCC', 'division', 'office_hr', 'PNVL-SUB') AS new
ON DUPLICATE KEY UPDATE
  password = new.password,
  full_name = new.full_name,
  div_role = new.div_role,
  div_office_code = new.div_office_code;

-- ============================================
-- CREDENTIALS SUMMARY
-- ============================================
--
-- Office         Username            Password                 Role
-- --------------------------------------------------------------------------------
-- CLA            clasrcc             cla@bbtro45              office_hr
-- CSMT-ML        csmtmlsrcc          csmtml@trobb28           office_hr
-- CSMT-SUB       csmtsubsrcc         csmtsub@tro12            office_hr
-- IGP            igpsrcc             igp@trobb89              office_hr
-- KYN-ML         kynmlsrcc           kynml@bbtro33            office_hr
-- KYN-SUB        kynsubsrcc          kynsub@tro76             office_hr
-- LNL            lnlsrcc             lnl@trobb21              office_hr
-- NRL            nrlsrcc             nrl@bbtro50              office_hr
-- PNVL-ML        pnvlmlsrcc          pnvlml@tro09             office_hr
-- PNVL-SUB       pnvlsubsrcc         pnvlsub@bbtro64          office_hr
-- --------------------------------------------------------------------------------
--
-- Login URL: http://localhost:3000/division-login
