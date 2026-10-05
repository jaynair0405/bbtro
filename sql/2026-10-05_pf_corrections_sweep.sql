-- ============================================================================
-- PF number sweep (div_staff_master.pf_number) - 2026-10-05
-- ============================================================================
-- All 101 master rows whose PF is not 11 chars were looked up on the HRMS
-- portal by hrms_id (identical set on local and prod). 93 differ from HRMS in
-- substance and are corrected here to the HRMS value as HRMS shows it:
--   leading "20" missing 59, leading "2" missing 20, leading "200" missing 4,
--   other typos 10 (AADHAC DGCPMN GHDYJC KZBKGX NOKWOI POXSWE QOSYQX THRDXN WFXMYY XIXEKJ).
-- NOT touched: 7 rows that differ only by leading zeros (user: no padding), and
-- TQXMMJ (wrong hrms_id - real id TQXHHJ, PF 002DSL00071; separate correction).
-- pf_number is not a key. Each UPDATE is guarded on the OLD value -> re-run is a
-- no-op. Safe one-shot: mysql < file.
-- ============================================================================

SELECT COUNT(*) AS rows_still_old_before FROM div_staff_master WHERE hrms_id IN ('AADHAC','AHBQNB','AOXWGD','AUKIXA','AUZQDZ','BLLDWQ','BRTFGX','BZMIAS','CGNNLR','CIZRRH','DBTRAL','DCAYRE','DCBZFK','DDAXKY','DGCPMN','DHJDWS','DLQUGX','DPJXOQ','DQYHJD','EHZNIR','EMRNBX','EPSPSI','ETFEGI','FEGUIL','FQBWFX','GDZTRM','GHDYJC','GLRNPH','GNYXHW','GQFPAI','GURRBQ','GZHQNF','HQGBLH','HWYJDX','HYEEAI','JHWQOD','JZOZWR','KTJUEI','KURSQK','KWGIKA','KZBKGX','KZLIKY','LFLJEU','LHDNBE','LLAKNX','LYCCWR','MDDILA','MKLNRS','MOCEEI','MPRNWM','MYITYB','NFSPYE','NIGLZZ','NNORIQ','NOKWOI','OCDQYI','PAKHIK','PFGMBX','PFHPKS','PGWDLD','PMWUHX','POXSWE','QOSYQX','QRZQNO','QTWXUB','QUQMZP','QUTBRC','RIIUQF','RSFIOZ','RTPKYY','RZRRHP','SGKUUG','SGQEEM','SQXXNB','SROKBI','TGUZYT','THRDXN','TIGXRA','TJZLZJ','TORSMF','TSQZSP','UBESRC','UDUPCZ','UGZLYC','USDNBI','WFXMYY','XCABAN','XIPLWU','XIXEKJ','XMAZUF','YDXYOP','ZPXXNF','ZZSWMR') AND LENGTH(pf_number) <> 11;

