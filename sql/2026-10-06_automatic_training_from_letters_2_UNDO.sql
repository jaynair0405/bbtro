-- Undo 2026-10-06_automatic_training_from_letters_2.sql: removes exactly the tagged rows of its 42 staff.
DELETE FROM div_training_records
WHERE training_id = 5 AND general_remarks = 'automatic_letters_2026-10-05'
  AND staff_hrms_id IN ('AAAXIG','BFRZZY','CIHZTE','DFBDPT','DFSWXO','DHJDWS','DJAQGW','ETBRCP','FBQDZI','FZWXOC','GGKNWD','GIOTLH','HMHOPF','IBGOXW','JIAIWX','KHKLJU','LEJECG','LYDIYQ','MATDRB','MHUEQA','MKTBZZ','MMYXQI','NDWZUO','NXYXQU','OXKJKP','OXOKUG','PZINCQ','QJRBSI','QMJFWG','QPQGMZ','QXPGTE','RKSDRC','SDYDKA','URLUFB','UUMJYK','WKKPBG','WSCSOL','XIMASJ','XTSSAQ','YDQYGT','YQCKOK','ZQJWYF');