UPDATE div_staff_master SET pf_number = '00229817293' WHERE hrms_id = 'AADHAC' AND pf_number = '0022917293'; -- MASKE AMIT KAWDU
UPDATE div_staff_master SET pf_number = '00210930589' WHERE hrms_id = 'AHBQNB' AND pf_number = '10930589'; -- Anuj Kumar K
UPDATE div_staff_master SET pf_number = '00211007163' WHERE hrms_id = 'AOXWGD' AND pf_number = '11007163'; -- Harshal Waghmare
UPDATE div_staff_master SET pf_number = '00201766946' WHERE hrms_id = 'AUKIXA' AND pf_number = '1766946'; -- D R KADAM
UPDATE div_staff_master SET pf_number = '00201940480' WHERE hrms_id = 'AUZQDZ' AND pf_number = '1940480'; -- S NARAYAN SINGH
UPDATE div_staff_master SET pf_number = '00211009135' WHERE hrms_id = 'BLLDWQ' AND pf_number = '11009135'; -- Sachidanand Suman
UPDATE div_staff_master SET pf_number = '00201865548' WHERE hrms_id = 'BRTFGX' AND pf_number = '1865548'; -- D B PANIGRAHI
UPDATE div_staff_master SET pf_number = '00201795521' WHERE hrms_id = 'BZMIAS' AND pf_number = '1795521'; -- N H SHINDE
UPDATE div_staff_master SET pf_number = '00201917997' WHERE hrms_id = 'CGNNLR' AND pf_number = '1917997'; -- M B RAO
UPDATE div_staff_master SET pf_number = '00201920650' WHERE hrms_id = 'CIZRRH' AND pf_number = '1920650'; -- S P SAHA
UPDATE div_staff_master SET pf_number = '00201866771' WHERE hrms_id = 'DBTRAL' AND pf_number = '1866771'; -- M G NIMKAR
UPDATE div_staff_master SET pf_number = '00200790049' WHERE hrms_id = 'DCAYRE' AND pf_number = '790049'; -- DHUP SINGH MEENA
UPDATE div_staff_master SET pf_number = '00201993227' WHERE hrms_id = 'DCBZFK' AND pf_number = '1993227'; -- R S NAKHVA
UPDATE div_staff_master SET pf_number = '00201941471' WHERE hrms_id = 'DDAXKY' AND pf_number = '1941471'; -- S S KOYANDE
UPDATE div_staff_master SET pf_number = '00229803057' WHERE hrms_id = 'DGCPMN' AND pf_number = '22983057'; -- Manish Kumar Sharma
UPDATE div_staff_master SET pf_number = '00201996060' WHERE hrms_id = 'DHJDWS' AND pf_number = '1996060'; -- U K DWIVEDI
UPDATE div_staff_master SET pf_number = '00201940510' WHERE hrms_id = 'DLQUGX' AND pf_number = '1940510'; -- VINOD KUMAR
UPDATE div_staff_master SET pf_number = '00201941264' WHERE hrms_id = 'DPJXOQ' AND pf_number = '1941264'; -- S W PAWAR
UPDATE div_staff_master SET pf_number = '00201941641' WHERE hrms_id = 'DQYHJD' AND pf_number = '1941641'; -- MAHENDRA R MHATRE
UPDATE div_staff_master SET pf_number = '00201921368' WHERE hrms_id = 'EHZNIR' AND pf_number = '1921368'; -- R R MALVANKAR
UPDATE div_staff_master SET pf_number = '00201941136' WHERE hrms_id = 'EMRNBX' AND pf_number = '1941136'; -- S M SHAHASANE
UPDATE div_staff_master SET pf_number = '00213736024' WHERE hrms_id = 'EPSPSI' AND pf_number = '13736024'; -- S B PAWASKAR
UPDATE div_staff_master SET pf_number = '00201918047' WHERE hrms_id = 'ETFEGI' AND pf_number = '1918047'; -- M V PARMAR
UPDATE div_staff_master SET pf_number = '00201918400' WHERE hrms_id = 'FEGUIL' AND pf_number = '1918400'; -- S S KUSHWAHA
UPDATE div_staff_master SET pf_number = '00201920418' WHERE hrms_id = 'FQBWFX' AND pf_number = '1920418'; -- J P SINGH
UPDATE div_staff_master SET pf_number = '00229812773' WHERE hrms_id = 'GDZTRM' AND pf_number = '29812773'; -- Shivam Kumar Nema
UPDATE div_staff_master SET pf_number = '00229812754' WHERE hrms_id = 'GHDYJC' AND pf_number = '2298142754'; -- CHOTULAL MEENA
UPDATE div_staff_master SET pf_number = '00207662567' WHERE hrms_id = 'GLRNPH' AND pf_number = '7662567'; -- V K MANDLIK
UPDATE div_staff_master SET pf_number = '00201974944' WHERE hrms_id = 'GNYXHW' AND pf_number = '1974944'; -- BISWAJIT MAJI
UPDATE div_staff_master SET pf_number = '00201862730' WHERE hrms_id = 'GQFPAI' AND pf_number = '1862730'; -- U M CHOUGULE
UPDATE div_staff_master SET pf_number = '00200859689' WHERE hrms_id = 'GURRBQ' AND pf_number = '859689'; -- SUNIL GAJBHIYE
UPDATE div_staff_master SET pf_number = '00201919921' WHERE hrms_id = 'GZHQNF' AND pf_number = '1919921'; -- D GOVINDAPPA
UPDATE div_staff_master SET pf_number = '00210003861' WHERE hrms_id = 'HQGBLH' AND pf_number = '10003861'; -- VINOD SINGH
UPDATE div_staff_master SET pf_number = '00201898498' WHERE hrms_id = 'HWYJDX' AND pf_number = '1898498'; -- AFROZ AHMED
UPDATE div_staff_master SET pf_number = '00210004002' WHERE hrms_id = 'HYEEAI' AND pf_number = '10004002'; -- DEELIP KUMAR
UPDATE div_staff_master SET pf_number = '00201941380' WHERE hrms_id = 'JHWQOD' AND pf_number = '1941380'; -- R C CHAVAN
UPDATE div_staff_master SET pf_number = '00201920236' WHERE hrms_id = 'JZOZWR' AND pf_number = '1920236'; -- SAJITH C K
UPDATE div_staff_master SET pf_number = '00201871456' WHERE hrms_id = 'KTJUEI' AND pf_number = '1871456'; -- P P JOSE
UPDATE div_staff_master SET pf_number = '00211047471' WHERE hrms_id = 'KURSQK' AND pf_number = '11047471'; -- YOGESH KURKURE
UPDATE div_staff_master SET pf_number = '00201941458' WHERE hrms_id = 'KWGIKA' AND pf_number = '1941458'; -- M V SHIRODKAR
UPDATE div_staff_master SET pf_number = '00229814991' WHERE hrms_id = 'KZBKGX' AND pf_number = '002298814991'; -- KUNDAN KUMAR
UPDATE div_staff_master SET pf_number = '00205733935' WHERE hrms_id = 'KZLIKY' AND pf_number = '5733935'; -- S M UPADHAYA
UPDATE div_staff_master SET pf_number = '00201918382' WHERE hrms_id = 'LFLJEU' AND pf_number = '1918382'; -- SHIBU CHACKO
UPDATE div_staff_master SET pf_number = '00201920560' WHERE hrms_id = 'LHDNBE' AND pf_number = '1920560'; -- P S R NAIR
UPDATE div_staff_master SET pf_number = '00211000521' WHERE hrms_id = 'LLAKNX' AND pf_number = '11000521'; -- Bhushan Anil Talele
UPDATE div_staff_master SET pf_number = '00201795399' WHERE hrms_id = 'LYCCWR' AND pf_number = '1795399'; -- N D KHOT
UPDATE div_staff_master SET pf_number = '00210002418' WHERE hrms_id = 'MDDILA' AND pf_number = '10002418'; -- Subhash Chandra
UPDATE div_staff_master SET pf_number = '00201941562' WHERE hrms_id = 'MKLNRS' AND pf_number = '1941562'; -- TEJ BAHADUR
UPDATE div_staff_master SET pf_number = '00211048748' WHERE hrms_id = 'MOCEEI' AND pf_number = '11048748'; -- HARENDRA PAL
UPDATE div_staff_master SET pf_number = '00201997208' WHERE hrms_id = 'MPRNWM' AND pf_number = '1997208'; -- V K TALPADE
UPDATE div_staff_master SET pf_number = '00211047451' WHERE hrms_id = 'MYITYB' AND pf_number = '11047451'; -- SURENDRA KUMAR AVALIYA
UPDATE div_staff_master SET pf_number = '00201901953' WHERE hrms_id = 'NFSPYE' AND pf_number = '1901953'; -- NAWAL K MEENA
UPDATE div_staff_master SET pf_number = '00204661291' WHERE hrms_id = 'NIGLZZ' AND pf_number = '4661291'; -- S S MAHURKAR
UPDATE div_staff_master SET pf_number = '00207570508' WHERE hrms_id = 'NNORIQ' AND pf_number = '7570508'; -- UJWAL KURKURE
UPDATE div_staff_master SET pf_number = '00229815421' WHERE hrms_id = 'NOKWOI' AND pf_number = '2299815421'; -- PANKAJ KUMAR
UPDATE div_staff_master SET pf_number = '00201928831' WHERE hrms_id = 'OCDQYI' AND pf_number = '1928831'; -- MILIND SAWARDEKAR
UPDATE div_staff_master SET pf_number = '00210003241' WHERE hrms_id = 'PAKHIK' AND pf_number = '10003241'; -- PINKU KUMAR MODI
UPDATE div_staff_master SET pf_number = '00201811053' WHERE hrms_id = 'PFGMBX' AND pf_number = '1811053'; -- A K MADGE
UPDATE div_staff_master SET pf_number = '00201918448' WHERE hrms_id = 'PFHPKS' AND pf_number = '1918448'; -- SUNIL KUMAR C V
UPDATE div_staff_master SET pf_number = '00201921253' WHERE hrms_id = 'PGWDLD' AND pf_number = '1921253'; -- M D PATIL
UPDATE div_staff_master SET pf_number = '00202258791' WHERE hrms_id = 'PMWUHX' AND pf_number = '2258791'; -- P R JADHAV
UPDATE div_staff_master SET pf_number = '002SNT36045' WHERE hrms_id = 'POXSWE' AND pf_number = '25NT36045'; -- DEEP CHAND SHARMA
UPDATE div_staff_master SET pf_number = '00211048293' WHERE hrms_id = 'QOSYQX' AND pf_number = '0021-11048293'; -- HEMANT MAHAJAN
UPDATE div_staff_master SET pf_number = '00202685152' WHERE hrms_id = 'QRZQNO' AND pf_number = '2685152'; -- SHAILENDRA SINGH
UPDATE div_staff_master SET pf_number = '00202256800' WHERE hrms_id = 'QTWXUB' AND pf_number = '2256800'; -- S K ROTHE
UPDATE div_staff_master SET pf_number = '00210001773' WHERE hrms_id = 'QUQMZP' AND pf_number = '10001773'; -- ANIL VIJAY
UPDATE div_staff_master SET pf_number = '00210002108' WHERE hrms_id = 'QUTBRC' AND pf_number = '10002108'; -- Dharmendra Kumar Singh
UPDATE div_staff_master SET pf_number = '00211048177' WHERE hrms_id = 'RIIUQF' AND pf_number = '11048177'; -- NILESH KUMAR RAJNATH
UPDATE div_staff_master SET pf_number = '00201919740' WHERE hrms_id = 'RSFIOZ' AND pf_number = '1919740'; -- S V RAVI KUMAR
UPDATE div_staff_master SET pf_number = '00201873167' WHERE hrms_id = 'RTPKYY' AND pf_number = '1873167'; -- PAWAN NARAIN
UPDATE div_staff_master SET pf_number = '00201921230' WHERE hrms_id = 'RZRRHP' AND pf_number = '1921230'; -- N T DURGE
UPDATE div_staff_master SET pf_number = '00214589631' WHERE hrms_id = 'SGKUUG' AND pf_number = '14589631'; -- S B SONAWANE
UPDATE div_staff_master SET pf_number = '00201919830' WHERE hrms_id = 'SGQEEM' AND pf_number = '1919830'; -- P K BENDALE
UPDATE div_staff_master SET pf_number = '00201919003' WHERE hrms_id = 'SQXXNB' AND pf_number = '1919003'; -- V Y RANE
UPDATE div_staff_master SET pf_number = '00210002030' WHERE hrms_id = 'SROKBI' AND pf_number = '10002030'; -- PRAVEEN KAMBLE
UPDATE div_staff_master SET pf_number = '00201920558' WHERE hrms_id = 'TGUZYT' AND pf_number = '1920558'; -- S N TRIPATHI
UPDATE div_staff_master SET pf_number = '00210009784' WHERE hrms_id = 'THRDXN' AND pf_number = '0021009784'; -- Sunil Jagdale
UPDATE div_staff_master SET pf_number = '00201872126' WHERE hrms_id = 'TIGXRA' AND pf_number = '1872126'; -- CHAKRAVARTHY P
UPDATE div_staff_master SET pf_number = '00201995662' WHERE hrms_id = 'TJZLZJ' AND pf_number = '1995662'; -- C VASUDEVAN S
UPDATE div_staff_master SET pf_number = '00200978541' WHERE hrms_id = 'TORSMF' AND pf_number = '978541'; -- G S THORVE
UPDATE div_staff_master SET pf_number = '00211020600' WHERE hrms_id = 'TSQZSP' AND pf_number = '11020600'; -- Md Abbas Alam
UPDATE div_staff_master SET pf_number = '00201918503' WHERE hrms_id = 'UBESRC' AND pf_number = '1918503'; -- S S RATHOD
UPDATE div_staff_master SET pf_number = '00200978826' WHERE hrms_id = 'UDUPCZ' AND pf_number = '978826'; -- S K KHAIRNAR
UPDATE div_staff_master SET pf_number = '00201921174' WHERE hrms_id = 'UGZLYC' AND pf_number = '1921174'; -- AJAY BANSAL
UPDATE div_staff_master SET pf_number = '00201940570' WHERE hrms_id = 'USDNBI' AND pf_number = '1940570'; -- ARJUN PRASAD
UPDATE div_staff_master SET pf_number = '00211038901' WHERE hrms_id = 'WFXMYY' AND pf_number = '2211038901'; -- Shib Shankar Mahto
UPDATE div_staff_master SET pf_number = '00201920297' WHERE hrms_id = 'XCABAN' AND pf_number = '1920297'; -- JAISON P T
UPDATE div_staff_master SET pf_number = '00201941240' WHERE hrms_id = 'XIPLWU' AND pf_number = '1941240'; -- P G SHINDE
UPDATE div_staff_master SET pf_number = '00229811778' WHERE hrms_id = 'XIXEKJ' AND pf_number = '002298117778'; -- RAJEEV MEENA
UPDATE div_staff_master SET pf_number = '00201795650' WHERE hrms_id = 'XMAZUF' AND pf_number = '1795650'; -- D M RAUT
UPDATE div_staff_master SET pf_number = '00201796045' WHERE hrms_id = 'YDXYOP' AND pf_number = '1796045'; -- K P DESHMUKH
UPDATE div_staff_master SET pf_number = '00210001906' WHERE hrms_id = 'ZPXXNF' AND pf_number = '10001906'; -- Anil Kumar Banke
UPDATE div_staff_master SET pf_number = '00206456327' WHERE hrms_id = 'ZZSWMR' AND pf_number = '6456327'; -- VIMAL KUMAR

-- AFTER: expect 93 corrected, 0 left with a non-11-char PF among these ids
SELECT COUNT(*) AS rows_still_old_after FROM div_staff_master WHERE hrms_id IN ('AADHAC','AHBQNB','AOXWGD','AUKIXA','AUZQDZ','BLLDWQ','BRTFGX','BZMIAS','CGNNLR','CIZRRH','DBTRAL','DCAYRE','DCBZFK','DDAXKY','DGCPMN','DHJDWS','DLQUGX','DPJXOQ','DQYHJD','EHZNIR','EMRNBX','EPSPSI','ETFEGI','FEGUIL','FQBWFX','GDZTRM','GHDYJC','GLRNPH','GNYXHW','GQFPAI','GURRBQ','GZHQNF','HQGBLH','HWYJDX','HYEEAI','JHWQOD','JZOZWR','KTJUEI','KURSQK','KWGIKA','KZBKGX','KZLIKY','LFLJEU','LHDNBE','LLAKNX','LYCCWR','MDDILA','MKLNRS','MOCEEI','MPRNWM','MYITYB','NFSPYE','NIGLZZ','NNORIQ','NOKWOI','OCDQYI','PAKHIK','PFGMBX','PFHPKS','PGWDLD','PMWUHX','POXSWE','QOSYQX','QRZQNO','QTWXUB','QUQMZP','QUTBRC','RIIUQF','RSFIOZ','RTPKYY','RZRRHP','SGKUUG','SGQEEM','SQXXNB','SROKBI','TGUZYT','THRDXN','TIGXRA','TJZLZJ','TORSMF','TSQZSP','UBESRC','UDUPCZ','UGZLYC','USDNBI','WFXMYY','XCABAN','XIPLWU','XIXEKJ','XMAZUF','YDXYOP','ZPXXNF','ZZSWMR') AND LENGTH(pf_number) <> 11;
SELECT hrms_id, name, pf_number FROM div_staff_master WHERE hrms_id IN ('AADHAC','AHBQNB','AOXWGD','AUKIXA','AUZQDZ','BLLDWQ','BRTFGX','BZMIAS','CGNNLR','CIZRRH','DBTRAL','DCAYRE','DCBZFK','DDAXKY','DGCPMN','DHJDWS','DLQUGX','DPJXOQ','DQYHJD','EHZNIR','EMRNBX','EPSPSI','ETFEGI','FEGUIL','FQBWFX','GDZTRM','GHDYJC','GLRNPH','GNYXHW','GQFPAI','GURRBQ','GZHQNF','HQGBLH','HWYJDX','HYEEAI','JHWQOD','JZOZWR','KTJUEI','KURSQK','KWGIKA','KZBKGX','KZLIKY','LFLJEU','LHDNBE','LLAKNX','LYCCWR','MDDILA','MKLNRS','MOCEEI','MPRNWM','MYITYB','NFSPYE','NIGLZZ','NNORIQ','NOKWOI','OCDQYI','PAKHIK','PFGMBX','PFHPKS','PGWDLD','PMWUHX','POXSWE','QOSYQX','QRZQNO','QTWXUB','QUQMZP','QUTBRC','RIIUQF','RSFIOZ','RTPKYY','RZRRHP','SGKUUG','SGQEEM','SQXXNB','SROKBI','TGUZYT','THRDXN','TIGXRA','TJZLZJ','TORSMF','TSQZSP','UBESRC','UDUPCZ','UGZLYC','USDNBI','WFXMYY','XCABAN','XIPLWU','XIXEKJ','XMAZUF','YDXYOP','ZPXXNF','ZZSWMR') ORDER BY hrms_id;
